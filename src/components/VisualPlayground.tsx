import React, { useState, useEffect, useRef } from 'react';
import { Play, Download, RefreshCw, FileText, Loader2, Image } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { safeSetInnerHTML, SecureStorage } from '@/lib/security';
import mermaid from 'mermaid';
import html2canvas from 'html2canvas';

interface VisualPlaygroundProps {
  sessionId: string | null;
  fileCount: number;
  user: any;
}

export function VisualPlayground({ sessionId, fileCount, user }: VisualPlaygroundProps) {
  const [mermaidCode, setMermaidCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [lastAnalyzed, setLastAnalyzed] = useState<Date | null>(null);
  const mermaidRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Initialize Mermaid
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'strict', // Changed to strict for security
      fontFamily: 'inherit',
      fontSize: 14,
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis'
      },
      sequence: {
        diagramMarginX: 50,
        diagramMarginY: 10,
        actorMargin: 50,
        width: 150,
        height: 65,
        boxMargin: 10,
        boxTextMargin: 5,
        noteMargin: 10,
        messageMargin: 35
      }
    });
  }, []);

  // Render Mermaid diagram when code changes
  useEffect(() => {
    if (mermaidCode && mermaidRef.current) {
      const renderDiagram = async () => {
        try {
          // Clear previous content
          mermaidRef.current!.innerHTML = '';
          
          // Generate unique ID for this diagram
          const id = `mermaid-${Date.now()}`;
          
          // Validate and render the diagram
          const { svg } = await mermaid.render(id, mermaidCode);
          
          // Use secure DOM manipulation instead of innerHTML
          safeSetInnerHTML(mermaidRef.current!, svg);
        } catch (error) {
          console.error('Error rendering Mermaid diagram:', error);
          
          // Create error message safely
          const errorDiv = document.createElement('div');
          errorDiv.className = 'text-center p-8 text-red-500';
          
          const titleP = document.createElement('p');
          titleP.className = 'font-medium';
          titleP.textContent = 'Error rendering diagram';
          
          const descP = document.createElement('p');
          descP.className = 'text-sm mt-2';
          descP.textContent = 'Please check the Mermaid code syntax';
          
          errorDiv.appendChild(titleP);
          errorDiv.appendChild(descP);
          mermaidRef.current!.appendChild(errorDiv);
        }
      };

      renderDiagram();
    }
  }, [mermaidCode]);

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

    // Get user API keys from localStorage (try encrypted first)
    let userApiKeys = null;
    
    try {
      const encryptedKeys = localStorage.getItem('user-api-keys-encrypted');
      if (encryptedKeys) {
        const decryptedData = await SecureStorage.decryptData(encryptedKeys);
        userApiKeys = JSON.parse(decryptedData);
      } else {
        // Fallback to unencrypted keys
        const savedKeys = localStorage.getItem('user-api-keys');
        if (savedKeys) {
          userApiKeys = JSON.parse(savedKeys);
        }
      }
    } catch (error) {
      console.error('Error loading API keys:', error);
      // Fallback to unencrypted keys
      const savedKeys = localStorage.getItem('user-api-keys');
      if (savedKeys) {
        try {
          userApiKeys = JSON.parse(savedKeys);
        } catch (fallbackError) {
          console.error('Error parsing fallback API keys:', fallbackError);
        }
      }
    }

    // Check if user has any API keys configured
    const hasApiKeys = userApiKeys && (userApiKeys.openai || userApiKeys.claude || userApiKeys.google);
    
    if (!hasApiKeys) {
      toast({
        title: "API Keys Required",
        description: "Please configure your API keys in the settings to generate diagrams",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-codebase', {
        body: { 
          sessionId,
          userApiKeys 
        }
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
        title: "Generation Failed",
        description: "Failed to generate diagram. Please check your API keys and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadMermaidCode = () => {
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
      title: "Code Downloaded",
      description: "Mermaid diagram code saved to your downloads",
    });
  };

  const exportAsImage = async () => {
    if (!mermaidRef.current || !mermaidCode) return;

    setIsExporting(true);
    try {
      const svg = mermaidRef.current.querySelector('svg');
      if (!svg) {
        throw new Error('No SVG element found');
      }

      // Create a temporary container with white background for better image quality
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.top = '-9999px';
      tempContainer.style.backgroundColor = '#ffffff';
      tempContainer.style.padding = '20px';
      tempContainer.appendChild(svg.cloneNode(true));
      document.body.appendChild(tempContainer);

      // Use html2canvas to convert to image
      const canvas = await html2canvas(tempContainer, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true
      });

      // Clean up temporary container
      document.body.removeChild(tempContainer);

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `codebase-diagram-${Date.now()}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);

          toast({
            title: "Image Exported",
            description: "Diagram saved as PNG image",
          });
        }
      }, 'image/png');
    } catch (error) {
      console.error('Error exporting image:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export diagram as image",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Visual Architecture Playground
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
                  <>
                    <Button
                      variant="outline"
                      onClick={exportAsImage}
                      disabled={isExporting}
                      className="flex items-center gap-2"
                    >
                      {isExporting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Image className="w-4 h-4" />
                      )}
                      {isExporting ? 'Exporting...' : 'Export PNG'}
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={downloadMermaidCode}
                      className="flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download Code
                    </Button>
                  </>
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
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={exportAsImage}
                  disabled={isExporting}
                  className="flex items-center gap-2"
                >
                  {isExporting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Image className="w-4 h-4" />
                  )}
                  Export PNG
                </Button>
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
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-6 bg-white dark:bg-background">
              <div className="w-full overflow-auto">
                <div 
                  ref={mermaidRef}
                  className="mermaid-container min-h-[400px] flex items-center justify-center"
                  style={{ minWidth: '100%' }}
                />
              </div>
            </div>
            
            {/* Code Display */}
            <div className="mt-4">
              <details>
                <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                  View Mermaid Code
                </summary>
                <div className="mt-2 p-3 bg-muted rounded text-xs overflow-auto">
                  <pre><code>{mermaidCode}</code></pre>
                </div>
              </details>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}