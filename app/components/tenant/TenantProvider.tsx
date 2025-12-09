"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

import {
  canonicalizeTenantSlug,
  tenantAuthPath,
  tenantPath,
} from "@/lib/tenant/routing";

type TenantContextValue = {
  slug: string;
};

const TenantContext = createContext<TenantContextValue | null>(null);

export function TenantProvider({
  slug,
  children,
}: {
  slug: string;
  children: ReactNode;
}) {
  const value = useMemo(
    () => ({ slug: canonicalizeTenantSlug(slug) }),
    [slug],
  );

  return (
    <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
  );
}

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error("useTenant must be used within a TenantProvider");
  }

  return context;
};

export const useOptionalTenant = () => useContext(TenantContext);

export const useTenantPaths = () => {
  const { slug } = useTenant();
  return {
    slug,
    tenantPath: (path?: string | null) => tenantPath(slug, path),
    tenantAuthPath: (path?: string | null) => tenantAuthPath(slug, path),
  };
};
