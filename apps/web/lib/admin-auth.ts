import { apiClient } from "./api-client";

export type AdminSession = {
  id: string;
  kind: "admin";
  role: "SYSTEM_ADMIN" | "ORGANIZER";
  email: string;
};

export type AdminLoginResponse = {
  user: {
    id: string;
    name: string;
    email: string;
    role: AdminSession["role"];
  };
};

export function loginAdmin(payload: { email: string; password: string }) {
  return apiClient<AdminLoginResponse>("/admin/auth/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getAdminSession() {
  return apiClient<{ user: AdminSession }>("/admin/auth/me");
}

export function logoutAdmin() {
  return apiClient<{ success: true }>("/admin/auth/logout", {
    method: "POST"
  });
}
