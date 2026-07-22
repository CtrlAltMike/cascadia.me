#!/usr/bin/env python3

from __future__ import annotations

import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from phase2_common import classify_catalog, effective_recheck_status  # noqa: E402


REGISTERED_URL = "https://prd-tnm.s3.amazonaws.com/StagedProducts/Maps/USTopo/PDF/WA/example.pdf"
REGISTERED_DATE = "2023-08-18"


class CatalogDecisionTests(unittest.TestCase):
    def test_exact_current_preserves_existing_gate(self) -> None:
        live = {"product_url": REGISTERED_URL, "product_date": REGISTERED_DATE}
        result = classify_catalog(REGISTERED_URL, REGISTERED_DATE, live)
        self.assertEqual(result["catalog_status"], "exact-current")
        status, reason = effective_recheck_status(
            "blocked-territory", result
        )
        self.assertEqual(status, "blocked-territory")
        self.assertEqual(reason, "")

    def test_new_url_pauses_as_superseded(self) -> None:
        live = {
            "product_url": REGISTERED_URL.replace("example.pdf", "replacement.pdf"),
            "product_date": "2026-07-21",
        }
        result = classify_catalog(REGISTERED_URL, REGISTERED_DATE, live)
        status, _ = effective_recheck_status("eligible", result)
        self.assertEqual(result["catalog_status"], "superseded")
        self.assertEqual(status, "paused-new-edition-check")

    def test_new_date_pauses_as_superseded(self) -> None:
        live = {"product_url": REGISTERED_URL, "product_date": "2026-07-21"}
        result = classify_catalog(REGISTERED_URL, REGISTERED_DATE, live)
        status, _ = effective_recheck_status("eligible", result)
        self.assertEqual(result["catalog_status"], "superseded")
        self.assertEqual(status, "paused-new-edition-check")

    def test_missing_record_pauses_as_withdrawn(self) -> None:
        result = classify_catalog(REGISTERED_URL, REGISTERED_DATE, None)
        status, _ = effective_recheck_status("eligible", result)
        self.assertEqual(result["catalog_status"], "withdrawn")
        self.assertEqual(status, "blocked-stale")

    def test_catalog_error_pauses_as_unconfirmed(self) -> None:
        result = classify_catalog(
            REGISTERED_URL, REGISTERED_DATE, None, "timeout"
        )
        status, _ = effective_recheck_status("eligible", result)
        self.assertEqual(result["catalog_status"], "unconfirmed")
        self.assertEqual(status, "blocked-stale")


if __name__ == "__main__":
    unittest.main()
