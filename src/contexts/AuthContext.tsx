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

  const fetchUserRole = async (userId: string) => {
    try {
      console.log('Fetching user role for:', userId);
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      console.log('Role query result:', { data, error });

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

  const assignAdminRoleToGitHubUser = async (userId: string) => {
    try {
      console.log('=== STARTING ADMIN ROLE ASSIGNMENT ===');
      console.log('User ID:', userId);
      
      // First, check if user already has admin role
      const { data: existingRoles, error: fetchError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      console.log('Existing roles:', existingRoles);

      if (fetchError) {
        console.error('Error fetching existing roles:', fetchError);
      }

      // Check if user already has admin role
      const hasAdminRole = existingRoles?.some(role => role.role === 'admin');
      if (hasAdminRole) {
        console.log('User already has admin role');
        return true;
      }

      // Delete all existing roles for this user first
      console.log('Deleting existing roles...');
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (deleteError) {
        console.error('Error deleting existing roles:', deleteError);
      } else {
        console.log('Successfully deleted existing roles');
      }

      // Insert admin role
      console.log('Inserting admin role...');
      const { data: insertData, error: insertError } = await supabase
        .from('user_roles')
        .insert([{ user_id: userId, role: 'admin' }])
        .select();
      
      console.log('Insert result:', { insertData, insertError });

      if (insertError) {
        console.error('Error inserting admin role:', insertError);
        throw insertError;
      }
      
      console.log('=== ADMIN ROLE ASSIGNED SUCCESSFULLY ===');
      return true;
    } catch (error) {
      console.error('=== ADMIN ROLE ASSIGNMENT FAILED ===');
      console.error('Error:', error);
      throw error;
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
    console.log('Setting up auth state listener...');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('=== AUTH STATE CHANGE ===');
        console.log('Event:', event);
        console.log('Session user email:', session?.user?.email);
        console.log('Provider:', session?.user?.app_metadata?.provider);
        console.log('User ID:', session?.user?.id);
        
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Handle GitHub signin specifically
          if (session.user.app_metadata.provider === 'github') {
            console.log('=== GITHUB USER DETECTED ===');
            
            try {
              console.log('Assigning admin role to GitHub user...');
              await assignAdminRoleToGitHubUser(session.user.id);
              
              // Force set admin role immediately
              setUserRole('admin');
              console.log('Admin role set in state');
              
              if (event === 'SIGNED_IN') {
                toast({
                  title: "Welcome Admin",
                  description: "You have been signed in with admin privileges.",
                  variant: "default"
                });
              }
            } catch (error) {
              console.error('Failed to assign admin role to GitHub user:', error);
              toast({
                title: "Role Assignment Error",
                description: "Could not assign admin role. Please contact support.",
                variant: "destructive"
              });
              
              // Fallback to fetching existing role
              const role = await fetchUserRole(session.user.id);
              setUserRole(role);
            }
          } else {
            // For non-GitHub users, fetch normal role
            console.log('=== NON-GITHUB USER ===');
            const role = await fetchUserRole(session.user.id);
            setUserRole(role);
          }
        } else {
          console.log('=== NO USER SESSION ===');
          setUserRole(null);
        }
        setLoading(false);
      }
    );

    // Get initial session
    console.log('Checking for initial session...');
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('=== INITIAL SESSION CHECK ===');
      console.log('Initial session user:', session?.user?.email);
      console.log('Initial session provider:', session?.user?.app_metadata?.provider);
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        if (session.user.app_metadata.provider === 'github') {
          console.log('Initial session: GitHub user detected');
          assignAdminRoleToGitHubUser(session.user.id).then(() => {
            setUserRole('admin');
            setLoading(false);
          }).catch((error) => {
            console.error('Error in initial GitHub role assignment:', error);
            fetchUserRole(session.user.id).then((role) => {
              setUserRole(role);
              setLoading(false);
            });
          });
        } else {
          fetchUserRole(session.user.id).then((role) => {
            setUserRole(role);
            setLoading(false);
          });
        }
      } else {
        setLoading(false);
      }
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
