"use client";

import React, { createContext, useContext, useMemo, useState, useSyncExternalStore } from "react";

export type SubscriptionTier = "free" | "samurai" | "shogun";

export type UserProfile = {
  name: string;
  email?: string;
  title: string;
  rank: string;
  honorPoints: number;
  homeBase: string;
  isGuest: boolean;
  plan: SubscriptionTier;
};

const DEFAULT_GUEST: UserProfile = {
  name: "Ronin Traveler",
  title: "Guest Stargazer",
  rank: "Novice of the Night Sky",
  honorPoints: 50,
  homeBase: "Tokyo / Global Sky",
  isGuest: true,
  plan: "free",
};

type AuthContextType = {
  user: UserProfile;
  isLoggedIn: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  login: (name: string, email?: string) => void;
  continueAsGuest: () => void;
  logout: () => void;
  selectPlan: (tier: SubscriptionTier) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "tsukuyomi_user_profile";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("tsukuyomi_auth_change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("tsukuyomi_auth_change", callback);
  };
}

function getSnapshot() {
  return localStorage.getItem(STORAGE_KEY);
}

function getServerSnapshot() {
  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const rawStorage = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const user = useMemo<UserProfile>(() => {
    if (!rawStorage) return DEFAULT_GUEST;
    try {
      const parsed = JSON.parse(rawStorage) as UserProfile;
      return {
        ...parsed,
        plan: parsed.plan || (parsed.isGuest ? "free" : "samurai"),
      };
    } catch {
      return DEFAULT_GUEST;
    }
  }, [rawStorage]);

  const isLoggedIn = !user.isGuest || user.plan !== "free";

  const notifyChange = (updated: UserProfile) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event("tsukuyomi_auth_change"));
    } catch {
      // ignore
    }
  };

  const login = (name: string, email?: string) => {
    const newUser: UserProfile = {
      name: name.trim() || "Samurai Stargazer",
      email: email?.trim(),
      title: "Master of the Celestial Eye",
      rank: "Celestial Samurai · Rank 1",
      honorPoints: 240,
      homeBase: "Hanle High Plateau",
      isGuest: false,
      plan: "samurai",
    };
    notifyChange(newUser);
    setIsAuthModalOpen(false);
  };

  const continueAsGuest = () => {
    notifyChange(DEFAULT_GUEST);
    setIsAuthModalOpen(false);
  };

  const selectPlan = (tier: SubscriptionTier) => {
    if (tier === "free") {
      notifyChange({
        ...user,
        plan: "free",
        rank: "Novice of the Night Sky",
        title: "Guest Stargazer",
      });
    } else if (tier === "samurai") {
      notifyChange({
        ...user,
        name: user.name === "Ronin Traveler" ? "Samurai Stargazer" : user.name,
        plan: "samurai",
        rank: "Celestial Samurai · Rank 1",
        title: "Master of the Celestial Eye",
        honorPoints: Math.max(user.honorPoints, 240),
        isGuest: false,
      });
    } else if (tier === "shogun") {
      notifyChange({
        ...user,
        name: user.name === "Ronin Traveler" ? "Shogun Commander" : user.name,
        plan: "shogun",
        rank: "Night Sky Shogun · Grand Marshal",
        title: "Supreme Commander of the Celestial Realm",
        honorPoints: Math.max(user.honorPoints, 500),
        isGuest: false,
      });
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new Event("tsukuyomi_auth_change"));
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        login,
        continueAsGuest,
        logout,
        selectPlan,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
