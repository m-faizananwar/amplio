"use client"

import { Inbox, Users } from "lucide-react"
import { useMemo, useState } from "react"
import { TrailDrawer } from "@/components/trail/TrailDrawer"
import { Button } from "@/components/ui/button"
import { PersonAvatar } from "@/components/ui/avatar"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { RingWidget } from "@/components/ui/ring-widget"
import { StatCard } from "@/components/ui/stat-card"
import { StatusChip, statusTone } from "@/components/ui/status-chip"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SortableHead, TableEmpty, nextSort, type SortDirection } from "@/components/ui/table-parts"
import { avatarFor } from "@/lib/avatar"
import { STATUS_LABELS } from "@/lib/collaboration-labels"
import { SPARK, STATUSES, TABLE_ROWS, TRAIL_ROWS, type GalleryRow } from "./fixtures"
import { Row, Section } from "./Specimen"

const euros = (cents: number) => `€${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`

export function DataGallery() {
  return (
    <>
      <StatsSection />
      <Section id="chips" title="StatusChip · Avatar">
        <Row label="collaboration">{STATUSES.map((s) => <StatusChip key={s} tone={statusTone(s)} status={s}>{STATUS_LABELS[s]}</StatusChip>)}</Row>
        <Row label="avatar">
          <PersonAvatar name="Tom Bechtelar" src={avatarFor("Tom Bechtelar")} size="lg" />
          <PersonAvatar name="Tom Bechtelar" src={avatarFor("Tom Bechtelar")} />
          <PersonAvatar name="Althea Altenwerth" size="lg" />
          <PersonAvatar name="Zune" size="sm" />
        </Row>
      </Section>
      <TableSection />
      <Section id="empty" title="EmptyState · Skeleton">
        <Row label="empty"><EmptyState className="w-full max-w-xl" icon={Inbox} title="No drafts to review" body="When a creator sends a draft it lands here, with the post and the brief side by side." action={<Button variant="secondary">Invite creators</Button>} /></Row>
        <Row label="skeleton"><div className="grid w-72 gap-2"><Skeleton className="h-4 w-40" /><Skeleton className="h-8 w-28" /><Skeleton className="h-3 w-56" /></div></Row>
      </Section>
    </>
  )
}

function StatsSection() {
  const [clicks, setClicks] = useState(640)
  const [open, setOpen] = useState(false)
  return (
    <Section id="stats" title="StatCard · RingWidget · rolling number · trail drawer">
      <Row label="ring">
        <RingWidget className="w-full max-w-xl" label="Collaborations" totalLabel="in progress" segments={[
          { key: "needs_you", label: "Needs you", count: 4, href: "/brand/collaborations?filter=needs_you" },
          { key: "waiting", label: "Waiting on creators", count: 6, href: "/brand/collaborations?filter=waiting" },
          { key: "live", label: "Live", count: 3, href: "/brand/collaborations?filter=live" },
          { key: "done", label: "Done", count: 9, href: "/brand/collaborations?filter=done" },
        ]} />
      </Row>
      <Row label="cards">
        <div className="grid w-full gap-4 md:grid-cols-3">
          <StatCard label="Qualified clicks" value={clicks} spark={SPARK} delta={{ label: "+12%", direction: "up", good: true }} hint="last 30 days" onOpen={() => setOpen(true)} />
          <StatCard label="Committed budget" value={449000} format={euros} tone="money" hint="9 bookings" onOpen={() => setOpen(true)} />
          <StatCard label="Creators activated" value={7} hint="accepted and beyond" />
        </div>
      </Row>
      <Row label="roll"><Button variant="secondary" size="sm" onClick={() => setClicks((c) => c + Math.ceil(Math.random() * 40))}>Add clicks</Button></Row>
      <TrailDrawer open={open} onOpenChange={setOpen} title="Qualified clicks" total={`${clicks} clicks · last 30 days`} rows={TRAIL_ROWS} emptyText="No clicks yet." exportHref="#" />
    </Section>
  )
}

type Key = "creator" | "clicks" | "feeCents"

function TableSection() {
  const [sort, setSort] = useState<{ key: Key; direction: SortDirection }>({ key: "clicks", direction: "desc" })
  const rows = useMemo(() => sorted(TABLE_ROWS, sort), [sort])
  const dir = (key: Key) => (sort.key === key ? sort.direction : null)
  return (
    <Section id="table" title="Table">
      <Row label="sortable">
        <Table framed containerClassName="w-full max-w-3xl">
          <TableHeader><TableRow>
            <SortableHead direction={dir("creator")} onSort={() => setSort(nextSort(sort, "creator"))}>Creator</SortableHead>
            <TableHead>Status</TableHead>
            <SortableHead align="right" direction={dir("clicks")} onSort={() => setSort(nextSort(sort, "clicks"))}>Clicks</SortableHead>
            <SortableHead align="right" direction={dir("feeCents")} onSort={() => setSort(nextSort(sort, "feeCents"))}>Fee</SortableHead>
          </TableRow></TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.creator}</TableCell>
                <TableCell><StatusChip tone={statusTone(r.status)} status={r.status}>{STATUS_LABELS[r.status]}</StatusChip></TableCell>
                <TableCell className="num text-right">{r.clicks}</TableCell>
                <TableCell className="num text-right">{euros(r.feeCents)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Row>
      <Row label="empty">
        <Table framed containerClassName="w-full max-w-3xl">
          <TableHeader><TableRow><TableHead>Creator</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Clicks</TableHead></TableRow></TableHeader>
          <TableBody><TableEmpty colSpan={3}><EmptyState size="compact" icon={Users} title="No collaborations yet" body="Invite a creator from the Creators page to start one." action={<Button size="sm">Find creators</Button>} /></TableEmpty></TableBody>
        </Table>
      </Row>
    </Section>
  )
}

function sorted(rows: GalleryRow[], sort: { key: Key; direction: SortDirection }) {
  const sign = sort.direction === "asc" ? 1 : -1
  return [...rows].sort((a, b) => (a[sort.key] > b[sort.key] ? sign : a[sort.key] < b[sort.key] ? -sign : 0))
}
