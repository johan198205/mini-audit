# Growth Measurement Review Agent

En AI-driven verktyg för att genomföra "light audits" av företag och identifiera försäljningsmöjligheter inom mätning, dataanalys, CRO/UX, SEO och GEO.

## Funktioner

- **Wizard-baserad process** med 6 steg för att samla in data och kontext
- **AI-analys** med svenska prompts för olika områden:
  - Mätning (GA4/GTM/Consent)
  - Data & Rapportering (KPI:er, segmentering)
  - CRO/UX (konverteringsoptimering)
  - SEO (sökmotoroptimering)
  - GEO (generativ sökmotoroptimering)
- **Impact/Effort-matrix** för att prioritera rekommendationer
- **Export** till PDF och DOCX med professionell formatering
- **Redigerbar granskning** av AI-resultat

## Teknisk stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** + shadcn/ui komponenter
- **Zustand** för state management
- **React Hook Form** + Zod för formulärvalidering
- **OpenAI GPT-4o-mini** för analys
- **Puppeteer** för PDF-generering
- **docx** för Word-dokument

## Installation

1. Klona repositoryt:
```bash
git clone <repository-url>
cd growth-measurement-review-agent
```

2. Installera dependencies:
```bash
pnpm install
```

3. Skapa `.env.local` fil:
```bash
cp env.example .env.local
```

4. Lägg till din OpenAI API-nyckel i `.env.local`:
```
OPENAI_API_KEY=your_openai_api_key_here
```

5. Starta utvecklingsservern:
```bash
pnpm dev
```

6. Öppna [http://localhost:3000](http://localhost:3000) i din webbläsare.

## Användning

### 1. Företagsinformation
- Ange företagsnamn och huvuddomän
- Välj vilka områden som ska analyseras

### 2. Filuppladdning
- **Screaming Frog export** (obligatorisk) - CSV eller Excel
- **Ahrefs export** (valfri) - CSV eller Excel
- **GA4 export** (valfri) - CSV eller JSON
- **GTM export** (valfri) - CSV eller JSON
- **Skärmdumpar** (valfri) - PNG, JPG eller WebP

### 3. Kontextfrågor
- Affärsmål/NSM
- Primära konverteringar
- Konkurrenter
- Marknader/språk

### 4. AI-analys
- Parallell analys av alla valda områden
- Svenska prompts med fokus på affärsnytta
- Strukturerad JSON-output

### 5. Granskning
- Redigerbar tabell med alla fynd
- Impact/Effort-matrix
- AI-genererad executive summary

### 6. Export
- PDF med professionell formatering
- DOCX för redigering i Word

## Exempeldata

Använd filerna i `/examples` mappen för att testa systemet:
- `screaming-frog-sample.csv` - Exempel på Screaming Frog export
- `ahrefs-sample.csv` - Exempel på Ahrefs export

## API Routes

### Upload
- `POST /api/upload` - Laddar upp filer till `/tmp/uploads`

### Analys
- `POST /api/analyze/measurement` - GA4/GTM/Consent analys
- `POST /api/analyze/data` - KPI:er och segmentering
- `POST /api/analyze/seo` - SEO-analys
- `POST /api/analyze/geo` - GEO-analys
- `POST /api/analyze/ux` - CRO/UX analys (Vision)

### Export
- `POST /api/export/pdf` - Genererar PDF
- `POST /api/export/docx` - Genererar Word-dokument

### Hjälp
- `POST /api/generate-summary` - Genererar executive summary

## Datastruktur

```typescript
type Finding = {
  title: string;
  why_it_matters: string;
  evidence?: string;
  recommendation: string;
  impact: 1|2|3|4|5;
  effort: 1|2|3|4|5;
  area: "GA4"|"GTM"|"Consent"|"Data"|"CRO/UX"|"SEO"|"GEO";
};
```

## Impact/Effort-skala

- **Impact**: 1-5 (mycket låg till mycket hög)
- **Effort**: 1-5 (mycket låg till mycket hög)
- **Quick Wins**: Impact 4-5 + Effort 1-2
- **Strategic Projects**: Impact 4-5 + Effort 3-5

## Utveckling

### Projektstruktur
```
app/
  (wizard)/          # Wizard-sidor
  api/               # API routes
components/          # React-komponenter
lib/
  ai/               # OpenAI integration
  parsers/          # Filparsare
  prompts/          # Svenska prompts
  scoring/          # Impact/Effort-logik
  store/            # Zustand store
  utils/            # Hjälpfunktioner
```

### Lägg till ny analys
1. Skapa prompt i `lib/prompts/`
2. Skapa API route i `app/api/analyze/`
3. Lägg till i wizard-flödet

## Säkerhet

- Alla OpenAI-anrop sker server-side
- Filuppladdningar valideras (typ och storlek)
- Inga API-nycklar exponeras client-side

## Deployment

För produktion:
1. Sätt `OPENAI_API_KEY` miljövariabel
2. Konfigurera filuppladdning för din plattform (S3, etc.)
3. Bygg applikationen: `pnpm build`
4. Starta: `pnpm start`

## Licens

MIT License


