import logging
from typing import Annotated, Literal

from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client

from app.core.security import get_current_user, get_supabase_client
from app.schemas.datasets import DatasetAnalysisResponse, DatasetChatRequest, DatasetChatResponse
from app.services.ai.gemini import GeminiAIService, GeminiServiceError
from app.services.generic_report import build_generic_report
from app.services.profiling import load_dataframe, profile_dataframe

router = APIRouter(prefix="/datasets", tags=["datasets"])
logger = logging.getLogger(__name__)


@router.post("/{dataset_id}/analyze", response_model=DatasetAnalysisResponse)
def analyze_dataset(
    dataset_id: str,
    user: Annotated[dict, Depends(get_current_user)],
    locale: Literal["es", "en"] = "es",
) -> DatasetAnalysisResponse:
    token = user["access_token"]
    supabase: Client = get_supabase_client(token)
    try:
        dataset_response = (
            supabase.table("ai_datasets")
            .select("id, user_id, name, file_path, status")
            .eq("id", dataset_id)
            .eq("user_id", user["id"])
            .maybe_single()
            .execute()
        )
    except Exception as error:
        logger.exception("Could not load dataset %s for user %s", dataset_id, user["id"])
        raise HTTPException(status_code=502, detail="Could not load dataset metadata") from error
    dataset = dataset_response.data
    if not dataset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found")

    authorized_client: Client = get_supabase_client(token)
    try:
        file_content = authorized_client.storage.from_("ai-datasets").download(dataset["file_path"])
        dataframe = load_dataframe(dataset["file_path"], file_content)
        profile = profile_dataframe(dataframe)
        ai_report = GeminiAIService().create_report(profile, locale)
        report = ai_report or profile["report"] or build_generic_report(profile, locale)
        (
            authorized_client.table("ai_dataset_columns")
            .delete()
            .eq("dataset_id", dataset_id)
            .execute()
        )
        column_rows = [{"dataset_id": dataset_id, **column} for column in profile["columns"]]
        if column_rows:
            authorized_client.table("ai_dataset_columns").insert(column_rows).execute()
        authorized_client.table("ai_datasets").update(
            {
                "status": "ready",
                "row_count": profile["row_count"],
                "column_count": profile["column_count"],
                "duplicate_rows": profile["duplicate_rows"],
                "analysis_summary": {
                    "missing_values": profile["missing_values"],
                    "numeric_statistics": profile["numeric_statistics"],
                    "sample_rows": profile["sample_rows"],
                    "report": report,
                },
                "error_message": None,
            }
        ).eq("id", dataset_id).execute()
    except Exception as error:
        logger.exception("Could not analyze dataset %s", dataset_id)
        try:
            authorized_client.table("ai_datasets").update(
                {"status": "failed", "error_message": str(error)[:500]}
            ).eq("id", dataset_id).execute()
        except Exception:
            logger.exception("Could not mark dataset %s as failed", dataset_id)
        raise HTTPException(
            status_code=422,
            detail=f"Could not analyze dataset: {error}",
        ) from error

    return DatasetAnalysisResponse(
        dataset_id=dataset_id,
        status="ready",
        name=dataset["name"],
        **profile,
    )


@router.post("/{dataset_id}/chat", response_model=DatasetChatResponse)
def chat_about_dataset(
    dataset_id: str,
    request: DatasetChatRequest,
    user: Annotated[dict, Depends(get_current_user)],
) -> DatasetChatResponse:
    token = user["access_token"]
    supabase: Client = get_supabase_client(token)
    try:
        dataset_response = (
            supabase.table("ai_datasets")
            .select("id, analysis_summary, status")
            .eq("id", dataset_id)
            .eq("user_id", user["id"])
            .maybe_single()
            .execute()
        )
    except Exception as error:
        logger.exception("Could not load dataset %s for chat", dataset_id)
        raise HTTPException(status_code=502, detail="Could not load dataset metadata") from error

    dataset = dataset_response.data
    if not dataset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found")

    analysis_summary = dataset.get("analysis_summary") or {}
    report = analysis_summary.get("report")
    if dataset.get("status") != "ready" or not report:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="The dataset must have a completed analysis before using chat",
        )

    try:
        columns_response = (
            supabase.table("ai_dataset_columns")
            .select("name, data_type, position, missing_count")
            .eq("dataset_id", dataset_id)
            .order("position")
            .execute()
        )
        context = {
            "report": report,
            "missing_values": analysis_summary.get("missing_values", 0),
            "numeric_statistics": analysis_summary.get("numeric_statistics", [])[:30],
            "columns": (columns_response.data or [])[:100],
            "sample_rows": analysis_summary.get("sample_rows", [])[:8],
        }
        answer = GeminiAIService().answer_question(
            context,
            [message.model_dump() for message in request.history],
            request.message,
            request.locale,
        )
    except GeminiServiceError as error:
        logger.error("Gemini chat failed with status %s", error.status_code)
        raise HTTPException(
            status_code=503,
            detail=f"Gemini error HTTP {error.status_code}: {error.detail}",
        ) from error
    except Exception as error:
        logger.exception("Could not answer chat for dataset %s", dataset_id)
        raise HTTPException(status_code=502, detail="Could not answer the question") from error

    if not answer:
        raise HTTPException(status_code=503, detail="The AI service is not available")
    return DatasetChatResponse(answer=answer)
