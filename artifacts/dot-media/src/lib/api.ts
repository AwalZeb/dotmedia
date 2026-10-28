const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
const apiBase = `${basePath}/api`;

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    headers,
    credentials: 'same-origin',
  });

  if (response.status === 204) return undefined as T;

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      typeof body?.error === 'string'
        ? body.error
        : `Request failed (${response.status})`;
    throw new Error(message);
  }

  return body as T;
}
