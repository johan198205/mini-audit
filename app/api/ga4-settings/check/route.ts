import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET() {
  try {
    const envPath = join(process.cwd(), '.env.local');
    
    try {
      const envContent = await readFile(envPath, 'utf-8');
      const hasPropertyId = envContent.includes('GA4_PROPERTY_ID=');
      const hasCredentials = envContent.includes('GA4_CREDENTIALS=');
      
      return NextResponse.json({
        configured: hasPropertyId && hasCredentials,
        hasPropertyId,
        hasCredentials
      });
    } catch (error) {
      // .env.local doesn't exist
      return NextResponse.json({
        configured: false,
        hasPropertyId: false,
        hasCredentials: false
      });
    }
  } catch (error) {
    console.error('Error checking GA4 settings:', error);
    return NextResponse.json(
      { error: 'Kunde inte kontrollera GA4-inställningar' },
      { status: 500 }
    );
  }
}
