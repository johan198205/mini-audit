'use client';

import { useWizardStore } from '@/lib/store/wizard';
import { Stepper } from '@/components/Stepper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';

const sections = [
  { id: 'Measurement', label: 'Mätning (GA4/GTM)', description: 'Analys av analytics och spårning' },
  { id: 'Data', label: 'Data & Rapportering', description: 'KPI:er och segmentering' },
  { id: 'CRO/UX', label: 'CRO/UX', description: 'Konverteringsoptimering' },
  { id: 'SEO', label: 'SEO', description: 'Sökmotoroptimering' },
  { id: 'GEO', label: 'GEO', description: 'Generativ sökmotoroptimering' },
] as const;

export default function CompanyPage() {
  const router = useRouter();
  const { companyInfo, setCompanyInfo, setCurrentStep } = useWizardStore();
  
  const [formData, setFormData] = useState({
    name: companyInfo?.name || '',
    domain: companyInfo?.domain || '',
    sections: companyInfo?.sections || [],
  });

  const handleSectionToggle = (sectionId: string) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.includes(sectionId as any)
        ? prev.sections.filter(s => s !== sectionId)
        : [...prev.sections, sectionId as any]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.domain || formData.sections.length === 0) {
      return;
    }

    setCompanyInfo({
      name: formData.name,
      domain: formData.domain,
      sections: formData.sections,
    });
    
    setCurrentStep(1);
    router.push('/upload');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <Stepper />
      </div>

      <Card className="rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">
            Growth Measurement Review Agent
          </CardTitle>
          <p className="text-center text-muted-foreground mt-2">
            Fyll i grundläggande information om företaget och välj vilka områden som ska analyseras
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="company-name" className="block text-sm font-medium mb-2">
                  Företagsnamn *
                </label>
                <Input
                  id="company-name"
                  type="text"
                  placeholder="Ex: Acme AB"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label htmlFor="domain" className="block text-sm font-medium mb-2">
                  Huvuddomän *
                </label>
                <Input
                  id="domain"
                  type="url"
                  placeholder="Ex: https://acme.se"
                  value={formData.domain}
                  onChange={(e) => setFormData(prev => ({ ...prev, domain: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">
                Välj analysområden *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sections.map((section) => (
                  <div
                    key={section.id}
                    className={`
                      p-4 border-2 rounded-xl cursor-pointer transition-all
                      ${formData.sections.includes(section.id as any)
                        ? 'border-primary bg-primary/5'
                        : 'border-muted hover:border-primary/50'
                      }
                    `}
                    onClick={() => handleSectionToggle(section.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{section.label}</h3>
                        <p className="text-sm text-muted-foreground">{section.description}</p>
                      </div>
                      {formData.sections.includes(section.id as any) && (
                        <Check className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button 
                type="submit" 
                disabled={!formData.name || !formData.domain || formData.sections.length === 0}
                className="px-8"
              >
                Fortsätt till uppladdning
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


