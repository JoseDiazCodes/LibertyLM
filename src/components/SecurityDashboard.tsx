import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, Info, XCircle } from 'lucide-react';

interface SecurityEvent {
  timestamp: string;
  event: string;
  details: any;
  severity: 'info' | 'warning' | 'error';
}

interface SecurityDashboardProps {
  user: any;
}

export const SecurityDashboard: React.FC<SecurityDashboardProps> = ({ user }) => {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [securityWarnings, setSecurityWarnings] = useState<string[]>([]);

  useEffect(() => {
    loadSecurityEvents();
    checkSecurityConfiguration();
  }, []);

  const loadSecurityEvents = () => {
    try {
      const events = localStorage.getItem('security_events');
      if (events) {
        const parsedEvents = JSON.parse(events);
        // Get last 10 events
        setSecurityEvents(parsedEvents.slice(-10).reverse());
      }
    } catch (error) {
      console.error('Failed to load security events:', error);
    }
  };

  const checkSecurityConfiguration = () => {
    const warnings: string[] = [];

    // Check if running on HTTPS
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      warnings.push('Application should be served over HTTPS in production');
    }

    // Check CSP configuration
    const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (!cspMeta) {
      warnings.push('Content Security Policy not detected');
    }

    // Check for old API keys
    const apiKeyData = localStorage.getItem('api_key_created');
    if (apiKeyData) {
      try {
        const keyData = JSON.parse(apiKeyData);
        const now = Date.now();
        Object.entries(keyData).forEach(([key, timestamp]) => {
          const ageInDays = (now - (timestamp as number)) / (1000 * 60 * 60 * 24);
          if (ageInDays > 90) {
            warnings.push(`API key for ${key} is ${Math.floor(ageInDays)} days old and should be rotated`);
          }
        });
      } catch (error) {
        console.error('Error checking API key age:', error);
      }
    }

    setSecurityWarnings(warnings);
  };

  const clearSecurityEvents = () => {
    localStorage.removeItem('security_events');
    setSecurityEvents([]);
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      default:
        return <Info className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'destructive';
      case 'warning':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Security Warnings */}
      {securityWarnings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Security Recommendations
            </CardTitle>
            <CardDescription>
              Configuration recommendations for production deployment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {securityWarnings.map((warning, index) => (
                <Alert key={index}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{warning}</AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Events
          </CardTitle>
          <CardDescription>
            Recent security events and activities (last 10 events)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {securityEvents.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No security events recorded yet
              </p>
            ) : (
              <>
                <div className="space-y-3">
                  {securityEvents.map((event, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 border rounded-lg"
                    >
                      {getSeverityIcon(event.severity)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{event.event}</span>
                          <Badge variant={getSeverityColor(event.severity) as any}>
                            {event.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {formatTimestamp(event.timestamp)}
                        </p>
                        {event.details && (
                          <div className="text-xs bg-muted p-2 rounded">
                            <pre className="whitespace-pre-wrap">
                              {typeof event.details === 'string' 
                                ? event.details 
                                : JSON.stringify(event.details, null, 2)
                              }
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadSecurityEvents}
                  >
                    Refresh Events
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={clearSecurityEvents}
                  >
                    Clear Events
                  </Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};