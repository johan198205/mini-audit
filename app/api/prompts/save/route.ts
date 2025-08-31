import { NextRequest, NextResponse } from 'next/server';
import { saveCustomPrompts } from '@/lib/utils/prompts';

export async function POST(request: NextRequest) {
  try {
    const { prompts } = await request.json();
    
    if (!prompts) {
      return NextResponse.json({ error: 'Prompts are required' }, { status: 400 });
    }

    await saveCustomPrompts(prompts);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving prompts:', error);
    return NextResponse.json({ error: 'Failed to save prompts' }, { status: 500 });
  }
}