"use client";

import { ArrowUp, Bot } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { TrailLoader } from "@/components/graphics/TrailLoader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BRIEF_PROMPT_MAX_CHARS } from "../../constants";
import { createCampaignFromAi } from "../../server/actions";

// Three questions, then the answers (with the workspace profile) become the
// draft brief — written by the AI provider when one is configured, from the
// template otherwise. Everything is editable before launch.
const QUESTIONS = ["selling", "buyer", "goal"] as const;
const ANSWER_MAX_CHARS = Math.floor(BRIEF_PROMPT_MAX_CHARS / QUESTIONS.length) - 20;

type Turn = { role: "assistant" | "you"; text: string };

export function AiComposer() {
  const t = useTranslations("brand.campaigns.create");
  const router = useRouter();
  const [answers, setAnswers] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const step = Math.min(answers.length, QUESTIONS.length - 1);
  const done = answers.length === QUESTIONS.length;
  const current = QUESTIONS[step];
  const turns: Turn[] = QUESTIONS.slice(0, answers.length + 1).flatMap((q, i) => {
    const out: Turn[] = [{ role: "assistant", text: t(`questions.${q}.ask`) }];
    if (answers[i]) out.push({ role: "you", text: answers[i] });
    return out;
  });

  function generate(all: string[]) {
    setError(null);
    const [selling, buyer, goal] = all;
    startTransition(async () => {
      const result = await createCampaignFromAi({ prompt: `Goal: ${goal}. We are selling: ${selling}. The buyer: ${buyer}.` });
      if (!result.ok) {
        setError(result.error);
        setAnswers(all.slice(0, -1));
        return;
      }
      toast.success(t(`generated.${result.data.generatedWith}`));
      router.push(`/brand/campaigns/${result.data.campaignId}/launch?generated=${result.data.generatedWith}`);
    });
  }

  function submit() {
    const text = draft.trim();
    if (!text || pending || done) return;
    const next = [...answers, text];
    setAnswers(next);
    setDraft("");
    if (next.length === QUESTIONS.length) generate(next);
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="grid gap-4 rounded-card border border-rule bg-surface p-4">
      <ol className="grid gap-2" aria-live="polite">
        {turns.map((turn, i) => (
          <li key={i} className={turn.role === "assistant" ? "flex items-start gap-2 animate-rise" : "flex justify-end animate-rise"}>
            {turn.role === "assistant" ? (
              <>
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-tint text-ink-muted"><Bot className="size-3.5" aria-hidden="true" /></span>
                <p className="max-w-[85%] rounded-card rounded-tl-sm bg-tint px-3 py-2 text-body">{turn.text}</p>
              </>
            ) : <p className="max-w-[85%] rounded-card rounded-br-sm bg-ink px-3 py-2 text-body text-paper">{turn.text}</p>}
          </li>
        ))}
        {pending ? <li className="flex items-center gap-2 text-small text-ink-muted"><TrailLoader /> {t("preparing")}</li> : null}
      </ol>
      {!done ? (
        <div>
          <label htmlFor="ai-answer" className="sr-only">{t(`questions.${current}.ask`)}</label>
          <Textarea id="ai-answer" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={t(`questions.${current}.placeholder`)} maxLength={ANSWER_MAX_CHARS} rows={3} disabled={pending}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
            className="min-h-20 resize-none border-0 bg-transparent p-0 text-lead focus-visible:ring-0" />
          <div className="mt-3 flex items-end justify-between gap-3">
            <button type="button" onClick={() => setDraft(t(`questions.${current}.example`))} className="text-left text-caption text-ink-muted hover:text-ink hover:underline">{t("try", { example: t(`questions.${current}.example`) })}</button>
            <Button type="submit" size="icon" aria-label={step === QUESTIONS.length - 1 ? t("generate") : t("next")} disabled={pending || draft.trim().length === 0}><ArrowUp aria-hidden="true" /></Button>
          </div>
          <p className="num mt-2 text-caption text-ink-muted">{t("progress", { step: step + 1, total: QUESTIONS.length })}</p>
        </div>
      ) : null}
      {error ? <p role="alert" className="rounded-control border border-failure/30 bg-failure-soft px-3 py-2 text-small text-failure">{error}</p> : null}
    </form>
  );
}
