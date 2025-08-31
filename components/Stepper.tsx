'use client';

import { useWizardStore } from '@/lib/store/wizard';
import { cn } from '@/lib/utils/cn';
import { Check } from 'lucide-react';

const steps = [
  { id: 0, name: 'Företag', description: 'Grundläggande information' },
  { id: 1, name: 'Uppladdning', description: 'Ladda upp filer' },
  { id: 2, name: 'Frågor', description: 'Ytterligare kontext' },
  { id: 3, name: 'Analys', description: 'AI-analys pågår' },
  { id: 4, name: 'Granskning', description: 'Granska resultat' },
  { id: 5, name: 'Export', description: 'Ladda ner rapport' },
];

export function Stepper() {
  const currentStep = useWizardStore((state) => state.currentStep);

  return (
    <nav aria-label="Progress" className="w-full">
      <ol className="flex items-center justify-between">
        {steps.map((step, stepIdx) => (
          <li key={step.name} className={cn(
            stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : '',
            'relative'
          )}>
            <div className="flex items-center">
              <div className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full border-2',
                step.id < currentStep
                  ? 'border-primary bg-primary text-primary-foreground'
                  : step.id === currentStep
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-muted-foreground bg-background text-muted-foreground'
              )}>
                {step.id < currentStep ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-medium">{step.id + 1}</span>
                )}
              </div>
              <div className="ml-4 min-w-0">
                <p className={cn(
                  'text-sm font-medium',
                  step.id <= currentStep ? 'text-foreground' : 'text-muted-foreground'
                )}>
                  {step.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
            {stepIdx !== steps.length - 1 && (
              <div className={cn(
                'absolute top-5 left-10 h-0.5 w-full',
                step.id < currentStep ? 'bg-primary' : 'bg-muted-foreground'
              )} />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}


