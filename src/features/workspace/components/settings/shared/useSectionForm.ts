"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { type DefaultValues, type FieldValues, type Resolver, useForm } from "react-hook-form";
import { toast } from "sonner";
import type { ZodType } from "zod";

type Result = { ok: true } | { ok: false; error: string };
type Options<T extends FieldValues> = {
  schema: ZodType<T, FieldValues>;
  defaults: DefaultValues<T>;
  save: (values: T) => Promise<Result>;
  saved: string;
};

// A settings form: validate with the shared schema, save with the shared
// action, then make the saved values the new baseline (so Save disables
// again) and refresh the server data around it.
export function useSectionForm<T extends FieldValues>({ schema, defaults, save, saved }: Options<T>) {
  const router = useRouter();
  const form = useForm<T>({ resolver: zodResolver(schema) as unknown as Resolver<T>, defaultValues: defaults, mode: "onTouched" });
  const onSubmit = form.handleSubmit(async (values) => {
    const result = await save(values);
    if (!result.ok) {
      form.setError("root", { message: result.error });
      toast.error(result.error);
      return;
    }
    form.reset(values);
    toast.success(saved);
    router.refresh();
  });
  return { form, onSubmit };
}
