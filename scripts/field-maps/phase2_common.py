"""Shared Phase 2 catalog and decision helpers."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry


USGS_CURRENT_QUERY = (
    "https://index.nationalmap.gov/arcgis/rest/services/"
    "USTopoAvailability/MapServer/2/query"
)
OFFICIAL_PRODUCT_PREFIX = (
    "https://prd-tnm.s3.amazonaws.com/StagedProducts/Maps/USTopo/PDF/"
)


def requests_session() -> requests.Session:
    retry = Retry(
        total=5,
        connect=5,
        read=5,
        backoff_factor=0.8,
        status_forcelist=(429, 500, 502, 503, 504),
        allowed_methods=("GET", "HEAD"),
    )
    session = requests.Session()
    session.headers.update(
        {
            "User-Agent": (
                "CascadiaFieldMapsPhase2/1.0 "
                "(+https://cascadia.me/field-maps/)"
            )
        }
    )
    session.mount("https://", HTTPAdapter(max_retries=retry))
    return session


def normalized_cell_id(value: Any) -> str:
    if isinstance(value, float) and value.is_integer():
        return str(int(value))
    return str(value).strip()


def arcgis_date(value: Any) -> str:
    if value in (None, ""):
        return ""
    try:
        return datetime.fromtimestamp(float(value) / 1000, tz=timezone.utc).date().isoformat()
    except (TypeError, ValueError, OSError):
        return str(value)


def query_current_product(
    session: requests.Session, cell_id: str
) -> dict[str, str] | None:
    params = {
        "where": f"cell_id = {int(cell_id)}",
        "outFields": (
            "cell_id,cell_name,primary_state,file_name_date,cloud_url,pub_yr,"
            "minx,maxx,miny,maxy"
        ),
        "returnGeometry": "false",
        "f": "json",
    }
    response = session.get(USGS_CURRENT_QUERY, params=params, timeout=(20, 120))
    response.raise_for_status()
    payload = response.json()
    if "error" in payload:
        raise RuntimeError(f"USGS catalog query failed: {payload['error']}")
    features = payload.get("features") or []
    if not features:
        return None

    candidates: list[dict[str, str]] = []
    for feature in features:
        values = feature.get("attributes") or {}
        candidates.append(
            {
                "cell_id": normalized_cell_id(values.get("cell_id")),
                "cell_name": str(values.get("cell_name") or ""),
                "primary_state": str(values.get("primary_state") or ""),
                "product_date": arcgis_date(values.get("file_name_date")),
                "product_url": str(values.get("cloud_url") or ""),
                "publication_year": str(values.get("pub_yr") or ""),
            }
        )
    candidates.sort(
        key=lambda item: (
            item["publication_year"],
            item["product_date"],
            item["product_url"],
        ),
        reverse=True,
    )
    return candidates[0]


def classify_catalog(
    registered_url: str,
    registered_date: str,
    live_product: dict[str, str] | None,
    error: str = "",
) -> dict[str, str]:
    if error:
        return {
            "catalog_status": "unconfirmed",
            "effective_sale_status": "blocked-stale",
            "pause_reason": f"Official catalog could not be confirmed: {error}",
            "replacement_url": "",
            "replacement_date": "",
        }
    if live_product is None:
        return {
            "catalog_status": "withdrawn",
            "effective_sale_status": "blocked-stale",
            "pause_reason": "The official current-product catalog returned no record.",
            "replacement_url": "",
            "replacement_date": "",
        }
    if (
        live_product["product_url"] != registered_url
        or live_product["product_date"] != registered_date
    ):
        return {
            "catalog_status": "superseded",
            "effective_sale_status": "paused-new-edition-check",
            "pause_reason": (
                "The official catalog now identifies a different current file or "
                "edition date. The replacement must complete exact-file verification."
            ),
            "replacement_url": live_product["product_url"],
            "replacement_date": live_product["product_date"],
        }
    return {
        "catalog_status": "exact-current",
        "effective_sale_status": "",
        "pause_reason": "",
        "replacement_url": "",
        "replacement_date": "",
    }


def effective_recheck_status(
    registered_sale_status: str, catalog_result: dict[str, str]
) -> tuple[str, str]:
    if catalog_result["catalog_status"] != "exact-current":
        return (
            catalog_result["effective_sale_status"],
            catalog_result["pause_reason"],
        )
    return registered_sale_status, ""
