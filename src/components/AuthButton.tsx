import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthButtonProps {
  user: any;
}

export const AuthButton: React.FC<AuthButtonProps> = ({ user }) => {
  const { toast } = useToast();

  const signInAsGuest = async () => {
    try {
      const { error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
      
      toast({
        title: "Signed in successfully",
        description: "You can now upload files and start chatting",
      });
    } catch (error) {
      console.error('Error signing in:', error);
      toast({
        title: "Error",
        description: "Failed to sign in. Please try again.",
        variant: "destructive",
      });
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Signed out",
        description: "You have been signed out successfully",
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          Signed in as guest
        </span>
        <Button variant="outline" size="sm" onClick={signOut}>
          Sign Out
        </Button>
      </div>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Welcome to Code Onboarding Assistant</CardTitle>
        <CardDescription>
          Sign in to start uploading files and asking questions about your codebase
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={signInAsGuest} className="w-full">
          Continue as Guest
        </Button>
      </CardContent>
    </Card>
  );
};