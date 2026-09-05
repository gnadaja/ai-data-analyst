import pandas as pd

from app.services.meta_ads import build_meta_ads_report


def test_build_meta_ads_report_for_spanish_meta_columns() -> None:
    dataframe = pd.DataFrame(
        {
            "Importe gastado (ARS)": [1000.0, 500.0],
            "Impresiones": [1000, 500],
            "Alcance": [800, 400],
            "Frecuencia": [1.25, 1.2],
            "Resultados": [10, 5],
            "Compras": [2, 1],
            "Costo por compra": [500.0, 500.0],
            "ROAS (retorno de la inversión en publicidad de compras en el sitio web)": [2.0, 2.0],
            "Valor de conversión de compras": [2000.0, 1000.0],
        }
    )

    report = build_meta_ads_report(dataframe)

    assert report is not None
    assert next(kpi for kpi in report["kpis"] if kpi["key"] == "spend")["value"] == 1500
    assert any("compras" in insight for insight in report["insights"])
