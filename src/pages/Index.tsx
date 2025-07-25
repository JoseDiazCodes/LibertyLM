import React, { useState, useCallback } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { FileUpload } from '@/components/FileUpload';
import { ChatWindow } from '@/components/ChatWindow';
import { SampleQuestions } from '@/components/SampleQuestions';
import { SessionStatus } from '@/components/SessionStatus';
import { useToast } from '@/hooks/use-toast';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'success' | 'error';
  progress?: number;
}

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

const Index = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => Math.random().toString(36).substr(2, 16));
  const { toast } = useToast();

  const handleFilesUploaded = useCallback((newFiles: UploadedFile[]) => {
    setUploadedFiles(prev => [...prev, ...newFiles]);
    toast({
      title: "Files uploaded",
      description: `${newFiles.length} file(s) uploaded successfully`,
    });
  }, [toast]);

  const handleRemoveFile = useCallback((fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
    toast({
      title: "File removed",
      description: "File has been removed from the session",
    });
  }, [toast]);

  const handleSendMessage = useCallback(async (content: string) => {
    const userMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      content,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const aiResponse: Message = {
        id: Math.random().toString(36).substr(2, 9),
        content: generateMockResponse(content, uploadedFiles),
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get response from AI assistant",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [uploadedFiles, toast]);

  const handleQuestionSelect = useCallback((question: string) => {
    handleSendMessage(question);
  }, [handleSendMessage]);

  const handleClearSession = useCallback(() => {
    setUploadedFiles([]);
    setMessages([]);
    toast({
      title: "Session cleared",
      description: "All files and messages have been cleared",
    });
  }, [toast]);

  const totalSize = uploadedFiles.reduce((sum, file) => sum + file.size, 0);
  const isProcessing = uploadedFiles.some(file => file.status === 'uploading');

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto p-4 grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-7xl">
        {/* Left Sidebar - File Upload & Session */}
        <div className="lg:col-span-1 space-y-6">
          <SessionStatus
            sessionId={sessionId}
            fileCount={uploadedFiles.length}
            totalSize={totalSize}
            onClearSession={handleClearSession}
            isProcessing={isProcessing}
          />
          
          <FileUpload
            onFilesUploaded={handleFilesUploaded}
            uploadedFiles={uploadedFiles}
            onRemoveFile={handleRemoveFile}
          />
        </div>

        {/* Center - Chat Window */}
        <div className="lg:col-span-2 min-h-[600px]">
          <div className="h-full rounded-lg border bg-card shadow-card">
            <ChatWindow
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              className="h-full"
            />
          </div>
        </div>

        {/* Right Sidebar - Sample Questions */}
        <div className="lg:col-span-1">
          <SampleQuestions onQuestionSelect={handleQuestionSelect} />
        </div>
      </main>

      <Footer />
    </div>
  );
};

// Mock response generator
function generateMockResponse(question: string, files: UploadedFile[]): string {
  const hasFiles = files.length > 0;
  const fileTypes = files.map(f => f.name.split('.').pop()).filter(Boolean);
  
  if (!hasFiles) {
    return "I'd be happy to help you understand your codebase! However, I don't see any files uploaded yet. Please upload your code files first so I can provide specific insights about your project's architecture, dependencies, and structure.";
  }

  // Generate contextual responses based on question keywords
  const lowerQuestion = question.toLowerCase();
  
  if (lowerQuestion.includes('authentication') || lowerQuestion.includes('auth')) {
    return `Based on your uploaded files (${files.length} files), I can see you have ${fileTypes.join(', ')} files. For authentication, I'd typically look for:\n\n• Authentication middleware or decorators\n• User models and session management\n• JWT token handling or OAuth configuration\n• Login/logout routes and controllers\n\nLet me analyze your specific files to provide more detailed insights about your authentication flow.`;
  }
  
  if (lowerQuestion.includes('architecture') || lowerQuestion.includes('diagram')) {
    return `Looking at your uploaded files, I can help explain the architecture! From the ${files.length} files you've uploaded, I can identify:\n\n• **Component Structure**: How your modules are organized\n• **Data Flow**: How information moves through your system\n• **Dependencies**: Key libraries and their relationships\n• **Design Patterns**: Architectural patterns being used\n\nWould you like me to focus on any specific aspect of the architecture?`;
  }
  
  if (lowerQuestion.includes('run') || lowerQuestion.includes('setup') || lowerQuestion.includes('local')) {
    return `To run this project locally, I'll analyze your configuration files. Based on your uploaded files, here's what I typically look for:\n\n• **Package files**: package.json, requirements.txt, pom.xml\n• **Environment setup**: .env files, config files\n• **Build scripts**: Dockerfile, scripts, build configurations\n• **Documentation**: README files with setup instructions\n\nLet me examine your specific files to provide exact setup instructions for your project.`;
  }
  
  if (lowerQuestion.includes('dependencies') || lowerQuestion.includes('libraries')) {
    return `I'll analyze the dependencies in your project. From your ${files.length} uploaded files, I can identify:\n\n• **Core Dependencies**: Main libraries and frameworks\n• **Development Tools**: Testing, building, and development utilities\n• **Version Compatibility**: Potential conflicts or outdated packages\n• **Security Considerations**: Known vulnerabilities or recommendations\n\nLet me examine your package files to provide a detailed dependency analysis.`;
  }
  
  // Default response
  return `Great question! I can see you've uploaded ${files.length} files including ${fileTypes.slice(0, 3).join(', ')}${fileTypes.length > 3 ? ' and more' : ''}.\n\nI'm analyzing your codebase to provide specific insights. Based on the files you've uploaded, I can help you understand:\n\n• Code structure and organization\n• Key components and their relationships\n• Configuration and setup requirements\n• Best practices and potential improvements\n\nFeel free to ask more specific questions about any particular file or aspect of your project!`;
}

export default Index;