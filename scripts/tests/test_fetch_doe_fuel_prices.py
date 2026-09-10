"""Focused coverage for DOE fuel-price report discovery."""

from datetime import date
import importlib.util
from pathlib import Path
import sys
import unittest
from unittest.mock import MagicMock


SCRIPT_PATH = Path(__file__).parents[1] / 'fetch-doe-fuel-prices.py'
SPEC = importlib.util.spec_from_file_location('fetch_doe_fuel_prices', SCRIPT_PATH)
assert SPEC and SPEC.loader
fuel_prices = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = fuel_prices
sys.modules.setdefault('pdfplumber', MagicMock())
SPEC.loader.exec_module(fuel_prices)


LISTING_FIXTURE = '''
<a href="https://prod-cms.doe.gov.ph/documents/d/guest/vfo-price-monitoring-081826-pdf">
  August 18 to 24
</a>
<a href="https://d24qbtp4vooyzi.cloudfront.net/api/media/file/List%20of%20Visayas%20Pump%20Prices%20for%2025%20to%2031%20August%202026.pdf?prefix=dev%2Fmedia">
  August 25 to 31
</a>
<a href="https://d24qbtp4vooyzi.cloudfront.net/api/media/file/List%20of%20Visayas%20Pump%20Prices%2001-07%20September%202026.pdf?prefix=dev%2Fmedia">
  September 1 to 7
</a>
<a href="https://example.com/report.pdf">September 8 to 14</a>
'''


class DiscoverReportUrlsTests(unittest.TestCase):
    def test_discovers_legacy_and_cloudfront_attachments(self) -> None:
        reports = fuel_prices.discover_report_urls_from_listing(LISTING_FIXTURE)

        self.assertEqual(
            reports,
            {
                date(2026, 8, 18): (
                    'https://prod-cms.doe.gov.ph/documents/d/guest/'
                    'vfo-price-monitoring-081826-pdf'
                ),
                date(2026, 8, 25): (
                    'https://d24qbtp4vooyzi.cloudfront.net/api/media/file/'
                    'List%20of%20Visayas%20Pump%20Prices%20for%2025%20to%2031%20August%202026.pdf'
                    '?prefix=dev%2Fmedia'
                ),
                date(2026, 9, 1): (
                    'https://d24qbtp4vooyzi.cloudfront.net/api/media/file/'
                    'List%20of%20Visayas%20Pump%20Prices%2001-07%20September%202026.pdf'
                    '?prefix=dev%2Fmedia'
                ),
            },
        )

    def test_missing_listing_attachment_does_not_guess_a_legacy_url(self) -> None:
        with self.assertRaises(fuel_prices.PDFNotPublished):
            fuel_prices.fetch_pdf(date(2026, 9, 8))


if __name__ == '__main__':
    unittest.main()
