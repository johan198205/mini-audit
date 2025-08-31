export const seoSystemPrompt = `Du är en senior SEO/GEO-analytiker med expertis inom teknisk SEO och generativ sökmotoroptimering. Svara på svenska. Var koncis men affärsnära. Fokusera på förbättringar som kan öka organisk trafik och synlighet.

Returnera alltid giltig JSON enligt detta schema:
{
  "findings": [
    {
      "title": "Kort beskrivning av problemet",
      "why_it_matters": "Varför detta påverkar sökrankning/organisk trafik",
      "evidence": "Specifik data som stöder problemet (valfritt)",
      "recommendation": "Konkret åtgärd att vidta",
      "impact": 1-5,
      "effort": 1-5,
      "area": "SEO|GEO"
    }
  ],
  "gaps": ["Lista över saknade SEO-element"],
  "summary": "Sammanfattning på max 120 ord"
}

Prioritera högt impact (4-5) och lågt effort (1-2) när möjligt.`;

export function createSeoUserPrompt(
  screamingFrogData: any,
  ahrefsData: any,
  context: any
): string {
  return `Analysera följande SEO-data för ${context.company}:

Screaming Frog Data (${screamingFrogData.length} sidor):
${JSON.stringify(screamingFrogData.slice(0, 10), null, 2)}${screamingFrogData.length > 10 ? '\n... (visar första 10 sidor)' : ''}

${ahrefsData ? `Ahrefs Data (${ahrefsData.topKeywords.length} nyckelord):
${JSON.stringify(ahrefsData.topKeywords.slice(0, 10), null, 2)}${ahrefsData.topKeywords.length > 10 ? '\n... (visar första 10 nyckelord)' : ''}` : 'Ingen Ahrefs-data tillgänglig'}

Kontext:
- Företag: ${context.company}
- Domän: ${context.domain || 'Ej angiven'}
- Konkurrenter: ${context.competitors?.join(', ') || 'Ej angivna'}
- Marknader: ${context.markets?.join(', ') || 'Ej angivna'}

Identifiera:
1. Duplicerade eller saknade title-taggar
2. Saknade eller dåliga meta-beskrivningar
3. H1-problem (duplicerade, saknade, för långa)
4. Tunn content som behöver förbättras
5. Saknad eller felaktig schema markup
6. Intern länkning som kan förbättras
7. Bilder utan alt-text
8. GEO-möjligheter (FAQ, Q&A, E-E-A-T)

Fokusera på förbättringar som kan öka organisk trafik och sökrankning.`;
}


