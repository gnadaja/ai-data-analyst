from pydantic import BaseModel


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
