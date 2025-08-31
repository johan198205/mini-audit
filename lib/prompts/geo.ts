export const geoSystemPrompt = `Du är en GEO-expert (Generativ Engine Optimization) med fokus på hur innehåll kan fångas av generativa sökmotorer som ChatGPT, Gemini och Bing Chat. Svara på svenska. Var koncis men affärsnära.

Returnera alltid giltig JSON enligt detta schema:
{
  "findings": [
    {
      "title": "Kort beskrivning av möjligheten",
      "why_it_matters": "Varför detta påverkar synlighet i generativa sökmotorer",
      "evidence": "Specifik data som stöder möjligheten (valfritt)",
      "recommendation": "Konkret åtgärd att vidta",
      "impact": 1-5,
      "effort": 1-5,
      "area": "GEO"
    }
  ],
  "gaps": ["Lista över saknade GEO-element"],
  "summary": "Sammanfattning på max 120 ord"
}

Prioritera högt impact (4-5) och lågt effort (1-2) när möjligt.`;

export function createGeoUserPrompt(
  screamingFrogData: any,
  context: any
): string {
  return `Analysera följande innehåll för GEO-möjligheter för ${context.company}:

Screaming Frog Data (${screamingFrogData.length} sidor):
${JSON.stringify(screamingFrogData.slice(0, 10), null, 2)}${screamingFrogData.length > 10 ? '\n... (visar första 10 sidor)' : ''}

Kontext:
- Företag: ${context.company}
- Domän: ${context.domain || 'Ej angiven'}
- Affärsmål: ${context.businessGoal || 'Ej angivet'}
- Marknader: ${context.markets?.join(', ') || 'Ej angivna'}

Identifiera GEO-möjligheter:
1. FAQ-schema markup för vanliga frågor
2. Q&A-innehåll som kan fångas av AI-assistenter
3. E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) bevis
4. Strukturerad data för produkter/tjänster
5. Innehåll som svarar på "hur", "vad", "när", "varför" frågor
6. Möjligheter att nämnas i externa källor
7. Innehåll som kan citeras av generativa sökmotorer
8. Lokal SEO för generativa sökmotorer

Fokusera på innehåll som kan öka synlighet i AI-assistenter och generativa sökmotorer.`;
}


