import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { ApiResponse } from "../types/api";

interface User {
  id: string;
  name: string;
  email?: string;
  nickname?: string;
  profileImage?: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  token: string | null;
  user: User | null;
  login: (token: string, userData?: User) => void;
  logout: () => void;
  checkSession: () => Promise<boolean>;
  isSessionChecking: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 서버 절대 URL (예: http://localhost:8080 또는 http://52.78.132.85:8080)
const API_BASE = import.meta.env.VITE_API_BASE_URL as string;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null); // 서버 세션 사용 → 토큰 null 유지
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isSessionChecking, setIsSessionChecking] = useState<boolean>(true);

  // 세션 체크: 항상 서버 절대 URL 사용 + JSON 가드
  const checkSession = async (): Promise<boolean> => {
    try {
      if (!API_BASE) throw new Error("VITE_API_BASE_URL is missing");
      console.log("세션 체크 시작...");

      const res = await fetch(`${API_BASE}/member/me`, {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json" },
      });

      console.log("세션 체크 응답:", res.status, res.ok);

      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("application/json")) {
        const bodyPreview = (await res.text()).slice(0, 200);
        console.error("세션 체크: JSON 아님. body 미리보기:", bodyPreview);
        // 비로그인 처리
        setUser(null);
        setIsLoggedIn(false);
        setToken(null);
        return false;
      }

      // 서버 응답 스키마: { result: { memberId, nickname }, ... }
      const data: ApiResponse<{ memberId: number; nickname: string }> = await res.json();
      console.log("세션 체크 데이터:", data);

      if (res.ok && data?.isSuccess && data.result) {
        const u: User = {
          id: String(data.result.memberId),
          name: data.result.nickname ?? "",
          nickname: data.result.nickname ?? "",
        };
        setUser(u);
        setIsLoggedIn(true);
        setToken(null);
        console.log("세션 유효 - 로그인 상태 설정");
        return true;
      }

      // 세션 무효
      console.log("세션 무효 - 로그아웃 상태 설정");
      setUser(null);
      setIsLoggedIn(false);
      setToken(null);
      return false;
    } catch (error) {
      console.error("세션 체크 실패:", error);
      setUser(null);
      setIsLoggedIn(false);
      setToken(null);
      return false;
    }
  };

  // 초기 로드 시 1회 세션 체크
  useEffect(() => {
    const initializeAuth = async () => {
      console.log("인증 상태 초기화 시작");
      await checkSession();
      setIsSessionChecking(false);
      console.log("인증 상태 초기화 완료");
    };
    initializeAuth();
  }, []);

  // 수동 로그인 훅 (실제 인증은 서버 세션)
  const login = (_newToken: string, userData?: User) => {
    console.log("수동 로그인 처리");
    setIsLoggedIn(true);
    setToken(null);
    if (userData) setUser(userData);
  };

  const logout = async () => {
    console.log("로그아웃 처리 시작...");
    try {
      if (!API_BASE) throw new Error("VITE_API_BASE_URL is missing");
      await fetch(`${API_BASE}/member/logout`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      console.log("서버 로그아웃 완료");
    } catch (error) {
      console.error("서버 로그아웃 실패:", error);
    } finally {
      setToken(null);
      setUser(null);
      setIsLoggedIn(false);
      console.log("로그아웃 완료");
    }
  };

  useEffect(() => {
    console.log("Auth State 변경:", {
      isLoggedIn,
      hasUser: !!user,
      userName: user?.name,
      isSessionChecking,
      timestamp: new Date().toISOString(),
    });
  }, [isLoggedIn, user, isSessionChecking]);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        token,
        user,
        login,
        logout,
        checkSession,
        isSessionChecking,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
