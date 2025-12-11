"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import SystemOwnerAuthLayout from "@/app/components/auth/SystemOwnerAuthLayout";
import Button from "@/app/components/atoms/buttons/Button";
import EmailInput from "@/app/components/atoms/inputs/EmailInput";
import PasswordInput from "@/app/components/atoms/inputs/PasswordInput";
import Text from "@/app/components/atoms/Text/Text";

const passwordPattern = /^.{8,}$/;

const schema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .regex(passwordPattern, "Password must be at least 8 characters."),
});

type FormData = z.infer<typeof schema>;

function SuperAdminLoginPage() {
  const router = useRouter();
  const [rememberMe, setRememberMe] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    const rememberedEmail = localStorage.getItem("superAdminEmail");
    const rememberedPassword = localStorage.getItem("superAdminPassword");

    if (rememberedEmail && rememberedPassword) {
      setValue("email", rememberedEmail);
      setValue("password", rememberedPassword);
      setRememberMe(true);
    }
  }, [setValue]);

  const toggleRememberMe = (event: ChangeEvent<HTMLInputElement>) => {
    setRememberMe(event.target.checked);
  };

  const persistRememberedCredentials = (data: FormData) => {
    if (rememberMe) {
      localStorage.setItem("superAdminEmail", data.email);
      localStorage.setItem("superAdminPassword", data.password);
    } else {
      localStorage.removeItem("superAdminEmail");
      localStorage.removeItem("superAdminPassword");
    }
  };

  const handleForgotPasswordClick = () => {
    const slugInput =
      typeof window !== "undefined"
        ? window.prompt("Enter your organization slug to reset your password.")
        : null;
    const slug = slugInput?.trim().toLowerCase();
    if (!slug) {
      return;
    }
    router.push(`/org/${slug}/auth/forget-password`);
  };

  const attemptSignIn = async (data: FormData) => {
    const response = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
      callbackUrl: "/system-owner",
    });

    if (!response || response.error || response.status === 401) {
      throw new Error("Invalid email or password.");
    }

    persistRememberedCredentials(data);
    router.push(response.url ?? "/system-owner");
  };

  const onSubmit = async (data: FormData) => {
    setFormError(null);
    setIsSubmitting(true);

    try {
      await attemptSignIn(data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to sign in right now.";
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SystemOwnerAuthLayout
      title="System Owner access"
      subtitle="Keep every organization healthy from a single cockpit."
      description="Use your Super Admin credentials to enter the global control center."
      helper="Only verified System Owners can use this portal."
      badge="System Owner"
      showShowcase={false}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <EmailInput
            name="email"
            error={errors?.email}
            label="Super Admin email"
            register={register}
            placeholder="you@smart-hr.app"
            isRequired
          />
          <PasswordInput
            name="password"
            error={errors?.password}
            register={register}
            label="Password"
            placeholder="Enter your password"
            isRequired
          />
        </div>

        <div className="flex flex-wrap items-center justify-between text-sm text-slate-500 dark:text-slate-400">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900"
              checked={rememberMe}
              onChange={toggleRememberMe}
            />
            <span>Remember me on this device</span>
          </label>
          <button
            type="button"
            onClick={handleForgotPasswordClick}
            className="font-semibold text-indigo-600 transition hover:text-indigo-500 dark:text-sky-400 dark:hover:text-sky-300"
          >
            Forgot password?
          </button>
        </div>

        {formError ? (
          <p className="rounded-2xl border border-rose-200 bg-rose-50/60 px-4 py-3 text-sm text-rose-600 dark:border-rose-500/50 dark:bg-rose-500/10 dark:text-rose-200">
            {formError}
          </p>
        ) : null}
        <Button type="submit" theme="primary" isWidthFull disabled={isSubmitting}>
          <Text
            text={isSubmitting ? "Signing in..." : "Enter System Owner console"}
            className="text-[16px] font-semibold"
          />
        </Button>
      </form>
    </SystemOwnerAuthLayout>
  );
}

export default SuperAdminLoginPage;
