'use client';

import { useWizardStore } from '@/lib/store/wizard';
import { Stepper } from '@/components/Stepper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileDrop } from '@/components/FileDrop';
import { TestFileDrop } from '@/components/TestFileDrop';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function UploadPage() {
  const router = useRouter();
  const { companyInfo, uploadedFiles, updateUploadedFiles, setCurrentStep } = useWizardStore();
  
  const [files, setFiles] = useState<{
    screamingFrog: File[];
    ahrefs: File[];
    ga4: File[];
    gtm: File[];
    screenshots: File[];
  }>({
    screamingFrog: [],
    ahrefs: [],
    ga4: [],
    gtm: [],
    screenshots: [],
  });

  const handleFilesAccepted = (type: keyof typeof files) => (acceptedFiles: File[]) => {
    console.log(`Upload: Files accepted for ${type}:`, acceptedFiles.length, acceptedFiles.map(f => f.name));
    setFiles(prev => ({
      ...prev,
      [type]: [...prev[type], ...acceptedFiles]
    }));
  };

  const handleFileRemove = (type: keyof typeof files) => (file: File) => {
    setFiles(prev => ({
      ...prev,
      [type]: prev[type].filter(f => f !== file)
    }));
  };

  const handleContinue = async () => {
    // Upload files to server
    const uploadedFilePaths: Record<string, string | string[]> = {};
    
    for (const [type, fileList] of Object.entries(files)) {
      if (fileList.length === 0) continue;
      
      const formData = new FormData();
      fileList.forEach(file => formData.append('files', file));
      formData.append('type', type);
      
      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (response.ok) {
          const result = await response.json();
          if (type === 'screenshots' || type === 'ga4') {
            uploadedFilePaths[type] = result.paths;
          } else {
            uploadedFilePaths[type] = result.paths[0];
          }
        }
      } catch (error) {
        console.error(`Error uploading ${type}:`, error);
      }
    }

    updateUploadedFiles(uploadedFilePaths);
    setCurrentStep(2);
    router.push('/questions');
  };

  const handleBack = () => {
    setCurrentStep(0);
    router.push('/');
  };

  // Allow continuing without any files - all are optional
  const canContinue = true;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <Stepper />
      </div>

      <Card className="rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Ladda upp filer för analys
          </CardTitle>
          <p className="text-muted-foreground">
            Ladda upp relevanta filer för {companyInfo?.name}. Alla filer är valfria - ladda upp de du har tillgängliga.
          </p>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">📋 Exakt vilka filer som behövs:</h4>
            <div className="text-sm text-blue-800 space-y-3">
              <div>
                <strong>🔍 Screaming Frog (Rekommenderat):</strong>
                <ul className="ml-4 mt-1 space-y-1">
                  <li>• Kör en full crawl av hela webbplatsen</li>
                  <li>• <strong>Huvudrapport:</strong> File → Export → Internal HTML → CSV/Excel</li>
                  <li>• Viktigt: Inkludera alla kolumner (URL, Title, Meta Description, H1, Status Code, etc.)</li>
                  <li>• <strong>Ytterligare rapporter (rekommenderat):</strong></li>
                  <li>  - File → Export → Response Codes → CSV (för statuskoder)</li>
                  <li>  - File → Export → Images → CSV (för bildanalys)</li>
                  <li>  - File → Export → Internal Links → CSV (för intern länkning)</li>
                  <li>  - File → Export → External Links → CSV (för externa länkar)</li>
                  <li>  - File → Export → Redirects → CSV (för omdirigeringar)</li>
                </ul>
              </div>
              
              {companyInfo?.sections.includes('SEO') && (
                <>
                  <div>
                    <strong>📊 Ahrefs (för SEO-analys):</strong>
                    <ul className="ml-4 mt-1 space-y-1">
                      <li>• Site Explorer → Organic Keywords → Export → CSV/Excel</li>
                      <li>• Inkludera: Keyword, Search Volume, Position, URL</li>
                      <li>• Exportera top 1000-5000 nyckelord</li>
                    </ul>
                  </div>
                  
                  <div>
                    <strong>📈 GA4 (för SEO-data):</strong>
                    <ul className="ml-4 mt-1 space-y-1">
                      <li>• Organic Search: Reports → Acquisition → Traffic acquisition → Filter: Google/organic → Export → CSV</li>
                      <li>• Landing Pages: Reports → Engagement → Pages and screens → Export → CSV</li>
                      <li>• Search Console: Koppla GSC till GA4 för sökdata</li>
                    </ul>
                  </div>
                </>
              )}
              
              {companyInfo?.sections.includes('Measurement') && (
                <>
                  <div>
                    <strong>📈 GA4 (för mätning):</strong>
                    <ul className="ml-4 mt-1 space-y-1">
                      <li>• Events: Reports → Engagement → Events → Export → CSV</li>
                      <li>• Conversions: Reports → Monetization → Conversions → Export → CSV</li>
                      <li>• Traffic: Reports → Acquisition → Traffic acquisition → Export → CSV</li>
                      <li>• Real-time: För att se live-events och spårning</li>
                    </ul>
                  </div>
                  
                  <div>
                    <strong>🏷️ GTM (för mätning):</strong>
                    <ul className="ml-4 mt-1 space-y-1">
                      <li>• Container → Export → Download → JSON</li>
                      <li>• Tags → Export → CSV (för tag-översikt)</li>
                      <li>• Variables → Export → CSV (för variabel-översikt)</li>
                    </ul>
                  </div>
                </>
              )}
              
              {companyInfo?.sections.includes('Data') && (
                <div>
                  <strong>📈 GA4 (för data-analys - ladda upp flera filer):</strong>
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>• <strong>Traffic Acquisition:</strong> Reports → Acquisition → Traffic acquisition → Export → CSV</li>
                    <li>• <strong>Engagement Overview:</strong> Reports → Engagement → Overview → Export → CSV</li>
                    <li>• <strong>Pages and Screens:</strong> Reports → Engagement → Pages and screens → Export → CSV</li>
                    <li>• <strong>Events:</strong> Reports → Engagement → Events → Export → CSV</li>
                    <li>• <strong>Conversions:</strong> Reports → Monetization → Conversions → Export → CSV</li>
                    <li>• <strong>Demographics:</strong> Reports → Demographics → Demographics details → Export → CSV</li>
                    <li>• <strong>Technology:</strong> Reports → Demographics → Tech → Tech details → Export → CSV</li>
                    <li>• <strong>Geographic:</strong> Reports → Demographics → Geographic → Geographic details → Export → CSV</li>
                  </ul>
                  <p className="ml-4 mt-2 text-xs text-blue-600">
                    💡 <strong>Tips:</strong> Ladda upp alla relevanta rapporter för bästa analys. Ju fler filer, desto mer specifika fynd!
                  </p>
                </div>
              )}
              
              {companyInfo?.sections.includes('CRO/UX') && (
                <>
                  <div>
                    <strong>📈 GA4 (för CRO-data):</strong>
                    <ul className="ml-4 mt-1 space-y-1">
                      <li>• Funnel Analysis: Reports → Monetization → Ecommerce → Purchase journey → Export → CSV</li>
                      <li>• Page Performance: Reports → Engagement → Pages and screens → Export → CSV</li>
                      <li>• Events: Reports → Engagement → Events → Export → CSV</li>
                    </ul>
                  </div>
                  
                  <div>
                    <strong>📸 Skärmdumpar (för CRO/UX):</strong>
                    <ul className="ml-4 mt-1 space-y-1">
                      <li>• Startsida (desktop + mobil)</li>
                      <li>• Produktsida/kategori (desktop + mobil)</li>
                      <li>• Kontaktformulär</li>
                      <li>• Checkout-process (alla steg)</li>
                      <li>• Om oss/varför oss-sida</li>
                    </ul>
                  </div>
                </>
              )}
              
              {companyInfo?.sections.includes('GEO') && (
                <div>
                  <strong>📈 GA4 (för GEO-data):</strong>
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>• Search Console: Koppla GSC till GA4 för sökdata</li>
                    <li>• Organic Search: Reports → Acquisition → Traffic acquisition → Filter: Google/organic → Export → CSV</li>
                    <li>• Content Performance: Reports → Engagement → Pages and screens → Export → CSV</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-2">🎯 Målet med analysen:</h4>
            <div className="text-sm text-green-800 space-y-2">
              {companyInfo?.sections.includes('SEO') && (
                <div><strong>SEO:</strong> Identifiera tekniska problem, saknade meta-taggar, duplicerat innehåll</div>
              )}
              {companyInfo?.sections.includes('Measurement') && (
                <div><strong>Mätning:</strong> Hitta saknade events, felaktig spårning, samtyckesproblem</div>
              )}
              {companyInfo?.sections.includes('Data') && (
                <div><strong>Data:</strong> Förbättra KPI:er, segmentering och rapportering</div>
              )}
              {companyInfo?.sections.includes('CRO/UX') && (
                <div><strong>CRO/UX:</strong> Optimera konverteringsgrad, formulär och användarupplevelse</div>
              )}
              {companyInfo?.sections.includes('GEO') && (
                <div><strong>GEO:</strong> Förbättra synlighet i AI-sökmotorer som ChatGPT</div>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-8">
          <FileDrop
            accept={{
              'text/csv': ['.csv'],
              'application/vnd.ms-excel': ['.xls'],
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
            }}
            onFilesAccepted={handleFilesAccepted('screamingFrog')}
            onFileRemove={handleFileRemove('screamingFrog')}
            files={files.screamingFrog}
            title="Screaming Frog Export"
            description="CSV eller Excel-fil med full crawl-data. MÅSTE innehålla: URL, Title, Meta Description, H1, Status Code, Images Missing Alt Text, Canonical Link Element, Schema.org Type."
          />

          {companyInfo?.sections.includes('SEO') && (
            <FileDrop
              accept={{
                'text/csv': ['.csv'],
                'application/vnd.ms-excel': ['.xls'],
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
              }}
              onFilesAccepted={handleFilesAccepted('ahrefs')}
              onFileRemove={handleFileRemove('ahrefs')}
              files={files.ahrefs}
              title="Ahrefs Export (Valfritt)"
              description="CSV eller Excel-fil med organic keywords. MÅSTE innehålla: Keyword, Search Volume, Position, URL. Exportera top 1000-5000 nyckelord."
            />
          )}

          {(companyInfo?.sections.includes('Measurement') || companyInfo?.sections.includes('Data') || companyInfo?.sections.includes('SEO') || companyInfo?.sections.includes('CRO/UX') || companyInfo?.sections.includes('GEO')) && (
            <div className="space-y-3">
              <div>
                <h3 className="font-medium">GA4 Export (flera filer möjliga)</h3>
                <p className="text-sm text-muted-foreground">
                  Ladda upp flera GA4-rapporter för komplett analys: Traffic Acquisition, Engagement, Pages, Events, Conversions, Demographics, Technology, Geographic
                </p>
              </div>
              <TestFileDrop
                onFilesAccepted={handleFilesAccepted('ga4')}
                files={files.ga4}
                title=""
                maxFiles={10}
              />
            </div>
          )}

          {companyInfo?.sections.includes('Measurement') && (
            <FileDrop
              accept={{
                'text/csv': ['.csv'],
                'application/json': ['.json']
              }}
              onFilesAccepted={handleFilesAccepted('gtm')}
              onFileRemove={handleFileRemove('gtm')}
              files={files.gtm}
              title="GTM Export (Valfritt)"
              description="JSON-fil från GTM Container → Export → Download. Eller CSV från Tags → Export för tag-översikt."
            />
          )}

          {companyInfo?.sections.includes('CRO/UX') && (
            <FileDrop
              accept={{
                'image/png': ['.png'],
                'image/jpeg': ['.jpg', '.jpeg'],
                'image/webp': ['.webp']
              }}
              maxFiles={10}
              onFilesAccepted={handleFilesAccepted('screenshots')}
              onFileRemove={handleFileRemove('screenshots')}
              files={files.screenshots}
              title="Skärmdumpar (Valfritt)"
              description="PNG/JPG-bilder för CRO/UX-analys. Ta skärmdumpar av: Startsida (desktop+mobil), Produktsida, Kontaktformulär, Checkout-process, Om oss-sida."
            />
          )}

          <div className="flex justify-between pt-6">
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Tillbaka
            </Button>
            
            <Button 
              onClick={handleContinue}
              disabled={!canContinue}
            >
              Fortsätt till frågor
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}