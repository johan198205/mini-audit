import { openai } from './client';
import { AnalysisResult } from '@/lib/types';

export async function runPrompt(
  systemPrompt: string,
  userPrompt: string,
  temperature: number = 0.2
): Promise<AnalysisResult> {
  try {
    console.log('runPrompt called with:', { 
      systemPromptLength: systemPrompt.length, 
      userPromptLength: userPrompt.length,
      temperature 
    });
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature,
      response_format: { type: 'json_object' }
    });

    console.log('OpenAI response received:', { choices: response.choices.length });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response content from OpenAI');
    }

    console.log('Response content length:', content.length);
    console.log('Response content preview:', content.substring(0, 500));

    const result = safeJson(content);
    console.log('Parsed result:', { 
      findingsCount: result.findings.length, 
      hasGaps: !!result.gaps, 
      hasSummary: !!result.summary 
    });
    
    return result;
  } catch (error) {
    console.error('Error running prompt:', error);
    throw new Error('Failed to get AI analysis');
  }
}

export async function runSummaryPrompt(
  systemPrompt: string,
  userPrompt: string,
  temperature: number = 0.2
): Promise<{ summary: string }> {
  try {
    console.log('runSummaryPrompt called with:', { systemPrompt: systemPrompt.substring(0, 100), userPrompt: userPrompt.substring(0, 100) });
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature,
      response_format: { type: 'json_object' }
    });

    console.log('OpenAI response received:', { choices: response.choices.length });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response content from OpenAI');
    }

    console.log('Response content:', content.substring(0, 200));

    const parsed = JSON.parse(content);
    if (!parsed.summary) {
      throw new Error('Invalid response structure: missing summary');
    }

    return parsed;
  } catch (error) {
    console.error('Error running summary prompt:', error);
    throw new Error('Failed to generate summary');
  }
}

export async function runVisionPrompt(
  systemPrompt: string,
  userPrompt: string,
  imagePaths: string[],
  temperature: number = 0.2
): Promise<AnalysisResult> {
  try {
    const fs = await import('fs/promises');
    
    // Read all images first
    const imageData = await Promise.all(
      imagePaths.map(async (path) => ({
        type: 'image_url',
        image_url: {
          url: `data:image/jpeg;base64,${await fs.readFile(path, 'base64')}`
        }
      }))
    );
    
    const messages: any[] = [
      { role: 'system', content: systemPrompt },
      { 
        role: 'user', 
        content: [
          { type: 'text', text: userPrompt },
          ...imageData
        ]
      }
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      temperature,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response content from OpenAI');
    }

    return safeJson(content);
  } catch (error) {
    console.error('Error running vision prompt:', error);
    throw new Error('Failed to get AI vision analysis');
  }
}

function safeJson(content: string): AnalysisResult {
  try {
    const parsed = JSON.parse(content);
    
    // Validate the structure
    if (!parsed.findings || !Array.isArray(parsed.findings)) {
      throw new Error('Invalid response structure: missing findings array');
    }

    // Validate each finding
    for (const finding of parsed.findings) {
      if (!finding.title || !finding.recommendation || !finding.impact || !finding.effort || !finding.area) {
        throw new Error('Invalid finding structure');
      }
      
      if (![1, 2, 3, 4, 5].includes(finding.impact) || ![1, 2, 3, 4, 5].includes(finding.effort)) {
        throw new Error('Invalid impact or effort value');
      }
    }

    return parsed as AnalysisResult;
  } catch (error) {
    console.error('Error parsing JSON response:', error);
    console.error('Raw content:', content);
    
    // Return a safe fallback
    return {
      findings: [],
      gaps: ['Failed to parse AI response'],
      summary: 'AI-analysen misslyckades. Kontrollera indata och försök igen.'
    };
  }
}