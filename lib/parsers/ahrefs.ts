import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { AhrefsRow } from '@/lib/types';

export async function parseAhrefs(filepath: string): Promise<AhrefsRow> {
  const fileExtension = filepath.split('.').pop()?.toLowerCase();
  
  if (fileExtension === 'csv') {
    return parseAhrefsCSV(filepath);
  } else if (['xls', 'xlsx'].includes(fileExtension || '')) {
    return parseAhrefsExcel(filepath);
  } else {
    throw new Error('Unsupported file format. Please use CSV or Excel files.');
  }
}

async function parseAhrefsCSV(filepath: string): Promise<AhrefsRow> {
  const fs = await import('fs/promises');
  const content = await fs.readFile(filepath, 'utf-8');
  
  return new Promise((resolve, reject) => {
    Papa.parse(content, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const topKeywords = results.data.map((row: any) => normalizeAhrefsKeyword(row));
          resolve({ topKeywords });
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(error);
      }
    });
  });
}

async function parseAhrefsExcel(filepath: string): Promise<AhrefsRow> {
  const fs = await import('fs/promises');
  const buffer = await fs.readFile(filepath);
  const workbook = XLSX.read(buffer);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet);
  
  const topKeywords = jsonData.map((row: any) => normalizeAhrefsKeyword(row));
  return { topKeywords };
}

function normalizeAhrefsKeyword(row: any): { keyword: string; volume: number; rank: number; url: string } {
  return {
    keyword: row['Keyword'] || row['keyword'] || row['Query'] || '',
    volume: parseInt(row['Search Volume'] || row['Volume'] || row['search_volume'] || '0'),
    rank: parseInt(row['Position'] || row['Rank'] || row['position'] || '0'),
    url: row['URL'] || row['url'] || row['Page'] || '',
  };
}


