import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client

from app.core.security import get_current_user, get_supabase_client
from app.schemas.datasets import DatasetAnalysisResponse
from app.services.profiling import load_dataframe, profile_dataframe

router = APIRouter(prefix="/datasets", tags=["datasets"])
logger = logging.getLogger(__name__)


@router.post("/{dataset_id}/analyze", response_model=DatasetAnalysisResponse)
def analyze_dataset(
    dataset_id: str,
    user: Annotated[dict, Depends(get_current_user)],
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
