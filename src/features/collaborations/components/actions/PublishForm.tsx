"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Link2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { type PublishFormInput, publishFormSchema } from "../../schemas";

type Props = { id: string; onSubmit: (values: PublishFormInput) => Promise<boolean>; onDone: () => void };

// No LinkedIn API, so publication is self-reported with the post URL.
export function PublishForm({ id, onSubmit, onDone }: Props) {
  const t = useTranslations("collaboration.detail");
  const form = useForm<PublishFormInput>({ resolver: zodResolver(publishFormSchema), defaultValues: { postUrl: "" } });
  const { errors } = form.formState;
  const error = errors.postUrl ? (errors.postUrl.message?.toLowerCase().includes("linkedin") ? t("validation.postUrlLinkedin") : t("validation.postUrlInvalid")) : null;
  return (
    <form id={id} onSubmit={form.handleSubmit(async (v) => { if (await onSubmit(v)) onDone(); })} className="grid gap-3" noValidate>
      <div className="grid gap-1.5">
        <label htmlFor="postUrl" className="text-small font-medium">{t("creator.publish.label")}</label>
        <Input id="postUrl" leadingIcon={<Link2 />} type="url" inputMode="url" placeholder={t("creator.publish.placeholder")} aria-invalid={Boolean(error)} {...form.register("postUrl")} />
        {error ? <p role="alert" className="text-caption text-failure">{error}</p> : null}
      </div>
    </form>
  );
}
