const defaultBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export type ApiClientOptions = RequestInit & {
  token?: string | null;
};

export async function apiClient<T>(path: string, options: ApiClientOptions = {}): Promise<T> {
  const { token, headers, ...rest } = options;
  const url = `${defaultBaseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;

  const res = await fetch(url, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers
    }
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }

  return (await res.json()) as T;
}
