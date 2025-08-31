'use client';

import { useWizardStore } from '@/lib/store/wizard';
import { Stepper } from '@/components/Stepper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FindingsTable } from '@/components/FindingsTable';
import { ImpactEffortMatrix } from '@/components/ImpactEffortMatrix';
import { SummaryCard } from '@/components/SummaryCard';
import { combineFindings, getQuickWins, getStrategicProjects } from '@/lib/scoring/impactEffort';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Download } from 'lucide-react';
import { Finding, AggregatedResult } from '@/lib/types';

export default function ReviewPage() {
  const router = useRouter();
  const { 
    companyInfo, 
    analysisResults, 
    aggregatedResult,
    setAggregatedResult,
    setCurrentStep 
  } = useWizardStore();

  const [findings, setFindings] = useState<Finding[]>([]);
  const [executiveSummary, setExecutiveSummary] = useState('');

  useEffect(() => {
    console.log('Review page - analysisResults:', analysisResults);
    console.log('Review page - analysisResults keys:', Object.keys(analysisResults));
    
    // Combine all findings from different analysis results
    const allFindings = Object.values(analysisResults).map(result => result.findings);
    const combinedFindings = combineFindings(...allFindings);
    setFindings(combinedFindings);

    // Set executive summary if available
    if (aggregatedResult?.executiveSummary) {
      setExecutiveSummary(aggregatedResult.executiveSummary);
    }
  }, [analysisResults, aggregatedResult]);

  const handleFindingsChange = (newFindings: Finding[]) => {
    setFindings(newFindings);
  };

  const handleSummaryChange = (summary: string) => {
    setExecutiveSummary(summary);
  };

  const handleContinue = () => {
    // Create aggregated result
    const result: AggregatedResult = {
      company: companyInfo?.name || '',
      executiveSummary,
      findings,
    };

    setAggregatedResult(result);
    setCurrentStep(5);
    router.push('/export');
  };

  const handleBack = () => {
    setCurrentStep(3);
    router.push('/analyze');
  };

  const quickWins = getQuickWins(findings);
  const strategicProjects = getStrategicProjects(findings);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <Stepper />
      </div>

      <div className="space-y-8">
        {/* Summary Card */}
        <SummaryCard
          company={companyInfo?.name || ''}
          analysisResults={analysisResults}
          onSummaryChange={handleSummaryChange}
        />

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-green-600">{quickWins.length}</div>
              <div className="text-sm text-muted-foreground">Quick Wins</div>
              <div className="text-xs text-muted-foreground mt-1">
                Hög impact, låg effort
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-blue-600">{strategicProjects.length}</div>
              <div className="text-sm text-muted-foreground">Strategiska projekt</div>
              <div className="text-xs text-muted-foreground mt-1">
                Hög impact, hög effort
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-gray-600">{findings.length}</div>
              <div className="text-sm text-muted-foreground">Totalt fynd</div>
              <div className="text-xs text-muted-foreground mt-1">
                Alla rekommendationer
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Impact/Effort Matrix */}
        <ImpactEffortMatrix findings={findings} />

        {/* Findings Table */}
        <FindingsTable 
          findings={findings} 
          onFindingsChange={handleFindingsChange}
        />

        {/* Navigation */}
        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Tillbaka
          </Button>
          
          <Button 
            onClick={handleContinue}
            disabled={findings.length === 0}
          >
            Fortsätt till export
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
