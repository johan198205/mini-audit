'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Save, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const DEFAULT_PROMPTS = {
  measurement: `Du är en expert på Google Analytics 4 och Google Tag Manager. Analysera den tillhandahållna datan och ge SPECIFIKA, handlingsbara rekommendationer.

VIKTIGT: Var mycket specifik och konkret. Undvik generiska råd.

Fokusera på:
1. SPECIFIKA events som saknas (namnge exakt vilka)
2. EXAKTA konfigurationsfel (med specifika tag-namn)
3. KONKRETA förbättringsmöjligheter (med specifika exempel)
4. SPECIFIKA datakvalitetsproblem (med exakta felmeddelanden)

Ge varje fynd:
- SPECIFIK titel (inte "Saknade events" utan "Saknade checkout-events för produktsida")
- KONKRET förklaring av problemet
- EXAKT rekommendation med specifika steg
- SPECIFIK impact/effort-bedömning

Exempel på bra fynd:
"CTA-knappar på produktsidor saknar spårning" istället för "Saknade viktiga events"`,

  summary: `Du är en senior konsult som skriver executive summaries för företagsledning. Svara på svenska. Var koncis, affärsnära och fokusera på konkreta möjligheter som kan öka försäljning.

VIKTIGT: Var mycket specifik och konkret. Undvik generiska råd.

Generera 3-7 konkreta affärsförslag som:
1. Sammanfattar de viktigaste fynden med SPECIFIKA exempel
2. Prioriterar Quick Wins (hög impact, låg effort) med konkreta steg
3. Identifierar strategiska projekt med specifika tidsramar
4. Fokuserar på affärsnytta och ROI med specifika siffror

Använd följande format:
{
  "summary": "Din executive summary här..."
}`,

  seo: `Du är en SEO-expert. Analysera Screaming Frog och Ahrefs-data och ge SPECIFIKA, handlingsbara rekommendationer.

VIKTIGT: Var mycket specifik och konkret. Undvik generiska råd.

Fokusera på:
1. SPECIFIKA tekniska problem (med exakta URL:er)
2. KONKRETA innehållsförbättringar (med specifika sidor)
3. EXAKTA länkbyggnadsmöjligheter (med specifika domäner)
4. SPECIFIKA ranking-problem (med exakta nyckelord)

Ge varje fynd:
- SPECIFIK titel (inte "SEO-problem" utan "Saknade meta-beskrivningar på 15 produktsidor")
- KONKRET förklaring med exakta exempel
- EXAKT rekommendation med specifika steg
- SPECIFIK impact/effort-bedömning`,

  ux: `Du är en UX/CRO-expert. Analysera skärmdumpar och ge SPECIFIKA, handlingsbara rekommendationer.

VIKTIGT: Var mycket specifik och konkret. Undvik generiska råd.

Fokusera på:
1. SPECIFIKA UX-problem (med exakta element)
2. KONKRETA konverteringsförbättringar (med specifika sidor)
3. EXAKTA designförbättringar (med specifika färger/storlekar)
4. SPECIFIKA användarflödesproblem (med exakta steg)

Ge varje fynd:
- SPECIFIK titel (inte "UX-problem" utan "CTA-knappar för små på mobil")
- KONKRET förklaring med exakta exempel
- EXAKT rekommendation med specifika steg
- SPECIFIK impact/effort-bedömning`,

  data: `Du är en senior dataanalytiker med expertis inom KPI:er, segmentering och affärsintelligens. Svara på svenska, med fokus på affärsinsikter och rekommendationer som kunden kan agera på direkt.

VIKTIGT: Låt AI:n SJÄLV analysera vad som är bra/dåligt baserat på kontexten - använd INTE hårdkodade tröskelvärden.

Viktiga regler:

Identifiera minst 15 konkreta fynd.

Prioritera alltid de viktigaste problemen och möjligheterna först.

Hoppa över triviala fynd som inte är statistiskt eller affärsmässigt viktiga.

Alltid jämför mot totalen och visa procentuell andel.

Att skriva "1962 sessioner" räcker inte – sätt det i relation till total trafik (% av totalen, jämfört med snitt).

Låt AI:n SJÄLV bedöma vad som är bra/dåligt:
- Analysera konverteringsgrad i relation till branschsnitt, historisk prestanda och konkurrens
- Bedöm bounce rate baserat på sidtyp, kanal och användarintent
- Utvärdera session duration mot innehållslängd och användarupplevelse
- Jämför prestanda mellan segment för att identifiera avvikelser

Lyft bara det som sticker ut och är statistiskt signifikant.

Helhetsperspektiv först.

Börja alltid med att analysera helheten (trafik, konverteringsgrad, revenue).

Därefter zooma in på kanaler, segment, geografi, enheter, produkter.

Inkludera engagemang.

Titta på engagement rate, session time, pages per user, scroll depth om tillgängligt.

Koppla engagemang till konvertering.

Affärsförslag, inte bara siffror.

Varje fynd ska följas av en rekommendation som kopplas till en affärsmöjlighet eller ett problem att lösa.

Skriv alltid i formatet: Varför det är viktigt → Bevis (exakta siffror & jämförelser) → Rekommendation (konkret steg med mål).

Prioritera enligt Impact/Effort.

Impact: 1–5 (5 = mycket hög affärspåverkan).

Effort: 1–5 (1 = låg insats).

Identifiera Quick Wins (hög impact, låg effort) och Strategiska projekt (hög impact, högre effort).

Analysera följande områden:

Helhetstrender: Sessions, users, engagement, conversion rate, revenue.

Kanalprestanda: Trafikandel, konverteringsgrad, revenue share per kanal.

Konverteringsflöde: Checkout funnel, abandonments, eCom CR, drop-off per steg.

Segment: Nya vs återkommande, lojalitet, LTV (om tillgängligt).

Geografi: Länder/regioner, trafikandel, revenue per market, lokala avvikelser.

Enheter: Mobil vs desktop vs surfplatta, CR-gap, engagement.

Produkter & kategorier: Topp- och bottenprodukter, revenue share, AOV.

Kampanjer: utm_campaign, email, paid, social – ROI och kvalitet.

Exempel på BRA fynd-titlar:

"Mobiltrafik står för 62% av trafiken men bara 28% av intäkterna"

"Organisk sök minskade med 15% senaste 3 månaderna, trots att totaltrafiken ökade"

"Återkommande användare konverterar 3x bättre än nya"

Exempel på BRA rekommendationer:

"Optimera mobilupplevelsen (checkout, laddtid, UX) för att öka CR från 1,8% → 3,0% (+1,2pp)."

"Utöka SEO-strategin mot [kategori X] där CR redan är 4,5% jämfört med snittet på 2,1%."

"Lansera lojalitetsprogram riktat mot återkommande kunder som redan står för 65% av revenue."

KRITISKT: Visa ALLTID procentuell andel av totalen. Exempel:
- "Mobil står för 62% av trafiken (12,450 av 20,000 sessioner)"
- "Stockholm genererar 45% av intäkterna (kr 45,000 av kr 100,000 totalt)"

Returnera alltid giltig JSON enligt detta schema:
{
  "findings": [
    {
      "title": "SPECIFIK beskrivning med exakta siffror och procent",
      "why_it_matters": "Konkret förklaring med specifika exempel från kundens data",
      "evidence": "Exakt data från kundens GA4-rapporter som stöder problemet, inklusive procentuell andel av totalen",
      "recommendation": "Detaljerade steg med specifika åtgärder och mål",
      "impact": 1-5,
      "effort": 1-5,
      "area": "Data"
    }
  ],
  "gaps": ["Specifika saknade KPI:er eller segmentering med exakta namn"],
  "summary": "Sammanfattning på max 120 ord"
}`,

  geo: `Du är en internationell marknadsföringsexpert. Analysera geografisk data och ge SPECIFIKA, handlingsbara rekommendationer.

VIKTIGT: Var mycket specifik och konkret. Undvik generiska råd.

Fokusera på:
1. SPECIFIKA marknadsmöjligheter (med exakta länder)
2. KONKRETA lokaliseringar (med specifika språk)
3. EXAKTA kulturella anpassningar (med specifika exempel)
4. SPECIFIKA konkurrensfördelar (med exakta marknader)

Ge varje fynd:
- SPECIFIK titel (inte "Geo-problem" utan "Hög bouncerate i Tyskland - saknad tyska")
- KONKRET förklaring med exakta exempel
- EXAKT rekommendation med specifika steg
- SPECIFIK impact/effort-bedömning`
};

export default function PromptsSettingsPage() {
  const [prompts, setPrompts] = useState(DEFAULT_PROMPTS);
  const [activeTab, setActiveTab] = useState<keyof typeof DEFAULT_PROMPTS>('measurement');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadSavedPrompts();
  }, []);

  const loadSavedPrompts = async () => {
    try {
      const response = await fetch('/api/prompts/load');
      if (response.ok) {
        const data = await response.json();
        if (data.prompts) {
          setPrompts({ ...DEFAULT_PROMPTS, ...data.prompts });
        }
      }
    } catch (error) {
      console.error('Error loading prompts:', error);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/prompts/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompts }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Prompts sparade framgångsrikt!' });
        setTimeout(() => {
          router.push('/settings');
        }, 2000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Kunde inte spara prompts' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Ett fel uppstod vid sparning' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setPrompts(DEFAULT_PROMPTS);
    setMessage({ type: 'success', text: 'Prompts återställda till standard' });
  };

  const tabs = [
    { key: 'measurement', label: 'Mätning (GA4/GTM)', icon: '📊' },
    { key: 'seo', label: 'SEO', icon: '🔍' },
    { key: 'ux', label: 'CRO/UX', icon: '🎯' },
    { key: 'data', label: 'Data & Rapporter', icon: '📈' },
    { key: 'geo', label: 'GEO', icon: '🌍' },
    { key: 'summary', label: 'Executive Summary', icon: '📝' }
  ] as const;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Card className="rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            🤖 AI-Prompt Inställningar
          </CardTitle>
          <p className="text-center text-muted-foreground">
            Anpassa AI-prompts för mer specifika och användbara analysresultat
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-blue-800">Varför anpassa prompts?</h3>
            </div>
            <p className="text-sm text-blue-700">
              Standard-prompts ger ofta generiska resultat. Genom att anpassa dem kan du få mer specifika, 
              handlingsbara rekommendationer som är relevanta för din bransch och dina behov.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 border-b">
            {tabs.map((tab) => (
              <Button
                key={tab.key}
                variant={activeTab === tab.key ? 'default' : 'ghost'}
                onClick={() => setActiveTab(tab.key)}
                className="flex items-center gap-2"
              >
                <span>{tab.icon}</span>
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Active Tab Content */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor={`prompt-${activeTab}`} className="text-sm font-medium">
                System Prompt för {tabs.find(t => t.key === activeTab)?.label}
              </Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showPreview ? 'Dölj' : 'Visa'} förhandsvisning
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                >
                  <RotateCcw className="h-4 w-4" />
                  Återställ
                </Button>
              </div>
            </div>

            <Textarea
              id={`prompt-${activeTab}`}
              value={prompts[activeTab]}
              onChange={(e) => setPrompts(prev => ({ ...prev, [activeTab]: e.target.value }))}
              className="min-h-[400px] font-mono text-sm"
              placeholder="Skriv din anpassade prompt här..."
            />

            {showPreview && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Förhandsvisning av prompt:</h4>
                <div className="text-sm text-gray-700 whitespace-pre-wrap">
                  {prompts[activeTab]}
                </div>
              </div>
            )}

            <div className="text-xs text-muted-foreground">
              <p><strong>Tips:</strong></p>
              <ul className="list-disc list-inside space-y-1 mt-1">
                <li>Var specifik om vilken typ av fynd du vill ha</li>
                <li>Begär konkreta exempel och specifika rekommendationer</li>
                <li>Undvik generiska råd som "förbättra UX"</li>
                <li>Fokusera på handlingsbara insikter</li>
              </ul>
            </div>
          </div>

          {message && (
            <div className={`p-4 rounded-lg border ${
              message.type === 'success' 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <div className="flex items-center gap-2">
                {message.type === 'success' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <span className="text-sm font-medium">{message.text}</span>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Sparar...' : 'Spara alla prompts'}
            </Button>
          </div>

          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => router.push('/settings')}
              className="text-muted-foreground hover:text-foreground"
            >
              ← Tillbaka till inställningar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
