import { NextRequest, NextResponse } from 'next/server';
import { runPrompt } from '@/lib/ai/runPrompt';
import { measurementSystemPrompt, createMeasurementUserPrompt } from '@/lib/prompts/measurement';
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

    // Parse GA4 and GTM data if available
    let ga4Data = null;
    let gtmData = null;

    if (files?.ga4) {
      try {
        const fs = await import('fs/promises');
        const content = await fs.readFile(files.ga4 as string, 'utf-8');
        ga4Data = JSON.parse(content);
      } catch (error) {
        console.error('Error parsing GA4 data:', error);
        // Continue without GA4 data
      }
    }

    if (files?.gtm) {
      try {
        const fs = await import('fs/promises');
        const content = await fs.readFile(files.gtm as string, 'utf-8');
        gtmData = JSON.parse(content);
      } catch (error) {
        console.error('Error parsing GTM data:', error);
        // Continue without GTM data
      }
    }

    // Load custom prompts if available
    const customPrompts = await loadCustomPrompts();
    
    // Create prompts - use custom prompt if available, otherwise use override or default
    const systemPrompt = promptOverrides?.measurement || customPrompts.measurement || measurementSystemPrompt;
    const userPrompt = createMeasurementUserPrompt(
      { ga4: ga4Data, gtm: gtmData },
      {
        company,
        domain: context?.url,
        businessGoal: context?.businessGoal,
        conversions: context?.conversions,
      }
    );

    // Run AI analysis
    const result = await runPrompt(systemPrompt, userPrompt);

    return NextResponse.json(result);

  } catch (error) {
    console.error('Measurement analysis error:', error);
    
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
      { error: 'Failed to perform measurement analysis' },
      { status: 500 }
    );
  }
}