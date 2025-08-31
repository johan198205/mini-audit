'use client';

import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function SettingsButton() {
  const router = useRouter();

  return (
    <div className="fixed top-4 right-4 z-50">
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.push('/settings')}
        className="bg-white/80 backdrop-blur-sm hover:bg-white shadow-lg"
      >
        <Settings className="h-4 w-4 mr-2" />
        Inställningar
      </Button>
    </div>
  );
}


