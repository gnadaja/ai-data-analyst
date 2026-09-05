import re
import unicodedata

import pandas as pd


def build_meta_ads_report(dataframe: pd.DataFrame) -> dict | None:
    columns = {normalize(column): column for column in dataframe.columns}
    required_signals = ["importe gastado", "impresiones", "resultados"]
    if sum(find_column(columns, signal) is not None for signal in required_signals) < 2:
        return None

    metrics = {
        "spend": metric(dataframe, columns, "importe gastado"),
        "impressions": metric(dataframe, columns, "impresiones"),
        "reach": metric(dataframe, columns, "alcance"),
        "frequency": metric(dataframe, columns, "frecuencia"),
        "results": metric(dataframe, columns, "resultados"),
        "purchases": metric(dataframe, columns, "compras"),
        "cost_per_result": metric(dataframe, columns, "costo por resultado"),
        "cost_per_purchase": metric(dataframe, columns, "costo por compra"),
        "roas": metric(dataframe, columns, "roas"),
        "conversion_value": metric(dataframe, columns, "valor de conversion"),
    }

    kpis = []
    for key, label, format_type in [
        ("spend", "Inversión", "currency"),
        ("impressions", "Impresiones", "number"),
        ("reach", "Alcance", "number"),
        ("results", "Resultados", "number"),
        ("purchases", "Compras", "number"),
        ("cost_per_purchase", "Costo por compra", "currency"),
        ("roas", "ROAS", "decimal"),
        ("conversion_value", "Valor de conversión", "currency"),
    ]:
        value = metrics[key]
        if value is not None:
            kpis.append({"key": key, "label": label, "value": value, "format": format_type})

    insights = []
    warnings = []
    spend = metrics["spend"]
    purchases = metrics["purchases"]
    roas = metrics["roas"]
    frequency = metrics["frequency"]
    conversion_value = metrics["conversion_value"]
    if spend is not None and purchases is not None:
        if purchases > 0:
            insights.append(
                f"La campaña invirtió {format_currency(spend)} y generó "
                f"{format_number(purchases)} compras."
            )
        else:
            warnings.append("La campaña registra inversión, pero no registra compras.")
    if roas is not None:
        if roas >= 3:
            insights.append(
                f"El ROAS es {roas:.2f}: por cada unidad invertida se generaron "
                f"aproximadamente {roas:.2f} unidades de valor."
            )
        elif roas < 1:
            warnings.append(
                f"El ROAS es {roas:.2f}, por debajo del punto de equilibrio publicitario."
            )
        else:
            insights.append(
                f"El ROAS es {roas:.2f}: la campaña recupera la inversión, "
                "aunque con margen moderado."
            )
    if conversion_value is not None and spend:
        insights.append(
            f"El valor de conversión atribuido es {format_currency(conversion_value)} "
            f"frente a una inversión de {format_currency(spend)}."
        )
    if frequency is not None:
        if frequency >= 3:
            warnings.append(
                f"La frecuencia media es {frequency:.2f}; conviene revisar fatiga "
                "creativa y saturación de audiencia."
            )
        else:
            insights.append(
                f"La frecuencia media es {frequency:.2f}, todavía moderada para la "
                "audiencia alcanzada."
            )
    if metrics["cost_per_purchase"] is not None and purchases:
        insights.append(
            f"El costo medio por compra fue {format_currency(metrics['cost_per_purchase'])}."
        )

    return {
        "title": "Informe de rendimiento de Meta Ads",
        "subtitle": "Lectura ejecutiva basada en las métricas disponibles del archivo.",
        "kpis": kpis,
        "insights": insights,
        "warnings": warnings,
    }


def normalize(value: object) -> str:
    text = unicodedata.normalize("NFKD", str(value)).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", " ", text).strip()


def find_column(columns: dict[str, object], signal: str):
    normalized_signal = normalize(signal)
    return next((column for name, column in columns.items() if normalized_signal in name), None)


def metric(dataframe: pd.DataFrame, columns: dict[str, object], signal: str) -> float | None:
    column = find_column(columns, signal)
    if column is None:
        return None
    values = pd.to_numeric(dataframe[column], errors="coerce").dropna()
    return (
        float(values.sum())
        if signal
        in {
            "importe gastado",
            "impresiones",
            "alcance",
            "resultados",
            "compras",
            "valor de conversion",
        }
        else float(values.mean())
        if not values.empty
        else None
    )


def format_number(value: float) -> str:
    return f"{value:,.0f}".replace(",", ".")


def format_currency(value: float) -> str:
    return f"ARS {value:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
