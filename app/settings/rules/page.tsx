'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface GA4Rules {
  bounceRate: {
    high: number;
    normal: {
      min: number;
      max: number;
    };
    suspicious: number;
  };
  conversionRate: {
    low: number;
    good: number;
    excellent: number;
  };
  sessionDuration: {
    short: number;
    good: number;
    excellent: number;
  };
  pageViews: {
    low: number;
    good: number;
    excellent: number;
  };
  traffic: {
    significant: number;
    high: number;
  };
}

export default function RulesPage() {
  const [rules, setRules] = useState<GA4Rules | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      const response = await fetch('/api/rules/ga4');
      if (response.ok) {
        const data = await response.json();
        setRules(data.rules);
      }
    } catch (error) {
      console.error('Error loading rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveRules = async () => {
    if (!rules) return;
    
    setSaving(true);
    try {
      const response = await fetch('/api/rules/ga4', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rules }),
      });

      if (response.ok) {
        alert('Regler sparade framgångsrikt!');
      } else {
        alert('Fel vid sparande av regler');
      }
    } catch (error) {
      console.error('Error saving rules:', error);
      alert('Fel vid sparande av regler');
    } finally {
      setSaving(false);
    }
  };

  const updateRule = (path: string, value: number) => {
    if (!rules) return;
    
    const newRules = { ...rules };
    const keys = path.split('.');
    let current: any = newRules;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    setRules(newRules);
  };

  if (loading) {
    return <div className="p-6">Laddar regler...</div>;
  }

  if (!rules) {
    return <div className="p-6">Fel vid laddning av regler</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">GA4 Analysregler</h1>
        <p className="text-gray-600">Konfigurera tröskelvärden för GA4-analys</p>
      </div>

      <div className="grid gap-6">
        {/* Bounce Rate */}
        <Card>
          <CardHeader>
            <CardTitle>Bounce Rate</CardTitle>
            <CardDescription>Tröskelvärden för bounce rate analys</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="bounceRate.high">Hög bounce rate (%)</Label>
                <Input
                  id="bounceRate.high"
                  type="number"
                  value={rules.bounceRate.high}
                  onChange={(e) => updateRule('bounceRate.high', Number(e.target.value))}
                />
                <p className="text-sm text-gray-500">> {rules.bounceRate.high}% = hög</p>
              </div>
              <div>
                <Label htmlFor="bounceRate.normal.min">Normal min (%)</Label>
                <Input
                  id="bounceRate.normal.min"
                  type="number"
                  value={rules.bounceRate.normal.min}
                  onChange={(e) => updateRule('bounceRate.normal.min', Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="bounceRate.normal.max">Normal max (%)</Label>
                <Input
                  id="bounceRate.normal.max"
                  type="number"
                  value={rules.bounceRate.normal.max}
                  onChange={(e) => updateRule('bounceRate.normal.max', Number(e.target.value))}
                />
                <p className="text-sm text-gray-500">{rules.bounceRate.normal.min}-{rules.bounceRate.normal.max}% = normalt</p>
              </div>
            </div>
            <div>
              <Label htmlFor="bounceRate.suspicious">Misstänkt låg (%)</Label>
              <Input
                id="bounceRate.suspicious"
                type="number"
                value={rules.bounceRate.suspicious}
                onChange={(e) => updateRule('bounceRate.suspicious', Number(e.target.value))}
              />
              <p className="text-sm text-gray-500">< {rules.bounceRate.suspicious}% = misstänkt låg</p>
            </div>
          </CardContent>
        </Card>

        {/* Conversion Rate */}
        <Card>
          <CardHeader>
            <CardTitle>Konverteringsgrad</CardTitle>
            <CardDescription>Tröskelvärden för konverteringsgrad analys</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="conversionRate.low">Låg (%)</Label>
                <Input
                  id="conversionRate.low"
                  type="number"
                  step="0.1"
                  value={rules.conversionRate.low}
                  onChange={(e) => updateRule('conversionRate.low', Number(e.target.value))}
                />
                <p className="text-sm text-gray-500">< {rules.conversionRate.low}% = låg</p>
              </div>
              <div>
                <Label htmlFor="conversionRate.good">Bra (%)</Label>
                <Input
                  id="conversionRate.good"
                  type="number"
                  step="0.1"
                  value={rules.conversionRate.good}
                  onChange={(e) => updateRule('conversionRate.good', Number(e.target.value))}
                />
                <p className="text-sm text-gray-500">{rules.conversionRate.low}-{rules.conversionRate.good}% = bra</p>
              </div>
              <div>
                <Label htmlFor="conversionRate.excellent">Excellent (%)</Label>
                <Input
                  id="conversionRate.excellent"
                  type="number"
                  step="0.1"
                  value={rules.conversionRate.excellent}
                  onChange={(e) => updateRule('conversionRate.excellent', Number(e.target.value))}
                />
                <p className="text-sm text-gray-500">> {rules.conversionRate.excellent}% = excellent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Session Duration */}
        <Card>
          <CardHeader>
            <CardTitle>Session Duration</CardTitle>
            <CardDescription>Tröskelvärden för session duration analys (sekunder)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="sessionDuration.short">Kort (s)</Label>
                <Input
                  id="sessionDuration.short"
                  type="number"
                  value={rules.sessionDuration.short}
                  onChange={(e) => updateRule('sessionDuration.short', Number(e.target.value))}
                />
                <p className="text-sm text-gray-500">< {rules.sessionDuration.short}s = kort</p>
              </div>
              <div>
                <Label htmlFor="sessionDuration.good">Bra (s)</Label>
                <Input
                  id="sessionDuration.good"
                  type="number"
                  value={rules.sessionDuration.good}
                  onChange={(e) => updateRule('sessionDuration.good', Number(e.target.value))}
                />
                <p className="text-sm text-gray-500">> {rules.sessionDuration.good}s = bra</p>
              </div>
              <div>
                <Label htmlFor="sessionDuration.excellent">Excellent (s)</Label>
                <Input
                  id="sessionDuration.excellent"
                  type="number"
                  value={rules.sessionDuration.excellent}
                  onChange={(e) => updateRule('sessionDuration.excellent', Number(e.target.value))}
                />
                <p className="text-sm text-gray-500">> {rules.sessionDuration.excellent}s = excellent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Page Views */}
        <Card>
          <CardHeader>
            <CardTitle>Page Views per Session</CardTitle>
            <CardDescription>Tröskelvärden för page views analys</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="pageViews.low">Låg</Label>
                <Input
                  id="pageViews.low"
                  type="number"
                  step="0.1"
                  value={rules.pageViews.low}
                  onChange={(e) => updateRule('pageViews.low', Number(e.target.value))}
                />
                <p className="text-sm text-gray-500">< {rules.pageViews.low} = låg</p>
              </div>
              <div>
                <Label htmlFor="pageViews.good">Bra</Label>
                <Input
                  id="pageViews.good"
                  type="number"
                  step="0.1"
                  value={rules.pageViews.good}
                  onChange={(e) => updateRule('pageViews.good', Number(e.target.value))}
                />
                <p className="text-sm text-gray-500">> {rules.pageViews.good} = bra</p>
              </div>
              <div>
                <Label htmlFor="pageViews.excellent">Excellent</Label>
                <Input
                  id="pageViews.excellent"
                  type="number"
                  step="0.1"
                  value={rules.pageViews.excellent}
                  onChange={(e) => updateRule('pageViews.excellent', Number(e.target.value))}
                />
                <p className="text-sm text-gray-500">> {rules.pageViews.excellent} = excellent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Traffic */}
        <Card>
          <CardHeader>
            <CardTitle>Trafik</CardTitle>
            <CardDescription>Tröskelvärden för trafik analys (sessioner)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="traffic.significant">Signifikant</Label>
                <Input
                  id="traffic.significant"
                  type="number"
                  value={rules.traffic.significant}
                  onChange={(e) => updateRule('traffic.significant', Number(e.target.value))}
                />
                <p className="text-sm text-gray-500">> {rules.traffic.significant} sessioner = signifikant</p>
              </div>
              <div>
                <Label htmlFor="traffic.high">Hög</Label>
                <Input
                  id="traffic.high"
                  type="number"
                  value={rules.traffic.high}
                  onChange={(e) => updateRule('traffic.high', Number(e.target.value))}
                />
                <p className="text-sm text-gray-500">> {rules.traffic.high} sessioner = hög</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={saveRules} disabled={saving}>
          {saving ? 'Sparar...' : 'Spara regler'}
        </Button>
      </div>
    </div>
  );
}
