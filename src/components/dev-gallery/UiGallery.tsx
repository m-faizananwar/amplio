"use client"

import { Moon, Sun } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ControlsGallery } from "./ControlsGallery"
import { DataGallery } from "./DataGallery"
import { OverlaysGallery } from "./OverlaysGallery"

const SECTIONS = [
  ["buttons", "Button"], ["fields", "Fields"], ["choices", "Choices"], ["stats", "StatCard"],
  ["chips", "Chips"], ["table", "Table"], ["empty", "Empty"], ["overlays", "Overlays"],
] as const

// /dev/ui: the component sheet. The theme switch here only flips the `.dark`
// class on <html> for this visit, to check both palettes side by side.
export function UiGallery() {
  const [dark, setDark] = useState(false)
  function flip() {
    document.documentElement.classList.toggle("dark", !dark)
    setDark(!dark)
  }
  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="sticky top-0 z-20 border-b border-rule bg-paper/95">
        <div className="mx-auto flex max-w-content items-center gap-6 px-4 py-3 md:px-8">
          <p className="text-body font-semibold">Amplio · UI</p>
          <nav aria-label="Sections" className="hidden flex-1 gap-4 overflow-x-auto text-small text-ink-muted md:flex">
            {SECTIONS.map(([id, label]) => <a key={id} href={`#${id}`} className="hover:text-ink">{label}</a>)}
          </nav>
          <Button variant="ghost" size="icon-sm" className="ml-auto" onClick={flip} aria-label={dark ? "Light palette" : "Dark palette"}>{dark ? <Sun /> : <Moon />}</Button>
        </div>
      </header>
      <main className="mx-auto max-w-content px-4 pb-24 md:px-8">
        <div className="py-10 animate-rise">
          <h1 className="text-h2">Components</h1>
          <p className="mt-2 max-w-2xl text-body text-ink-muted">One set, used everywhere. Paper, ink, hairline rules; the green is only for money and verified attribution. Numbers are mono and tabular.</p>
        </div>
        <ControlsGallery />
        <DataGallery />
        <OverlaysGallery />
      </main>
    </div>
  )
}
