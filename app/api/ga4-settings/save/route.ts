import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const { propertyId, credentials } = await request.json();
    
    console.log('GA4 Settings Save Request:', {
      propertyId: propertyId ? 'provided' : 'missing',
      credentialsLength: credentials ? credentials.length : 0,
      credentialsStart: credentials ? credentials.substring(0, 50) + '...' : 'none'
    });

    if (!propertyId || !credentials) {
      return NextResponse.json(
        { error: 'Property ID och credentials krävs' },
        { status: 400 }
      );
    }

    // Validate JSON credentials
    try {
      console.log('Attempting to parse JSON credentials...');
      const parsedCredentials = JSON.parse(credentials);
      console.log('JSON parsed successfully, checking fields...');
      
      // Check required fields
      const missingFields = [];
      if (!parsedCredentials.type) missingFields.push('type');
      if (!parsedCredentials.project_id) missingFields.push('project_id');
      if (!parsedCredentials.private_key) missingFields.push('private_key');
      if (!parsedCredentials.client_email) missingFields.push('client_email');
      
      if (missingFields.length > 0) {
        console.log('Missing fields:', missingFields);
        return NextResponse.json(
          { error: `Service Account JSON saknar obligatoriska fält: ${missingFields.join(', ')}` },
          { status: 400 }
        );
      }
      
      if (parsedCredentials.type !== 'service_account') {
        console.log('Invalid type:', parsedCredentials.type);
        return NextResponse.json(
          { error: 'JSON-nyckeln måste vara av typen "service_account"' },
          { status: 400 }
        );
      }
      
      console.log('JSON validation passed!');
    } catch (error) {
      console.error('JSON parse error:', error);
      console.error('Credentials that failed to parse:', credentials.substring(0, 200) + '...');
      return NextResponse.json(
        { error: 'Ogiltig JSON-format för credentials' },
        { status: 400 }
      );
    }

    // Save GA4 settings to .env.local
    const envPath = join(process.cwd(), '.env.local');
    const envContent = `# GA4 API Settings
GA4_PROPERTY_ID=${propertyId}
GA4_CREDENTIALS=${Buffer.from(credentials).toString('base64')}
`;

    await writeFile(envPath, envContent, { flag: 'a' });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving GA4 settings:', error);
    return NextResponse.json(
      { error: 'Kunde inte spara GA4-inställningar' },
      { status: 500 }
    );
  }
}