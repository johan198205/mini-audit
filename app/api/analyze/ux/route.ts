import { NextRequest, NextResponse } from 'next/server';
import { runVisionPrompt } from '@/lib/ai/runPrompt';
import { croUxSystemPrompt, createCroUxUserPrompt } from '@/lib/prompts/croUx';
import { AnalysisRequest } from '@/lib/types';
import { loadCustomPrompts } from '@/lib/utils/prompts';

export async function POST(request: NextRequest) {
  try {
    const body: AnalysisRequest = await request.json();
    const { company, files, context, promptOverrides } = body;

    if (!company) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    }

    // Check if screenshots are provided
    const screenshots = files?.screenshots as string[];
    if (!screenshots || screenshots.length === 0) {
      // Return empty result if no screenshots
      return NextResponse.json({
        findings: [],
        gaps: ['Inga skärmdumpar tillgängliga för CRO/UX-analys'],
        summary: 'CRO/UX-analys kräver skärmdumpar för att kunna utföras.'
      });
    }

    // Load custom prompts if available
    const customPrompts = await loadCustomPrompts();
    
    // Create prompts - use custom prompt if available, otherwise use override or default
    const systemPrompt = promptOverrides?.ux || customPrompts.ux || croUxSystemPrompt;
    const userPrompt = createCroUxUserPrompt({
      company,
      domain: context?.url,
      businessGoal: context?.businessGoal,
      conversions: context?.conversions,
    });

    // Run AI vision analysis
    const result = await runVisionPrompt(systemPrompt, userPrompt, screenshots);

    return NextResponse.json(result);

  } catch (error) {
    console.error('UX analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to perform UX analysis' },
      { status: 500 }
    );
  }
}
