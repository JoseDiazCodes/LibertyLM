import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';

interface SecurityCheck {
  name: string;
  description: string;
  status: 'pass' | 'fail' | 'warning';
  recommendation?: string;
}

export const ProductionSecurityChecker: React.FC = () => {
  const [securityChecks, setSecurityChecks] = useState<SecurityCheck[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    performSecurityChecks();
  }, []);

  const performSecurityChecks = async () => {
    setIsChecking(true);
    
    const checks: SecurityCheck[] = [];

    // HTTPS Check
    checks.push({
      name: 'HTTPS Protocol',
      description: 'Application served over secure HTTPS connection',
      status: location.protocol === 'https:' || location.hostname === 'localhost' ? 'pass' : 'fail',
      recommendation: location.protocol !== 'https:' && location.hostname !== 'localhost' 
        ? 'Enable HTTPS on your web server and redirect all HTTP traffic to HTTPS'
        : undefined
    });

    // Content Security Policy Check
    const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    checks.push({
      name: 'Content Security Policy',
      description: 'CSP headers configured to prevent XSS attacks',
      status: cspMeta ? 'pass' : 'warning',
      recommendation: !cspMeta ? 'Add Content-Security-Policy headers to prevent XSS attacks' : undefined
    });

    // Security Headers Check
    try {
      // We can't directly check response headers from client-side, but we can check meta tags
      const xFrameOptions = document.querySelector('meta[http-equiv="X-Frame-Options"]');
      const xContentTypeOptions = document.querySelector('meta[http-equiv="X-Content-Type-Options"]');
      
      checks.push({
        name: 'Security Headers',
        description: 'X-Frame-Options and X-Content-Type-Options headers',
        status: 'warning',
        recommendation: 'Configure X-Frame-Options: DENY and X-Content-Type-Options: nosniff headers on your web server'
      });
    } catch (error) {
      checks.push({
        name: 'Security Headers',
        description: 'X-Frame-Options and X-Content-Type-Options headers',
        status: 'warning',
        recommendation: 'Configure security headers on your web server'
      });
    }

    // Local Storage Security Check
    const hasApiKeys = localStorage.getItem('encrypted_api_keys') || localStorage.getItem('api_keys');
    checks.push({
      name: 'API Key Storage',
      description: 'API keys stored securely with encryption',
      status: hasApiKeys ? (localStorage.getItem('encrypted_api_keys') ? 'pass' : 'warning') : 'pass',
      recommendation: hasApiKeys && !localStorage.getItem('encrypted_api_keys') 
        ? 'API keys should be encrypted. Consider re-saving your API keys to enable encryption.'
        : undefined
    });

    // Session Security Check
    const hasSecurityEvents = localStorage.getItem('security_events');
    checks.push({
      name: 'Security Monitoring',
      description: 'Security event logging and monitoring active',
      status: hasSecurityEvents ? 'pass' : 'warning',
      recommendation: !hasSecurityEvents ? 'Security monitoring will activate once security events occur' : undefined
    });

    // API Key Age Check
    const apiKeyData = localStorage.getItem('api_key_created');
    let oldKeysFound = false;
    if (apiKeyData) {
      try {
        const keyData = JSON.parse(apiKeyData);
        const now = Date.now();
        Object.entries(keyData).forEach(([key, timestamp]) => {
          const ageInDays = (now - (timestamp as number)) / (1000 * 60 * 60 * 24);
          if (ageInDays > 90) {
            oldKeysFound = true;
          }
        });
      } catch (error) {
        console.error('Error checking API key age:', error);
      }
    }

    checks.push({
      name: 'API Key Rotation',
      description: 'API keys are regularly rotated (< 90 days old)',
      status: oldKeysFound ? 'warning' : 'pass',
      recommendation: oldKeysFound ? 'Some API keys are older than 90 days and should be rotated' : undefined
    });

    // Anonymous Authentication Check
    checks.push({
      name: 'Anonymous Authentication',
      description: 'Anonymous authentication is enabled for guest access',
      status: 'warning',
      recommendation: 'Anonymous authentication is enabled for guest access. Ensure this is intentional for your use case.'
    });

    setSecurityChecks(checks);
    setIsChecking(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'default';
      case 'fail':
        return 'destructive';
      case 'warning':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const passCount = securityChecks.filter(check => check.status === 'pass').length;
  const failCount = securityChecks.filter(check => check.status === 'fail').length;
  const warningCount = securityChecks.filter(check => check.status === 'warning').length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Production Security Checklist
            </CardTitle>
            <CardDescription>
              Security configuration recommendations for production deployment
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={performSecurityChecks}
            disabled={isChecking}
          >
            {isChecking ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {isChecking ? 'Checking...' : 'Recheck'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Summary */}
          <div className="flex gap-4 p-4 bg-muted rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{passCount}</div>
              <div className="text-sm text-muted-foreground">Passing</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">{warningCount}</div>
              <div className="text-sm text-muted-foreground">Warnings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive">{failCount}</div>
              <div className="text-sm text-muted-foreground">Failed</div>
            </div>
          </div>

          {/* Security Checks */}
          <div className="space-y-3">
            {securityChecks.map((check, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start gap-3">
                  {getStatusIcon(check.status)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{check.name}</span>
                      <Badge variant={getStatusColor(check.status) as any}>
                        {check.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {check.description}
                    </p>
                    {check.recommendation && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                          <strong>Recommendation:</strong> {check.recommendation}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};