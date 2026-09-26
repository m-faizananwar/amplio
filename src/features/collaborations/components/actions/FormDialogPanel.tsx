"use client";

import { type ReactNode, useState } from "react";
import { ActionDialog } from "@/components/dialog/ActionDialog";
import type { Fact } from "@/components/dialog/DialogFacts";
import { Button } from "@/components/ui/button";
import { ActionPanel } from "./ActionPanel";

type Props = {
  title: string;
  description: string;
  openLabel: string;
  submitLabel: string;
  cancelLabel: string;
  icon: ReactNode;
  facts: Fact[];
  disabled: boolean;
  /** The id the form inside carries, so the footer's submit button can drive it. */
  formId: string;
  /** Renders the form; `done` closes the dialog after a successful submit. */
  form: (done: () => void) => ReactNode;
};

// A step that needs one input (the publish day, the post URL): the panel
// opens a dialog with the facts, the field, and the submit in the footer.
export function FormDialogPanel({ title, description, openLabel, submitLabel, cancelLabel, icon, facts, disabled, formId, form }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <ActionPanel title={title} description={description}>
      <Button type="button" icon={icon} disabled={disabled} onClick={() => setOpen(true)}>{openLabel}</Button>
      <ActionDialog open={open} onOpenChange={setOpen} icon={icon} tone="attention" title={title} sub={description} facts={facts} cancelLabel={cancelLabel}
        action={<Button type="submit" form={formId} icon={icon} disabled={disabled}>{submitLabel}</Button>}>
        {form(() => setOpen(false))}
      </ActionDialog>
    </ActionPanel>
  );
}
