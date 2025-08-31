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

    // Analysis type specific queries
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
    const combinedData = {
      type: 'api',
      propertyId,
      dateRange: { startDate, endDate },
      analysisType: analysisType || 'default',
      reports: analysisType === 'session-analysis' ? {
        dailyTrends: reports[0]?.data || { rows: [] },
        hourlyPatterns: reports[1]?.data || { rows: [] },
        deviceAnalysis: reports[2]?.data || { rows: [] }
      } : {
        trafficAcquisition: reports[0]?.data || { rows: [] },
        pagePerformance: reports[1]?.data || { rows: [] },
        events: reports[2]?.data || { rows: [] },
        demographics: reports[3]?.data || { rows: [] }
      },
      totalRows: reports.reduce((sum, report) => {
        return sum + (report.data.rows?.length || 0);
      }, 0)
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