const TENANT_ROUTE_PREFIX = "org";

const splitPathAndSuffix = (value: string) => {
  const delimiterIndex = value.search(/[?#]/);
  if (delimiterIndex === -1) {
    return { pathname: value, suffix: "" };
  }
  return {
    pathname: value.slice(0, delimiterIndex),
    suffix: value.slice(delimiterIndex),
  };
};

const normalizePath = (value?: string | null) => {
  if (!value) {
    return { pathname: "", suffix: "" };
  }
  const trimmed = value.trim();
  if (!trimmed || trimmed === "/") {
    return { pathname: "", suffix: "" };
  }
  const { pathname, suffix } = splitPathAndSuffix(trimmed);
  if (!pathname || pathname === "/") {
    return { pathname: "", suffix };
  }
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return { pathname: normalizedPath, suffix };
};

const ensureLeadingSlash = (value: string) =>
  value.startsWith("/") ? value : `/${value}`;

export const canonicalizeTenantSlug = (slug: string) =>
  slug.trim().toLowerCase();

export const tenantPath = (slug: string, path?: string | null) => {
  const normalizedSlug = canonicalizeTenantSlug(slug);
  const { pathname, suffix } = normalizePath(path);
  const tenantBase = `/${TENANT_ROUTE_PREFIX}/${normalizedSlug}`;
  const href = pathname ? `${tenantBase}${pathname}` : tenantBase;
  return suffix ? `${href}${suffix}` : href;
};

export const tenantAuthPath = (slug: string, path?: string | null) => {
  const { pathname, suffix } = normalizePath(path);
  let authPath: string;

  if (!pathname) {
    authPath = "/auth/login";
  } else if (pathname.startsWith("/auth")) {
    authPath = pathname;
  } else {
    authPath = `/auth${pathname}`;
  }

  return tenantPath(slug, suffix ? `${authPath}${suffix}` : authPath);
};

export const tenantAbsoluteUrl = (
  baseUrl: string,
  slug: string,
  path?: string | null,
) => {
  const normalizedBase = baseUrl.replace(/\/$/, "");
  return `${normalizedBase}${tenantPath(slug, path)}`;
};

type TenantPathMatch = {
  slug: string;
  path: string;
};

export const matchTenantPath = (pathname: string): TenantPathMatch | null => {
  const sanitizedInput = ensureLeadingSlash(pathname || "/");
  const { pathname: normalizedPath, suffix } = normalizePath(sanitizedInput);
  const rawPath = normalizedPath || "/";
  const segments = rawPath.split("/").filter(Boolean);
  if (segments[0] !== TENANT_ROUTE_PREFIX || !segments[1]) {
    return null;
  }
  const slug = canonicalizeTenantSlug(segments[1]);
  const remainder = segments.slice(2).join("/");
  const tenantRelativePath = remainder ? `/${remainder}` : "/";
  return {
    slug,
    path: suffix ? `${tenantRelativePath}${suffix}` : tenantRelativePath,
  };
};

export const stripTenantPrefix = (pathname: string) => {
  const match = matchTenantPath(pathname);
  if (!match) {
    return ensureLeadingSlash(pathname);
  }
  return match.path;
};

export const isTenantPath = (pathname: string) =>
  Boolean(matchTenantPath(pathname));

export const TENANT_ROUTE_SEGMENT = TENANT_ROUTE_PREFIX;
