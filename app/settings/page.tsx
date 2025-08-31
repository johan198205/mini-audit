'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Save, Eye, EyeOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if API key is already configured
    checkApiKeyStatus();
  }, []);

  const checkApiKeyStatus = async () => {
    try {
      const response = await fetch('/api/check-api-key');
      const data = await response.json();
      if (data.configured) {
        setApiKey('••••••••••••••••••••••••••••••••');
      }
    } catch (error) {
      console.error('Error checking API key status:', error);
    }
  };

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setMessage({ type: 'error', text: 'API-nyckel krävs' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/save-api-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'API-nyckel sparad framgångsrikt!' });
        setApiKey('••••••••••••••••••••••••••••••••');
        setShowApiKey(false);
        
        // Redirect to main app after a short delay
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Kunde inte spara API-nyckeln' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Ett fel uppstod vid sparning' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTest = async () => {
    if (!apiKey.trim()) {
      setMessage({ type: 'error', text: 'API-nyckel krävs för att testa' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/test-api-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'API-nyckeln fungerar perfekt! ✅' });
      } else {
        setMessage({ type: 'error', text: data.error || 'API-nyckeln fungerar inte' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Ett fel uppstod vid testning' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card className="rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            ⚙️ Inställningar
          </CardTitle>
          <p className="text-center text-muted-foreground">
            Konfigurera din OpenAI API-nyckel för AI-analys
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-blue-800">Vad behöver du?</h3>
            </div>
            <p className="text-sm text-blue-700">
              En OpenAI API-nyckel för att använda AI-analysen. Du kan skaffa en på{' '}
              <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                platform.openai.com/api-keys
              </a>
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey" className="text-sm font-medium">
                OpenAI API-nyckel
              </Label>
              <div className="relative">
                <Input
                  id="apiKey"
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-your-api-key-here"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                API-nyckeln sparas lokalt och används endast för AI-analys
              </p>
            </div>
          </div>

          {message && (
            <div className={`p-4 rounded-lg border ${
              message.type === 'success' 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <div className="flex items-center gap-2">
                {message.type === 'success' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <span className="text-sm font-medium">{message.text}</span>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleTest}
              disabled={isLoading || !apiKey.trim()}
              variant="outline"
              className="flex-1"
            >
              {isLoading ? 'Testar...' : 'Testa API-nyckel'}
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading || !apiKey.trim()}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Sparar...' : 'Spara'}
            </Button>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">🎯 Få bättre analysresultat</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Anpassa AI-prompts för mer specifika och handlingsbara rekommendationer
              </p>
              <Button
                variant="outline"
                onClick={() => router.push('/settings/prompts')}
                className="w-full"
              >
                🤖 Anpassa AI-prompts
              </Button>
            </div>
          </div>

          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => router.push('/')}
              className="text-muted-foreground hover:text-foreground"
            >
              ← Tillbaka till appen
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
