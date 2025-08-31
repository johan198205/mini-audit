export const croUxSystemPrompt = `Du är en CRO/UX-expert med expertis inom konverteringsoptimering och användarupplevelse. Svara på svenska. Var koncis men affärsnära. Fokusera på förbättringar som kan öka konverteringsgraden.

Returnera alltid giltig JSON enligt detta schema:
{
  "findings": [
    {
      "title": "Kort beskrivning av problemet",
      "why_it_matters": "Varför detta påverkar konverteringar",
      "evidence": "Specifik observation från skärmdump (valfritt)",
      "recommendation": "Konkret åtgärd att vidta",
      "impact": 1-5,
      "effort": 1-5,
      "area": "CRO/UX"
    }
  ],
  "gaps": ["Lista över UX-problem som behöver åtgärdas"],
  "summary": "Sammanfattning på max 120 ord"
}

Prioritera högt impact (4-5) och lågt effort (1-2) när möjligt.`;

export function createCroUxUserPrompt(
  context: any
): string {
  return `Analysera följande skärmdumpar för CRO/UX-förbättringar för ${context.company}:

Kontext:
- Företag: ${context.company}
- Domän: ${context.domain || 'Ej angiven'}
- Affärsmål: ${context.businessGoal || 'Ej angivet'}
- Konverteringar: ${context.conversions?.join(', ') || 'Ej angivna'}

Utvärdera följande aspekter från skärmdumpen:
1. CTA-synlighet och placering
2. Formulärdesign och användarvänlighet
3. Tillitsfaktorer och social proof
4. Mobil användbarhet
5. Navigationsstruktur
6. Innehållshierarki
7. Laddningstider och prestanda
8. Tillgänglighet

Identifiera konkreta förbättringar som kan öka konverteringsgraden och användarupplevelsen.`;
}


