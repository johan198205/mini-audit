import { NextRequest, NextResponse } from 'next/server';
import { AggregatedResult } from '@/lib/types';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';

export async function POST(request: NextRequest) {
  try {
    const result: AggregatedResult = await request.json();

    if (!result.company || !result.findings) {
      return NextResponse.json({ error: 'Invalid data provided' }, { status: 400 });
    }

    const doc = generateReportDocument(result);
    const buffer = await Packer.toBuffer(doc);

    const filename = `${result.company.replace(/[^a-zA-Z0-9]/g, '_')}-review.docx`;

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error('DOCX export error:', error);
    return NextResponse.json(
      { error: 'Failed to generate DOCX' },
      { status: 500 }
    );
  }
}

function generateReportDocument(result: AggregatedResult): Document {
  const quickWins = result.findings.filter(f => f.impact >= 4 && f.effort <= 2);
  const strategicProjects = result.findings.filter(f => f.impact >= 4 && f.effort >= 3);

  const children: (Paragraph | any)[] = [
    new Paragraph({
      children: [
        new TextRun({
          text: 'Growth Measurement Review',
          bold: true,
          size: 32,
          color: '2563eb',
        }),
      ],
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
    
    new Paragraph({
      children: [
        new TextRun({
          text: result.company,
          size: 24,
          color: '374151',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
    
    new Paragraph({
      children: [
        new TextRun({
          text: `Genererad: ${new Date().toLocaleDateString('sv-SE')}`,
          size: 20,
          color: '6b7280',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
    }),

    new Paragraph({
      children: [
        new TextRun({
          text: 'Executive Summary',
          bold: true,
          size: 28,
          color: '2563eb',
        }),
      ],
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
    }),

    new Paragraph({
      children: [
        new TextRun({
          text: result.executiveSummary,
          size: 22,
        }),
      ],
      spacing: { after: 400 },
    }),

    new Paragraph({
      children: [
        new TextRun({
          text: 'Översikt',
          bold: true,
          size: 28,
          color: '2563eb',
        }),
      ],
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
    }),

    new Paragraph({
      children: [
        new TextRun({
          text: `Quick Wins: ${quickWins.length} | Strategiska projekt: ${strategicProjects.length} | Totalt fynd: ${result.findings.length}`,
          size: 22,
          bold: true,
        }),
      ],
      spacing: { after: 400 },
    }),
  ];

  // Quick Wins section
  if (quickWins.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Quick Wins (Hög impact, Låg effort)',
            bold: true,
            size: 28,
            color: '2563eb',
          }),
        ],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      })
    );

    quickWins.forEach(finding => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: finding.title,
              bold: true,
              size: 24,
              color: '1f2937',
            }),
          ],
          spacing: { before: 200, after: 100 },
        }),
        
        new Paragraph({
          children: [
            new TextRun({
              text: `${finding.area} | Impact: ${finding.impact}/5 | Effort: ${finding.effort}/5`,
              size: 20,
              color: '6b7280',
            }),
          ],
          spacing: { after: 100 },
        }),
        
        new Paragraph({
          children: [
            new TextRun({
              text: 'Varför det är viktigt: ',
              bold: true,
              size: 22,
            }),
            new TextRun({
              text: finding.why_it_matters,
              size: 22,
            }),
          ],
          spacing: { after: 100 },
        }),
        
        new Paragraph({
          children: [
            new TextRun({
              text: 'Rekommendation: ',
              bold: true,
              size: 22,
            }),
            new TextRun({
              text: finding.recommendation,
              size: 22,
            }),
          ],
          spacing: { after: 200 },
        })
      );
    });
  }

  // Strategic Projects section
  if (strategicProjects.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Strategiska projekt (Hög impact, Hög effort)',
            bold: true,
            size: 28,
            color: '2563eb',
          }),
        ],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      })
    );

    strategicProjects.forEach(finding => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: finding.title,
              bold: true,
              size: 24,
              color: '1f2937',
            }),
          ],
          spacing: { before: 200, after: 100 },
        }),
        
        new Paragraph({
          children: [
            new TextRun({
              text: `${finding.area} | Impact: ${finding.impact}/5 | Effort: ${finding.effort}/5`,
              size: 20,
              color: '6b7280',
            }),
          ],
          spacing: { after: 100 },
        }),
        
        new Paragraph({
          children: [
            new TextRun({
              text: 'Varför det är viktigt: ',
              bold: true,
              size: 22,
            }),
            new TextRun({
              text: finding.why_it_matters,
              size: 22,
            }),
          ],
          spacing: { after: 100 },
        }),
        
        new Paragraph({
          children: [
            new TextRun({
              text: 'Rekommendation: ',
              bold: true,
              size: 22,
            }),
            new TextRun({
              text: finding.recommendation,
              size: 22,
            }),
          ],
          spacing: { after: 200 },
        })
      );
    });
  }

  // All findings section
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'Alla rekommendationer',
          bold: true,
          size: 28,
          color: '2563eb',
        }),
      ],
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
    })
  );

  result.findings.forEach(finding => {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: finding.title,
            bold: true,
            size: 24,
            color: '1f2937',
          }),
        ],
        spacing: { before: 200, after: 100 },
      }),
      
      new Paragraph({
        children: [
          new TextRun({
            text: `${finding.area} | Impact: ${finding.impact}/5 | Effort: ${finding.effort}/5`,
            size: 20,
            color: '6b7280',
          }),
        ],
        spacing: { after: 100 },
      }),
      
      new Paragraph({
        children: [
          new TextRun({
            text: 'Varför det är viktigt: ',
            bold: true,
            size: 22,
          }),
          new TextRun({
            text: finding.why_it_matters,
            size: 22,
          }),
        ],
        spacing: { after: 100 },
      }),
      
      new Paragraph({
        children: [
          new TextRun({
            text: 'Rekommendation: ',
            bold: true,
            size: 22,
          }),
          new TextRun({
            text: finding.recommendation,
            size: 22,
          }),
        ],
        spacing: { after: 200 },
      })
    );
  });

  return new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });
}


