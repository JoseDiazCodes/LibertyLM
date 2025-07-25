import React, { useState } from 'react';
import { Play, Download, RefreshCw, FileText, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface VisualPlaygroundProps {
  sessionId: string | null;
  fileCount: number;
  user: any;
}

export function VisualPlayground({ sessionId, fileCount, user }: VisualPlaygroundProps) {
  const [mermaidCode, setMermaidCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastAnalyzed, setLastAnalyzed] = useState<Date | null>(null);
  const { toast } = useToast();

  const generateDiagram = async () => {
    if (!sessionId || !user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to generate diagrams",
        variant: "destructive",
      });
      return;
    }

    if (fileCount === 0) {
      toast({
        title: "No files uploaded",
        description: "Please upload your codebase files first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-codebase', {
        body: { sessionId }
      });

      if (error) throw error;

      setMermaidCode(data.mermaidCode);
      setLastAnalyzed(new Date());
      toast({
        title: "Diagram generated",
        description: `Analyzed ${data.fileCount} files successfully`,
      });
    } catch (error) {
      console.error('Error generating diagram:', error);
      toast({
        title: "Error",
        description: "Failed to generate diagram. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadDiagram = () => {
    if (!mermaidCode) return;

    const blob = new Blob([mermaidCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'codebase-diagram.mmd';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded",
      description: "Mermaid diagram saved to your downloads",
    });
  };

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Visual Playground
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Files uploaded: <span className="font-medium">{fileCount}</span>
                {lastAnalyzed && (
                  <span className="ml-4">
                    Last analyzed: {lastAnalyzed.toLocaleTimeString()}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={generateDiagram}
                  disabled={isLoading || fileCount === 0}
                  className="flex items-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  {isLoading ? 'Analyzing...' : 'Generate Diagram'}
                </Button>
                {mermaidCode && (
                  <Button
                    variant="outline"
                    onClick={downloadDiagram}
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                )}
              </div>
            </div>
            
            {fileCount === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Upload your codebase files to generate a visual diagram</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Diagram Display */}
      {mermaidCode && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Architecture Diagram</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={generateDiagram}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Regenerate
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-4 bg-background">
              <div className="w-full overflow-auto">
                <div 
                  className="mermaid-diagram min-h-[400px] flex items-center justify-center"
                  style={{ minWidth: '100%' }}
                >
                  <div dangerouslySetInnerHTML={{ 
                    __html: `<div class="mermaid">${mermaidCode}</div>` 
                  }} />
                </div>
              </div>
            </div>
            
            {/* Code Display */}
            <div className="mt-4">
              <details>
                <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                  View Mermaid Code
                </summary>
                <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-auto">
                  <code>{mermaidCode}</code>
                </pre>
              </details>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}