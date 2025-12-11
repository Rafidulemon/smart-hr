import "server-only";

import { headers } from "next/headers";
import { cache } from "react";

import { appRouter } from "@/server/api/root";
import { createCallerFactory, createTRPCContext } from "@/server/api/trpc";

const createCaller = createCallerFactory(appRouter);

const getCaller = cache(async () => {
  const resolvedHeaders = await headers();

  const ctx = await createTRPCContext({
    headers: resolvedHeaders,
  });

  return createCaller(ctx);
});

type Caller = Awaited<ReturnType<typeof getCaller>>;

const createCallerProxy = (path: PropertyKey[] = []) =>
  new Proxy(function () {}, {
    get(_target, prop: PropertyKey) {
      if (prop === "then" && path.length === 0) {
        return undefined;
      }

      return createCallerProxy([...path, prop]);
    },
    apply(_target, _thisArg, args) {
      if (path.length === 0) {
        return getCaller();
      }

      return getCaller().then((caller) => {
        const handler = path.reduce<unknown>(
          (acc, key) =>
            acc && (typeof acc === "object" || typeof acc === "function")
              ? (acc as Record<PropertyKey, unknown>)[key]
              : undefined,
          caller,
        );

        if (typeof handler !== "function") {
          throw new Error(
            `Property "${path.join(".")}" is not a callable tRPC procedure.`,
          );
        }

        return handler(...args);
      });
    },
  });

export const api = createCallerProxy() as Caller & (() => Promise<Caller>);
