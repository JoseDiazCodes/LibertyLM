import { useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { SessionMonitor, AuthFailureMonitor, SecurityAlerts, logSecurityEvent } from '@/lib/security';
import { supabase } from '@/integrations/supabase/client';

export const useSecurity = () => {
  const { toast } = useToast();

  // Session timeout warnings
  const handleSessionWarning = useCallback(() => {
    toast({
      title: "Session Expiring Soon",
      description: "Your session will expire in 5 minutes due to inactivity.",
      variant: "destructive",
    });
  }, [toast]);

  const handleSessionTimeout = useCallback(() => {
    toast({
      title: "Session Expired",
      description: "You have been logged out due to inactivity.",
      variant: "destructive",
    });
    
    // Sign out the user
    supabase.auth.signOut();
    logSecurityEvent('session_timeout', { reason: 'inactivity' }, 'warning');
  }, [toast]);

  // Authentication failure handling
  const handleAuthFailure = useCallback((email: string) => {
    AuthFailureMonitor.recordFailure(email);
    
    if (AuthFailureMonitor.isLockedOut(email)) {
      const remainingTime = AuthFailureMonitor.getRemainingLockoutTime(email);
      const minutes = Math.ceil(remainingTime / (1000 * 60));
      
      toast({
        title: "Account Temporarily Locked",
        description: `Too many failed attempts. Try again in ${minutes} minutes.`,
        variant: "destructive",
      });
      
      return true; // Locked out
    }
    
    return false; // Not locked out
  }, [toast]);

  const isAccountLocked = useCallback((email: string) => {
    return AuthFailureMonitor.isLockedOut(email);
  }, []);

  const clearAuthFailures = useCallback((email: string) => {
    AuthFailureMonitor.clearFailures(email);
  }, []);

  // Activity tracking
  const updateActivity = useCallback(() => {
    SessionMonitor.updateActivity();
  }, []);

  // Security monitoring
  useEffect(() => {
    // Start session monitoring
    const intervalId = SessionMonitor.startMonitoring(handleSessionWarning, handleSessionTimeout);
    
    // Set up activity listeners
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    const handleActivity = () => updateActivity();
    
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Periodic security checks
    const securityCheckInterval = setInterval(() => {
      SecurityAlerts.checkForSuspiciousActivity();
    }, 30000); // Check every 30 seconds

    // Cleanup
    return () => {
      if (intervalId) SessionMonitor.stopMonitoring(intervalId);
      clearInterval(securityCheckInterval);
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [handleSessionWarning, handleSessionTimeout, updateActivity]);

  return {
    handleAuthFailure,
    isAccountLocked,
    clearAuthFailures,
    updateActivity,
  };
};