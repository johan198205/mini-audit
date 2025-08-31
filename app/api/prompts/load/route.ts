import { NextResponse } from 'next/server';
import { loadCustomPrompts } from '@/lib/utils/prompts';

export async function GET() {
  try {
    const prompts = await loadCustomPrompts();
    return NextResponse.json({ prompts });
  } catch (error) {
    console.error('Error loading prompts:', error);
    return NextResponse.json({ error: 'Failed to load prompts' }, { status: 500 });
  }
}