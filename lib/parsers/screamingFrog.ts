import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { ScreamingFrogRow } from '@/lib/types';

export async function parseScreamingFrog(filepath: string): Promise<ScreamingFrogRow[]> {
  const fileExtension = filepath.split('.').pop()?.toLowerCase();
  
  if (fileExtension === 'csv') {
    return parseScreamingFrogCSV(filepath);
  } else if (['xls', 'xlsx'].includes(fileExtension || '')) {
    return parseScreamingFrogExcel(filepath);
  } else {
    throw new Error('Unsupported file format. Please use CSV or Excel files.');
  }
}

async function parseScreamingFrogCSV(filepath: string): Promise<ScreamingFrogRow[]> {
  const fs = await import('fs/promises');
  const content = await fs.readFile(filepath, 'utf-8');
  
  return new Promise((resolve, reject) => {
    Papa.parse(content, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const rows = results.data.map((row: any) => normalizeScreamingFrogRow(row));
          resolve(rows);
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

async function parseScreamingFrogExcel(filepath: string): Promise<ScreamingFrogRow[]> {
  const fs = await import('fs/promises');
  const buffer = await fs.readFile(filepath);
  const workbook = XLSX.read(buffer);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet);
  
  return jsonData.map((row: any) => normalizeScreamingFrogRow(row));
}

function normalizeScreamingFrogRow(row: any): ScreamingFrogRow {
  return {
    url: row['Address'] || row['URL'] || row['url'] || '',
    title: row['Title 1'] || row['Title'] || row['title'] || '',
    meta: row['Meta Description 1'] || row['Meta Description'] || row['meta_description'] || '',
    h1: row['H1-1'] || row['H1'] || row['h1'] || '',
    canonical: row['Canonical Link Element 1'] || row['Canonical'] || row['canonical'] || '',
    schema: row['Schema.org Type'] || row['Schema'] || row['schema'] || '',
    code: parseInt(row['Status Code'] || row['Status'] || row['status_code'] || '0'),
    imgAltCount: parseInt(row['Images Missing Alt Text'] || row['Images Missing Alt'] || '0'),
  };
}


