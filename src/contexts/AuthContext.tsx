
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: 'admin' | 'consumer' | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshUserRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'consumer' | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const ensureUserProfile = async (userId: string, userEmail: string) => {
    try {
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();

      if (!existingProfile) {
        console.log('Creating profile for new user:', userEmail);
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{ id: userId, email: userEmail }]);

        if (profileError) {
          console.error('Error creating profile:', profileError);
        }
      }
    } catch (error) {
      console.error('Error in ensureUserProfile:', error);
    }
  };

  const fetchUserRole = async (userId: string): Promise<'admin' | 'consumer'> => {
    try {
      console.log('Fetching user role for:', userId);
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching user role:', error);
        return 'consumer';
      }

      if (!data || data.length === 0) {
        console.log('No roles found for user, defaulting to consumer');
        return 'consumer';
      }

      const hasAdminRole = data.some(roleData => roleData.role === 'admin');
      const finalRole = hasAdminRole ? 'admin' : 'consumer';
      console.log('User role determined:', finalRole);
      
      return finalRole;
    } catch (error) {
      console.error('Error in fetchUserRole:', error);
      return 'consumer';
    }
  };

  const refreshUserRole = async () => {
    if (user) {
      console.log('Refreshing user role for:', user.email);
      const role = await fetchUserRole(user.id);
      setUserRole(role);
      console.log('Role refreshed to:', role);
    }
  };

  const handleAuthStateChange = async (event: string, session: Session | null) => {
    console.log('=== AUTH STATE CHANGE ===');
    console.log('Event:', event);
    console.log('Session user email:', session?.user?.email);
    
    // Prevent infinite loops by checking if we're already processing
    if (!initialized && event !== 'INITIAL_SESSION') {
      console.log('Not initialized yet, skipping non-initial event');
      return;
    }
    
    setSession(session);
    setUser(session?.user ?? null);

    if (session?.user) {
      // Use setTimeout to defer the role fetching to prevent blocking
      setTimeout(async () => {
        try {
          // Ensure user profile exists first
          await ensureUserProfile(session.user.id, session.user.email || '');
          
          // Fetch user role (no automatic admin assignment)
          const role = await fetchUserRole(session.user.id);
          setUserRole(role);
          
          if (event === 'SIGNED_IN') {
            toast({
              title: "Welcome",
              description: `You have been signed in as ${role}.`,
              variant: "default"
            });
          }
        } catch (error) {
          console.error('Error in role fetching:', error);
          setUserRole('consumer');
        }
      }, 0);
    } else {
      console.log('=== NO USER SESSION ===');
      setUserRole(null);
    }
    
    // Set loading to false and mark as initialized
    setLoading(false);
    setInitialized(true);
  };

  useEffect(() => {
    console.log('Setting up auth state listener...');
    
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    // Get initial session
    console.log('Checking for initial session...');
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('=== INITIAL SESSION CHECK ===');
      console.log('Initial session user:', session?.user?.email);
      
      handleAuthStateChange('INITIAL_SESSION', session);
    });

    return () => {
      console.log('Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl
        }
      });

      if (error) {
        console.error('Google sign in error:', error);
        toast({
          title: "Authentication Error",
          description: error.message,
          variant: "destructive"
        });
        setLoading(false);
      }
    } catch (error) {
      console.error('Error signing in:', error);
      toast({
        title: "Authentication Error",
        description: "Failed to sign in with Google",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  const signInWithGitHub = async () => {
    try {
      setLoading(true);
      console.log('Starting GitHub sign in...');
      
      const redirectUrl = `${window.location.origin}/`;
      console.log('Redirect URL:', redirectUrl);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: redirectUrl
        }
      });

      if (error) {
        console.error('GitHub sign in error:', error);
        toast({
          title: "Authentication Error",
          description: error.message,
          variant: "destructive"
        });
        setLoading(false);
      } else {
        console.log('GitHub OAuth initiated successfully');
      }
    } catch (error) {
      console.error('Error signing in with GitHub:', error);
      toast({
        title: "Authentication Error",
        description: "Failed to sign in with GitHub",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Signed out successfully"
        });
        // Reset state immediately
        setUser(null);
        setSession(null);
        setUserRole(null);
      }
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    userRole,
    loading,
    signInWithGoogle,
    signInWithGitHub,
    signOut,
    refreshUserRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
