const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

export const getRouterBasename = (): string | undefined => {
  const publicUrl = process.env.PUBLIC_URL || '';
  if (!publicUrl) return undefined;

  let basename = '';

  try {
    const pathname = new URL(publicUrl, window.location.origin).pathname;
    basename = trimTrailingSlash(pathname);
  } catch (error) {
    basename = trimTrailingSlash(publicUrl.replace(/^https?:\/\/[^/]+/, ''));
  }

  if (!basename || basename === '/') return undefined;

  return window.location.pathname === basename || window.location.pathname.startsWith(`${basename}/`)
    ? basename
    : undefined;
};

export const publicAsset = (path: string): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const publicUrl = trimTrailingSlash(process.env.PUBLIC_URL || '');

  return publicUrl ? `${publicUrl}${cleanPath}` : cleanPath;
};

export const appPath = (path = '/'): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const basename = getRouterBasename();

  return basename ? `${basename}${cleanPath}` : cleanPath;
};
