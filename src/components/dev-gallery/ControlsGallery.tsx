"use client"

import { ArrowRight, AtSign, Building2, Globe, Plus, Search, Trash2, Wallet } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Combobox } from "@/components/ui/combobox"
import { ConfirmButton } from "@/components/ui/confirm-button"
import { DatePicker } from "@/components/ui/date-picker"
import { Input } from "@/components/ui/input"
import { SegmentedControl } from "@/components/ui/segmented-control"
import { Switch } from "@/components/ui/switch"
import { FormField } from "@/features/profile-fields/components/FormField"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { COUNTRY_OPTIONS } from "./fixtures"
import { Row, Section } from "./Specimen"

const VARIANTS = ["primary", "money", "quiet", "danger", "ghost", "link"] as const

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
        <Row label="icon disc">
          <Button icon={<ArrowRight />}>Continue</Button>
          <Button variant="money" size="sm" icon={<Wallet />}>Top up</Button>
          <Button variant="quiet" size="sm" icon={<Plus />}>New campaign</Button>
        </Row>
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
  const [on, setOn] = useState(true)
  return (
    <Section id="fields" title="Fields · Switch">
      <Row label="input">
        <FormField id="g-name" label="Campaign name" className="w-72"><Input id="g-name" placeholder="Spring launch" /></FormField>
        <FormField id="g-fee" label="Fee" className="w-72"><Input id="g-fee" defaultValue="450.00" className="num" /></FormField>
      </Row>
      <Row label="leading icon">
        <FormField id="g-company" label="Company" className="w-72"><Input id="g-company" leadingIcon={<Building2 />} placeholder="Zune" /></FormField>
        <FormField id="g-site" label="Website" className="w-72"><Input id="g-site" leadingIcon={<Globe />} defaultValue="zune.com" /></FormField>
        <FormField id="g-search" label="Search" className="w-72"><Input id="g-search" leadingIcon={<Search />} placeholder="Creators, campaigns" /></FormField>
      </Row>
      <Row label="invalid · disabled">
        <FormField id="g-url" label="Website" error="Enter a full address, like https://zune.com" className="w-72">
          <Input id="g-url" leadingIcon={<Globe />} defaultValue="zune" aria-invalid aria-describedby="g-url-error" />
        </FormField>
        <FormField id="g-dis" label="Handle" className="w-72"><Input id="g-dis" leadingIcon={<AtSign />} defaultValue="@locked" disabled /></FormField>
      </Row>
      <Row label="description · empty · filled">
        <FormField id="g-desc-empty" label="Company description" context="What you sell and who buys it, in two or three sentences." className="w-full max-w-md"><Textarea id="g-desc-empty" maxLength={2000} placeholder="What should creators know about you?" /></FormField>
        <FormField id="g-desc-filled" label="What customers care about" className="w-full max-w-md"><Textarea id="g-desc-filled" defaultValue={"Shipping a real product fast without hiring a team.\nA fixed price they can plan around, and owning the code at the end."} /></FormField>
      </Row>
      <Row label="focused · near limit">
        <FormField id="g-desc-focus" label="Bio" context="Focus shows the ring, the lift and the beam." className="w-full max-w-md"><Textarea id="g-desc-focus" defaultValue="Founder-turned-advisor writing about B2B go-to-market." /></FormField>
        <FormField id="g-desc-near" label="Offer note" className="w-full max-w-md"><Textarea id="g-desc-near" maxLength={112} defaultValue="Zune builds a founder's product in weeks, not months: a senior studio, one fixed price, full code handover." /></FormField>
      </Row>
      <Row label="bracketed · error">
        <FormField id="g-desc-bracket" label="Brief" className="w-full max-w-md"><Textarea id="g-desc-bracket" defaultValue="Open with the moment [your customer] realised their roadmap was [a number] weeks behind." /></FormField>
        <FormField id="g-desc-error" label="Feedback for the creator" error="Say what to change: at least 20 characters." className="w-full max-w-md"><Textarea id="g-desc-error" aria-invalid defaultValue="Too long." aria-describedby="g-desc-error-error" /></FormField>
      </Row>
      <Row label="switch">
        <span className="inline-flex items-center gap-3 text-body"><Switch id="g-sw-draft" checked={on} onCheckedChange={setOn} /><label htmlFor="g-sw-draft">Email me when a draft is ready</label></span>
        <span className="inline-flex items-center gap-3 text-body text-ink-muted"><Switch id="g-sw-digest" disabled /><label htmlFor="g-sw-digest">Weekly digest</label></span>
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
          <SelectTrigger className="w-64" aria-label="Sort creators"><SelectValue /></SelectTrigger>
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
