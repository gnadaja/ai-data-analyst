from typing import Literal

from pydantic import BaseModel, Field


class DatasetAnalysisResponse(BaseModel):
    dataset_id: str
    status: str
    name: str
    row_count: int
    column_count: int
    duplicate_rows: int
    missing_values: int
    columns: list[dict[str, int | str]]
    numeric_statistics: list[dict[str, int | float | str | None]]


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=2000)


class DatasetChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    history: list[ChatMessage] = Field(default_factory=list, max_length=12)
    locale: Literal["es", "en"] = "es"


class DatasetChatResponse(BaseModel):
    answer: str
