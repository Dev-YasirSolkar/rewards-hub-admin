export async function adminFetch<T = any>(
  path: string,
  options?: RequestInit
): Promise<{ success: boolean; data?: T; [key: string]: any }> {
  try {
    const res = await fetch(path, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (res.status === 401) {
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
      return { success: false, error: 'Unauthorized' };
    }

    const json = await res.json();
    return json;
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Network request failed',
    };
  }
}
