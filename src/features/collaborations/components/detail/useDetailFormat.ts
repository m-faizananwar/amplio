"use client";

import { useFormatter } from "next-intl";

const CENTS = 100;

// Money and dates on the collaboration page, in the viewer's locale.
export function useDetailFormat() {
  const format = useFormatter();
  return {
    money: (cents: number) => format.number(cents / CENTS, { style: "currency", currency: "EUR" }),
    date: (iso: string) => format.dateTime(new Date(iso), { dateStyle: "medium" }),
    dateTime: (iso: string) => format.dateTime(new Date(iso), { dateStyle: "medium", timeStyle: "short" }),
  };
}
