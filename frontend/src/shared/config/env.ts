const normalisePath = (value: string) => (value.endsWith('/') && value !== '/' ? value.slice(0, -1) : value);
const ensureLeadingSlash = (value: string) => (value.startsWith('/') ? value : `/${value}`);
const isAbsoluteUrl = (value: string) => {
  try {
    const parsed = new URL(value);
    return Boolean(parsed);
  } catch {
    return false;
  }
};

const rawPublicApiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001/api/v1';
const publicApiIsAbsolute = isAbsoluteUrl(rawPublicApiBase);

const publicApiBaseUrl = normalisePath(
  publicApiIsAbsolute ? rawPublicApiBase : ensureLeadingSlash(rawPublicApiBase),
);

const publicApiPath = publicApiIsAbsolute
  ? normalisePath(new URL(publicApiBaseUrl).pathname || '/')
  : publicApiBaseUrl;

const derivedInternalFallback = publicApiIsAbsolute
  ? normalisePath(new URL(publicApiBaseUrl).origin)
  : 'http://localhost:3001';

const internalApiBaseUrl = normalisePath(
  process.env.INTERNAL_API_BASE_URL ?? derivedInternalFallback,
);

export const env = {
  apiBaseUrl: publicApiBaseUrl,
  apiBasePath: publicApiPath,
  internalApiBaseUrl,
  defaultTheme: process.env.NEXT_PUBLIC_DEFAULT_THEME ?? 'dark',
};
