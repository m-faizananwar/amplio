"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type PublishFormInput, publishFormSchema } from "../../schemas";

type Props = { disabled: boolean; onSubmit: (values: PublishFormInput) => Promise<boolean> };

// No LinkedIn API, so publication is self-reported with the post URL.
export function PublishForm({ disabled, onSubmit }: Props) {
  const t = useTranslations("collaboration.detail");
  const form = useForm<PublishFormInput>({ resolver: zodResolver(publishFormSchema), defaultValues: { postUrl: "" } });
  const { errors, isSubmitting } = form.formState;
  const error = errors.postUrl ? (errors.postUrl.message?.toLowerCase().includes("linkedin") ? t("validation.postUrlLinkedin") : t("validation.postUrlInvalid")) : null;
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-3" noValidate>
      <div className="grid gap-1.5">
        <label htmlFor="postUrl" className="text-small font-medium">{t("creator.publish.label")}</label>
        <Input id="postUrl" type="url" inputMode="url" placeholder={t("creator.publish.placeholder")} aria-invalid={Boolean(error)} {...form.register("postUrl")} />
        {error ? <p role="alert" className="text-caption text-failure">{error}</p> : null}
      </div>
      <Button type="submit" className="justify-self-start" disabled={disabled || isSubmitting}>{isSubmitting ? t("creator.publish.pending") : t("creator.publish.submit")}</Button>
    </form>
  );
}
