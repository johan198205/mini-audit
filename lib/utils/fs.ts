import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function readTempFile(filepath: string): Promise<string> {
  try {
    return await readFile(filepath, 'utf-8');
  } catch (error) {
    console.error(`Error reading file ${filepath}:`, error);
    throw new Error(`Failed to read file: ${filepath}`);
  }
}

export async function writeTempFile(filepath: string, content: string): Promise<void> {
  try {
    const dir = filepath.substring(0, filepath.lastIndexOf('/'));
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }
    await writeFile(filepath, content, 'utf-8');
  } catch (error) {
    console.error(`Error writing file ${filepath}:`, error);
    throw new Error(`Failed to write file: ${filepath}`);
  }
}

export function getTempPath(filename: string): string {
  return join(process.cwd(), 'tmp', filename);
}


