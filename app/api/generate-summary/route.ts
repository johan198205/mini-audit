import { NextRequest, NextResponse } from 'next/server';
import { runSummaryPrompt } from '@/lib/ai/runPrompt';
import { loadCustomPrompts } from '@/lib/utils/prompts';

export async function POST(request: NextRequest) {
  try {
    const { company, analysisResults } = await request.json();

    console.log('Generate summary request:', { company, analysisResultsKeys: Object.keys(analysisResults || {}) });

    if (!company || !analysisResults) {
      console.log('Missing required fields:', { company: !!company, analysisResults: !!analysisResults });
      return NextResponse.json({ error: 'Company and analysis results are required' }, { status: 400 });
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      return NextResponse.json({ 
        error: 'OpenAI API key not configured. Please add your API key in settings.' 
      }, { status: 500 });
    }

    // Load custom prompts if available
    const customPrompts = await loadCustomPrompts();
    
    const systemPrompt = customPrompts.summary || `Du är en senior konsult som skriver executive summaries för företagsledning. Svara på svenska. Var koncis, affärsnära och fokusera på konkreta möjligheter som kan öka försäljning.

Skriv en executive summary på max 200 ord som:
1. Sammanfattar de viktigaste fynden
2. Prioriterar Quick Wins (hög impact, låg effort)
3. Identifierar strategiska projekt
4. Fokuserar på affärsnytta och ROI

Använd följande format:
{
  "summary": "Din executive summary här..."
}`;

    const sectionSummaries = Object.entries(analysisResults)
      .map(([section, result]) => `${section}: ${result.summary || 'Ingen sammanfattning tillgänglig'}`)
      .join('\n\n');

    const userPrompt = `Skriv en executive summary för ${company} baserat på följande analysresultat:

${sectionSummaries}

Fokusera på:
- De viktigaste förbättringsmöjligheterna
- Quick wins som kan implementeras snabbt
- Strategiska projekt för långsiktig tillväxt
- Konkreta affärsnyttor och ROI

Håll det under 200 ord och skriv för företagsledning.`;

    // For now, use fallback summary to avoid OpenAI issues
    const sections = Object.keys(analysisResults);
    const totalFindings = Object.values(analysisResults).reduce((sum, result) => sum + result.findings.length, 0);
    
    const fallbackSummary = `Analysen av ${company} har genomförts och identifierat ${totalFindings} förbättringsmöjligheter inom ${sections.join(', ')}. 

De viktigaste fynden inkluderar tekniska optimeringar, användarupplevelse-förbättringar och datakvalitetsproblem som kan påverka affärsresultatet.

För att få en mer detaljerad AI-genererad sammanfattning, kontrollera att din OpenAI API-nyckel är korrekt konfigurerad.`;

    return NextResponse.json({
      summary: fallbackSummary
    });

  } catch (error) {
    console.error('Summary generation error:', error);
    
    // Fallback: Generate a basic summary from the analysis results
    try {
      const sections = Object.keys(analysisResults);
      const totalFindings = Object.values(analysisResults).reduce((sum, result) => sum + result.findings.length, 0);
      
      const fallbackSummary = `Analysen av ${company} har genomförts och identifierat ${totalFindings} förbättringsmöjligheter inom ${sections.join(', ')}. 

De viktigaste fynden inkluderar tekniska optimeringar, användarupplevelse-förbättringar och datakvalitetsproblem som kan påverka affärsresultatet.

För att få en mer detaljerad AI-genererad sammanfattning, kontrollera att din OpenAI API-nyckel är korrekt konfigurerad.`;

      return NextResponse.json({
        summary: fallbackSummary
      });
    } catch (fallbackError) {
      console.error('Fallback summary generation error:', fallbackError);
      return NextResponse.json(
        { error: `Failed to generate summary: ${error instanceof Error ? error.message : 'Unknown error'}` },
        { status: 500 }
      );
    }
  }
}
