import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_USERS, supabase } from '../lib/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('fast_parking_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved user state', e);
      }
    }
    return INITIAL_USERS[0]; 
  });

  const [session, setSession] = useState(null);
  const [usersList, setUsersList] = useState(INITIAL_USERS);
  const [loading, setLoading] = useState(true);

  // Initialize Supabase Auth session listener
  useEffect(() => {
    // Fetch initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        syncUserProfile(session.user);
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        await syncUserProfile(session.user);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const syncUserProfile = async (authUser) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profile) {
        const fullUserData = {
          id: profile.id,
          name: profile.full_name || authUser.user_metadata?.full_name || authUser.email.split('@')[0],
          email: authUser.email,
          role: profile.role || 'user',
          phone: profile.phone,
          status: 'Active'
        };
        setUser(fullUserData);
      } else {
        const newUserData = {
          id: authUser.id,
          name: authUser.user_metadata?.full_name || authUser.email.split('@')[0],
          email: authUser.email,
          role: authUser.user_metadata?.role || 'user',
          status: 'Active'
        };
        setUser(newUserData);
      }
    } catch (e) {
      console.warn('Sync profile fallback', e);
    }
  };

  useEffect(() => {
    if (user) {
      localStorage.setItem('fast_parking_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('fast_parking_user');
    }
  }, [user]);

  // Supabase Login
  const login = async (email, password, targetRole = null) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Fallback for demo testing when mock credentials used
        let foundUser = usersList.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (!foundUser || targetRole) {
          foundUser = {
            id: 'u-' + Date.now(),
            name: email.split('@')[0].toUpperCase(),
            email: email,
            role: targetRole || 'user',
            status: 'Active'
          };
          setUsersList(prev => [...prev, foundUser]);
        }
        if (targetRole && foundUser.role !== targetRole) {
          foundUser = { ...foundUser, role: targetRole };
        }
        setUser(foundUser);
        return { success: true, user: foundUser };
      }

      if (data?.user) {
        await syncUserProfile(data.user);
      }
      return { success: true, user };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Supabase Register
  const register = async (name, email, password, role = 'user', vehicle = '') => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            role: role,
            vehicle: vehicle
          }
        }
      });

      const newUser = {
        id: data?.user?.id || 'u-' + Date.now(),
        name,
        email,
        role,
        vehicle,
        status: 'Active',
        createdAt: new Date().toISOString()
      };

      setUsersList(prev => [...prev, newUser]);
      setUser(newUser);
      return { success: true, user: newUser };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Supabase Reset Password
  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/login',
      });
      if (error) throw error;
      return { success: true, message: 'Password reset link sent to your email.' };
    } catch (err) {
      return { success: false, error: err.message || 'Failed to send reset link.' };
    }
  };

  // Supabase Logout
  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('SignOut exception', e);
    }
    setUser(null);
    setSession(null);
  };

  // Role Switcher for instant demo testing
  const switchRole = (role) => {
    let presetUser = usersList.find(u => u.role === role);
    if (!presetUser) {
      presetUser = {
        id: 'u-' + role + '-' + Date.now(),
        name: `${role.toUpperCase()} Demo`,
        email: `${role}@fastparking.com`,
        role: role,
        status: 'Active'
      };
    }
    setUser(presetUser);
  };

  const updateUserRole = (userId, newRole) => {
    setUsersList(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    if (user && user.id === userId) {
      setUser(prev => ({ ...prev, role: newRole }));
    }
  };

  const deleteUser = (userId) => {
    setUsersList(prev => prev.filter(u => u.id !== userId));
  };

  const value = {
    user,
    session,
    usersList,
    loading,
    login,
    register,
    resetPassword,
    logout,
    switchRole,
    updateUserRole,
    deleteUser,
    isAuthenticated: !!user,
    isUser: user?.role === 'user',
    isStaff: user?.role === 'staff',
    isAdmin: user?.role === 'admin'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
