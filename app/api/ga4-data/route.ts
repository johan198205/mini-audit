import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request: NextRequest) {
  try {
    const { propertyId, dateRange } = await request.json();

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

    // Fetch multiple reports in parallel
    const reports = await Promise.all([
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
          limit: 1000
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
            { name: 'bounceRate' },
            { name: 'bounceRate' }
          ],
          limit: 1000
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
          limit: 1000
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
          limit: 1000
        }
      })
    ]);

    // Combine all data
    const combinedData = {
      type: 'api',
      propertyId,
      dateRange: { startDate, endDate },
      reports: {
        trafficAcquisition: reports[0].data,
        pagePerformance: reports[1].data,
        events: reports[2].data,
        demographics: reports[3].data
      },
      totalRows: reports.reduce((sum, report) => {
        return sum + (report.data.rows?.length || 0);
      }, 0)
    };

    return NextResponse.json(combinedData);

  } catch (error) {
    console.error('GA4 API error:', error);
    return NextResponse.json(
      { error: 'Kunde inte hämta data från GA4 API' },
      { status: 500 }
    );
  }
}
