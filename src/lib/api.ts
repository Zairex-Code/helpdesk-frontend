"use client";

import axios, { AxiosError } from "axios";
import { clearToken, getToken } from "@/lib/auth";
import type { ErrorResponseDto } from "@/types/api";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ErrorResponseDto>) => {
    if (error.response?.status === 401) {
      const isLoginRequest = error.config?.url?.includes("/auth/login");
      if (!isLoginRequest) {
        clearToken();
        if (typeof window !== "undefined" && window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  },
);

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ErrorResponseDto>(error)) {
    return error.response?.data?.detail ?? error.message;
  }
  return "Error inesperado";
}

export function getErrorCode(error: unknown): string | undefined {
  if (axios.isAxiosError<ErrorResponseDto>(error)) {
    return error.response?.data?.errorCode;
  }
  return undefined;
}
