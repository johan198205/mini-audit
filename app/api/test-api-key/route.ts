import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json();

    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json({ error: 'API-nyckel krävs' }, { status: 400 });
    }

    if (!apiKey.startsWith('sk-')) {
      return NextResponse.json({ error: 'Ogiltig API-nyckel format' }, { status: 400 });
    }

    // Test the API key by making a simple request
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    try {
      // Make a simple test request
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: 'Test'
          }
        ],
        max_tokens: 5,
        temperature: 0
      });

      if (response.choices && response.choices.length > 0) {
        return NextResponse.json({ 
          success: true,
          message: 'API-nyckeln fungerar perfekt!'
        });
      } else {
        return NextResponse.json({ 
          error: 'API-nyckeln fungerar inte korrekt'
        }, { status: 400 });
      }
    } catch (openaiError: any) {
      console.error('OpenAI API error:', openaiError);
      
      if (openaiError.status === 401) {
        return NextResponse.json({ 
          error: 'Ogiltig API-nyckel'
        }, { status: 400 });
      } else if (openaiError.status === 429) {
        return NextResponse.json({ 
          error: 'API-kvot överskriden'
        }, { status: 400 });
      } else {
        return NextResponse.json({ 
          error: 'API-nyckeln fungerar inte: ' + (openaiError.message || 'Okänt fel')
        }, { status: 400 });
      }
    }

  } catch (error) {
    console.error('Error testing API key:', error);
    return NextResponse.json({ 
      error: 'Ett fel uppstod vid testning av API-nyckeln'
    }, { status: 500 });
  }
}


