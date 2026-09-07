def build_generic_report(profile: dict, locale: str = "es") -> dict:
    english = locale == "en"
    missing = profile["missing_values"]
    rows = profile["row_count"]
    quality = {
        "level": "good" if missing == 0 else "review",
        "label": "Good" if english and missing == 0 else "Review" if english else "Buena" if missing == 0 else "Revisar",
        "message": ("The data is complete for a first read." if english else "Los datos están completos para una primera lectura.")
        if missing == 0
        else (
            f"There are {missing} missing values across {rows} rows; review them before making decisions."
            if english
            else f"Hay {missing} valores faltantes en {rows} filas; conviene revisarlos antes de tomar decisiones."
        ),
    }
    numeric_kpis = [
        {
            "key": statistic["name"],
            "label": statistic["name"],
            "value": statistic["average"],
            "format": "decimal",
            "explanation": "Average of available values." if english else "Promedio de los valores disponibles.",
        }
        for statistic in profile["numeric_statistics"][:6]
        if statistic["average"] is not None
    ]
    return {
        "dataset_type": "generic",
        "title": "Smart dataset report" if english else "Informe inteligente del dataset",
        "subtitle": "AI is not configured yet; showing a safe automatic summary." if english else "La IA todavía no está configurada; mostramos un resumen automático seguro.",
        "quality": quality,
        "kpis": numeric_kpis,
        "comparisons": {"best": None, "worst": None},
        "insights": [
            f"The file contains {rows} rows and {profile['column_count']} columns." if english else f"El archivo contiene {rows} filas y {profile['column_count']} columnas.",
            "Configure Gemini to get a business-specific interpretation." if english else "Configura Gemini para obtener una interpretación específica del negocio.",
        ],
        "warnings": [],
        "recommendations": [
            "Connect an AI provider to classify the dataset and generate recommendations." if english else "Conecta un proveedor de IA para clasificar el dataset y generar recomendaciones."
        ],
    }
