import { NextRequest, NextResponse } from 'next/server';
import { runPrompt } from '@/lib/ai/runPrompt';
import { createDataUserPrompt } from '@/lib/prompts/data';
import { AnalysisRequest } from '@/lib/types';

import { google } from 'googleapis';

// GA4 API function - full implementation
async function fetchGA4Data(propertyId: string, dateRange: any, analysisType?: string) {
  try {
    // Get GA4 settings from environment
    const credentials = process.env.GA4_CREDENTIALS;
    if (!credentials) {
      throw new Error('GA4 API-inställningar saknas. Konfigurera GA4_CREDENTIALS i .env.local.');
    }

    // Parse credentials
    let credentialsJson;
    try {
      credentialsJson = JSON.parse(Buffer.from(credentials, 'base64').toString());
    } catch (error) {
      // If base64 decode fails, try parsing as direct JSON
      try {
        credentialsJson = JSON.parse(credentials);
      } catch (parseError) {
        throw new Error('GA4 credentials format is invalid. Must be base64 encoded JSON or direct JSON.');
      }
    }

    // Initialize Google Analytics Data API
    const auth = new google.auth.GoogleAuth({
      credentials: credentialsJson,
      scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
    });

    const analyticsData = google.analyticsdata({ version: 'v1beta', auth });

    // Default date range
    const startDate = dateRange?.startDate || '30daysAgo';
    const endDate = dateRange?.endDate || 'today';

    let reports;
    
    if (analysisType === 'session-analysis') {
      // Deep session analysis over longer period
      reports = await Promise.all([
        // Daily session trends over last year
        analyticsData.properties.runReport({
          property: `properties/${propertyId}`,
          requestBody: {
            dateRanges: [{ startDate: '365daysAgo', endDate: 'today' }],
            dimensions: [
              { name: 'date' },
              { name: 'sessionDefaultChannelGroup' }
            ],
            metrics: [
              { name: 'sessions' },
              { name: 'bounceRate' },
              { name: 'averageSessionDuration' },
              { name: 'conversions' }
            ],
            limit: '10000'
          }
        }),

        // Hourly patterns
        analyticsData.properties.runReport({
          property: `properties/${propertyId}`,
          requestBody: {
            dateRanges: [{ startDate, endDate }],
            dimensions: [
              { name: 'hour' },
              { name: 'dayOfWeek' }
            ],
            metrics: [
              { name: 'sessions' },
              { name: 'bounceRate' },
              { name: 'averageSessionDuration' }
            ],
            limit: '1000'
          }
        }),

        // Device and browser analysis
        analyticsData.properties.runReport({
          property: `properties/${propertyId}`,
          requestBody: {
            dateRanges: [{ startDate, endDate }],
            dimensions: [
              { name: 'deviceCategory' },
              { name: 'operatingSystem' },
              { name: 'browser' }
            ],
            metrics: [
              { name: 'sessions' },
              { name: 'bounceRate' },
              { name: 'averageSessionDuration' },
              { name: 'conversions' }
            ],
            limit: '1000'
          }
        }),

        // Geographic performance
        analyticsData.properties.runReport({
          property: `properties/${propertyId}`,
          requestBody: {
            dateRanges: [{ startDate, endDate }],
            dimensions: [
              { name: 'country' },
              { name: 'city' }
            ],
            metrics: [
              { name: 'sessions' },
              { name: 'totalUsers' },
              { name: 'bounceRate' },
              { name: 'conversions' }
            ],
            limit: '1000'
          }
        }),

                        // User segmentation
                analyticsData.properties.runReport({
                  property: `properties/${propertyId}`,
                  requestBody: {
                    dateRanges: [{ startDate, endDate }],
                    dimensions: [
                      { name: 'sessionDefaultChannelGroup' },
                      { name: 'newVsReturning' }
                    ],
                    metrics: [
                      { name: 'sessions' },
                      { name: 'totalUsers' },
                      { name: 'newUsers' },
                      { name: 'bounceRate' },
                      { name: 'conversions' }
                    ],
                    limit: '1000'
                  }
                }),

        // Page performance
        analyticsData.properties.runReport({
          property: `properties/${propertyId}`,
          requestBody: {
            dateRanges: [{ startDate, endDate }],
            dimensions: [
              { name: 'pagePath' },
              { name: 'pageTitle' }
            ],
            metrics: [
              { name: 'screenPageViews' },
              { name: 'averageSessionDuration' },
              { name: 'bounceRate' },
              { name: 'conversions' }
            ],
            limit: '1000'
          }
        }),

        // Events analysis
        analyticsData.properties.runReport({
          property: `properties/${propertyId}`,
          requestBody: {
            dateRanges: [{ startDate, endDate }],
            dimensions: [
              { name: 'eventName' }
            ],
            metrics: [
              { name: 'eventCount' },
              { name: 'totalUsers' }
            ],
            limit: '1000'
          }
        })
      ]);
    } else {
      // Default comprehensive analysis
      reports = await Promise.all([
        // Traffic Acquisition
        analyticsData.properties.runReport({
          property: `properties/${propertyId}`,
          requestBody: {
            dateRanges: [{ startDate, endDate }],
            dimensions: [
              { name: 'sessionDefaultChannelGroup' },
              { name: 'sessionSource' },
              { name: 'sessionMedium' }
            ],
            metrics: [
              { name: 'sessions' },
              { name: 'totalUsers' },
              { name: 'newUsers' },
              { name: 'bounceRate' },
              { name: 'averageSessionDuration' }
            ],
            limit: '1000'
          }
        }),

        // Page Performance
        analyticsData.properties.runReport({
          property: `properties/${propertyId}`,
          requestBody: {
            dateRanges: [{ startDate, endDate }],
            dimensions: [
              { name: 'pagePath' },
              { name: 'pageTitle' }
            ],
            metrics: [
              { name: 'screenPageViews' },
              { name: 'averageSessionDuration' },
              { name: 'bounceRate' }
            ],
            limit: '1000'
          }
        }),

        // Events
        analyticsData.properties.runReport({
          property: `properties/${propertyId}`,
          requestBody: {
            dateRanges: [{ startDate, endDate }],
            dimensions: [
              { name: 'eventName' }
            ],
            metrics: [
              { name: 'eventCount' },
              { name: 'totalUsers' }
            ],
            limit: '1000'
          }
        }),

        // Demographics
        analyticsData.properties.runReport({
          property: `properties/${propertyId}`,
          requestBody: {
            dateRanges: [{ startDate, endDate }],
            dimensions: [
              { name: 'country' },
              { name: 'city' },
              { name: 'deviceCategory' },
              { name: 'operatingSystem' },
              { name: 'browser' }
            ],
            metrics: [
              { name: 'sessions' },
              { name: 'totalUsers' },
              { name: 'bounceRate' }
            ],
            limit: '1000'
          }
        })
      ]);
    }

    // Combine all data
    return {
      type: 'api',
      propertyId,
      dateRange: { startDate, endDate },
      analysisType: analysisType || 'default',
      reports: analysisType === 'session-analysis' ? {
        dailyTrends: reports[0]?.data || { rows: [] },
        hourlyPatterns: reports[1]?.data || { rows: [] },
        deviceAnalysis: reports[2]?.data || { rows: [] },
        geographicPerformance: reports[3]?.data || { rows: [] },
        userSegmentation: reports[4]?.data || { rows: [] },
        pagePerformance: reports[5]?.data || { rows: [] },
        events: reports[6]?.data || { rows: [] }} : {
        trafficAcquisition: reports[0]?.data || { rows: [] },
        pagePerformance: reports[1]?.data || { rows: [] },
        events: reports[2]?.data || { rows: [] },
        demographics: reports[3]?.data || { rows: [] }
      },
      totalRows: reports.reduce((sum, report) => {
        return sum + (report.data.rows?.length || 0);
      }, 0)
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
      console.log('useGa4Api is true, attempting to fetch GA4 data...');
      try {
        const propertyId = process.env.GA4_PROPERTY_ID;
        console.log('Property ID from env:', propertyId ? 'Found' : 'Not found');
        if (!propertyId) {
          throw new Error('GA4 Property ID not configured');
        }

        console.log('Calling fetchGA4Data with:', { propertyId, analysisType });
        const apiData = await fetchGA4Data(propertyId, {
          startDate: analysisType === 'session-analysis' ? '365daysAgo' : '30daysAgo',
          endDate: 'today'
        }, analysisType);

        ga4Data = apiData;
        
        console.log('GA4 API data fetched successfully:', {
          propertyId: apiData.propertyId,
          totalRows: apiData.totalRows,
          analysisType: apiData.analysisType,
          reports: Object.keys(apiData.reports)
        });
      } catch (error) {
        console.error('Error fetching GA4 API data:', error);
        console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
        // Continue without GA4 data
      }
    } else {
      console.log('useGa4Api is false, skipping GA4 API fetch');
    }
    
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

    // Custom prompts loading removed - UI settings are the only source of truth
    
    // Create prompts - UI settings are the only source of truth
    if (!promptOverrides?.data) {
      console.error('Missing promptOverrides.data:', { promptOverrides });
      return NextResponse.json(
        { error: 'GA4-analys kräver prompt från UI-inställningar. Ingen fallback tillåten.' },
        { status: 400 }
      );
    }
    const systemPrompt = promptOverrides.data;
    console.log('Using system prompt from UI:', { 
      promptLength: systemPrompt?.length, 
      promptPreview: systemPrompt?.substring(0, 100) 
    });
    
    let userPrompt;
    try {
      console.log('Data being sent to createDataUserPrompt:', {
        hasGa4Data: !!ga4Data,
        ga4DataType: ga4Data?.type,
        ga4DataKeys: ga4Data ? Object.keys(ga4Data) : 'none',
        ga4DataReports: ga4Data?.reports ? Object.keys(ga4Data.reports) : 'none',
        ga4DataTotalRows: ga4Data?.totalRows || 0
      });
      userPrompt = createDataUserPrompt(
        { ga4: ga4Data },
        {
          company,
          businessGoal: context?.businessGoal,
          conversions: context?.conversions,
        },
        systemPrompt
      );
      console.log('User prompt created, length:', userPrompt.length);
      console.log('User prompt preview:', userPrompt.substring(0, 1000));
    } catch (error) {
      console.error('Error creating user prompt:', error);
      throw error;
    }

    // Run AI analysis
    let result;
    try {
      console.log('Running AI analysis with system prompt length:', systemPrompt.length);
      result = await runPrompt(systemPrompt, userPrompt);
      console.log('AI analysis completed:', {
        findingsCount: result.findings.length,
        hasGaps: !!result.gaps,
        hasSummary: !!result.summary
      });
    } catch (error) {
      console.error('Error running AI prompt:', error);
      throw error;
    }

    return NextResponse.json({
      ...result,
      analysisPeriod: {
        startDate: analysisType === 'session-analysis' ? '365daysAgo' : '30daysAgo',
        endDate: 'today',
        description: analysisType === 'session-analysis' ? 'Senaste 365 dagarna' : 'Senaste 30 dagarna'
      }
    });

  } catch (error) {
    console.error('Data analysis error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
    return NextResponse.json(
      { error: 'Failed to perform data analysis: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}