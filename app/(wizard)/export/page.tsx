'use client';

import { useWizardStore } from '@/lib/store/wizard';
import { Stepper } from '@/components/Stepper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { Download, FileText, File, CheckCircle } from 'lucide-react';

export default function ExportPage() {
  const { aggregatedResult } = useWizardStore();
  const [isExporting, setIsExporting] = useState<{
    pdf: boolean;
    docx: boolean;
  }>({ pdf: false, docx: false });

  const handleExport = async (format: 'pdf' | 'docx') => {
    if (!aggregatedResult) return;

    setIsExporting(prev => ({ ...prev, [format]: true }));

    try {
      const response = await fetch(`/api/export/${format}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(aggregatedResult),
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Check if we got HTML instead of PDF (fallback case)
      const contentType = response.headers.get('content-type');
      if (format === 'pdf' && contentType?.includes('text/html')) {
        a.download = `${aggregatedResult.company.replace(/[^a-zA-Z0-9]/g, '_')}-review.html`;
        // Show a message about the fallback
        alert('PDF-generering misslyckades, men du får en HTML-fil istället. Öppna filen i webbläsaren och använd Ctrl+P (Cmd+P på Mac) för att skapa en PDF.');
      } else {
        a.download = `${aggregatedResult.company.replace(/[^a-zA-Z0-9]/g, '_')}-review.${format}`;
      }
      
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (error) {
      console.error(`Error exporting ${format}:`, error);
      alert(`Fel vid export av ${format.toUpperCase()}. Försök igen.`);
    } finally {
      setIsExporting(prev => ({ ...prev, [format]: false }));
    }
  };

  if (!aggregatedResult) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Stepper />
        </div>
        <Card className="rounded-2xl shadow-lg">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Ingen data att exportera. Gå tillbaka och slutför analysen.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const quickWins = aggregatedResult.findings.filter(f => f.impact >= 4 && f.effort <= 2);
  const strategicProjects = aggregatedResult.findings.filter(f => f.impact >= 4 && f.effort >= 3);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <Stepper />
      </div>

      <Card className="rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Export av rapport
          </CardTitle>
          <p className="text-center text-muted-foreground">
            Ladda ner din Growth Measurement Review för {aggregatedResult.company}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{quickWins.length}</div>
              <div className="text-sm text-green-700">Quick Wins</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{strategicProjects.length}</div>
              <div className="text-sm text-blue-700">Strategiska projekt</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{aggregatedResult.findings.length}</div>
              <div className="text-sm text-gray-700">Totalt fynd</div>
            </div>
          </div>

          {/* Export Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Välj exportformat:</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-2 hover:border-primary transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-100 rounded-lg">
                      <FileText className="h-8 w-8 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">PDF Rapport</h4>
                      <p className="text-sm text-muted-foreground">
                        Professionell rapport med formatering och layout
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">Printbar</Badge>
                        <Badge variant="outline">Formaterad</Badge>
                      </div>
                      <p className="text-xs text-amber-600 mt-2">
                        ⚠️ Om PDF misslyckas får du en HTML-fil som du kan skriva ut som PDF
                      </p>
                    </div>
                  </div>
                  <Button
                    className="w-full mt-4"
                    onClick={() => handleExport('pdf')}
                    disabled={isExporting.pdf}
                  >
                    {isExporting.pdf ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Genererar PDF...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Ladda ner PDF
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <File className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">Word Dokument</h4>
                      <p className="text-sm text-muted-foreground">
                        Redigerbar rapport i Microsoft Word-format
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">Redigerbar</Badge>
                        <Badge variant="outline">Word</Badge>
                      </div>
                    </div>
                  </div>
                  <Button
                    className="w-full mt-4"
                    onClick={() => handleExport('docx')}
                    disabled={isExporting.docx}
                  >
                    {isExporting.docx ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Genererar DOCX...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Ladda ner DOCX
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Report Preview */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Rapportinnehåll:</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Executive Summary</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Översikt med statistik</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Quick Wins ({quickWins.length} stycken)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Strategiska projekt ({strategicProjects.length} stycken)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Alla rekommendationer ({aggregatedResult.findings.length} stycken)</span>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {(isExporting.pdf || isExporting.docx) && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-green-700 font-medium">
                  Rapporten genereras och kommer att laddas ner automatiskt...
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
