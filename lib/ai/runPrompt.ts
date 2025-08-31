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
    console.log('Attempting to parse JSON content...');
    console.log('Content length:', content.length);
    console.log('Content preview (first 1000 chars):', content.substring(0, 1000));
    
    // Try to fix incomplete JSON by finding the last complete finding
    let fixedContent = content;
    if (content.includes('"evidence": "') && !content.trim().endsWith('}')) {
      console.log('Detected incomplete JSON, attempting to fix...');
      
      // Find the last complete finding by looking for complete objects
      const lastCompleteBrace = content.lastIndexOf('}');
      const lastCompleteBracket = content.lastIndexOf(']');
      
      if (lastCompleteBrace > lastCompleteBracket) {
        // Find the position after the last complete finding
        const beforeLastFinding = content.lastIndexOf('},', lastCompleteBrace);
        if (beforeLastFinding > 0) {
          fixedContent = content.substring(0, beforeLastFinding + 1) + ']}';
          console.log('Fixed incomplete JSON by truncating at last complete finding');
        }
      }
    }
    
    const parsed = JSON.parse(fixedContent);
    console.log('JSON parsed successfully');
    console.log('Parsed structure:', {
      hasFindings: !!parsed.findings,
      findingsType: typeof parsed.findings,
      findingsLength: Array.isArray(parsed.findings) ? parsed.findings.length : 'not array',
      hasGaps: !!parsed.gaps,
      hasSummary: !!parsed.summary
    });
    
    // Validate the structure
    if (!parsed.findings || !Array.isArray(parsed.findings)) {
      console.error('Invalid findings structure:', parsed.findings);
      throw new Error('Invalid response structure: missing findings array');
    }

    console.log('Validating and normalizing findings...');
    // Validate and normalize each finding
    const normalizedFindings = [];
    for (let i = 0; i < parsed.findings.length; i++) {
      const finding = parsed.findings[i];
      console.log(`Finding ${i}:`, {
        hasTitle: !!finding.title,
        hasWhyItMatters: !!finding.why_it_matters,
        hasWhyItMattersDot: !!finding['why_it.matters'],
        hasRecommendation: !!finding.recommendation,
        hasImpact: !!finding.impact,
        hasEffort: !!finding.effort,
        hasArea: !!finding.area,
        impactValue: finding.impact,
        effortValue: finding.effort
      });
      
      // Normalize the finding structure
      const normalizedFinding = {
        title: finding.title,
        why_it_matters: finding.why_it_matters || finding['why_it.matters'] || finding.whyItMatters || 'Ej angivet',
        evidence: finding.evidence || '',
        recommendation: finding.recommendation,
        impact: finding.impact,
        effort: finding.effort,
        area: finding.area || 'Data'
      };
      
      if (!normalizedFinding.title || !normalizedFinding.recommendation || !normalizedFinding.impact || !normalizedFinding.effort) {
        console.error(`Invalid finding structure at index ${i}:`, finding);
        throw new Error(`Invalid finding structure at index ${i}`);
      }
      
      if (![1, 2, 3, 4, 5].includes(normalizedFinding.impact) || ![1, 2, 3, 4, 5].includes(normalizedFinding.effort)) {
        console.error(`Invalid impact/effort values at index ${i}:`, { impact: normalizedFinding.impact, effort: normalizedFinding.effort });
        throw new Error(`Invalid impact or effort value at index ${i}`);
      }
      
      normalizedFindings.push(normalizedFinding);
    }

    console.log('All findings validated and normalized successfully');
    return {
      findings: normalizedFindings,
      gaps: parsed.gaps || [],
      summary: parsed.summary || ''
    };
  } catch (error) {
    console.error('Error parsing JSON response:', error);
    console.error('Raw content (first 2000 chars):', content.substring(0, 2000));
    console.error('Raw content (last 1000 chars):', content.substring(Math.max(0, content.length - 1000)));
    
    // Try to extract findings from incomplete JSON
    try {
      console.log('Attempting to extract findings from incomplete JSON...');
      const findingsMatch = content.match(/"findings":\s*\[(.*?)\]/s);
      if (findingsMatch) {
        const findingsContent = findingsMatch[1];
        const findingMatches = findingsContent.match(/\{[^}]*"title"[^}]*\}/g);
        if (findingMatches && findingMatches.length > 0) {
          console.log(`Found ${findingMatches.length} potential findings in incomplete JSON`);
          // Return partial results
          return {
            findings: [],
            gaps: ['JSON response was incomplete but findings were detected'],
            summary: `AI genererade ${findingMatches.length} fynd men svaret blev ofullständigt. Försök igen med färre fynd.`
          };
        }
      }
    } catch (extractError) {
      console.error('Failed to extract findings from incomplete JSON:', extractError);
    }
    
    // Return a safe fallback
    return {
      findings: [],
      gaps: ['Failed to parse AI response'],
      summary: 'AI-analysen misslyckades. Kontrollera indata och försök igen.'
    };
  }
}