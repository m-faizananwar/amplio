"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { SendHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { type MessageFormInput, messageFormSchema } from "../../schemas";
import { QuickReactions } from "./QuickReactions";

type Props = { disabled: boolean; onSend: (values: MessageFormInput) => void };

// Enter sends, Shift+Enter breaks the line.
export function Composer({ disabled, onSend }: Props) {
  const t = useTranslations("collaboration.messages.composer");
  const form = useForm<MessageFormInput>({ resolver: zodResolver(messageFormSchema), defaultValues: { body: "" } });
  const { errors } = form.formState;
  const submit = form.handleSubmit((values) => {
    onSend(values);
    form.reset();
  });
  return (
    <form onSubmit={submit} className="grid gap-2 border-t border-rule p-3" noValidate>
      <QuickReactions onPick={(emoji) => form.setValue("body", `${form.getValues("body")}${emoji}`, { shouldValidate: false })} />
      <div className="flex items-end gap-2">
        <label className="sr-only" htmlFor="message-body">{t("label")}</label>
        <Textarea
          id="message-body"
          rows={1}
          placeholder={t("placeholder")}
          aria-invalid={Boolean(errors.body)}
          aria-describedby="message-hint"
          minRows={1}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void submit();
            }
          }}
          {...form.register("body")}
        />
        <Button type="submit" size="icon" aria-label={t("send")} disabled={disabled} className="shrink-0"><SendHorizontal aria-hidden="true" /></Button>
      </div>
      <p id="message-hint" className={`text-caption ${errors.body ? "text-failure" : "text-ink-muted"}`}>{errors.body ? t("validation.empty") : t("hint")}</p>
    </form>
  );
}
