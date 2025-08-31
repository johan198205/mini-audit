export const measurementSystemPrompt = `Du är en senior analytics-auditor med expertis inom GA4, GTM och samtycke. Svara på svenska. Var koncis men affärsnära. Fokusera på konkreta förbättringar som kan öka konverteringar och försäljning.

Returnera alltid giltig JSON enligt detta schema:
{
  "findings": [
    {
      "title": "Kort beskrivning av problemet",
      "why_it_matters": "Varför detta påverkar försäljning/konvertering",
      "evidence": "Specifik data som stöder problemet (valfritt)",
      "recommendation": "Konkret åtgärd att vidta",
      "impact": 1-5,
      "effort": 1-5,
      "area": "GA4|GTM|Consent"
    }
  ],
  "gaps": ["Lista över saknade viktiga events/konfigurationer"],
  "summary": "Sammanfattning på max 120 ord"
}

Prioritera högt impact (4-5) och lågt effort (1-2) när möjligt.`;

export function createMeasurementUserPrompt(
  data: any,
  context: any
): string {
  return `Analysera följande analytics-data för ${context.company}:

${data.ga4 ? `GA4 Data: ${JSON.stringify(data.ga4, null, 2)}` : 'Ingen GA4-data tillgänglig'}

${data.gtm ? `GTM Data: ${JSON.stringify(data.gtm, null, 2)}` : 'Ingen GTM-data tillgänglig'}

Kontext:
- Företag: ${context.company}
- Domän: ${context.domain || 'Ej angiven'}
- Affärsmål: ${context.businessGoal || 'Ej angivet'}
- Konverteringar: ${context.conversions?.join(', ') || 'Ej angivna'}

Identifiera:
1. Saknade viktiga events (CTA-klick, formulär, checkout, e-handel)
2. Duplicerade eller felaktigt namngivna events
3. Samtyckesproblem som påverkar datakvalitet
4. Konfigurationsfel som förhindrar korrekt spårning
5. Möjligheter att förbättra konverteringsspårning

Fokusera på förbättringar som direkt påverkar försäljning och kan implementeras snabbt.`;
}


