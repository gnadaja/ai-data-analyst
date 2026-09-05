from io import BytesIO
from pathlib import PurePosixPath

import pandas as pd

SUPPORTED_EXTENSIONS = {"csv", "xls", "xlsx"}


def load_dataframe(file_name: str, content: bytes) -> pd.DataFrame:
    extension = PurePosixPath(file_name).suffix.lower().lstrip(".")
    if extension not in SUPPORTED_EXTENSIONS:
        raise ValueError("Unsupported dataset format")

    if extension == "csv":
        return pd.read_csv(BytesIO(content), nrows=100_000)
    engine = "openpyxl" if extension == "xlsx" else "xlrd"
    return pd.read_excel(BytesIO(content), engine=engine, nrows=100_000)


def profile_dataframe(dataframe: pd.DataFrame) -> dict:
    column_profiles = []
    for position, column in enumerate(dataframe.columns):
        series = dataframe[column]
        column_profiles.append(
            {
                "name": str(column),
                "data_type": str(series.dtype),
                "position": position,
                "missing_count": int(series.isna().sum()),
            }
        )

    return {
        "row_count": int(len(dataframe.index)),
        "column_count": int(len(dataframe.columns)),
        "duplicate_rows": int(dataframe.duplicated().sum()),
        "missing_values": int(dataframe.isna().sum().sum()),
        "columns": column_profiles,
    }
