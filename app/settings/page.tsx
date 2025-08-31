'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Save, Eye, EyeOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [ga4PropertyId, setGa4PropertyId] = useState('');
  const [ga4Credentials, setGa4Credentials] = useState('');
  const [showGa4Credentials, setShowGa4Credentials] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if API key and GA4 settings are already configured
    checkApiKeyStatus();
    checkGA4Status();
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

  const checkGA4Status = async () => {
    try {
      const response = await fetch('/api/ga4-settings/check');
      const data = await response.json();
      if (data.configured) {
        setGa4PropertyId('••••••••••••••••••••••••••••••••');
        setGa4Credentials('••••••••••••••••••••••••••••••••');
      }
    } catch (error) {
      console.error('Error checking GA4 status:', error);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      // Save OpenAI API key if provided
      if (apiKey.trim()) {
        const apiResponse = await fetch('/api/save-api-key', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ apiKey: apiKey.trim() }),
        });

        if (!apiResponse.ok) {
          const data = await apiResponse.json();
          setMessage({ type: 'error', text: data.error || 'Kunde inte spara OpenAI API-nyckeln' });
          return;
        }
      }

      // Save GA4 settings if provided
      if (ga4PropertyId.trim() && ga4Credentials.trim()) {
        console.log('Sending GA4 data:', {
          propertyId: ga4PropertyId.trim(),
          credentialsLength: ga4Credentials.trim().length,
          credentialsStart: ga4Credentials.trim().substring(0, 50)
        });
        
        const ga4Response = await fetch('/api/ga4-settings/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            propertyId: ga4PropertyId.trim(),
            credentials: ga4Credentials.trim()
          }),
        });

        const ga4Data = await ga4Response.json();
        console.log('GA4 response:', ga4Data);

        if (!ga4Response.ok) {
          setMessage({ type: 'error', text: ga4Data.error || 'Kunde inte spara GA4-inställningar' });
          return;
        }
      }

      setMessage({ type: 'success', text: 'Alla inställningar sparade framgångsrikt!' });
      setApiKey('••••••••••••••••••••••••••••••••');
      setShowApiKey(false);
      setGa4Credentials('••••••••••••••••••••••••••••••••');
      setShowGa4Credentials(false);
      
      // Redirect to main app after a short delay
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Ett fel uppstod vid sparning' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTest = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      // Test the saved API key directly from server
      const response = await fetch('/api/test-api-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ testSaved: true }),
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

          <div className="space-y-6">
            {/* OpenAI API Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">🤖 OpenAI API</h3>
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

            {/* GA4 API Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">📊 Google Analytics 4 API</h3>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h4 className="font-semibold text-green-800">Valfritt: GA4 API-integration</h4>
                </div>
                <p className="text-sm text-green-700 mb-3">
                  Om du har full access till GA4 kan du använda API:et istället för CSV-uppladdning för snabbare och mer omfattande dataanalys.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ga4PropertyId" className="text-sm font-medium">
                    GA4 Property ID
                  </Label>
                  <Input
                    id="ga4PropertyId"
                    type="text"
                    value={ga4PropertyId}
                    onChange={(e) => setGa4PropertyId(e.target.value)}
                    placeholder="123456789"
                    className="font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    Hitta detta i GA4 under Admin → Property Settings → Property ID
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ga4Credentials" className="text-sm font-medium">
                    Service Account JSON
                  </Label>
                  <div className="relative">
                    <Textarea
                      id="ga4Credentials"
                      value={ga4Credentials}
                      onChange={(e) => setGa4Credentials(e.target.value)}
                      placeholder="Klistra in hela JSON-nyckeln här"
                      className="font-mono text-xs min-h-[200px] pr-10"
                      rows={10}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-2 px-2 py-1 hover:bg-transparent"
                      onClick={() => setShowGa4Credentials(!showGa4Credentials)}
                    >
                      {showGa4Credentials ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Service Account JSON-nyckel från Google Cloud Console med GA4 läsbehörighet
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const defaultJson = `{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "your-private-key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n",
  "client_email": "your-service-account@your-project.iam.gserviceaccount.com",
  "client_id": "your-client-id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/your-service-account%40your-project.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
}`;                      setGa4Credentials(defaultJson);
                    }}
                    className="mt-2"
                  >
                    🔧 Använd min JSON-nyckel
                  </Button>
                </div>
              </div>
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
