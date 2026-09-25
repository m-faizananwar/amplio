"use client"

import type { LucideIcon } from "lucide-react"
import { useEffect } from "react"
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandShortcut } from "./command"

export type CommandMenuItem = {
  id: string
  label: string
  /** Extra words that should match, e.g. a creator's handle. */
  keywords?: string[]
  hint?: string
  icon?: LucideIcon
  onSelect: () => void
}

export type CommandMenuGroup = { heading: string; items: CommandMenuItem[] }

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  groups: CommandMenuGroup[]
  placeholder: string
  emptyText: string
  title: string
}

// ⌘K / Ctrl+K from anywhere: jump to a page, a creator, a campaign, or run an
// action. The groups come from the caller (the shell knows the routes and the
// data); this is only the palette.
export function CommandMenu({ open, onOpenChange, groups, placeholder, emptyText, title }: Props) {
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} title={title} description={placeholder}>
      <Command loop>
        <CommandInput placeholder={placeholder} />
        <CommandList className="max-h-[min(60vh,420px)]">
          <CommandEmpty className="py-8 text-center text-body text-ink-muted">{emptyText}</CommandEmpty>
          {groups.filter((g) => g.items.length > 0).map((group) => (
            <CommandGroup key={group.heading} heading={group.heading}>
              {group.items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={`${item.label} ${item.id}`}
                  keywords={item.keywords}
                  onSelect={() => {
                    onOpenChange(false)
                    item.onSelect()
                  }}
                >
                  {item.icon ? <item.icon aria-hidden="true" className="text-ink-muted" /> : null}
                  <span className="truncate">{item.label}</span>
                  {item.hint ? <CommandShortcut className="num">{item.hint}</CommandShortcut> : null}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </Command>
    </CommandDialog>
  )
}

/** Toggles the menu on ⌘K / Ctrl+K, and ignores the shortcut while typing in another field. */
export function useCommandShortcut(toggle: () => void) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key.toLowerCase() !== "k" || !(event.metaKey || event.ctrlKey)) return
      event.preventDefault()
      toggle()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [toggle])
}
