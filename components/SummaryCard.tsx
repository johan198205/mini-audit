'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { AnalysisResult } from '@/lib/types';
import { Loader2 } from 'lucide-react';

interface SummaryCardProps {
  company: string;
  analysisResults: Record<string, AnalysisResult>;
  onSummaryChange: (summary: string) => void;
}

export function SummaryCard({ company, analysisResults, onSummaryChange }: SummaryCardProps) {
  const [summary, setSummary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateSummary = async () => {
    setIsGenerating(true);
    
    console.log('Generating summary with:', { company, analysisResultsKeys: Object.keys(analysisResults) });
    
    try {
      const response = await fetch('/api/generate-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company,
          analysisResults,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setSummary(result.summary);
        onSummaryChange(result.summary);
      } else {
        const error = await response.json();
        // If API key is not configured, generate a basic summary
        if (error.error?.includes('API key')) {
          const basicSummary = generateBasicSummary();
          setSummary(basicSummary);
          onSummaryChange(basicSummary);
        } else {
          setSummary(`Fel: ${error.error || 'Kunde inte generera sammanfattning'}`);
          onSummaryChange(`Fel: ${error.error || 'Kunde inte generera sammanfattning'}`);
        }
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      // Generate basic summary as fallback
      const basicSummary = generateBasicSummary();
      setSummary(basicSummary);
      onSummaryChange(basicSummary);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateBasicSummary = () => {
    const sections = Object.keys(analysisResults);
    const totalFindings = Object.values(analysisResults).reduce((sum, result) => sum + result.findings.length, 0);
    
    if (sections.length === 0) {
      return `Analysen av ${company} har genomförts men inga specifika resultat är tillgängliga för sammanfattning. 

Kontrollera att analysen har körts korrekt och att resultaten har sparats. Om problemet kvarstår, kör analysen igen.

För att få en mer detaljerad AI-genererad sammanfattning, konfigurera din OpenAI API-nyckel i inställningarna.`;
    }
    
    return `Analysen av ${company} har genomförts och identifierat ${totalFindings} förbättringsmöjligheter inom ${sections.join(', ')}. 

De viktigaste fynden inkluderar tekniska optimeringar, användarupplevelse-förbättringar och datakvalitetsproblem som kan påverka affärsresultatet.

För att få en mer detaljerad AI-genererad sammanfattning, konfigurera din OpenAI API-nyckel i inställningarna.`;
  };

  useEffect(() => {
    // Auto-generate summary when analysis results change
    if (Object.keys(analysisResults).length > 0 && !summary) {
      generateSummary();
    }
  }, [analysisResults, summary]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Executive Summary</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={generateSummary}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Genererar...
              </>
            ) : (
              'Generera om'
            )}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          AI-genererad sammanfattning av analysen (max 200 ord)
        </p>
      </CardHeader>
      
      <CardContent>
        <Textarea
          value={summary}
          onChange={(e) => {
            setSummary(e.target.value);
            onSummaryChange(e.target.value);
          }}
          placeholder={isGenerating ? "Genererar executive summary..." : "Executive summary kommer att genereras automatiskt..."}
          rows={6}
          className="resize-none"
          disabled={isGenerating}
        />
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-muted-foreground">
            {summary.length} / 200 ord
          </span>
          {summary.length > 200 && (
            <span className="text-xs text-red-500">
              Överstiger rekommenderad längd
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
