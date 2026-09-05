import re
import unicodedata

import pandas as pd


def build_meta_ads_report(dataframe: pd.DataFrame) -> dict | None:
    columns = {normalize(column): column for column in dataframe.columns}
    required_signals = ["importe gastado", "impresiones", "resultados"]
    if sum(find_column(columns, signal) is not None for signal in required_signals) < 2:
        return None

    spend = total_metric(dataframe, columns, "importe gastado")
    impressions = total_metric(dataframe, columns, "impresiones")
    reach = total_metric(dataframe, columns, "alcance")
    results = total_metric(dataframe, columns, "resultados")
    purchases = total_metric(dataframe, columns, "compras")
    conversion_value = total_metric(dataframe, columns, "valor de conversion")
    roas = average_metric(dataframe, columns, "roas")
    frequency = average_metric(dataframe, columns, "frecuencia")
    cost_per_purchase = average_metric(dataframe, columns, "costo por compra")

    kpis = []
    for key, label, value, format_type, explanation in [
        ("impressions", "Impresiones totales", impressions, "number", None),
        ("reach", "Alcance total", reach, "number", None),
        ("spend", "Gasto total", spend, "currency", None),
        (
            "roas",
            "ROAS promedio",
            roas,
            "decimal",
            f"Por cada $1 invertido, recuperaste aproximadamente ${roas:.2f}."
            if roas is not None
            else None,
        ),
        ("results", "Resultados", results, "number", None),
        ("purchases", "Compras", purchases, "number", None),
        ("cost_per_purchase", "Costo por compra", cost_per_purchase, "currency", None),
        ("conversion_value", "Valor de conversión", conversion_value, "currency", None),
    ]:
        if value is not None:
            kpis.append(
                {
                    "key": key,
                    "label": label,
                    "value": value,
                    "format": format_type,
                    "explanation": explanation,
                }
            )

    quality = build_quality(dataframe, columns)
    comparisons = build_comparisons(dataframe, columns)
    insights = []
    warnings = []
    if purchases is not None and spend is not None:
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
                f"El ROAS promedio es {roas:.2f}: por cada unidad invertida se generaron "
                f"aproximadamente {roas:.2f} unidades de valor."
            )
        elif roas < 1:
            warnings.append(f"El ROAS promedio es {roas:.2f}, por debajo del punto de equilibrio.")
        else:
            insights.append(
                f"El ROAS promedio es {roas:.2f}: la campaña recupera la inversión, "
                "aunque con margen moderado."
            )
    if frequency is not None:
        if frequency >= 3:
            warnings.append(
                f"La frecuencia media es {frequency:.2f}; conviene revisar fatiga "
                "creativa y saturación de audiencia."
            )
        else:
            insights.append(f"La frecuencia media es {frequency:.2f}, todavía moderada.")
    if comparisons.get("best"):
        insights.append(
            f"El mejor rendimiento corresponde a {comparisons['best']['name']} "
            f"con un ROAS de {comparisons['best']['roas']:.2f}."
        )
    if comparisons.get("worst"):
        warnings.append(
            f"Conviene revisar {comparisons['worst']['name']}: tiene el ROAS más bajo "
            f"({comparisons['worst']['roas']:.2f})."
        )

    return {
        "title": "Informe de rendimiento de Meta Ads",
        "subtitle": "Una lectura ejecutiva de inversión, resultados y oportunidades de mejora.",
        "quality": quality,
        "kpis": kpis,
        "comparisons": comparisons,
        "insights": insights,
        "warnings": warnings,
    }


def build_quality(dataframe: pd.DataFrame, columns: dict[str, object]) -> dict:
    important_signals = ["importe gastado", "impresiones", "resultados", "compras", "roas"]
    available = [find_column(columns, signal) for signal in important_signals]
    available = [column for column in available if column is not None]
    missing_cells = int(dataframe[available].isna().sum().sum()) if available else 0
    affected_rows = (
        int(dataframe[available].isna().any(axis=1).sum()) if available else len(dataframe)
    )
    total_cells = max(len(dataframe) * len(available), 1)
    completeness = 1 - (missing_cells / total_cells)
    if completeness >= 0.95:
        level, label = "good", "Buena"
        message = "Los datos clave están completos y listos para analizar."
    elif completeness >= 0.7:
        level, label = "review", "Revisar"
        message = (
            f"{affected_rows} de {len(dataframe)} filas tienen datos incompletos "
            "que pueden afectar resultados."
        )
    else:
        level, label = "incomplete", "Incompleta"
        message = "Faltan datos clave para interpretar la campaña con confianza."
    return {"level": level, "label": label, "message": message, "missing_cells": missing_cells}


def build_comparisons(dataframe: pd.DataFrame, columns: dict[str, object]) -> dict:
    name_column = find_column(columns, "nombre de la campaña") or find_column(
        columns, "nombre del conjunto de anuncios"
    )
    roas_column = find_column(columns, "roas")
    if name_column is None or roas_column is None:
        return {"best": None, "worst": None}
    comparison = dataframe[[name_column, roas_column]].copy()
    comparison[roas_column] = pd.to_numeric(comparison[roas_column], errors="coerce")
    comparison = comparison.dropna(subset=[roas_column])
    if comparison.empty:
        return {"best": None, "worst": None}
    best = comparison.loc[comparison[roas_column].idxmax()]
    worst = comparison.loc[comparison[roas_column].idxmin()]
    return {
        "best": {"name": str(best[name_column]), "roas": float(best[roas_column])},
        "worst": {"name": str(worst[name_column]), "roas": float(worst[roas_column])},
    }


def normalize(value: object) -> str:
    text = unicodedata.normalize("NFKD", str(value)).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", " ", text).strip()


def find_column(columns: dict[str, object], signal: str):
    normalized_signal = normalize(signal)
    return next((column for name, column in columns.items() if normalized_signal in name), None)


def total_metric(dataframe: pd.DataFrame, columns: dict[str, object], signal: str) -> float | None:
    column = find_column(columns, signal)
    if column is None:
        return None
    values = pd.to_numeric(dataframe[column], errors="coerce").dropna()
    return float(values.sum()) if not values.empty else None


def average_metric(
    dataframe: pd.DataFrame, columns: dict[str, object], signal: str
) -> float | None:
    column = find_column(columns, signal)
    if column is None:
        return None
    values = pd.to_numeric(dataframe[column], errors="coerce").dropna()
    return float(values.mean()) if not values.empty else None


def format_number(value: float) -> str:
    return f"{value:,.0f}".replace(",", ".")


def format_currency(value: float) -> str:
    return f"ARS {value:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
