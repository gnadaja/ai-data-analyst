import json
import logging
import time

import httpx

from app.core.config import get_settings

logger = logging.getLogger(__name__)


class GeminiAIService:
    def create_report(self, dataset_profile: dict) -> dict | None:
        settings = get_settings()
        if not settings.gemini_api_key:
            logger.warning("Gemini is not configured: GEMINI_API_KEY is empty")
            return None

        prompt = build_prompt(dataset_profile)
        endpoint = (
            "https://generativelanguage.googleapis.com/v1beta/models/"
            f"{settings.gemini_model}:generateContent"
        )
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0.2,
                "responseMimeType": "application/json",
            },
        }
        transient_statuses = {429, 500, 502, 503, 504}
        for attempt in range(3):
            try:
                response = httpx.post(
                    endpoint,
                    params={"key": settings.gemini_api_key},
                    json=payload,
                    timeout=30,
                )
                response.raise_for_status()
                text = response.json()["candidates"][0]["content"]["parts"][0]["text"]
                return normalize_report(json.loads(text))
            except httpx.HTTPStatusError as error:
                status_code = error.response.status_code
                if status_code in transient_statuses and attempt < 2:
                    delay = 2**attempt
                    logger.warning(
                        "Gemini returned HTTP %s; retrying in %s seconds (attempt %s/3)",
                        status_code,
                        delay,
                        attempt + 1,
                    )
                    time.sleep(delay)
                    continue
                logger.error(
                    "Gemini returned HTTP %s: %s",
                    status_code,
                    error.response.text[:500],
                )
                return None
            except (httpx.HTTPError, KeyError, TypeError, ValueError):
                logger.exception("Gemini report generation failed")
                return None
        return None


def build_prompt(profile: dict) -> str:
    return f"""Eres un analista de datos para pequeñas empresas.
Analiza el perfil de un archivo tabular y devuelve SOLO JSON valido.

No inventes valores. Usa solo los datos del perfil. Detecta el tipo de dataset
(por ejemplo meta_ads, ventas, ecommerce, marketing, finanzas o generico).
Traduce cualquier termino tecnico a lenguaje de negocio. No uses palabras como
object, float64, mediana o desviacion estandar en el resultado.

El JSON debe tener exactamente esta forma:
{{
  "dataset_type": "string",
  "title": "string",
  "subtitle": "string",
    "quality": {{"level": "good|review|incomplete", "label": "Buena|Revisar|Incompleta",
        "message": "string"}},
    "kpis": [{{"key": "string", "label": "string", "value": 0,
        "format": "currency|number|decimal", "explanation": "string|null"}}],
  "comparisons": {{"best": null, "worst": null}},
  "insights": ["string"],
  "warnings": ["string"],
  "recommendations": ["string"]
}}

Perfil del dataset:
{json.dumps(profile, ensure_ascii=False, default=str)}
"""


def normalize_report(report: dict) -> dict:
    report.setdefault("title", "Informe inteligente del dataset")
    report.setdefault("subtitle", "Lectura ejecutiva basada en los datos disponibles.")
    report.setdefault(
        "quality",
        {
            "level": "review",
            "label": "Revisar",
            "message": "Revisa la calidad de los datos antes de tomar decisiones.",
        },
    )
    report.setdefault("kpis", [])
    report.setdefault("comparisons", {"best": None, "worst": None})
    report.setdefault("insights", [])
    report.setdefault("warnings", [])
    report.setdefault("recommendations", [])
    return report
