import { NextRequest, NextResponse } from 'next/server';
import { runPrompt } from '@/lib/ai/runPrompt';
import { dataSystemPrompt, createDataUserPrompt } from '@/lib/prompts/data';
import { AnalysisRequest } from '@/lib/types';
import { loadCustomPrompts } from '@/lib/utils/prompts';
import { google } from 'googleapis';

// GA4 API function - simplified version
async function fetchGA4Data(propertyId: string, dateRange: any, analysisType?: string) {
  try {
    // For now, return mock data to get the app working
    // TODO: Implement proper GA4 API integration
    return {
      type: 'api',
      propertyId,
      dateRange: { startDate: dateRange?.startDate || '30daysAgo', endDate: dateRange?.endDate || 'today' },
      analysisType: analysisType || 'default',
      reports: {
        trafficAcquisition: { rows: [] },
        pagePerformance: { rows: [] },
        events: { rows: [] },
        demographics: { rows: [] }
      },
      totalRows: 0
    };
  } catch (error) {
    console.error('GA4 API error:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalysisRequest & { analysisType?: string; useGa4Api?: boolean } = await request.json();
    const { company, files, context, promptOverrides, analysisType, useGa4Api } = body;

    if (!company) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    }

    // Parse GA4 data if available
    let ga4Data = null;

    // Check if GA4 API should be used
    if (useGa4Api) {
      try {
        const propertyId = process.env.GA4_PROPERTY_ID;
        if (!propertyId) {
          throw new Error('GA4 Property ID not configured');
        }

        const apiData = await fetchGA4Data(propertyId, {
          startDate: analysisType === 'session-analysis' ? '365daysAgo' : '30daysAgo',
          endDate: 'today'
        }, analysisType);

        ga4Data = {
          type: 'api',
          data: apiData,
          propertyId: apiData.propertyId,
          dateRange: apiData.dateRange,
          analysisType: apiData.analysisType
        };
        
        console.log('GA4 API data fetched successfully:', {
          propertyId: apiData.propertyId,
          totalRows: apiData.totalRows,
          analysisType: apiData.analysisType,
          reports: Object.keys(apiData.reports)
        });
      } catch (error) {
        console.error('Error fetching GA4 API data:', error);
        // Continue without GA4 data
      }
    } else if (files?.ga4) {
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
    let customPrompts: any = {};
    try {
      customPrompts = await loadCustomPrompts();
    } catch (error) {
      console.error('Error loading custom prompts:', error);
    }
    
    // Create prompts - use custom prompt if available, otherwise use override or default
    const systemPrompt = promptOverrides?.data || customPrompts?.data || dataSystemPrompt;
    
    let userPrompt;
    try {
      userPrompt = createDataUserPrompt(
        { ga4: ga4Data },
        {
          company,
          businessGoal: context?.businessGoal,
          conversions: context?.conversions,
        }
      );
    } catch (error) {
      console.error('Error creating user prompt:', error);
      throw error;
    }

    // Run AI analysis
    let result;
    try {
      result = await runPrompt(systemPrompt, userPrompt);
    } catch (error) {
      console.error('Error running AI prompt:', error);
      throw error;
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Data analysis error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json(
      { error: 'Failed to perform data analysis: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}