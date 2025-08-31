'use client';

import { useState } from 'react';
import { Finding } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { getImpactEffortCategory, getImpactLabel, getEffortLabel } from '@/lib/scoring/impactEffort';
import { Search, Filter } from 'lucide-react';

interface FindingsTableProps {
  findings: Finding[];
  onFindingsChange: (findings: Finding[]) => void;
}

export function FindingsTable({ findings, onFindingsChange }: FindingsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterArea, setFilterArea] = useState<string>('all');
  const [editingFinding, setEditingFinding] = useState<Finding | null>(null);

  const areas = Array.from(new Set(findings.map(f => f.area)));

  const filteredFindings = findings.filter(finding => {
    const matchesSearch = finding.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         finding.recommendation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesArea = filterArea === 'all' || finding.area === filterArea;
    return matchesSearch && matchesArea;
  });

  const updateFinding = (updatedFinding: Finding) => {
    const newFindings = findings.map(f => 
      f === editingFinding ? updatedFinding : f
    );
    onFindingsChange(newFindings);
    setEditingFinding(null);
  };

  const updateFindingField = (field: keyof Finding, value: any) => {
    if (!editingFinding) return;
    
    const updated = { ...editingFinding, [field]: value };
    setEditingFinding(updated);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analysresultat</CardTitle>
        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Sök i fynd..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={filterArea}
              onChange={(e) => setFilterArea(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="all">Alla områden</option>
              {areas.map(area => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {filteredFindings.map((finding, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {editingFinding === finding ? (
                    <Input
                      value={finding.title}
                      onChange={(e) => updateFindingField('title', e.target.value)}
                      className="font-medium mb-2"
                    />
                  ) : (
                    <h3 className="font-medium">{finding.title}</h3>
                  )}
                  
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{finding.area}</Badge>
                    <Badge 
                      variant={getImpactEffortCategory(finding.impact, finding.effort) === 'Quick Win' ? 'default' : 'secondary'}
                    >
                      {getImpactEffortCategory(finding.impact, finding.effort)}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="text-right text-sm">
                    <div>Impact: {getImpactLabel(finding.impact)}</div>
                    <div>Effort: {getEffortLabel(finding.effort)}</div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingFinding(editingFinding === finding ? null : finding)}
                  >
                    {editingFinding === finding ? 'Spara' : 'Redigera'}
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Varför det är viktigt:</label>
                {editingFinding === finding ? (
                  <Textarea
                    value={finding.why_it_matters}
                    onChange={(e) => updateFindingField('why_it_matters', e.target.value)}
                    className="mt-1"
                    rows={2}
                  />
                ) : (
                  <p className="text-sm mt-1">{finding.why_it_matters}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Rekommendation:</label>
                {editingFinding === finding ? (
                  <Textarea
                    value={finding.recommendation}
                    onChange={(e) => updateFindingField('recommendation', e.target.value)}
                    className="mt-1"
                    rows={2}
                  />
                ) : (
                  <p className="text-sm mt-1">{finding.recommendation}</p>
                )}
              </div>

              {finding.evidence && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Bevis:</label>
                  <p className="text-sm mt-1 text-muted-foreground">{finding.evidence}</p>
                </div>
              )}

              {editingFinding === finding && (
                <div className="flex gap-2">
                  <div className="flex items-center gap-2">
                    <label className="text-sm">Impact:</label>
                    <select
                      value={finding.impact}
                      onChange={(e) => updateFindingField('impact', parseInt(e.target.value))}
                      className="px-2 py-1 border rounded text-sm"
                    >
                      {[1, 2, 3, 4, 5].map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm">Effort:</label>
                    <select
                      value={finding.effort}
                      onChange={(e) => updateFindingField('effort', parseInt(e.target.value))}
                      className="px-2 py-1 border rounded text-sm"
                    >
                      {[1, 2, 3, 4, 5].map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateFinding(editingFinding)}
                  >
                    Spara ändringar
                  </Button>
                </div>
              )}
            </div>
          ))}
          
          {filteredFindings.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Inga fynd hittades för de valda filtren.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


