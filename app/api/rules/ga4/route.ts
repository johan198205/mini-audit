import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { GA4Thresholds, DEFAULT_GA4_THRESHOLDS } from '@/lib/rules/ga4-thresholds';

const RULES_FILE_PATH = path.join(process.cwd(), 'tmp', 'ga4-rules.json');

export async function GET() {
  try {
    // Try to read custom rules, fallback to defaults
    try {
      const rulesData = await fs.readFile(RULES_FILE_PATH, 'utf-8');
      const customRules = JSON.parse(rulesData);
      return NextResponse.json({ rules: customRules });
    } catch (error) {
      // File doesn't exist or is invalid, return defaults
      return NextResponse.json({ rules: DEFAULT_GA4_THRESHOLDS });
    }
  } catch (error) {
    console.error('Error loading GA4 rules:', error);
    return NextResponse.json(
      { error: 'Failed to load GA4 rules' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rules } = body;

    if (!rules) {
      return NextResponse.json(
        { error: 'Rules data is required' },
        { status: 400 }
      );
    }

    // Validate the rules structure
    const requiredFields = ['bounceRate', 'conversionRate', 'sessionDuration', 'pageViews', 'traffic'];
    for (const field of requiredFields) {
      if (!rules[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Save rules to file
    await fs.writeFile(RULES_FILE_PATH, JSON.stringify(rules, null, 2), 'utf-8');

    return NextResponse.json({ 
      success: true, 
      message: 'GA4 rules updated successfully',
      rules 
    });
  } catch (error) {
    console.error('Error saving GA4 rules:', error);
    return NextResponse.json(
      { error: 'Failed to save GA4 rules' },
      { status: 500 }
    );
  }
}
