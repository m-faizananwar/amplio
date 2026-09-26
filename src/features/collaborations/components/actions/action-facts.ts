import type { Fact } from "@/components/dialog/DialogFacts";
import type { CollaborationDto } from "../../schemas";

// The facts each decision dialog rests on, built from the collaboration.
// `t` is collaboration.detail.facts; `fmt` the viewer's money and dates.
type T = (key: string) => string;
type Fmt = { money: (cents: number) => string; date: (iso: string) => string };

const when = (iso: string | null, fmt: Fmt, t: T) => (iso ? fmt.date(iso) : t("none"));

export function decideFacts(c: CollaborationDto, { role, t, fmt }: { role: "creator" | "brand"; t: T; fmt: Fmt }): Fact[] {
  return [
    role === "creator" ? { label: t("brand"), value: c.brandCompany } : { label: t("creator"), value: c.creatorName },
    { label: t("campaign"), value: c.campaignName },
    { label: t(role === "creator" ? "feeHeldForYou" : "feeFromWallet"), value: fmt.money(c.feeCents), mono: true, tone: "money" },
    ...(role === "creator" ? [{ label: t("acceptBy"), value: when(c.acceptBy, fmt, t), mono: true }] : []),
    { label: t("deadline"), value: when(c.dueDate, fmt, t), mono: true },
  ];
}

export function scheduleFacts(c: CollaborationDto, t: T, fmt: Fmt): Fact[] {
  return [
    { label: t("brand"), value: c.brandCompany },
    { label: t("campaign"), value: c.campaignName },
    { label: t("deadline"), value: when(c.dueDate, fmt, t), mono: true },
    { label: t("fee"), value: fmt.money(c.feeCents), mono: true, tone: "money" },
  ];
}

export function publishFacts(c: CollaborationDto, t: T, fmt: Fmt): Fact[] {
  return [
    { label: t("brand"), value: c.brandCompany },
    { label: t("scheduledFor"), value: when(c.scheduledAt, fmt, t), mono: true },
    { label: t("fee"), value: fmt.money(c.feeCents), mono: true, tone: "money" },
  ];
}

export function payFacts(c: CollaborationDto, t: T, fmt: Fmt): Fact[] {
  const post = c.postUrl ? c.postUrl.replace(/^https?:\/\/(www\.)?/, "") : t("none");
  return [
    { label: t("creator"), value: c.creatorName },
    { label: t("post"), value: post, mono: true },
    { label: t("liveSince"), value: when(c.publishedAt, fmt, t), mono: true },
    { label: t("amount"), value: fmt.money(c.feeCents), mono: true, tone: "money" },
  ];
}
