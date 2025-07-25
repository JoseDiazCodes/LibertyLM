import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatWindowProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  className?: string;
}

export function ChatWindow({ messages, onSendMessage, isLoading, className }: ChatWindowProps) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center">
                <Bot className="w-8 h-8 text-accent-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Welcome to Code Onboarding Assistant</h3>
                <p className="text-muted-foreground max-w-md">
                  Upload your codebase files and I'll help you understand the architecture, 
                  dependencies, and how everything works together.
                </p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3 animate-fade-in",
                    message.role === 'user' ? "justify-end" : "justify-start"
                  )}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                  
                  <Card className={cn(
                    "max-w-[80%] p-4 transition-all duration-200",
                    message.role === 'user' 
                      ? "bg-primary text-primary-foreground shadow-card" 
                      : "bg-card border shadow-card"
                  )}>
                    <div className="prose prose-sm max-w-none">
                      <p className={cn(
                        "whitespace-pre-wrap leading-relaxed",
                        message.role === 'user' ? "text-primary-foreground" : "text-foreground"
                      )}>
                        {message.content}
                      </p>
                    </div>
                    <div className={cn(
                      "text-xs mt-2 opacity-70",
                      message.role === 'user' ? "text-primary-foreground" : "text-muted-foreground"
                    )}>
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </Card>

                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-accent-foreground" />
                    </div>
                  )}
                </div>
              ))}

              {/* Typing Indicator */}
              {isLoading && (
                <div className="flex gap-3 justify-start animate-fade-in">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <Card className="bg-card border shadow-card p-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Thinking...</span>
                    </div>
                  </Card>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t bg-background p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your codebase..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            disabled={!inputValue.trim() || isLoading}
            className="px-6"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
        <div className="text-xs text-muted-foreground mt-2 text-center">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  );
}