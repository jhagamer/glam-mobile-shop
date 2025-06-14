
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

  const checkAdminSlotAvailable = async () => {
    try {
      const { data, error } = await supabase.rpc('is_admin_slot_available');
      if (error) {
        console.error('Error checking admin slot:', error);
        return false;
      }
      return data;
    } catch (error) {
      console.error('Error in checkAdminSlotAvailable:', error);
      return false;
    }
  };

  const fetchUserRole = async (userId: string) => {
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

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // For GitHub signins, check if admin slot is available
          if (event === 'SIGNED_IN' && session.user.app_metadata.provider === 'github') {
            const isAdminSlotAvailable = await checkAdminSlotAvailable();
            
            if (!isAdminSlotAvailable) {
              // Admin slot is taken, sign out the user
              await supabase.auth.signOut();
              toast({
                title: "Access Denied",
                description: "GitHub login is restricted to admin users only. The admin slot is currently occupied.",
                variant: "destructive"
              });
              return;
            }
            
            // Check if user already has admin role
            const currentRole = await fetchUserRole(session.user.id);
            if (currentRole !== 'admin') {
              // Assign admin role to GitHub user
              try {
                const { error } = await supabase
                  .from('user_roles')
                  .insert([{ user_id: session.user.id, role: 'admin' }]);
                
                if (error) {
                  console.error('Error assigning admin role:', error);
                  await supabase.auth.signOut();
                  toast({
                    title: "Error",
                    description: "Failed to assign admin privileges. Please contact support.",
                    variant: "destructive"
                  });
                  return;
                }
              } catch (insertError) {
                console.error('Database error assigning admin role:', insertError);
                await supabase.auth.signOut();
                toast({
                  title: "Error",
                  description: "Database error occurred. Please try again later.",
                  variant: "destructive"
                });
                return;
              }
            }
          }
          
          // Fetch user role
          const role = await fetchUserRole(session.user.id);
          setUserRole(role);
        } else {
          setUserRole(null);
        }
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserRole(session.user.id).then((role) => {
          setUserRole(role);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
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
      
      // Check if admin slot is available before attempting login
      const isAdminSlotAvailable = await checkAdminSlotAvailable();
      
      if (!isAdminSlotAvailable) {
        toast({
          title: "Access Denied",
          description: "GitHub login is restricted to admin users only. The admin slot is currently occupied.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      const redirectUrl = `${window.location.origin}/`;
      
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
      }
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive"
      });
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
