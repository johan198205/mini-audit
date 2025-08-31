import { NextRequest, NextResponse } from 'next/server';
import { runPrompt } from '@/lib/ai/runPrompt';
import { parseScreamingFrog } from '@/lib/parsers/screamingFrog';
import { parseAhrefs } from '@/lib/parsers/ahrefs';
import { seoSystemPrompt, createSeoUserPrompt } from '@/lib/prompts/seo';
import { AnalysisRequest } from '@/lib/types';
import { loadCustomPrompts } from '@/lib/utils/prompts';

export async function POST(request: NextRequest) {
  try {
    const body: AnalysisRequest = await request.json();
    const { company, files, context, promptOverrides } = body;

    if (!company) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      return NextResponse.json({ 
        error: 'OpenAI API key not configured. Please add your API key to .env.local' 
      }, { status: 500 });
    }

    let screamingFrogData = [];
    let ahrefsData = null;

    // Parse Screaming Frog data (required)
    if (files?.screamingFrog) {
      try {
        screamingFrogData = await parseScreamingFrog(files.screamingFrog as string);
      } catch (error) {
        console.error('Error parsing Screaming Frog data:', error);
        return NextResponse.json(
          { error: 'Failed to parse Screaming Frog data' },
          { status: 400 }
        );
      }
    } else {
      // If no Screaming Frog data, return empty analysis
      return NextResponse.json({
        findings: [],
        gaps: ['Ingen Screaming Frog-data tillgänglig för SEO-analys'],
        summary: 'SEO-analys kräver Screaming Frog-data för att kunna utföras.'
      });
    }

    // Parse Ahrefs data (optional)
    if (files?.ahrefs) {
      try {
        ahrefsData = await parseAhrefs(files.ahrefs as string);
      } catch (error) {
        console.error('Error parsing Ahrefs data:', error);
        // Continue without Ahrefs data
      }
    }

    // Load custom prompts if available
    const customPrompts = await loadCustomPrompts();
    
    // Create prompts - use custom prompt if available, otherwise use override or default
    const systemPrompt = promptOverrides?.seo || customPrompts.seo || seoSystemPrompt;
    const userPrompt = createSeoUserPrompt(screamingFrogData, ahrefsData, {
      company,
      domain: context?.url,
      competitors: context?.competitors,
      markets: context?.markets,
    });

    // Run AI analysis
    const result = await runPrompt(systemPrompt, userPrompt);

    return NextResponse.json(result);

  } catch (error) {
    console.error('SEO analysis error:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json({ 
          error: 'OpenAI API key is invalid or not configured' 
        }, { status: 500 });
      }
      if (error.message.includes('quota')) {
        return NextResponse.json({ 
          error: 'OpenAI API quota exceeded' 
        }, { status: 500 });
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to perform SEO analysis' },
      { status: 500 }
    );
  }
}