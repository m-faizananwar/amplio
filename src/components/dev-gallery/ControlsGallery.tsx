"use client"

import { Plus, Trash2 } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Combobox } from "@/components/ui/combobox"
import { ConfirmButton } from "@/components/ui/confirm-button"
import { DatePicker } from "@/components/ui/date-picker"
import { Input } from "@/components/ui/input"
import { SegmentedControl } from "@/components/ui/segmented-control"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { COUNTRY_OPTIONS } from "./fixtures"
import { Row, Section } from "./Specimen"

const VARIANTS = ["primary", "secondary", "ghost", "danger", "link"] as const

export function ControlsGallery() {
  return (
    <>
      <Section id="buttons" title="Button">
        {VARIANTS.map((v) => (
          <Row key={v} label={v}>
            <Button variant={v}>Save changes</Button>
            <Button variant={v} size="sm"><Plus />Small</Button>
            <Button variant={v} disabled>Disabled</Button>
          </Row>
        ))}
        <Row label="icon"><Button variant="secondary" size="icon" aria-label="Add"><Plus /></Button><Button variant="ghost" size="icon-sm" aria-label="Add"><Plus /></Button></Row>
        <Row label="confirm step">
          <ConfirmButton confirmLabel="Click again to delete" onConfirm={() => new Promise((r) => setTimeout(r, 600))}><Trash2 />Delete campaign</ConfirmButton>
        </Row>
      </Section>
      <FieldsSection />
      <ChoiceSection />
    </>
  )
}

function FieldsSection() {
  return (
    <Section id="fields" title="Input · Textarea">
      <Row label="input">
        <div className="grid w-72 gap-1.5"><label htmlFor="g-name" className="text-small font-medium">Campaign name</label><Input id="g-name" placeholder="Spring launch" /></div>
        <div className="grid w-72 gap-1.5"><label htmlFor="g-fee" className="text-small font-medium">Fee</label><Input id="g-fee" defaultValue="450.00" className="num" /></div>
      </Row>
      <Row label="invalid · disabled">
        <div className="grid w-72 gap-1.5">
          <label htmlFor="g-url" className="text-small font-medium">Website</label>
          <Input id="g-url" defaultValue="zune" aria-invalid aria-describedby="g-url-err" />
          <p id="g-url-err" className="text-caption text-failure">Enter a full address, like https://zune.com</p>
        </div>
        <div className="grid w-72 gap-1.5"><label htmlFor="g-dis" className="text-small font-medium">Handle</label><Input id="g-dis" defaultValue="@locked" disabled /></div>
      </Row>
      <Row label="textarea">
        <div className="grid w-full max-w-lg gap-1.5"><label htmlFor="g-brief" className="text-small font-medium">Hook</label><Textarea id="g-brief" placeholder="What should the post open with?" /></div>
      </Row>
    </Section>
  )
}

function ChoiceSection() {
  const [country, setCountry] = useState<string | null>("FR")
  const [date, setDate] = useState<string | null>(null)
  const [role, setRole] = useState<"brand" | "creator">("brand")
  const [range, setRange] = useState<"week" | "month" | "year">("month")
  return (
    <Section id="choices" title="Select · Combobox · DatePicker · SegmentedControl · Tabs">
      <Row label="select">
        <Select defaultValue="best" items={[{ value: "best", label: "Best fit" }, { value: "price", label: "Lowest price" }, { value: "followers", label: "Most followers" }]}>
          <SelectTrigger className="w-56" aria-label="Sort creators"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="best">Best fit</SelectItem>
            <SelectItem value="price">Lowest price</SelectItem>
            <SelectItem value="followers">Most followers</SelectItem>
          </SelectContent>
        </Select>
      </Row>
      <Row label="combobox"><Combobox className="w-72" options={COUNTRY_OPTIONS} value={country} onValueChange={setCountry} placeholder="Search a country" emptyText="No country matches" aria-label="Country" /></Row>
      <Row label="date picker"><div className="w-72"><DatePicker value={date} onValueChange={setDate} min={new Date().toISOString().slice(0, 10)} placeholder="Pick a post date" /></div></Row>
      <Row label="segmented">
        <SegmentedControl label="I am a" value={role} onValueChange={setRole} options={[{ value: "brand", label: "Brand" }, { value: "creator", label: "Creator" }]} />
        <SegmentedControl size="sm" label="Range" value={range} onValueChange={setRange} options={[{ value: "week", label: "Week" }, { value: "month", label: "Month" }, { value: "year", label: "Year" }]} />
      </Row>
      <Row label="tabs · line">
        <Tabs defaultValue="collabs" className="w-full max-w-xl">
          <TabsList><TabsTrigger value="collabs">Collaborations</TabsTrigger><TabsTrigger value="brief">Brief</TabsTrigger><TabsTrigger value="shortlist">Shortlist</TabsTrigger><TabsTrigger value="analytics">Analytics</TabsTrigger></TabsList>
          <TabsContent value="collabs" className="text-ink-muted">Rows with the next action and who owns it.</TabsContent>
          <TabsContent value="brief" className="text-ink-muted">Industries, geographies, hook, angle, avoid.</TabsContent>
          <TabsContent value="shortlist" className="text-ink-muted">Creators you saved for this campaign.</TabsContent>
          <TabsContent value="analytics" className="text-ink-muted">Clicks per day, each one a row.</TabsContent>
        </Tabs>
      </Row>
      <Row label="tabs · pill">
        <Tabs defaultValue="all"><TabsList variant="pill"><TabsTrigger value="all">All</TabsTrigger><TabsTrigger value="needs">Needs you</TabsTrigger><TabsTrigger value="done">Done</TabsTrigger></TabsList></Tabs>
      </Row>
    </Section>
  )
}
