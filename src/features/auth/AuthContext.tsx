import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import { assertSupabaseConfigured, isSupabaseConfigured, supabase } from '@/lib/supabase';
import type { Profile } from '@/types/database';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ profile: Profile | null }>;
  signUp: (input: { full_name: string; email: string; password: string }) => Promise<{
    needsEmailConfirmation: boolean;
  }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<Profile | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function loadUserProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, phone, role, created_at, updated_at')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    return null;
  }
  return data as Profile | null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAuthInitializing, setIsAuthInitializing] = useState<boolean>(isSupabaseConfigured);
  const [isProfileLoading, setIsProfileLoading] = useState<boolean>(false);

  const isMountedRef = useRef(true);
  const profileReqIdRef = useRef(0);
  const loadedProfileUserIdRef = useRef<string | null>(null);

  const syncProfileForUser = useCallback(async (userId: string) => {
    const reqId = ++profileReqIdRef.current;
    setIsProfileLoading(true);
    try {
      const loadedProfile = await loadUserProfile(userId);
      if (isMountedRef.current && reqId === profileReqIdRef.current) {
        loadedProfileUserIdRef.current = userId;
        setProfile(loadedProfile);
      }
      return loadedProfile;
    } finally {
      if (isMountedRef.current && reqId === profileReqIdRef.current) {
        setIsProfileLoading(false);
      }
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!isSupabaseConfigured || !session?.user?.id) {
      loadedProfileUserIdRef.current = null;
      setProfile(null);
      return null;
    }
    return syncProfileForUser(session.user.id);
  }, [session?.user?.id, syncProfileForUser]);

  useEffect(() => {
    isMountedRef.current = true;

    if (!isSupabaseConfigured) {
      setIsAuthInitializing(false);
      setIsProfileLoading(false);
      return () => {
        isMountedRef.current = false;
      };
    }

    async function init() {
      try {
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();

        if (!isMountedRef.current) return;
        setSession(initialSession);

        if (initialSession?.user?.id) {
          await syncProfileForUser(initialSession.user.id);
        } else {
          loadedProfileUserIdRef.current = null;
          setProfile(null);
        }
      } finally {
        if (isMountedRef.current) {
          setIsAuthInitializing(false);
        }
      }
    }

    void init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMountedRef.current) return;
      setSession(nextSession);

      const nextUserId = nextSession?.user?.id ?? null;
      if (!nextUserId) {
        profileReqIdRef.current += 1;
        loadedProfileUserIdRef.current = null;
        setProfile(null);
        setIsProfileLoading(false);
        return;
      }

      // Hindari memuat ulang jika profil untuk user yang sama sudah sinkron (mis. tepat setelah signIn)
      if (loadedProfileUserIdRef.current !== nextUserId) {
        void syncProfileForUser(nextUserId);
      }
    });

    return () => {
      isMountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [syncProfileForUser]);

  const signIn = useCallback(async (email: string, password: string) => {
    assertSupabaseConfigured();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message.toLowerCase().includes('invalid login credentials')) {
        throw new Error('Email atau kata sandi tidak sesuai.');
      }
      throw new Error(error.message);
    }

    const signedInUser = data.user;
    let loadedProfile: Profile | null = null;
    if (signedInUser?.id) {
      const reqId = ++profileReqIdRef.current;
      setIsProfileLoading(true);
      try {
        loadedProfile = await loadUserProfile(signedInUser.id);
        if (isMountedRef.current && reqId === profileReqIdRef.current) {
          loadedProfileUserIdRef.current = signedInUser.id;
          setSession(data.session ?? null);
          setProfile(loadedProfile);
        }
      } finally {
        if (isMountedRef.current && reqId === profileReqIdRef.current) {
          setIsProfileLoading(false);
        }
      }
    }
    return { profile: loadedProfile };
  }, []);

  const signUp = useCallback(
    async (input: { full_name: string; email: string; password: string }) => {
      assertSupabaseConfigured();
      const { data, error } = await supabase.auth.signUp({
        email: input.email,
        password: input.password,
        options: {
          data: {
            full_name: input.full_name,
          },
        },
      });
      if (error) {
        throw new Error(error.message);
      }
      return {
        needsEmailConfirmation: !data.session,
      };
    },
    [],
  );

  const signOut = useCallback(async () => {
    profileReqIdRef.current += 1;
    loadedProfileUserIdRef.current = null;
    setIsProfileLoading(false);

    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }

    setSession(null);
    setProfile(null);
    queryClient.clear();
  }, [queryClient]);

  const isLoading = isAuthInitializing || isProfileLoading;

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      isLoading,
      isAdmin: profile?.role === 'admin',
      signIn,
      signUp,
      signOut,
      refreshProfile,
    }),
    [session, profile, isLoading, signIn, signUp, signOut, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider.');
  }
  return ctx;
}
