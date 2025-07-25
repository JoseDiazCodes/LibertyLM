import React, { useState } from 'react';
import { ChevronDown, ChevronRight, HelpCircle, MessageSquare } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SampleQuestion {
  id: string;
  question: string;
  category: string;
}

interface SampleQuestionsProps {
  onQuestionSelect: (question: string) => void;
  className?: string;
}

const SAMPLE_QUESTIONS: SampleQuestion[] = [
  {
    id: '1',
    category: 'Architecture',
    question: 'How does authentication work in this system?'
  },
  {
    id: '2',
    category: 'Architecture',
    question: 'What does this architecture diagram show?'
  },
  {
    id: '3',
    category: 'Architecture',
    question: 'Explain the main components and their relationships'
  },
  {
    id: '4',
    category: 'Setup',
    question: 'How do I run this project locally?'
  },
  {
    id: '5',
    category: 'Setup',
    question: 'What are the key dependencies?'
  },
  {
    id: '6',
    category: 'Setup',
    question: 'What environment variables need to be configured?'
  },
  {
    id: '7',
    category: 'Code Structure',
    question: 'What is the folder structure and organization?'
  },
  {
    id: '8',
    category: 'Code Structure',
    question: 'How are the different modules connected?'
  },
  {
    id: '9',
    category: 'Code Structure',
    question: 'What design patterns are used in this codebase?'
  },
  {
    id: '10',
    category: 'APIs & Data',
    question: 'What APIs does this application expose?'
  },
  {
    id: '11',
    category: 'APIs & Data',
    question: 'How is data stored and managed?'
  },
  {
    id: '12',
    category: 'APIs & Data',
    question: 'What external services does this integrate with?'
  }
];

export function SampleQuestions({ onQuestionSelect, className }: SampleQuestionsProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['Architecture', 'Setup'])
  );

  const categories = Array.from(new Set(SAMPLE_QUESTIONS.map(q => q.category)));

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const handleQuestionClick = (question: string) => {
    onQuestionSelect(question);
  };

  return (
    <Card className={cn("h-full flex flex-col", className)}>
      {/* Header */}
      <div className="p-3 sm:p-4 border-b">
        <Button
          variant="ghost"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full justify-between p-0 h-auto hover:bg-transparent"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
            <span className="font-medium text-sm sm:text-base">Sample Questions</span>
          </div>
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 flex-shrink-0" />
          ) : (
            <ChevronDown className="w-4 h-4 flex-shrink-0" />
          )}
        </Button>
        {!isCollapsed && (
          <p className="text-xs sm:text-sm text-muted-foreground mt-2">
            Click any question to get started
          </p>
        )}
      </div>

      {/* Questions List */}
      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-3">
          {categories.map((category) => {
            const categoryQuestions = SAMPLE_QUESTIONS.filter(q => q.category === category);
            const isExpanded = expandedCategories.has(category);

            return (
              <div key={category} className="space-y-2">
                <Button
                  variant="ghost"
                  onClick={() => toggleCategory(category)}
                  className="w-full justify-between p-2 sm:p-3 h-auto hover:bg-accent rounded-md"
                >
                  <span className="font-medium text-xs sm:text-sm">{category}</span>
                  {isExpanded ? (
                    <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  )}
                </Button>

                {isExpanded && (
                  <div className="space-y-1 ml-1 sm:ml-2">
                    {categoryQuestions.map((item) => (
                      <Button
                        key={item.id}
                        variant="ghost"
                        onClick={() => handleQuestionClick(item.question)}
                        className="w-full justify-start p-2 sm:p-3 h-auto text-left hover:bg-accent hover:shadow-sm transition-all duration-200 group rounded-md"
                      >
                        <MessageSquare className="w-3 h-3 mr-2 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                        <span className="text-xs sm:text-sm leading-relaxed text-left break-words">
                          {item.question}
                        </span>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-3 sm:p-4 border-t bg-accent/30">
          <div className="text-xs text-muted-foreground text-center space-y-1">
            <p className="break-words">
              <span className="hidden sm:inline">💡 </span>
              <strong>Tip:</strong> Upload your files first for better context
            </p>
            <p className="break-words hidden sm:block">
              Ask about specific files, functions, or architectural patterns
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}