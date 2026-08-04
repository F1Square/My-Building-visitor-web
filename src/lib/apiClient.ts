const _envBase = import.meta.env.VITE_API_BASE;
const API_BASE: string = (_envBase && _envBase !== 'undefined')
  ? _envBase
  : 'https://my-building-backend.vercel.app/api';

export type UploadProgressHandler = (percent: number | null) => void;

function withQuery(path: string, params?: Record<string, string | number | boolean | undefined | null>): string {
  if (!params) return path;
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
  });
  const q = qs.toString();
  return q ? `${path}?${q}` : path;
}

function handleUnauthorized() {
  localStorage.removeItem('mb_token');
  localStorage.removeItem('mb_user');
  localStorage.removeItem('mb_subscription');
  window.location.replace('/login');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('mb_token');

  // Build headers — don't set Content-Type for FormData (browser sets it with boundary)
  const isFormData = options.body instanceof FormData;
  const headers: Record<string, string> = {};
  if (!isFormData) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    handleUnauthorized();
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || body.message || `Request failed: ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

/**
 * XHR upload with real byte progress. Use for FormData / large JSON bodies.
 * `percent` is 0–100 when total is known; otherwise `null` (no invented %).
 */
function xhrRequest<T>(
  url: string,
  options: {
    method?: string;
    body?: Document | XMLHttpRequestBodyInit | null;
    headers?: Record<string, string>;
    onProgress?: UploadProgressHandler;
    withAuth?: boolean;
  } = {},
): Promise<T> {
  const {
    method = 'POST',
    body = null,
    headers = {},
    onProgress,
    withAuth = true,
  } = options;

  return new Promise<T>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);

    if (withAuth) {
      const token = localStorage.getItem('mb_token');
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }
    Object.entries(headers).forEach(([k, v]) => xhr.setRequestHeader(k, v));

    xhr.upload.onprogress = (e) => {
      if (!onProgress) return;
      if (!e.lengthComputable || !e.total) {
        onProgress(null);
        return;
      }
      onProgress(Math.min(100, Math.round((e.loaded / e.total) * 100)));
    };

    xhr.onload = () => {
      if (xhr.status === 401 && withAuth) {
        handleUnauthorized();
        reject(new Error('Unauthorized'));
        return;
      }

      let parsed: unknown = undefined;
      const raw = xhr.responseText;
      if (raw) {
        try {
          parsed = JSON.parse(raw);
        } catch {
          parsed = raw;
        }
      }

      if (xhr.status < 200 || xhr.status >= 300) {
        const errBody = (parsed && typeof parsed === 'object') ? parsed as { error?: string; message?: string } : {};
        reject(new Error(errBody.error || errBody.message || `Request failed: ${xhr.status}`));
        return;
      }

      if (xhr.status === 204) {
        resolve(undefined as T);
        return;
      }
      resolve(parsed as T);
    };

    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.onabort = () => reject(new Error('Upload cancelled'));
    xhr.send(body);
  });
}

export const api = {
  get: <T>(path: string, params?: Record<string, string | number | boolean | undefined | null>) =>
    request<T>(withQuery(path, params)),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),

  /** Authenticated API request with upload progress (FormData or JSON string). */
  upload: <T>(
    path: string,
    body: FormData | unknown,
    options?: { method?: 'POST' | 'PATCH' | 'PUT'; onProgress?: UploadProgressHandler },
  ) => {
    const isFormData = body instanceof FormData;
    const headers: Record<string, string> = {};
    if (!isFormData) headers['Content-Type'] = 'application/json';
    return xhrRequest<T>(`${API_BASE}${path}`, {
      method: options?.method || 'POST',
      body: isFormData ? body : JSON.stringify(body),
      headers,
      onProgress: options?.onProgress,
      withAuth: true,
    });
  },

  /** Direct PUT to a signed storage URL (e.g. newspaper PDF) with progress. */
  putBlob: (
    signedUrl: string,
    blob: Blob,
    options?: { contentType?: string; token?: string | null; onProgress?: UploadProgressHandler },
  ) => {
    const headers: Record<string, string> = {
      'Content-Type': options?.contentType || blob.type || 'application/octet-stream',
    };
    if (options?.token) headers.Authorization = `Bearer ${options.token}`;
    return xhrRequest<unknown>(signedUrl, {
      method: 'PUT',
      body: blob,
      headers,
      onProgress: options?.onProgress,
      withAuth: false,
    });
  },
};

export default api;
