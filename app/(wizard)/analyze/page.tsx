'use client';

import { useWizardStore } from '@/lib/store/wizard';
import { Stepper } from '@/components/Stepper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';

type AnalysisStatus = 'pending' | 'running' | 'completed' | 'error';

interface AnalysisState {
  status: AnalysisStatus;
  result?: any;
  error?: string;
}

export default function AnalyzePage() {
  const router = useRouter();
  const { 
    companyInfo, 
    uploadedFiles, 
    contextAnswers, 
    setAnalysisResult, 
    setCurrentStep 
  } = useWizardStore();

  const [analysisStates, setAnalysisStates] = useState<Record<string, AnalysisState>>({});
  const [overallProgress, setOverallProgress] = useState(0);

  useEffect(() => {
    if (companyInfo?.sections) {
      const initialStates: Record<string, AnalysisState> = {};
      companyInfo.sections.forEach(section => {
        initialStates[section] = { status: 'pending' };
      });
      setAnalysisStates(initialStates);
    }
  }, [companyInfo?.sections]);

  useEffect(() => {
    const completed = Object.values(analysisStates).filter(state => state.status === 'completed').length;
    const total = Object.keys(analysisStates).length;
    setOverallProgress(total > 0 ? (completed / total) * 100 : 0);
  }, [analysisStates]);

  const runAnalysis = async () => {
    if (!companyInfo?.sections) return;

    const analysisPromises = companyInfo.sections.map(async (section) => {
      setAnalysisStates(prev => ({
        ...prev,
        [section]: { status: 'running' }
      }));

      try {
        const endpoint = section === 'CRO/UX' ? 'ux' : section.toLowerCase();
        const response = await fetch(`/api/analyze/${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            company: companyInfo.name,
            files: uploadedFiles,
            context: {
              url: companyInfo.domain,
              businessGoal: contextAnswers.businessGoal,
              conversions: contextAnswers.conversions,
              competitors: contextAnswers.competitors,
              markets: contextAnswers.markets,
            },
          }),
        });

        if (!response.ok) {
          throw new Error(`Analysis failed: ${response.statusText}`);
        }

        const result = await response.json();
        
        console.log(`Analysis completed for ${section}:`, result);
        setAnalysisResult(section, result);
        setAnalysisStates(prev => ({
          ...prev,
          [section]: { status: 'completed', result }
        }));

      } catch (error) {
        console.error(`Error in ${section} analysis:`, error);
        setAnalysisStates(prev => ({
          ...prev,
          [section]: { 
            status: 'error', 
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }));
      }
    });

    await Promise.all(analysisPromises);
  };

  const handleContinue = () => {
    setCurrentStep(4);
    router.push('/review');
  };

  const allCompleted = Object.values(analysisStates).every(state => state.status === 'completed');
  const hasErrors = Object.values(analysisStates).some(state => state.status === 'error');

  const getStatusIcon = (status: AnalysisStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'running':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStatusText = (status: AnalysisStatus) => {
    switch (status) {
      case 'completed':
        return 'Klar';
      case 'error':
        return 'Fel';
      case 'running':
        return 'Analyserar...';
      default:
        return 'Väntar';
    }
  };

  const getSectionName = (section: string) => {
    const names: Record<string, string> = {
      'Measurement': 'Mätning (GA4/GTM)',
      'Data': 'Data & Rapportering',
      'CRO/UX': 'CRO/UX',
      'SEO': 'SEO',
      'GEO': 'GEO',
    };
    return names[section] || section;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <Stepper />
      </div>

      <Card className="rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            AI-analys pågår
          </CardTitle>
          <p className="text-muted-foreground">
            Analyserar data för {companyInfo?.name} med AI...
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total framsteg</span>
              <span className="text-sm text-muted-foreground">
                {Math.round(overallProgress)}%
              </span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>

          <div className="space-y-4">
            {companyInfo?.sections.map((section) => {
              const state = analysisStates[section];
              return (
                <div
                  key={section}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(state?.status || 'pending')}
                    <div>
                      <h3 className="font-medium">{getSectionName(section)}</h3>
                      <p className="text-sm text-muted-foreground">
                        {state?.status === 'error' ? state.error : getStatusText(state?.status || 'pending')}
                      </p>
                    </div>
                  </div>
                  
                  {state?.status === 'completed' && state.result && (
                    <Badge variant="secondary">
                      {state.result.findings?.length || 0} fynd
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-center pt-6">
            {Object.values(analysisStates).every(state => state.status === 'pending') ? (
              <Button onClick={runAnalysis} size="lg">
                Starta analys
              </Button>
            ) : allCompleted ? (
              <Button onClick={handleContinue} size="lg">
                Fortsätt till granskning
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : hasErrors ? (
              <Button onClick={runAnalysis} variant="outline" size="lg">
                Försök igen
              </Button>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Analys pågår...
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
