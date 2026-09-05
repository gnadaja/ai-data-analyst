def build_generic_report(profile: dict) -> dict:
    missing = profile["missing_values"]
    rows = profile["row_count"]
    quality = {
        "level": "good" if missing == 0 else "review",
        "label": "Buena" if missing == 0 else "Revisar",
        "message": "Los datos están completos para una primera lectura."
        if missing == 0
        else (
            f"Hay {missing} valores faltantes en {rows} filas; conviene "
            "revisarlos antes de tomar decisiones."
        ),
    }
    numeric_kpis = [
        {
            "key": statistic["name"],
            "label": statistic["name"],
            "value": statistic["average"],
            "format": "decimal",
            "explanation": "Promedio de los valores disponibles.",
        }
        for statistic in profile["numeric_statistics"][:6]
        if statistic["average"] is not None
    ]
    return {
        "dataset_type": "generic",
        "title": "Informe inteligente del dataset",
        "subtitle": "La IA todavía no está configurada; mostramos un resumen automático seguro.",
        "quality": quality,
        "kpis": numeric_kpis,
        "comparisons": {"best": None, "worst": None},
        "insights": [
            f"El archivo contiene {rows} filas y {profile['column_count']} columnas.",
            "Configura Gemini para obtener una interpretación específica del negocio.",
        ],
        "warnings": [],
        "recommendations": [
            "Conecta un proveedor de IA para clasificar el dataset y generar recomendaciones."
        ],
    }
