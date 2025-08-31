import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET() {
  try {
    const envPath = join(process.cwd(), '.env.local');
    
    try {
      const envContent = await readFile(envPath, 'utf-8');
      const hasValidKey = envContent.includes('OPENAI_API_KEY=') && 
                         !envContent.includes('OPENAI_API_KEY=your_openai_api_key_here') &&
                         envContent.includes('OPENAI_API_KEY=sk-');
      
      return NextResponse.json({ 
        configured: hasValidKey,
        message: hasValidKey ? 'API-nyckel är konfigurerad' : 'API-nyckel saknas eller är ogiltig'
      });
    } catch (error) {
      // .env.local doesn't exist
      return NextResponse.json({ 
        configured: false,
        message: 'API-nyckel saknas'
      });
    }
  } catch (error) {
    console.error('Error checking API key:', error);
    return NextResponse.json({ 
      configured: false,
      message: 'Kunde inte kontrollera API-nyckel'
    }, { status: 500 });
  }
}


