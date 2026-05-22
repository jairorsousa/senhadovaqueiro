import { apiClient } from "./api-client";

export type CowboySession = {
  id: string;
  cpf: string;
  role: "COWBOY";
};

export function loginCowboy(payload: { cpf: string; password: string }) {
  return apiClient<{ cowboy: { id: string; name: string; cpf: string; whatsapp: string } }>(
    "/cowboys/login",
    {
      method: "POST",
      body: JSON.stringify(payload)
    }
  );
}

export function getCowboySession() {
  return apiClient<{ cowboy: CowboySession }>("/cowboys/me");
}

export function logoutCowboy() {
  return apiClient<{ success: true }>("/cowboys/logout", {
    method: "POST"
  });
}
