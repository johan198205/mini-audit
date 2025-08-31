'use client';

import { useWizardStore } from '@/lib/store/wizard';
import { Stepper } from '@/components/Stepper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Plus, X } from 'lucide-react';

export default function QuestionsPage() {
  const router = useRouter();
  const { companyInfo, contextAnswers, setContextAnswers, setCurrentStep } = useWizardStore();
  
  const [formData, setFormData] = useState({
    businessGoal: contextAnswers.businessGoal || '',
    conversions: contextAnswers.conversions || [],
    competitors: contextAnswers.competitors || [],
    markets: contextAnswers.markets || [],
  });

  const [newConversion, setNewConversion] = useState('');
  const [newCompetitor, setNewCompetitor] = useState('');
  const [newMarket, setNewMarket] = useState('');

  const addConversion = () => {
    if (newConversion.trim() && !formData.conversions.includes(newConversion.trim())) {
      setFormData(prev => ({
        ...prev,
        conversions: [...prev.conversions, newConversion.trim()]
      }));
      setNewConversion('');
    }
  };

  const removeConversion = (conversion: string) => {
    setFormData(prev => ({
      ...prev,
      conversions: prev.conversions.filter(c => c !== conversion)
    }));
  };

  const addCompetitor = () => {
    if (newCompetitor.trim() && !formData.competitors.includes(newCompetitor.trim())) {
      setFormData(prev => ({
        ...prev,
        competitors: [...prev.competitors, newCompetitor.trim()]
      }));
      setNewCompetitor('');
    }
  };

  const removeCompetitor = (competitor: string) => {
    setFormData(prev => ({
      ...prev,
      competitors: prev.competitors.filter(c => c !== competitor)
    }));
  };

  const addMarket = () => {
    if (newMarket.trim() && !formData.markets.includes(newMarket.trim())) {
      setFormData(prev => ({
        ...prev,
        markets: [...prev.markets, newMarket.trim()]
      }));
      setNewMarket('');
    }
  };

  const removeMarket = (market: string) => {
    setFormData(prev => ({
      ...prev,
      markets: prev.markets.filter(m => m !== market)
    }));
  };

  const handleContinue = () => {
    setContextAnswers({
      businessGoal: formData.businessGoal,
      conversions: formData.conversions,
      competitors: formData.competitors,
      markets: formData.markets,
    });
    
    setCurrentStep(3);
    router.push('/analyze');
  };

  const handleBack = () => {
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
          <CardTitle className="text-2xl font-bold">
            Ytterligare kontext
          </CardTitle>
          <p className="text-muted-foreground">
            Fyll i ytterligare information som hjälper AI:n att ge mer relevanta rekommendationer
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div>
            <label htmlFor="business-goal" className="block text-sm font-medium mb-2">
              Affärsmål / NSM (North Star Metric)
            </label>
            <Textarea
              id="business-goal"
              placeholder="Beskriv företagets huvudmål och hur framgång mäts..."
              value={formData.businessGoal}
              onChange={(e) => setFormData(prev => ({ ...prev, businessGoal: e.target.value }))}
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Primära konverteringar
            </label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Ex: Lead, Köp, Registrering..."
                  value={newConversion}
                  onChange={(e) => setNewConversion(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addConversion())}
                />
                <Button type="button" onClick={addConversion} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.conversions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.conversions.map((conversion) => (
                    <Badge key={conversion} variant="secondary" className="flex items-center gap-2">
                      {conversion}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => removeConversion(conversion)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Top 2 konkurrenter (domäner)
            </label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Ex: konkurrent1.se, konkurrent2.se"
                  value={newCompetitor}
                  onChange={(e) => setNewCompetitor(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCompetitor())}
                />
                <Button type="button" onClick={addCompetitor} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.competitors.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.competitors.map((competitor) => (
                    <Badge key={competitor} variant="secondary" className="flex items-center gap-2">
                      {competitor}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => removeCompetitor(competitor)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Marknader/Språk (valfritt)
            </label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Ex: Sverige, Norge, Danmark"
                  value={newMarket}
                  onChange={(e) => setNewMarket(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMarket())}
                />
                <Button type="button" onClick={addMarket} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.markets.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.markets.map((market) => (
                    <Badge key={market} variant="secondary" className="flex items-center gap-2">
                      {market}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => removeMarket(market)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between pt-6">
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Tillbaka
            </Button>
            
            <Button onClick={handleContinue}>
              Starta analys
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


