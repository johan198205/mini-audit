import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request: NextRequest) {
  try {
    const { propertyId, dateRange, customQuery, analysisType } = await request.json();

    if (!propertyId) {
      return NextResponse.json(
        { error: 'Property ID krävs' },
        { status: 400 }
      );
    }

    // Get GA4 settings from environment
    const credentials = process.env.GA4_CREDENTIALS;
    if (!credentials) {
      return NextResponse.json(
        { error: 'GA4 API-inställningar saknas. Konfigurera i inställningar.' },
        { status: 400 }
      );
    }

    // Parse credentials
    const credentialsJson = JSON.parse(Buffer.from(credentials, 'base64').toString());

    // Initialize Google Analytics Data API
    const auth = new google.auth.GoogleAuth({
      credentials: credentialsJson,
      scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
    });

    const analyticsData = google.analyticsdata({ version: 'v1beta', auth });

    // Default date range (last 30 days)
    const startDate = dateRange?.startDate || '30daysAgo';
    const endDate = dateRange?.endDate || 'today';

    // If custom query is provided, use it instead of default reports
    if (customQuery) {
      try {
        const customReport = await analyticsData.properties.runReport({
          property: `properties/${propertyId}`,
          requestBody: {
            dateRanges: [{ startDate, endDate }],
            dimensions: customQuery.dimensions || [],
            metrics: customQuery.metrics || [],
            limit: customQuery.limit || 1000
          }
        });

        return NextResponse.json({
          type: 'api',
          propertyId,
          dateRange: { startDate, endDate },
          customQuery: true,
          data: customReport.data,
          totalRows: customReport.data.rows?.length || 0
        });
      } catch (customError) {
        console.error('Custom GA4 query error:', customError);
        return NextResponse.json(
          { error: 'Kunde inte köra anpassad GA4-fråga: ' + (customError instanceof Error ? customError.message : 'Unknown error') },
          { status: 400 }
        );
      }
    }

    // For now, return mock data to get the app working
    // TODO: Implement proper GA4 API integration
    const combinedData = {
      type: 'api',
      propertyId,
      dateRange: { startDate, endDate },
      analysisType: analysisType || 'default',
      reports: analysisType === 'session-analysis' ? {
        dailyTrends: { rows: [] },
        hourlyPatterns: { rows: [] },
        deviceAnalysis: { rows: [] }
      } : {
        trafficAcquisition: { rows: [] },
        pagePerformance: { rows: [] },
        events: { rows: [] },
        demographics: { rows: [] }
      },
      totalRows: 0
    };

    return NextResponse.json(combinedData);

  } catch (error) {
    console.error('GA4 API error:', error);
    return NextResponse.json(
      { error: 'Kunde inte hämta data från GA4 API: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}