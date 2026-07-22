#!/usr/bin/env python3
"""Recheck verified artifacts against the live official current-product catalog."""

from __future__ import annotations

import argparse
import csv
import json
from datetime import datetime
from pathlib import Path

from phase2_common import (
    classify_catalog,
    effective_recheck_status,
    query_current_product,
    requests_session,
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--register",
        type=Path,
        default=Path("docs/field-maps/artifact-register.csv"),
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("docs/field-maps/artifact-recheck.json"),
    )
    parser.add_argument("--checked-at", default="2026-07-21")
    parser.add_argument(
        "--fail-on-catalog-drift",
        action="store_true",
        help="Exit nonzero if any exact registered edition is no longer current.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        datetime.strptime(args.checked_at, "%Y-%m-%d")
    except ValueError as error:
        raise SystemExit("--checked-at must use YYYY-MM-DD") from error

    with args.register.open(newline="", encoding="utf-8") as handle:
        registered = list(csv.DictReader(handle))
    session = requests_session()
    results = []
    drifted = 0

    for row in registered:
        live_product = None
        error = ""
        try:
            live_product = query_current_product(session, row["cell_id"])
        except Exception as caught:  # fail closed; network ambiguity pauses inventory
            error = f"{type(caught).__name__}: {caught}"
        catalog = classify_catalog(
            row["official_url"], row["edition_date"], live_product, error
        )
        effective_status, inherited_reason = effective_recheck_status(
            row["sale_status"], catalog
        )
        if catalog["catalog_status"] != "exact-current":
            drifted += 1
        results.append(
            {
                "artifact_id": row["artifact_id"],
                "cell_id": row["cell_id"],
                "cell_name": row["cell_name"],
                "registered_edition_date": row["edition_date"],
                "registered_url": row["official_url"],
                "registered_sale_status": row["sale_status"],
                "catalog_checked_at": args.checked_at,
                "catalog_status": catalog["catalog_status"],
                "effective_sale_status": effective_status,
                "pause_reason": catalog["pause_reason"] or inherited_reason or row["pause_reason"],
                "replacement_date": catalog["replacement_date"],
                "replacement_url": catalog["replacement_url"],
                "live_product": live_product,
                "query_error": error,
            }
        )

    report = {
        "schema_version": 1,
        "checked_at": args.checked_at,
        "artifact_count": len(results),
        "catalog_drift_count": drifted,
        "automatic_pause_contract": (
            "Any state other than exact-current overrides the registered sale state "
            "with an approved non-sale state. Exact-current preserves all existing gates."
        ),
        "results": results,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"artifacts": len(results), "catalog_drift": drifted, "output": str(args.output)}, indent=2))
    if args.fail_on_catalog_drift and drifted:
        return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
