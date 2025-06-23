export const httpClient = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const headers = new Headers({
    "Content-Type": "application/json",
    ...options.headers,
  });

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw response;
  }

  const statusWithoutResponse = [204, 205, 304].includes(response?.status);

  if (!response?.body || statusWithoutResponse) {
    return {} as T;
  }

  return response.json() as Promise<T>;
};
