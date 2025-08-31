import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json();

    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json({ error: 'API-nyckel krävs' }, { status: 400 });
    }

    if (!apiKey.startsWith('sk-')) {
      return NextResponse.json({ error: 'Ogiltig API-nyckel format' }, { status: 400 });
    }

    const envPath = join(process.cwd(), '.env.local');
    
    try {
      // Try to read existing .env.local
      const existingContent = await readFile(envPath, 'utf-8');
      
      // Update or add the API key
      const updatedContent = existingContent.includes('OPENAI_API_KEY=')
        ? existingContent.replace(/OPENAI_API_KEY=.*/, `OPENAI_API_KEY=${apiKey}`)
        : existingContent + `\nOPENAI_API_KEY=${apiKey}\n`;
      
      await writeFile(envPath, updatedContent);
    } catch (error) {
      // .env.local doesn't exist, create it
      const newContent = `OPENAI_API_KEY=${apiKey}\n`;
      await writeFile(envPath, newContent);
    }

    return NextResponse.json({ 
      success: true,
      message: 'API-nyckel sparad framgångsrikt'
    });

  } catch (error) {
    console.error('Error saving API key:', error);
    return NextResponse.json({ 
      error: 'Kunde inte spara API-nyckeln'
    }, { status: 500 });
  }
}


