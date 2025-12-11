"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Button from "@/app/components/atoms/buttons/Button";
import EmailInput from "@/app/components/atoms/inputs/EmailInput";
import Text from "@/app/components/atoms/Text/Text";

const schema = z.object({
  email: z
    .string()
    .nonempty({ message: "Email is required" })
    .email({ message: "Enter a valid email address" }),
});

type FormData = z.infer<typeof schema>;

export default function ForgetPasswordPage() {
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    handleSubmit,
    formState: { errors },
    register,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const handleSubmitForm = async (data: FormData) => {
    setIsSubmitting(true);
    setServerMessage(null);
    setServerError(null);

    try {
      const response = await fetch("/api/forget-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: data.email }),
      });

      let payload: { message?: string } | undefined;
      try {
        payload = await response.json();
      } catch {
        payload = undefined;
      }

      if (response.status === 404) {
        const message =
          payload?.message ||
          "We couldn't find an account with that email address.";
        window.alert(message);
        throw new Error(message);
      }

      if (!response.ok) {
        throw new Error(payload?.message || "Unable to process the request.");
      }

      setServerError(null);
      setServerMessage(
        payload?.message ||
          "If that account exists, a reset link is on the way."
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to process the request.";
      setServerMessage(null);
      setServerError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
          Reset access
        </p>
        <Text
          text="Send a reset link"
          className="text-2xl font-semibold text-text_primary"
        />
        <p className="text-sm text-text_secondary">
          Enter your work email. If it matches an account we will email a secure
          link to reset your password.
        </p>
      </div>
      <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-6">
        <EmailInput
          name="email"
          error={errors?.email}
          label="Work email"
          register={register}
          placeholder="you@smart-hr.app"
          isRequired
        />
        {serverError ? (
          <p className="rounded-2xl border border-rose-200 bg-rose-50/60 px-4 py-3 text-sm text-rose-600 dark:border-rose-500/50 dark:bg-rose-500/10 dark:text-rose-200">
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
          disabled={isSubmitting}
        >
          <Text
            text={isSubmitting ? "Sending link..." : "Send reset link"}
            className="text-[16px] font-semibold"
          />
        </Button>
      </form>
    </div>
  );
}
