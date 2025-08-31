import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function loadCustomPrompts(): Promise<Record<string, string>> {
  try {
    const promptsPath = join(process.cwd(), 'tmp', 'custom-prompts.json');
    const content = await readFile(promptsPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    // File doesn't exist or can't be read, return empty object
    return {};
  }
}

export async function saveCustomPrompts(prompts: Record<string, string>): Promise<void> {
  try {
    const tmpDir = join(process.cwd(), 'tmp');
    const promptsPath = join(tmpDir, 'custom-prompts.json');
    
    // Ensure tmp directory exists
    await mkdir(tmpDir, { recursive: true });
    
    // Write prompts to file
    await writeFile(promptsPath, JSON.stringify(prompts, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving custom prompts:', error);
    throw error;
  }
}
