import { NextRequest, NextResponse } from 'next/server';
import { AggregatedResult } from '@/lib/types';
import puppeteer from 'puppeteer';

export async function POST(request: NextRequest) {
  try {
    const result: AggregatedResult = await request.json();

    if (!result.company || !result.findings) {
      return NextResponse.json({ error: 'Invalid data provided' }, { status: 400 });
    }

    const html = generateReportHTML(result);

    try {
      const browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox', 
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });

      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm'
        }
      });

      await browser.close();

      const filename = `${result.company.replace(/[^a-zA-Z0-9]/g, '_')}-review.pdf`;

      return new NextResponse(pdf, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });

    } catch (puppeteerError) {
      console.error('Puppeteer error:', puppeteerError);
      
      // Fallback: Return HTML that can be printed to PDF by the browser
      const filename = `${result.company.replace(/[^a-zA-Z0-9]/g, '_')}-review.html`;
      
      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

  } catch (error) {
    console.error('PDF export error:', error);
    return NextResponse.json(
      { error: `Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

function generateReportHTML(result: AggregatedResult): string {
  const quickWins = result.findings.filter(f => f.impact >= 4 && f.effort <= 2);
  const strategicProjects = result.findings.filter(f => f.impact >= 4 && f.effort >= 3);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Growth Measurement Review - ${result.company}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #3b82f6;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #3b82f6;
          margin: 0;
          font-size: 28px;
        }
        .header p {
          color: #666;
          margin: 5px 0 0 0;
        }
        .section {
          margin-bottom: 30px;
        }
        .section h2 {
          color: #3b82f6;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        .finding {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 15px;
          background: #f9fafb;
        }
        .finding-title {
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 8px;
        }
        .finding-meta {
          display: flex;
          gap: 15px;
          margin-bottom: 10px;
          font-size: 14px;
        }
        .finding-meta span {
          background: #e5e7eb;
          padding: 2px 8px;
          border-radius: 4px;
        }
        .finding-content {
          margin-bottom: 10px;
        }
        .finding-recommendation {
          background: #dbeafe;
          padding: 10px;
          border-radius: 4px;
          border-left: 4px solid #3b82f6;
        }
        .quick-win {
          border-left: 4px solid #10b981;
        }
        .strategic-project {
          border-left: 4px solid #3b82f6;
        }
        .stats {
          display: flex;
          gap: 20px;
          margin-bottom: 20px;
        }
        .stat {
          text-align: center;
          padding: 15px;
          background: #f3f4f6;
          border-radius: 8px;
          flex: 1;
        }
        .stat-number {
          font-size: 24px;
          font-weight: bold;
          color: #3b82f6;
        }
        .stat-label {
          font-size: 14px;
          color: #666;
        }
        @media print {
          body { margin: 0; }
          .section { page-break-inside: avoid; }
          .finding { page-break-inside: avoid; }
        }
        .print-instructions {
          background: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 20px;
          text-align: center;
        }
        .print-instructions h3 {
          margin: 0 0 10px 0;
          color: #92400e;
        }
        .print-instructions p {
          margin: 0;
          color: #92400e;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="print-instructions">
        <h3>📄 Instruktioner för PDF-export</h3>
        <p>Om du inte fick en PDF-fil, använd Ctrl+P (Cmd+P på Mac) för att skriva ut denna sida som PDF</p>
      </div>
      
      <div class="header">
        <h1>Growth Measurement Review</h1>
        <p>${result.company}</p>
        <p>Genererad: ${new Date().toLocaleDateString('sv-SE')}</p>
      </div>

      <div class="section">
        <h2>Executive Summary</h2>
        <p>${result.executiveSummary}</p>
      </div>

      <div class="section">
        <h2>Översikt</h2>
        <div class="stats">
          <div class="stat">
            <div class="stat-number">${quickWins.length}</div>
            <div class="stat-label">Quick Wins</div>
          </div>
          <div class="stat">
            <div class="stat-number">${strategicProjects.length}</div>
            <div class="stat-label">Strategiska projekt</div>
          </div>
          <div class="stat">
            <div class="stat-number">${result.findings.length}</div>
            <div class="stat-label">Totalt fynd</div>
          </div>
        </div>
      </div>

      ${quickWins.length > 0 ? `
      <div class="section">
        <h2>Quick Wins (Hög impact, Låg effort)</h2>
        ${quickWins.map(finding => `
          <div class="finding quick-win">
            <div class="finding-title">${finding.title}</div>
            <div class="finding-meta">
              <span>${finding.area}</span>
              <span>Impact: ${finding.impact}/5</span>
              <span>Effort: ${finding.effort}/5</span>
            </div>
            <div class="finding-content">
              <strong>Varför det är viktigt:</strong> ${finding.why_it_matters}
            </div>
            <div class="finding-recommendation">
              <strong>Rekommendation:</strong> ${finding.recommendation}
            </div>
          </div>
        `).join('')}
      </div>
      ` : ''}

      ${strategicProjects.length > 0 ? `
      <div class="section">
        <h2>Strategiska projekt (Hög impact, Hög effort)</h2>
        ${strategicProjects.map(finding => `
          <div class="finding strategic-project">
            <div class="finding-title">${finding.title}</div>
            <div class="finding-meta">
              <span>${finding.area}</span>
              <span>Impact: ${finding.impact}/5</span>
              <span>Effort: ${finding.effort}/5</span>
            </div>
            <div class="finding-content">
              <strong>Varför det är viktigt:</strong> ${finding.why_it_matters}
            </div>
            <div class="finding-recommendation">
              <strong>Rekommendation:</strong> ${finding.recommendation}
            </div>
          </div>
        `).join('')}
      </div>
      ` : ''}

      <div class="section">
        <h2>Alla rekommendationer</h2>
        ${result.findings.map(finding => `
          <div class="finding">
            <div class="finding-title">${finding.title}</div>
            <div class="finding-meta">
              <span>${finding.area}</span>
              <span>Impact: ${finding.impact}/5</span>
              <span>Effort: ${finding.effort}/5</span>
            </div>
            <div class="finding-content">
              <strong>Varför det är viktigt:</strong> ${finding.why_it_matters}
            </div>
            <div class="finding-recommendation">
              <strong>Rekommendation:</strong> ${finding.recommendation}
            </div>
          </div>
        `).join('')}
      </div>
    </body>
    </html>
  `;
}
