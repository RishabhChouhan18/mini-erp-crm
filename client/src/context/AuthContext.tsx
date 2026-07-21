import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import api from "../api/axios";

import type {
  User,
} from "../types/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;

  login: (
    email: string,
    password: string
  ) => Promise<void>;

  logout: () => void;
}

const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined
  );

export const AuthProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [user, setUser] =
    useState<User | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const storedUser =
      localStorage.getItem("user");

    const token =
      localStorage.getItem("token");

    if (storedUser && token) {
      try {
        setUser(
          JSON.parse(storedUser)
        );
      } catch {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }

    setLoading(false);
  }, []);

  const login = async (
    email: string,
    password: string
  ) => {
    const response = await api.post(
      "/auth/login",
      {
        email,
        password,
      }
    );

    /*
      IMPORTANT:

      If backend response:
      {
        token,
        user
      }

      use:
      response.data.token

      If backend response:
      {
        success: true,
        data: {
          token,
          user
        }
      }

      use:
      response.data.data.token
    */

    const authData =
      response.data.data ??
      response.data;

    localStorage.setItem(
      "token",
      authData.token
    );

    localStorage.setItem(
      "user",
      JSON.stringify(authData.user)
    );

    setUser(authData.user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);

    window.location.href =
      "/login";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};