import React, { useState, useCallback, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { FileUpload } from '@/components/FileUpload';
import { ChatWindow } from '@/components/ChatWindow';
import { SampleQuestions } from '@/components/SampleQuestions';
import { SessionStatus } from '@/components/SessionStatus';
import { AuthButton } from '@/components/AuthButton';
import { ChatHistory } from '@/components/ChatHistory';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const { toast } = useToast();

  // Initialize session and auth
  useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        createNewSession();
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (session?.user && !sessionId) {
        createNewSession();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Create new chat session
  const createNewSession = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert([
          {
            user_id: user.id,
            title: `Session ${new Date().toLocaleDateString()}`
          }
        ])
        .select()
        .single();

      if (error) throw error;
      setSessionId(data.id);
    } catch (error) {
      console.error('Error creating session:', error);
      toast({
        title: "Error",
        description: "Failed to create chat session",
        variant: "destructive",
      });
    }
  };

  const handleFilesUploaded = useCallback(async (newFiles: UploadedFile[]) => {
    if (!user || !sessionId) return;

    try {
      // Store file metadata in database
      const fileRecords = newFiles.map(file => ({
        session_id: sessionId,
        user_id: user.id,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        storage_path: `${user.id}/${file.id}`,
        status: file.status
      }));

      const { error } = await supabase
        .from('uploaded_files')
        .insert(fileRecords);

      if (error) throw error;

      setUploadedFiles(prev => [...prev, ...newFiles]);
      toast({
        title: "Files uploaded",
        description: `${newFiles.length} file(s) uploaded successfully`,
      });
    } catch (error) {
      console.error('Error saving files:', error);
      toast({
        title: "Error",
        description: "Failed to save file metadata",
        variant: "destructive",
      });
    }
  }, [user, sessionId, toast]);

  const handleRemoveFile = useCallback(async (fileId: string) => {
    if (!user) return;

    try {
      // Remove from database
      const { error } = await supabase
        .from('uploaded_files')
        .delete()
        .eq('id', fileId)
        .eq('user_id', user.id);

      if (error) throw error;

      setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
      toast({
        title: "File removed",
        description: "File has been removed from the session",
      });
    } catch (error) {
      console.error('Error removing file:', error);
      toast({
        title: "Error",
        description: "Failed to remove file",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  const handleSendMessage = useCallback(async (content: string) => {
    if (!user || !sessionId) return;

    const userMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      content,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Save user message to database
      await supabase
        .from('chat_messages')
        .insert([
          {
            session_id: sessionId,
            user_id: user.id,
            content,
            role: 'user'
          }
        ]);

      // Simulate AI response (your team will replace this with real LLM integration)
      await new Promise(resolve => setTimeout(resolve, 1500));

      const aiResponseContent = generateMockResponse(content, uploadedFiles);
      const aiResponse: Message = {
        id: Math.random().toString(36).substr(2, 9),
        content: aiResponseContent,
        role: 'assistant',
        timestamp: new Date()
      };

      // Save AI response to database
      await supabase
        .from('chat_messages')
        .insert([
          {
            session_id: sessionId,
            user_id: user.id,
            content: aiResponseContent,
            role: 'assistant'
          }
        ]);

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, sessionId, uploadedFiles, toast]);

  const handleQuestionSelect = useCallback((question: string) => {
    handleSendMessage(question);
  }, [handleSendMessage]);

  const handleSessionSelect = useCallback(async (selectedSessionId: string) => {
    setSessionId(selectedSessionId);
    setMessages([]);
    setUploadedFiles([]);
    
    try {
      // Load messages for the selected session
      const { data: messagesData, error: messagesError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', selectedSessionId)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      const loadedMessages: Message[] = (messagesData || []).map(msg => ({
        id: msg.id,
        content: msg.content,
        role: msg.role as 'user' | 'assistant',
        timestamp: new Date(msg.created_at)
      }));

      setMessages(loadedMessages);

      // Load files for the selected session
      const { data: filesData, error: filesError } = await supabase
        .from('uploaded_files')
        .select('*')
        .eq('session_id', selectedSessionId);

      if (filesError) throw filesError;

      const loadedFiles: UploadedFile[] = (filesData || []).map(file => ({
        id: file.id,
        name: file.file_name,
        size: file.file_size,
        type: file.file_type,
        status: file.status as 'uploading' | 'success' | 'error'
      }));

      setUploadedFiles(loadedFiles);
    } catch (error) {
      console.error('Error loading session:', error);
      toast({
        title: "Error",
        description: "Failed to load session data",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleNewSession = useCallback(async () => {
    setMessages([]);
    setUploadedFiles([]);
    await createNewSession();
  }, []);

  const handleClearSession = useCallback(async () => {
    if (!user || !sessionId) return;

    try {
      // Delete session (will cascade delete files and messages)
      await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', user.id);

      // Create new session
      setUploadedFiles([]);
      setMessages([]);
      await createNewSession();
      
      toast({
        title: "Session cleared",
        description: "All files and messages have been cleared",
      });
    } catch (error) {
      console.error('Error clearing session:', error);
      toast({
        title: "Error",
        description: "Failed to clear session",
        variant: "destructive",
      });
    }
  }, [user, sessionId, toast]);

  const totalSize = uploadedFiles.reduce((sum, file) => sum + file.size, 0);
  const isProcessing = uploadedFiles.some(file => file.status === 'uploading');

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto p-4 flex gap-6 max-w-7xl">
        {!user && (
          <div className="flex-1 flex justify-center">
            <div className="max-w-md w-full">
              <AuthButton user={user} />
            </div>
          </div>
        )}
        
        {user && (
          <>
            {/* Chat History Sidebar */}
            <div className="w-64 flex-shrink-0">
              <ChatHistory
                currentSessionId={sessionId}
                onSessionSelect={handleSessionSelect}
                onNewSession={handleNewSession}
                className="h-[calc(100vh-12rem)]"
              />
            </div>

            {/* Main Content */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6">
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
            </div>
          </>
        )}
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