Syfte
Säkerställa Prompt‑Driven Development (PDD) i Cursor: spec → test → kod, minsta möjliga diff, reproducerbara körningar.

Principer

Smallest possible change; inga orelaterade refaktoreringar.

Unified diffs only i alla svar.

Touch only: måste anges i varje prompt.

Tests först där möjligt; annars skapa minimal testrigg/fixtures.

Keep public APIs stable; bryt inte användarflöde.

UI är single source of truth för prompt/inställningar – inga hårdkodade defaults eller overrides i kod.

Aldrig ändra configs/linters/build utan uttryckligt OK.

Data‑kontrakt (TBD förenklad)

GTM (JSON export): containers[], tags[], triggers[], variables[].

GA4 (CSV export/API): dimensions+metrics med tidsstämplar; t.ex. events, sessions, conversions.

Screaming Frog (Excel): On‑Page, Directives, Response Codes, Inlinks/Outlinks.

Checks (exempel)

GTM: saknad Consent Mode, taggar utan utlösare, dubbletter, ospecificerade vars.

GA4: saknade key events, ingen purchase senaste 30 dagar, felaktiga session source/medium, sampling varning.

SEO: 4xx/5xx topp‑URL:er, noindex/blocking, saknade canonicals, tunna titlar, brutna inlänkar.

Rapport
Generator skriver Markdown (+ enkel HTML render) med sammanfattning, fynd per domän, och konkreta affärsförslag (prioritet/impact/effort).