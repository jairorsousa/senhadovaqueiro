const API_URL = process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL ?? "http://localhost:3333";

export async function apiClient<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);

  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers,
    ...init
  });

  const body = (await response.json().catch(() => null)) as T;

  if (!response.ok) {
    throw body;
  }

  return body;
}
