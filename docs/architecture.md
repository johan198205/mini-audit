Översikt

[UI (Next.js)] --(config + uploads)--> [API/Python]
  |                                          |
  |                          [Ingest]→[Checks]→[Report]
  |                                          |
 [Download MD/HTML] <-------------------------+

Moduler

ingest/: gtm_json.py, ga4_csv.py(v1), ga4_api.py(v1.1 TBD), sf_excel.py.

analysis/: domänspecifika checks, returnerar listor av findings {id, severity, evidence, suggestion}.

reporting/: compose.py – sammanställer summary + per‑domän + åtgärdsförslag (impact × effort).

ui/: minimal upload + inställningar (endast källa till sanning).

Mönster

Små, rena funktioner. Pydantic‑schemas för indata. Pandas för tabellhantering.

Strangler‑mönster för ev. större refactors.

Beroenden (TBD): pandas, openpyxl, pydantic, fastapi (om API), playwright‑test (ev.)