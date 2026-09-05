from io import BytesIO

import pandas as pd

from app.services.profiling import load_dataframe, profile_dataframe


def test_profile_dataframe_detects_quality_metrics() -> None:
    dataframe = pd.DataFrame({"region": ["sur", "sur", None], "sales": [10, 10, 20]})

    profile = profile_dataframe(dataframe)

    assert profile["row_count"] == 3
    assert profile["column_count"] == 2
    assert profile["duplicate_rows"] == 1
    assert profile["missing_values"] == 1
    assert profile["columns"][0]["missing_count"] == 1


def test_load_dataframe_reads_csv() -> None:
    content = b"name,value\nalpha,10\nbeta,20\n"

    dataframe = load_dataframe("sample.csv", content)

    assert list(dataframe.columns) == ["name", "value"]
    assert dataframe["value"].sum() == 30


def test_load_dataframe_reads_xlsx() -> None:
    buffer = BytesIO()
    pd.DataFrame({"name": ["alpha"], "value": [10]}).to_excel(buffer, index=False)

    dataframe = load_dataframe("sample.xlsx", buffer.getvalue())

    assert dataframe.iloc[0]["name"] == "alpha"
    assert dataframe.iloc[0]["value"] == 10
