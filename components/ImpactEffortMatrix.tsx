'use client';

import { Finding } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getImpactEffortCategory } from '@/lib/scoring/impactEffort';

interface ImpactEffortMatrixProps {
  findings: Finding[];
}

export function ImpactEffortMatrix({ findings }: ImpactEffortMatrixProps) {
  const matrix: Finding[][][] = Array.from({ length: 5 }, (_, i) => 
    Array.from({ length: 5 }, (_, j) => [])
  );

  // Place findings in matrix (impact is y-axis, effort is x-axis)
  findings.forEach(finding => {
    const impactIndex = 5 - finding.impact; // Reverse for visual (high impact at top)
    const effortIndex = finding.effort - 1;
    matrix[impactIndex][effortIndex].push(finding);
  });

  const getQuadrantColor = (impact: number, effort: number) => {
    if (impact >= 4 && effort <= 2) return 'bg-green-100 border-green-300';
    if (impact >= 4 && effort >= 3) return 'bg-blue-100 border-blue-300';
    if (impact <= 2) return 'bg-gray-100 border-gray-300';
    return 'bg-yellow-100 border-yellow-300';
  };

  const getQuadrantLabel = (impact: number, effort: number) => {
    if (impact >= 4 && effort <= 2) return 'Quick Wins';
    if (impact >= 4 && effort >= 3) return 'Strategic Projects';
    if (impact <= 2) return 'Low Priority';
    return 'Consider';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Impact/Effort Matrix</CardTitle>
        <p className="text-sm text-muted-foreground">
          Placering baserat på påverkan (y-axel) och insats (x-axel)
        </p>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-2">
          {/* Header */}
          <div className="flex">
            <div className="w-20 text-xs text-muted-foreground flex items-center justify-center">
              Impact
            </div>
            <div className="flex-1 grid grid-cols-5 gap-1">
              {[1, 2, 3, 4, 5].map(effort => (
                <div key={effort} className="text-xs text-muted-foreground text-center">
                  {effort}
                </div>
              ))}
            </div>
          </div>
          
          {/* Matrix */}
          {matrix.map((row, impactIndex) => {
            const impact = 5 - impactIndex;
            return (
              <div key={impact} className="flex">
                <div className="w-20 text-xs text-muted-foreground flex items-center justify-center">
                  {impact}
                </div>
                <div className="flex-1 grid grid-cols-5 gap-1">
                  {row.map((cell, effortIndex) => {
                    const effort = effortIndex + 1;
                    const quadrantColor = getQuadrantColor(impact, effort);
                    const quadrantLabel = getQuadrantLabel(impact, effort);
                    
                    return (
                      <div
                        key={effort}
                        className={`
                          min-h-[60px] p-2 border rounded text-xs
                          ${quadrantColor}
                          ${cell.length > 0 ? 'border-2' : ''}
                        `}
                      >
                        {cell.length > 0 && (
                          <div className="space-y-1">
                            <div className="font-medium text-xs">
                              {quadrantLabel}
                            </div>
                            {cell.map((finding, index) => (
                              <div
                                key={index}
                                className="text-xs p-1 bg-white rounded border truncate"
                                title={finding.title}
                              >
                                {finding.title}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          
          {/* Legend */}
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                <span>Quick Wins (Hög impact, Låg effort)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
                <span>Strategic Projects (Hög impact, Hög effort)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
                <span>Consider (Medel impact/effort)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
                <span>Low Priority (Låg impact)</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


