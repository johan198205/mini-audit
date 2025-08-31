import { NextRequest, NextResponse } from 'next/server';
import { runPrompt } from '@/lib/ai/runPrompt';
import { parseScreamingFrog } from '@/lib/parsers/screamingFrog';
import { geoSystemPrompt, createGeoUserPrompt } from '@/lib/prompts/geo';
import { AnalysisRequest } from '@/lib/types';
import { loadCustomPrompts } from '@/lib/utils/prompts';

export async function POST(request: NextRequest) {
  try {
    const body: AnalysisRequest = await request.json();
    const { company, files, context, promptOverrides } = body;

    if (!company) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    }

    let screamingFrogData = [];

    // Parse Screaming Frog data (required for GEO analysis)
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
      return NextResponse.json(
        { error: 'Screaming Frog data is required for GEO analysis' },
        { status: 400 }
      );
    }

    // Load custom prompts if available
    const customPrompts = await loadCustomPrompts();
    
    // Create prompts - use custom prompt if available, otherwise use override or default
    const systemPrompt = promptOverrides?.geo || customPrompts.geo || geoSystemPrompt;
    const userPrompt = createGeoUserPrompt(screamingFrogData, {
      company,
      domain: context?.url,
      businessGoal: context?.businessGoal,
      markets: context?.markets,
    });

    // Run AI analysis
    const result = await runPrompt(systemPrompt, userPrompt);

    return NextResponse.json(result);

  } catch (error) {
    console.error('GEO analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to perform GEO analysis' },
      { status: 500 }
    );
  }
}
