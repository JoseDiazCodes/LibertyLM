import React from 'react';
import { Trash2, RefreshCw, Clock, Files } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SessionStatusProps {
  sessionId: string;
  fileCount: number;
  totalSize: number;
  onClearSession: () => void;
  isProcessing: boolean;
  className?: string;
}

export function SessionStatus({ 
  sessionId, 
  fileCount, 
  totalSize, 
  onClearSession, 
  isProcessing,
  className 
}: SessionStatusProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatSessionId = (id: string) => {
    return id.substring(0, 8).toUpperCase();
  };

  return (
    <Card className={cn("p-4 space-y-4", className)}>
      {/* Session Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse-soft" />
          <span className="font-medium text-sm">Active Session</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSession}
          disabled={isProcessing}
          className="h-8 px-2 hover:bg-destructive hover:text-destructive-foreground"
        >
          <Trash2 className="w-3 h-3 mr-1" />
          Clear
        </Button>
      </div>

      {/* Session Info */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">Session ID:</span>
          <code className="px-2 py-1 bg-muted rounded text-xs font-mono">
            {formatSessionId(sessionId)}
          </code>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Files className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">Files:</span>
          <span className="font-medium">{fileCount}</span>
          {totalSize > 0 && (
            <>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">{formatFileSize(totalSize)}</span>
            </>
          )}
        </div>

        {isProcessing && (
          <div className="flex items-center gap-2 text-sm text-primary">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Processing files...</span>
          </div>
        )}
      </div>

      {/* Status Indicators */}
      <div className="pt-3 border-t space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Upload Status</span>
          <span className={cn(
            "px-2 py-1 rounded font-medium",
            fileCount > 0 
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
          )}>
            {fileCount > 0 ? 'Ready' : 'Waiting for files'}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">AI Assistant</span>
          <span className="px-2 py-1 rounded font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            Online
          </span>
        </div>
      </div>

      {/* Quick Actions */}
      {fileCount === 0 && (
        <div className="pt-3 border-t">
          <p className="text-xs text-muted-foreground text-center">
            Upload code files to start asking questions about your project
          </p>
        </div>
      )}
    </Card>
  );
}