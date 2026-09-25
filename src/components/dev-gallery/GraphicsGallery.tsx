"use client"

import { RotateCcw } from "lucide-react"
import { useState } from "react"
import { AudienceOrbit } from "@/components/graphics/AudienceOrbit"
import { Burst } from "@/components/graphics/Burst"
import { DrawOnPath } from "@/components/graphics/DrawOnPath"
import { FitRing } from "@/components/graphics/FitRing"
import { BlankBriefScene, JoiningDotsScene, LinkRipplesScene, TypingScene } from "@/components/graphics/scenes"
import { Stamp } from "@/components/graphics/Stamp"
import { StatusGlyph } from "@/components/graphics/StatusGlyph"
import { TrailLoader } from "@/components/graphics/TrailLoader"
import { PersonAvatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { RollingNumber } from "@/components/ui/rolling-number"
import { Sparkline } from "@/components/ui/sparkline"
import { STATUS_LABELS } from "@/lib/collaboration-labels"
import { SPARK, STATUSES } from "./fixtures"
import { Row, Section } from "./Specimen"

const NUMBERS = [1284, 1391, 20750, 988]
const ORBIT_FOLLOWERS = [1_800, 12_000, 64_000]
const ORBIT_TITLES = ["Founders", "Heads of sales", "RevOps"]

// The motion kit, every piece in one place. "Replay" remounts the section so
// each draw-in runs again; with reduced motion on, everything shows its last
// frame, which is the check for that rule.
export function GraphicsGallery() {
  const [run, setRun] = useState(0)
  const [step, setStep] = useState(0)
  const [n, setN] = useState(0)
  const status = STATUSES[step % STATUSES.length] ?? "invited"
  return (
    <Section id="motion" title="Motion · graphics">
      <Row label="replay">
        <Button variant="secondary" size="sm" onClick={() => setRun((r) => r + 1)}><RotateCcw aria-hidden="true" />Replay all</Button>
      </Row>
      <div key={run} className="grid gap-8">
        <Row label="DrawOnPath">
          <svg viewBox="0 0 120 48" className="h-12 w-30 text-ink" aria-hidden="true">
            <DrawOnPath d="M8 38 L60 22 L112 10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </Row>
        <Row label="TrailLoader"><TrailLoader label="Loading" /></Row>
        <Row label="StatusGlyph">
          {STATUSES.map((s) => <span key={s} className="inline-flex items-center gap-1.5 text-small text-ink-muted"><StatusGlyph status={s} className="size-4 text-ink" />{STATUS_LABELS[s]}</span>)}
        </Row>
        <Row label="glyph morph">
          <span className="inline-flex items-center gap-2 text-small"><StatusGlyph key={status} status={status} className="size-5 text-ink" />{STATUS_LABELS[status]}</span>
          <Button variant="secondary" size="sm" onClick={() => setStep((s) => s + 1)}>Next state</Button>
        </Row>
        <Row label="FitRing">{[42, 71, 93].map((score) => <span key={score} className="num inline-flex items-center gap-1.5 text-small"><FitRing score={score} />{score}%</span>)}</Row>
        <Row label="AudienceOrbit">
          {ORBIT_FOLLOWERS.map((followers) => (
            <AudienceOrbit key={followers} followers={followers} topTitles={ORBIT_TITLES}>
              <PersonAvatar name="Tom Bechtelar" size="lg" />
            </AudienceOrbit>
          ))}
        </Row>
        <Row label="Sparkline"><Sparkline points={SPARK} /><Sparkline points={SPARK} tone="money" /></Row>
        <Row label="RollingNumber">
          <span className="text-h3 font-semibold"><RollingNumber value={NUMBERS[n % NUMBERS.length] ?? 0} /></span>
          <Button variant="secondary" size="sm" onClick={() => setN((v) => v + 1)}>Change</Button>
        </Row>
        <Row label="Stamp"><Stamp>PAID</Stamp><Stamp tone="ink">APPROVED</Stamp></Row>
        <Row label="Burst"><span className="relative inline-flex size-10 items-center justify-center"><Burst /></span></Row>
        <Row label="empty scenes">
          <BlankBriefScene />
          <JoiningDotsScene />
          <LinkRipplesScene />
          <TypingScene />
        </Row>
      </div>
    </Section>
  )
}
