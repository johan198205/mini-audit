export const dataSystemPrompt = `Du är en senior dataanalytiker med expertis inom KPI:er, segmentering och affärsintelligens. Svara på svenska. Var mycket specifik och detaljerad. Använd ALLTID konkreta exempel från kundens data.

KRITISKT: Du MÅSTE identifiera minst 8-30 fynd. Om du inte hittar tillräckligt många problem, titta djupare och hitta även mindre viktiga problem.

FÖR ATT HITTA FLER FYND, analysera varje datapunkt separat:
- Varje kanal (organisk, direkt, social, betald, e-post, etc.)
- Varje geografisk region/land
- Varje enhetstyp (mobil, desktop, tablet)
- Varje tidsperiod (veckor, månader, säsonger)
- Varje målgrupp/segment
- Varje sida/landningssida
- Varje konverteringshändelse
- Varje teknisk aspekt (browser, OS, etc.)

VIKTIGT: 
- Var EXTREMT specifik med exakta siffror, procent och trender från kundens GA4-data
- Använd konkreta exempel från kundens trafikdata
- Ge specifika steg för varje rekommendation
- Inkludera exakta siffror, procent och trender när möjligt
- Hitta ALLA möjliga problem, även mindre viktiga

Returnera alltid giltig JSON enligt detta schema:
{
  "findings": [
    {
      "title": "SPECIFIK beskrivning med exakta siffror",
      "why_it_matters": "Konkret förklaring med specifika exempel från kundens data",
      "evidence": "Exakt data från kundens GA4-rapporter som stöder problemet",
      "recommendation": "Detaljerade steg med specifika åtgärder",
      "impact": 1-5,
      "effort": 1-5,
      "area": "Data"
    }
  ],
  "gaps": ["Specifika saknade KPI:er eller segmentering med exakta namn"],
  "summary": "Sammanfattning på max 120 ord"
}

Analysera ALLA aspekter från kundens GA4-data:
- Trafiktrender (använd exakta siffror och procent)
- Kanalprestanda (använd exakta data för varje kanal)
- Konverteringsproblem (använd exakta konverteringsgrad)
- Användarsegmentering (använd exakta data för varje segment)
- Geografisk prestanda (använd exakta data för varje land/region)
- Enhetsprestanda (använd exakta data för mobil/desktop)
- Tidsprestanda (använd exakta data för olika tidsperioder)
- Målgruppsprestanda (använd exakta data för olika målgrupper)

Identifiera ALLA möjliga problem:
1. Trafiktrender (använd exakta siffror och procent)
2. Kanalprestanda (använd exakta data för varje kanal)
3. Konverteringsproblem (använd exakta konverteringsgrad)
4. Användarsegmentering (använd exakta data för varje segment)
5. Geografisk prestanda (använd exakta data för varje land/region)
6. Enhetsprestanda (använd exakta data för mobil/desktop)
7. Tidsprestanda (använd exakta data för olika tidsperioder)
8. Målgruppsprestanda (använd exakta data för olika målgrupper)

KRITISKT: Om du inte hittar tillräckligt många problem, titta på:
- Trafiktrender (använd exakta siffror och procent)
- Kanalprestanda (använd exakta data för varje kanal)
- Konverteringsproblem (använd exakta konverteringsgrad)
- Användarsegmentering (använd exakta data för varje segment)
- Geografisk prestanda (använd exakta data för varje land/region)
- Enhetsprestanda (använd exakta data för mobil/desktop)
- Tidsprestanda (använd exakta data för olika tidsperioder)
- Målgruppsprestanda (använd exakta data för olika målgrupper)

Exempel på BRA fynd-titlar:
- "Organisk sök trafik minskade med 15% senaste 3 månaderna"
- "Mobil trafik har 40% lägre konverteringsgrad än desktop"
- "Direkt trafik ökar med 25% men kvaliteten minskar"

Exempel på BRA rekommendationer:
- "Implementera SEO-strategi för att öka organisk trafik med 20% genom att fokusera på nyckelord med hög volym och låg konkurrens"
- "Optimera mobilupplevelsen för att öka konverteringsgraden från 2.1% till 3.5% genom att förbättra laddningstider och användarupplevelse"

Prioritera högt impact (4-5) och lågt effort (1-2) när möjligt, men inkludera även medelhöga prioriteter.

KRITISKT: Du MÅSTE returnera minst 8-30 fynd. Om du inte hittar tillräckligt många problem, titta djupare och hitta även mindre viktiga problem.`;

export function createDataUserPrompt(
  data: any,
  context: any
): string {
  let dataDescription = 'Ingen GA4-data tillgänglig';
  
  if (data.ga4) {
    if (data.ga4.type === 'api') {
      const analysisType = data.ga4.analysisType || 'default';
      
      if (analysisType === 'session-analysis') {
        dataDescription = `GA4 API Data - DJUP SESSION ANALYS (Direkt från Google Analytics):
- Property ID: ${data.ga4.propertyId}
- Datumintervall: ${data.ga4.dateRange.startDate} till ${data.ga4.dateRange.endDate}
- Analys typ: Session-analys över längre period
- Totalt antal datapunkter: ${data.ga4.totalRows}

DETALJERAD SESSION DATA:
${data.ga4.reports ? Object.entries(data.ga4.reports).map(([reportName, reportData]: [string, any]) => `
${reportName.toUpperCase()}:
- Antal rader: ${reportData?.rows?.length || 0}
- Dimensioner: ${reportData?.dimensionHeaders?.map((h: any) => h.name).join(', ') || 'N/A'}
- Mätvärden: ${reportData?.metricHeaders?.map((h: any) => h.name).join(', ') || 'N/A'}
- Första 10 raderna:
${JSON.stringify(reportData?.rows?.slice(0, 10) || [], null, 2)}
`).join('\n') : 'Ingen rapportdata tillgänglig'}

ANALYSERA DENNA SESSION-DATA SPECIFIKT:
- Jämför dagliga trender över senaste året för att hitta avvikelser
- Analysera timmönster och veckodagsmönster för optimal timing
- Undersök enhetsprestanda och browser-kompatibilitet
- Identifiera säsongsmönster och trender
- Hitta konverteringsmönster över tid
- Analysera kanalprestanda över längre perioder
- Identifiera datakvalitetsproblem eller saknade mätvärden
- Hitta möjligheter för förbättring baserat på djupare dataanalys`;
      } else {
        dataDescription = `GA4 API Data (Direkt från Google Analytics):
- Property ID: ${data.ga4.propertyId}
- Datumintervall: ${data.ga4.dateRange.startDate} till ${data.ga4.dateRange.endDate}
- Totalt antal datapunkter: ${data.ga4.totalRows}
- Tillgängliga rapporter: ${data.ga4.reports ? Object.keys(data.ga4.reports).join(', ') : 'Inga rapporter'}

DETALJERAD DATA PER RAPPORT:
${data.ga4.reports ? Object.entries(data.ga4.reports).map(([reportName, reportData]: [string, any]) => `
${reportName.toUpperCase()}:
- Antal rader: ${reportData?.rows?.length || 0}
- Dimensioner: ${reportData?.dimensionHeaders?.map((h: any) => h.name).join(', ') || 'N/A'}
- Mätvärden: ${reportData?.metricHeaders?.map((h: any) => h.name).join(', ') || 'N/A'}
- Första 5 raderna:
${JSON.stringify(reportData?.rows?.slice(0, 5) || [], null, 2)}
`).join('\n') : 'Ingen rapportdata tillgänglig'}

ANALYSERA DENNA API-DATA SPECIFIKT:
- Jämför prestanda mellan olika kanaler och källor
- Analysera sidprestanda och användarflöden
- Identifiera toppevents och konverteringsmönster
- Undersök demografiska trender och geografisk fördelning
- Hitta möjligheter för förbättring baserat på faktisk data
- Identifiera datakvalitetsproblem eller saknade mätvärden`;
      }
    } else if (data.ga4.type === 'csv' || data.ga4.type === 'multi_csv') {
      const fileInfo = data.ga4.type === 'multi_csv' 
        ? `- Antal filer: ${data.ga4.fileCount}
- Filnamn: ${data.ga4.files.join(', ')}`
        : '';
      
      dataDescription = `GA4 Data (${data.ga4.type === 'multi_csv' ? 'Flera filer' : 'CSV'}):
${fileInfo}
- Totalt antal rader: ${data.ga4.data.length}
- Kolumner: ${data.ga4.columns.join(', ')}
- Första 10 raderna:
${JSON.stringify(data.ga4.data.slice(0, 10), null, 2)}

ANALYSERA DENNA DATA SPECIFIKT:
- Titta på trafiktrender över tid
- Jämför kanalprestanda (organisk, direkt, social, etc.)
- Analysera geografisk fördelning
- Undersök enhetsprestanda (mobil vs desktop)
- Identifiera konverteringsmönster
- Hitta säsongsmönster och trender
- Jämför data mellan olika filer/rapporter
- Identifiera inkonsistenser eller datakvalitetsproblem`;
    } else {
      dataDescription = `GA4 Data: ${JSON.stringify(data.ga4, null, 2)}`;
    }
  }

  return `Analysera följande data för ${context.company}:

${dataDescription}

Kontext:
- Företag: ${context.company}
- Affärsmål: ${context.businessGoal || 'Ej angivet'}
- Konverteringar: ${context.conversions?.join(', ') || 'Ej angivna'}

KRITISKT: Du MÅSTE identifiera minst 8-30 fynd från denna data. Titta på:

1. Trafiktrender och kanalprestanda
2. Konverteringsproblem och möjligheter
3. Användarsegmentering och målgrupper
4. Geografisk prestanda
5. Enhetsprestanda (mobil vs desktop)
6. Tidsprestanda och säsongsmönster
7. Målgruppsprestanda
8. Saknade KPI:er och segmentering
9. Rapporteringsmöjligheter
10. A/B-testing möjligheter
11. Datakvalitetsproblem
12. Affärsmöjligheter

Var EXTREMT specifik med exakta siffror, procent och trender från kundens data. Använd konkreta exempel och ge detaljerade rekommendationer.

Fokusera på insikter som kan öka konverteringar och försäljning.`;
}