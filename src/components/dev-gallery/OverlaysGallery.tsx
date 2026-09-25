"use client"

import { Briefcase, LayoutDashboard, Users } from "lucide-react"
import { useCallback, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { CommandMenu, useCommandShortcut } from "@/components/ui/command-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer"
import { Row, Section } from "./Specimen"

export function OverlaysGallery() {
  const [menu, setMenu] = useState(false)
  const toggle = useCallback(() => setMenu((m) => !m), [])
  useCommandShortcut(toggle)
  return (
    <Section id="overlays" title="Dialog · Drawer · Toast · CommandMenu">
      <Row label="dialog">
        <Dialog>
          <DialogTrigger render={<Button variant="secondary" />}>Approve draft</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Approve this draft?</DialogTitle>
              <DialogDescription>The creator can schedule the post once you approve. The fee stays held until it goes live.</DialogDescription>
            </DialogHeader>
            <DialogFooter><Button variant="secondary">Request changes</Button><Button>Approve</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </Row>
      <Row label="drawer">
        <Drawer>
          <DrawerTrigger render={<Button variant="secondary" />}>Why 86 fit?</DrawerTrigger>
          <DrawerContent heading="Fit 86 · Tom Bechtelar" description="Four signals, one reason.">
            <ul className="divide-y divide-rule px-5">
              {[["Industry match", "SaaS · Fintech", "40/40"], ["Audience titles", "3 of 4 ICP titles", "26/30"], ["Engagement", "4.1% median", "12/20"], ["Price fit", "€450 vs €500 budget", "8/10"]].map(([k, v, s]) => (
                <li key={k} className="flex items-baseline justify-between gap-3 py-3"><span><span className="block text-body">{k}</span><span className="text-caption text-ink-muted">{v}</span></span><span className="num text-small">{s}</span></li>
              ))}
            </ul>
          </DrawerContent>
        </Drawer>
      </Row>
      <Row label="toast">
        <Button variant="secondary" onClick={() => toast.success("Draft approved", { description: "Tom can schedule the post now." })}>Success</Button>
        <Button variant="secondary" onClick={() => toast.error("Wallet short by €50.00", { description: "Top up from Billing and try again." })}>Error</Button>
        <Button variant="secondary" onClick={() => toast("Invitation sent")}>Neutral</Button>
      </Row>
      <Row label="⌘K">
        <Button variant="secondary" onClick={toggle}>Open command menu <kbd className="num ml-1 rounded-[4px] border border-rule px-1 text-caption text-ink-muted">⌘K</kbd></Button>
        <CommandMenu
          open={menu}
          onOpenChange={setMenu}
          title="Command menu"
          placeholder="Jump to a page, a creator or a campaign…"
          emptyText="Nothing matches."
          groups={[
            { heading: "Go to", items: [
              { id: "overview", label: "Overview", icon: LayoutDashboard, hint: "G O", onSelect: () => toast("Overview") },
              { id: "creators", label: "Creators", icon: Users, hint: "G C", onSelect: () => toast("Creators") },
              { id: "campaigns", label: "Campaigns", icon: Briefcase, hint: "G K", onSelect: () => toast("Campaigns") },
            ] },
          ]}
        />
      </Row>
    </Section>
  )
}
