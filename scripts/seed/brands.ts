import type { Brief, BrandIcp } from "@/db/schema";
import { daysAgo, daysFromNow, hex } from "./random";

import { BRAND } from "@/config/brand";
export const DEFAULT_DO = [
  "Use only the confirmed information about {Company}.",
  "Connect the product to a practical audience question.",
  "Disclose the sponsored partnership clearly.",
];
export const DEFAULT_AVOID = [
  "Do not invent customers, results, figures or features.",
  "Do not force an endorsement or promise outcomes.",
];
const DEFAULT_TONE = "Clear, useful and natural. Keep the creator's own voice rather than following a script.";

export type CampaignFixture = {
  key: string;
  name: string;
  description: string;
  status: "draft" | "active" | "completed";
  openToApplications: boolean;
  postDeadline: Date | null;
  defaultFeeCents: number;
  brief: Brief;
  createdAt: Date;
};

export type BrandFixture = {
  key: "zune" | "premium-inboxes" | "orbisearch";
  slug: string;
  company: string;
  website: string;
  valueProp: string;
  icps: BrandIcp[];
  targetIndustries: string[];
  targetRegions: string[];
  pixelSiteKey: string;
  owner: { firstName: string; lastName: string; email: string };
  topupCents: number;
  campaigns: CampaignFixture[];
};

function brief(company: string, partial: Partial<Brief> & Pick<Brief, "whatToTell" | "angles">): Brief {
  return {
    targetIndustries: ["B2B", "SaaS"],
    targetGeos: ["Europe", "North America"],
    tone: DEFAULT_TONE,
    do: DEFAULT_DO.map((line) => line.replace("{Company}", company)),
    avoid: DEFAULT_AVOID,
    links: [],
    ...partial,
  };
}

// The demo brand. Value prop and ICPs are a real onboarding output for
// zune, verbatim.
const zune: BrandFixture = {
  key: "zune",
  slug: "zune",
  company: "Zune",
  website: "https://zune.dev",
  valueProp:
    "Zune is an AI product studio that designs, builds, and hands over high-performance websites, web applications, and AI " +
    "systems for ambitious companies. A senior in-house team—based in Islamabad and serving UK and EU clients—takes projects " +
    "from discovery through production launch, with no subcontractors or handoffs. The studio combines brand strategy, product " +
    "design, and modern engineering (React, Next.js, RAG pipelines, LLM features) to create scalable digital products that " +
    "compound over time. Clients own 100% of the code and infrastructure on day one, avoiding vendor lock-in. Typical " +
    "engagements are scoped after discovery and delivered in 6-week fixed-price builds, starting from £4k for websites to " +
    "£12k+ for web applications and AI systems.",
  icps: [
    {
      title: "Founder / CEO of Early-Stage SaaS",
      description:
        "Leads a 10–50 person SaaS company or venture-backed startup that has outgrown its initial MVP and needs a cohesive " +
        "product redesign, AI-powered features, or a new customer-facing application. Frustrated by fragmented agency work, " +
        "scope creep, and lack of ownership over code and design systems. Zune's fixed-price discovery-to-launch model, senior " +
        "team continuity, and full code handover align with the need for speed, quality, and long-term product control.",
    },
    {
      title: "Product Director at Mid-Market B2B Company",
      description:
        "Owns digital transformation or product modernization at a 100–500 person established company (fintech, healthtech, " +
        "logistics, or enterprise SaaS). Needs to rebuild internal tools, dashboards, or customer portals with modern UX and " +
        "AI-driven automation, but internal teams lack design and full-stack engineering capacity. Values a single accountable " +
        "partner who can diagnose problems, deliver production-grade code, and train the team to maintain it post-launch.",
    },
    {
      title: "Marketing / Growth Leader at B2B Service Firm",
      description:
        "Responsible for brand presence and lead generation at a consulting, agency, or professional services firm (50–200 " +
        "people) that has outgrown its website and needs a redesigned marketing site, SEO-optimized content platform, or " +
        "AI-powered lead qualification system. Seeks a partner who understands brand strategy, can deliver a site that reflects " +
        "studio quality, and can integrate automation (e.g., AI chatbots, retrieval-based search) to improve conversion and " +
        "customer experience.",
    },
  ],
  targetIndustries: ["B2B", "SaaS", "AI"],
  targetRegions: ["Europe"],
  pixelSiteKey: `nn_${hex(32)}`,
  owner: { firstName: "Demo", lastName: "Brand", email: `brand@${BRAND.demoDomain}` },
  topupCents: 1_000_000,
  campaigns: [
    {
      key: "zune-main",
      name: "Zune creator brief",
      description: "Senior product studio, fixed-price builds, full code handover. Creators show what changes when one team owns discovery to launch.",
      status: "active",
      openToApplications: true,
      postDeadline: daysFromNow(12),
      defaultFeeCents: 40_000,
      createdAt: daysAgo(31),
      brief: brief("Zune", {
        whatToTell:
          "Zune is described by the company as an AI product studio that designs, builds, and hands over high-performance websites, web applications, and AI systems for ambitious companies, delivered by a senior in-house team in 6-week fixed-price builds with full code handover. The intended audience is professionals connected to B2B, SaaS, AI in Europe. Introduce the product through your own expertise, adapt the angle to your audience, and keep every claim grounded in the confirmed company profile.",
        targetIndustries: ["B2B", "SaaS", "AI"],
        targetGeos: ["Europe"],
        links: ["https://zune.dev"],
        angles: [
          {
            angle: "A practical introduction",
            hook: "Most SaaS redesigns fail before the first screen: nobody owns the outcome.",
            direction: "Walk through what a discovery-to-launch build looks like when one senior team owns it end to end. Keep it concrete: weeks, deliverables, what the client keeps.",
            example:
              "Six weeks, one team, fixed price, and on day one the client owns every line of code. That's the whole pitch, and it's rarer than it should be.",
          },
          {
            angle: "Own your code on day one",
            hook: "Vendor lock-in is the tax you pay for not asking one question.",
            direction: "Contrast agency retainers where the client rents its own product with full code and infrastructure handover. No dunking on agencies.",
            example:
              "Ask any agency: 'if we leave tomorrow, what do we keep?' The good ones answer 'everything'. Zune's model is built around that answer.",
          },
          {
            angle: "AI features that ship",
            hook: "Every SaaS roadmap has 'add AI' on it. Almost none have a shipping date.",
            direction: "Explain what it takes to get a RAG or LLM feature into production, with one real anecdote. Disclose the partnership in the first three lines.",
            example:
              "Sponsored, and I'd say this anyway: the difference between an AI demo and an AI feature is the boring engineering around it. Zune does the boring part.",
          },
        ],
      }),
    },
    {
      key: "zune-q4",
      name: "Zune — Q4 founders push",
      description: "Second wave targeting SaaS founders in DACH and the Nordics.",
      status: "draft",
      openToApplications: false,
      postDeadline: null,
      defaultFeeCents: 40_000,
      createdAt: daysAgo(3),
      brief: brief("Zune", {
        whatToTell: "Same studio story, angled at founders who just raised and need a product rebuild before the next round.",
        targetGeos: ["Europe"],
        angles: [
          {
            angle: "Rebuild before the round",
            hook: "Investors don't fund a roadmap slide. They fund the product they can click.",
            direction: "Draft — to be completed with AI.",
            example: "",
          },
        ],
      }),
    },
  ],
};

const premiumInboxes: BrandFixture = {
  key: "premium-inboxes",
  slug: "premium-inboxes",
  company: "Premium Inboxes",
  website: "https://premiuminboxes.com",
  valueProp:
    "Premium Inboxes provides pre-warmed sending domains and mailboxes so outbound teams land in the inbox from day one.",
  icps: [
    { title: "Head of Outbound at a B2B SaaS", description: "Runs cold email at scale, fights deliverability every week." },
    { title: "Lead-gen agency founder", description: "Manages dozens of client domains and can't afford a blacklisting." },
    { title: "SDR team lead", description: "Owns reply rate targets and mailbox health for a team of 5–15." },
  ],
  targetIndustries: ["Outreach", "Sales", "B2B"],
  targetRegions: ["Europe", "North America"],
  pixelSiteKey: `nn_${hex(32)}`,
  owner: { firstName: "Léa", lastName: "Moreau", email: "lea@premiuminboxes.example" },
  topupCents: 600_000,
  campaigns: [
    {
      key: "pi-main",
      name: "Main campaign",
      description: "Deliverability stories from people who run outbound for a living.",
      status: "active",
      openToApplications: true,
      postDeadline: daysFromNow(6),
      defaultFeeCents: 30_000,
      createdAt: daysAgo(20),
      brief: brief("Premium Inboxes", {
        whatToTell: "Warm domains and mailboxes that land in the inbox on day one. Tell a deliverability story from your own outbound.",
        targetIndustries: ["Outreach", "Sales", "B2B"],
        links: ["https://premiuminboxes.com"],
        angles: [
          {
            angle: "The day the domain got burned",
            hook: "We lost a month of pipeline to one blacklisting.",
            direction: "Personal story, then what you'd do differently with pre-warmed infrastructure.",
            example: "Our reply rate went from 9% to 0.4% in a week. Nobody changed the copy. The domain was gone.",
          },
        ],
      }),
    },
    {
      key: "pi-spring",
      name: "Launch — spring wave",
      description: "First creator wave for the new inbox rotation feature.",
      status: "completed",
      openToApplications: false,
      postDeadline: daysAgo(40),
      defaultFeeCents: 30_000,
      createdAt: daysAgo(75),
      brief: brief("Premium Inboxes", {
        whatToTell: "Inbox rotation launch: spread sends across mailboxes automatically.",
        targetIndustries: ["Outreach", "Sales"],
        angles: [
          {
            angle: "Rotation, explained simply",
            hook: "One mailbox sending 200 emails a day is a smoke signal.",
            direction: "Explain rotation like you'd explain it to a founder.",
            example: "Spread 200 sends over 10 mailboxes and every one of them looks human. That's the whole trick.",
          },
        ],
      }),
    },
    {
      key: "pi-agencies",
      name: "Agency wave — deliverability for lead-gen teams",
      description: "Creators who run outbound for clients explain what pre-warmed infrastructure changes.",
      status: "active",
      openToApplications: true,
      postDeadline: daysFromNow(9),
      defaultFeeCents: 30_000,
      createdAt: daysAgo(4),
      brief: brief("Premium Inboxes", {
        whatToTell: "Pre-warmed domains and mailboxes for agencies that manage dozens of client domains. Tell the story of one client account you would not risk on unproven infrastructure.",
        targetIndustries: ["Outreach", "Sales", "Growth / GTM"],
        links: ["https://premiuminboxes.com"],
        angles: [
          {
            angle: "One client, one blacklisting",
            hook: "Agencies don't lose clients to bad copy. They lose them to a blacklisted domain.",
            direction: "A concrete account story, then the infrastructure lesson.",
            example: "The client noticed before we did. Replies dropped to zero on a Tuesday; by Thursday the domain was gone. Never again.",
          },
        ],
      }),
    },
  ],
};

const orbisearch: BrandFixture = {
  key: "orbisearch",
  slug: "orbisearch",
  company: "OrbiSearch",
  website: "https://orbisearch.example",
  valueProp: "OrbiSearch is enterprise search for product and support teams: one box over docs, tickets and Slack.",
  icps: [
    { title: "Head of Support at a scale-up", description: "Wants agents to find the answer in one search, not five tabs." },
    { title: "Product Ops lead", description: "Owns internal knowledge; tired of stale wikis." },
    { title: "CTO of a 50–200 person SaaS", description: "Evaluates search and RAG tooling, cares about permissions." },
  ],
  targetIndustries: ["Customer Support", "Productivity", "AI", "SaaS"],
  targetRegions: ["Europe", "North America"],
  pixelSiteKey: `nn_${hex(32)}`,
  owner: { firstName: "Jonas", lastName: "Weber", email: "jonas@orbisearch.example" },
  topupCents: 400_000,
  campaigns: [
    {
      key: "orbi-main",
      name: "Main campaign",
      description: "Show what changes when support finds answers in one search.",
      status: "active",
      openToApplications: true,
      postDeadline: daysFromNow(6),
      defaultFeeCents: 35_000,
      createdAt: daysAgo(18),
      brief: brief("OrbiSearch", {
        whatToTell: "One search box over docs, tickets and Slack. Tell the story of a support or product team that stopped hunting for answers.",
        targetIndustries: ["Customer Support", "Productivity", "AI"],
        links: ["https://orbisearch.example"],
        angles: [
          {
            angle: "Five tabs to one",
            hook: "Your support team's real job is search.",
            direction: "Quantify the tab-hunting. Then show one search.",
            example: "I timed it: 4 minutes 20 seconds per ticket spent looking, not answering. That's the whole product story.",
          },
        ],
      }),
    },
    {
      key: "orbi-product",
      name: "Product teams — one search over docs and Slack",
      description: "Product and ops leads on the cost of knowledge scattered across tools.",
      status: "active",
      openToApplications: true,
      postDeadline: daysFromNow(11),
      defaultFeeCents: 35_000,
      createdAt: daysAgo(3),
      brief: brief("OrbiSearch", {
        whatToTell: "One search box over docs, tickets and Slack, with permissions respected. Tell the story of a product or ops team that stopped re-answering the same question.",
        targetIndustries: ["Productivity", "AI", "SaaS", "Data / Analytics"],
        links: ["https://orbisearch.example"],
        angles: [
          {
            angle: "The question asked 40 times",
            hook: "Your team answered the same question 40 times last quarter. Search should have answered it once.",
            direction: "Quantify the repeat questions, then show one search.",
            example: "I counted: 40 Slack threads, same question, four different answers. One search box with the right permissions ended it.",
          },
        ],
      }),
    },
  ],
};

export const BRANDS: BrandFixture[] = [zune, premiumInboxes, orbisearch];
