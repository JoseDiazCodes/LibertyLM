import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Key, Save, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ApiKeys {
  openai: string;
  claude: string;
  google: string;
}

export const ApiKeyManager: React.FC = () => {
  const { toast } = useToast();
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    openai: '',
    claude: '',
    google: ''
  });
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({
    openai: false,
    claude: false,
    google: false
  });

  // Load API keys from localStorage on component mount
  useEffect(() => {
    const savedKeys = localStorage.getItem('user-api-keys');
    if (savedKeys) {
      try {
        const parsedKeys = JSON.parse(savedKeys);
        setApiKeys(parsedKeys);
      } catch (error) {
        console.error('Error parsing saved API keys:', error);
      }
    }
  }, []);

  const handleKeyChange = (provider: keyof ApiKeys, value: string) => {
    setApiKeys(prev => ({
      ...prev,
      [provider]: value
    }));
  };

  const toggleShowKey = (provider: string) => {
    setShowKeys(prev => ({
      ...prev,
      [provider]: !prev[provider]
    }));
  };

  const saveApiKeys = () => {
    try {
      localStorage.setItem('user-api-keys', JSON.stringify(apiKeys));
      toast({
        title: "API Keys Saved",
        description: "Your API keys have been saved securely in your browser.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save API keys. Please try again.",
        variant: "destructive",
      });
    }
  };

  const clearApiKeys = () => {
    setApiKeys({
      openai: '',
      claude: '',
      google: ''
    });
    localStorage.removeItem('user-api-keys');
    toast({
      title: "API Keys Cleared",
      description: "All API keys have been removed from your browser.",
    });
  };

  const hasAnyKeys = Object.values(apiKeys).some(key => key.trim() !== '');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          API Key Management
        </CardTitle>
        <CardDescription>
          Add your own API keys to use AI services. Keys are stored securely in your browser.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertDescription>
            Your API keys are stored locally in your browser and never sent to our servers. 
            They are only used to make direct requests to the AI providers.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="openai" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="openai">OpenAI</TabsTrigger>
            <TabsTrigger value="claude">Claude</TabsTrigger>
            <TabsTrigger value="google">Google AI</TabsTrigger>
          </TabsList>

          <TabsContent value="openai" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="openai-key">OpenAI API Key</Label>
              <div className="relative">
                <Input
                  id="openai-key"
                  type={showKeys.openai ? "text" : "password"}
                  placeholder="sk-..."
                  value={apiKeys.openai}
                  onChange={(e) => handleKeyChange('openai', e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => toggleShowKey('openai')}
                >
                  {showKeys.openai ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Get your API key from{' '}
                <a 
                  href="https://platform.openai.com/api-keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  OpenAI Platform
                </a>
              </p>
            </div>
          </TabsContent>

          <TabsContent value="claude" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="claude-key">Claude API Key</Label>
              <div className="relative">
                <Input
                  id="claude-key"
                  type={showKeys.claude ? "text" : "password"}
                  placeholder="sk-ant-..."
                  value={apiKeys.claude}
                  onChange={(e) => handleKeyChange('claude', e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => toggleShowKey('claude')}
                >
                  {showKeys.claude ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Get your API key from{' '}
                <a 
                  href="https://console.anthropic.com/account/keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Anthropic Console
                </a>
              </p>
            </div>
          </TabsContent>

          <TabsContent value="google" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="google-key">Google AI API Key</Label>
              <div className="relative">
                <Input
                  id="google-key"
                  type={showKeys.google ? "text" : "password"}
                  placeholder="AIza..."
                  value={apiKeys.google}
                  onChange={(e) => handleKeyChange('google', e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => toggleShowKey('google')}
                >
                  {showKeys.google ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Get your API key from{' '}
                <a 
                  href="https://makersuite.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Google AI Studio
                </a>
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-2">
          <Button onClick={saveApiKeys} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            Save API Keys
          </Button>
          {hasAnyKeys && (
            <Button variant="outline" onClick={clearApiKeys}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};