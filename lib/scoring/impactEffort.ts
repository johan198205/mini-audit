import { Finding } from '@/lib/types';

export function combineFindings(...findingLists: Finding[][]): Finding[] {
  const allFindings: Finding[] = [];
  
  // Flatten all findings
  findingLists.forEach(findings => {
    allFindings.push(...findings);
  });

  // Remove duplicates based on title and area
  const uniqueFindings = allFindings.filter((finding, index, self) => 
    index === self.findIndex(f => 
      f.title === finding.title && f.area === finding.area
    )
  );

  // Sort by impact (descending) then effort (ascending)
  return uniqueFindings.sort((a, b) => {
    if (a.impact !== b.impact) {
      return b.impact - a.impact; // Higher impact first
    }
    return a.effort - b.effort; // Lower effort first
  });
}

export function getQuickWins(findings: Finding[]): Finding[] {
  return findings.filter(finding => 
    finding.impact >= 4 && finding.effort <= 2
  );
}

export function getStrategicProjects(findings: Finding[]): Finding[] {
  return findings.filter(finding => 
    finding.impact >= 4 && finding.effort >= 3
  );
}

export function getImpactEffortCategory(impact: number, effort: number): string {
  if (impact >= 4 && effort <= 2) {
    return 'Quick Win';
  } else if (impact >= 4 && effort >= 3) {
    return 'Strategic Project';
  } else if (impact <= 2) {
    return 'Low Priority';
  } else {
    return 'Consider';
  }
}

export function getImpactLabel(impact: number): string {
  switch (impact) {
    case 1: return 'Mycket låg';
    case 2: return 'Låg';
    case 3: return 'Medel';
    case 4: return 'Hög';
    case 5: return 'Mycket hög';
    default: return 'Okänd';
  }
}

export function getEffortLabel(effort: number): string {
  switch (effort) {
    case 1: return 'Mycket låg';
    case 2: return 'Låg';
    case 3: return 'Medel';
    case 4: return 'Hög';
    case 5: return 'Mycket hög';
    default: return 'Okänd';
  }
}


