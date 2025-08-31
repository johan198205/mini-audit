Produkt
Mini‑audit som läser GTM/GA4/SEO och levererar rapport + affärsförslag.

Tech/Tooling

Backend: Python (3.11, TBD) – pandas, pydantic (TBD).

Frontend: Next.js (Node LTS, TBD) – minimal upload/konfiguration.

Test: pytest -q (py), npm test (js). ESLint/Prettier – ändra ej regler.

Beslut

Risknivå: Minimal diff.

UI = single source of truth för inställningar.

Tidsram: ett par dagar.

Artefakter (föreslagna paths)

app/ingest/gtm_json.py, app/ingest/ga4_csv.py, app/ingest/sf_excel.py

app/analysis/{gtm,ga4,seo}_checks.py

app/reporting/compose.py

web/ (Next.js minimal UI)

tests/ + tests/fixtures/

Öppna frågor (TBD)

Exakta CSV/Excel‑fält och exportformat per källa.

Minsta uppsättning checks v1 (prioriterad top‑10 lista).

Rapportformat (MD only vs MD+HTML+PDF).

GA4 API auth‑flöde v1 eller vänta till v1.1?

Versioner: Python/Node, paket‑lock.