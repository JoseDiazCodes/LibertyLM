import React from 'react';
import { Brain, HelpCircle, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  return (
    <header className={cn("border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60", className)}>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center">
            <Brain className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Code Onboarding Assistant</h1>
            <p className="text-sm text-muted-foreground">Upload your codebase and ask questions</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="gap-2">
            <HelpCircle className="w-4 h-4" />
            Help
          </Button>
          <Button variant="ghost" size="sm" className="gap-2">
            <Github className="w-4 h-4" />
            GitHub
          </Button>
        </div>
      </div>
    </header>
  );
}