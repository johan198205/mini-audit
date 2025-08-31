import { NextRequest, NextResponse } from 'next/server';
import { runPrompt } from '@/lib/ai/runPrompt';
import { dataSystemPrompt, createDataUserPrompt } from '@/lib/prompts/data';
import { AnalysisRequest } from '@/lib/types';
import { loadCustomPrompts } from '@/lib/utils/prompts';

export async function POST(request: NextRequest) {
  try {
    const body: AnalysisRequest = await request.json();
    const { company, files, context, promptOverrides } = body;

    if (!company) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    }

    // Parse GA4 data if available
    let ga4Data = null;

    if (files?.ga4) {
      try {
        const fs = await import('fs/promises');
        const path = await import('path');
        
        // Handle multiple GA4 files
        const ga4Files = Array.isArray(files.ga4) ? files.ga4 : [files.ga4];
        const allData: any[] = [];
        const allColumns = new Set<string>();
        
        for (const filePath of ga4Files) {
          const content = await fs.readFile(filePath as string, 'utf-8');
          
          // Check if it's a CSV file
          if (filePath.toString().endsWith('.csv')) {
            // Parse CSV data
            const Papa = await import('papaparse');
            const parsed = Papa.parse(content, { header: true, skipEmptyLines: true });
            
            // Add file info to each row
            const dataWithSource = parsed.data.map((row: any) => ({
              ...row,
              _source_file: path.basename(filePath as string)
            }));
            
            allData.push(...dataWithSource);
            parsed.meta.fields?.forEach((col: string) => allColumns.add(col));
            
            console.log(`Parsed GA4 CSV file ${path.basename(filePath as string)}:`, {
              rows: parsed.data.length,
              columns: parsed.meta.fields,
              sampleData: parsed.data.slice(0, 2)
            });
          } else if (filePath.toString().endsWith('.json')) {
            // Parse JSON data
            const jsonData = JSON.parse(content);
            allData.push({
              ...jsonData,
              _source_file: path.basename(filePath as string)
            });
          } else {
            // Try to parse as JSON first, then CSV
            try {
              const jsonData = JSON.parse(content);
              allData.push({
                ...jsonData,
                _source_file: path.basename(filePath as string)
              });
            } catch {
              const Papa = await import('papaparse');
              const parsed = Papa.parse(content, { header: true, skipEmptyLines: true });
              const dataWithSource = parsed.data.map((row: any) => ({
                ...row,
                _source_file: path.basename(filePath as string)
              }));
              allData.push(...dataWithSource);
              parsed.meta.fields?.forEach((col: string) => allColumns.add(col));
            }
          }
        }
        
        if (allData.length > 0) {
          ga4Data = {
            type: 'multi_csv',
            data: allData,
            columns: Array.from(allColumns),
            fileCount: ga4Files.length,
            files: ga4Files.map(f => path.basename(f as string))
          };
          
          console.log('Combined GA4 data from multiple files:', {
            totalRows: allData.length,
            fileCount: ga4Files.length,
            files: ga4Files.map(f => path.basename(f as string)),
            allColumns: Array.from(allColumns)
          });
        }
      } catch (error) {
        console.error('Error parsing GA4 data:', error);
        // Continue without GA4 data
      }
    }

    // Load custom prompts if available
    const customPrompts = await loadCustomPrompts();
    
    // Create prompts - use custom prompt if available, otherwise use override or default
    const systemPrompt = promptOverrides?.data || customPrompts.data || dataSystemPrompt;
    const userPrompt = createDataUserPrompt(
      { ga4: ga4Data },
      {
        company,
        businessGoal: context?.businessGoal,
        conversions: context?.conversions,
      }
    );

    // Run AI analysis
    const result = await runPrompt(systemPrompt, userPrompt);

    return NextResponse.json(result);

  } catch (error) {
    console.error('Data analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to perform data analysis' },
      { status: 500 }
    );
  }
}
