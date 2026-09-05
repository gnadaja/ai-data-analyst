import pandas as pd

from app.services.generic_report import build_generic_report
from app.services.profiling import profile_dataframe


def test_generic_report_does_not_require_meta_ads_columns() -> None:
    profile = profile_dataframe(
        pd.DataFrame({"producto": ["A", "B"], "unidades": [3, 7], "precio": [10.0, 20.0]})
    )

    report = build_generic_report(profile)

    assert report["dataset_type"] == "generic"
    assert report["kpis"]
    assert report["quality"]["label"] == "Buena"
