"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/app/components/atoms/buttons/Button";
import PasswordInput from "@/app/components/atoms/inputs/PasswordInput";
import Text from "@/app/components/atoms/Text/Text";
import { trpc } from "@/trpc/client";
import { useTenantPaths } from "@/app/components/tenant/TenantProvider";

const schema = z
  .object({
    password: z
      .string()
      .nonempty({ message: "Password is required" })
      .min(8, { message: "Password must be at least 8 characters long" }),
    confirmPassword: z
      .string()
      .nonempty({ message: "Confirm Password is required" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type FormData = z.infer<typeof schema>;

type ResetPasswordClientProps = {
  token: string;
  userId: string;
  goUrl?: string | null;
};

export function ResetPasswordClient({
  token,
  userId,
}: ResetPasswordClientProps) {
  const router = useRouter();
  const { tenantAuthPath } = useTenantPaths();
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    handleSubmit,
    formState: { errors },
    register,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const updatePasswordMutation = trpc.auth.updateUserPassword.useMutation({
    onSuccess: () => {
      setServerError(null);
      setServerMessage("Password updated successfully. Please sign in.");
      router.push(tenantAuthPath());
    },
    onError: (error) => {
      setServerMessage(null);
      setServerError(error.message || "Unable to reset the password.");
    },
  });

  const handleLogin = (data: FormData) => {
    if (!token || !userId) {
      setServerError("Reset link is invalid or has expired.");
      return;
    }

    setServerError(null);
    setServerMessage(null);
    updatePasswordMutation.mutate({
      userId,
      password: data.password,
    });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
          Choose new password
        </p>
        <Text
          text="Update your credentials"
          className="text-2xl font-semibold text-text_primary"
        />
        <p className="text-sm text-text_secondary">
          Create a strong password to secure your account. You’ll sign in again
          once this update succeeds.
        </p>
      </div>
      <form onSubmit={handleSubmit(handleLogin)} className="space-y-6">
        <PasswordInput
          name="password"
          error={errors?.password}
          register={register}
          label="New password"
          placeholder="Min. 8 characters"
          isRequired
        />
        <PasswordInput
          name="confirmPassword"
          error={errors?.confirmPassword}
          register={register}
          label="Confirm new password"
          placeholder="Re-enter password"
          isRequired
        />

        <ul className="space-y-2 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
          <li>At least 8 characters</li>
          <li>Include a number or symbol</li>
          <li>Avoid reusing old passwords</li>
        </ul>
        {serverError ? (
          <p className="rounded-2xl border border-rose-200 bg-rose-50/60 px-4 py-3 text-sm text-rose-600 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200">
            {serverError}
          </p>
        ) : null}
        {serverMessage ? (
          <p className="rounded-2xl border border-emerald-200 bg-emerald-50/60 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200">
            {serverMessage}
          </p>
        ) : null}

        <Button
          type="submit"
          theme="primary"
          isWidthFull
          disabled={!token || !userId || updatePasswordMutation.isPending}
        >
          <Text
            text={
              updatePasswordMutation.isPending
                ? "Updating password..."
                : "Update password"
            }
            className="text-[16px] font-semibold"
          />
        </Button>
      </form>
    </div>
  );
}
