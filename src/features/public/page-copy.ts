import { BRAND } from "@/config/brand";
// Copy for the static public pages (/for-creators, /for-agencies, /pricing,
// /faq, /case-study, /about). Taken from the reference screenshots where they
// exist; anything paraphrased is marked in the stream report.

export const FOR_CREATORS = {
  hero: {
    badge: "2,000+ creators paid · 4.8/5 rating",
    title: "Get paid to post on LinkedIn",
    sub: "Choose deals from B2B brands you know, post in your own voice, and get paid within 24h. No negotiating, no admin. Creators earn",
    subStrong: "€500 on average per deal",
    primary: { href: "/register/creator", label: "Start earning" },
    secondary: { href: "/for-creators#how-it-works", label: "See how it works" },
    trust: "Free to join · No exclusivity · Paid within 24h",
    logosHeading: `The brands already on ${BRAND.name}`,
  },
  monetize: {
    title: `Monetize your content on ${BRAND.name}.`,
    sub: "Accept deals from brands you know, or bring your own onto the platform and get paid faster.",
    mediaKit: { name: "Robin Tempe", line: "B2B SaaS · Product", views: "97K views", reach: "34K reach", rateLabel: "Starting rate", rate: "€800 / post", caption: "Launch a professional media kit in minutes" },
    payment: { title: "Payment received", when: "Today", amount: "€5,000", method: "Instant · SEPA", campaign: "Attio campaign", line1: "Paid to your account", line2: "No invoice, no chasing", caption: "Instant payment" },
    network: { caption: "Get sponsored by our network", logos: ["lemlist", "gojiberry", "ringover", "folk.", "ChatSEO", `${BRAND.wordmark}`] },
    ownDeal: { title: "A deal you sourced", site: "yourbrand.com", amount: "€2,000", bonusLabel: `${BRAND.name} bonus`, bonus: "+ €300", note: "Contract & payout handled. You just close it.", caption: "Bring your own deals & earn extra" },
    request: { title: "Attio sent a collaboration request", tag: "Sponsored post", amount: "€1,000", deliver: "Deliver by · Aug 12 · 1 post + 1 repost", accept: "Accept", decline: "Decline", caption: "Workflows to accelerate collaborations" },
  },
  platform: {
    eyebrow: "The platform",
    title: "For creators who don't want the administrative burden.",
    sub: "Find deals, get paid, and track your performance from one dashboard. No invoicing, no chasing, no spreadsheets.",
    dashboard: {
      greeting: "Welcome back, Thomas 👋",
      status: "LinkedIn analytics active",
      tiles: [
        { label: "Total earnings", value: "€1,413.10", sub: "Across all collaborations" },
        { label: "Active collaborations", value: "13", sub: "13 deals in progress" },
        { label: "Post views", value: "1,266", sub: "In the last 30 days" },
      ],
      rows: [
        { company: "Gojiberry AI", tag: "SaaS", status: "Active", amount: "€1,296.90" },
        { company: `${BRAND.name}`, tag: "SaaS", status: "Active", amount: "€51.70" },
        { company: "Loop", tag: "Finance", status: "In review", amount: "€32.30" },
      ],
    },
    features: [
      { title: "Centralized opportunities", body: "Discover brand deals that match your audience." },
      { title: "Payments built-in", body: "Get paid on time with secure, transparent payouts." },
      { title: "Track performance", body: "See views, clicks and engagement in real time." },
      { title: "Easy delivery", body: "Manage deals and deliver content with ease." },
    ],
  },
  testimonial: {
    quote: "I was able to select my rate and get paid the moment the post went live",
    author: "Thomas Higadère",
    role: "B2B & AI creator · 34K followers",
  },
  results: {
    eyebrow: "The results",
    stats: [
      { value: "2,000+", label: "Creators earning" },
      { value: "€500", label: "Avg. per deal" },
      { value: "5K+", label: "Posts published" },
      { value: "24h", label: "Avg. payout time" },
    ],
  },
  faq: {
    title: "Frequently asked questions.",
    sub: "Everything you need to know before you start earning.",
    items: [
      { q: `What is ${BRAND.name}?`, a: `${BRAND.name} is the B2B LinkedIn creator marketplace: B2B brands book creators for sponsored LinkedIn posts at a fixed price per post that you set. Creators from about 1,000 to 500,000 followers use ${BRAND.name} to monetize their LinkedIn audience with deals from B2B brands they already know.` },
      { q: `Is ${BRAND.name} free for creators?`, a: "Yes. Joining is free and there is no monthly fee. You set a net price per post; the brand pays that price through the platform and you receive it in full." },
      { q: "How much can I earn?", a: `You set your own rate per post. The marketplace floor is €20 and the platform limit is €1,500 per post; typical rates sit between €300 and €1,500 depending on your audience, and creators earn around €500 per deal on average. ${BRAND.name} recommends a starting price from your public audience data when you build your card.` },
      { q: "How and when do I get paid?", a: `${BRAND.name} pays you within 24 hours of your post going live, by instant transfer or SEPA through Stripe Connect. Contracts and invoices are handled for you.` },
      { q: "Do I have to sign an exclusivity contract?", a: "No. There is no exclusivity. You choose which collaboration requests to accept and can keep working with brands directly." },
      { q: `What kind of brands are on ${BRAND.name}?`, a: `B2B software and services companies: SaaS, AI, sales tech, marketing tools, fintech, HR tech and more, mostly in Europe and North America. Brands like lemlist, Attio, folk, ringover and La Growth Machine run campaigns on ${BRAND.name}.` },
      { q: "Do I keep control of my content?", a: "Yes. You get a brief and an angle, then write the post in your own voice. Brands can request a limited number of revisions but never publish on your behalf." },
      { q: "How do I join?", a: "Create your creator account, add your public LinkedIn URL, pick up to three industries and confirm your price. It takes about two minutes and there is no commitment." },
    ],
  },
  cta: {
    eyebrow: "Ready to earn?",
    title: "You've seen how it works. Now get paid for it.",
    sub: "Takes 2 minutes. No commitment.",
    button: { href: "/register/creator", label: "Start earning" },
  },
} as const;

export const FOR_AGENCIES = {
  hero: {
    eyebrow: `${BRAND.name} for agencies`,
    title: "Choose the workspace that matches your agency.",
    sub: `${BRAND.name} separates brand operations from creator management. Choose your setup and create the right workspace for your agency.`,
    cta: { href: "/for-agencies#workspaces", label: "Choose your agency" },
  },
  workspaces: {
    eyebrow: "Two distinct products",
    title: "What does your agency manage?",
    options: [
      {
        n: "01",
        kind: "Brand agency",
        title: "I manage campaigns for companies",
        body: "Operate separate client workspaces, budgets, campaigns and reporting from one portfolio.",
        bullets: ["Create one workspace per client", "Add and allocate client budgets", "Track campaigns and next actions"],
        cta: { href: "/register/brand", label: "Create a brand agency workspace" },
        note: "You will create the agency manager account first.",
      },
      {
        n: "02",
        kind: "Creator agency",
        title: "I represent and manage creators",
        body: "Import your roster, manage every profile and run collaborations without creator logins.",
        bullets: ["Import any creator roster CSV", "Manage rates and creator profiles", "Track collaborations and earnings"],
        cta: { href: "/register/creator", label: "Create a creator agency workspace" },
        note: `Your creators do not need individual ${BRAND.name} accounts.`,
      },
    ],
  },
  call: {
    eyebrow: `Talk to ${BRAND.name}`,
    title: "Not sure which workspace fits your agency?",
    body: "Book a 30-minute agency call. We will look at how you manage clients or creators and point you to the right setup.",
    cta: { href: "/#cta", label: "Book a call" },
    note: `30 minutes with the ${BRAND.name} team. No commitment.`,
  },
  buildNote: "Agency mode (multi-client workspaces, roster import) is not part of this build: both buttons create a standard brand or creator account.",
} as const;

export const PRICING_PAGE = {
  hero: {
    eyebrow: "Pricing",
    title: "Start free. Upgrade when you want your time back.",
    sub: `Choose whether you want to run creator campaigns in-house or have ${BRAND.name} operate them. Campaign spend is always separate from the plan.`,
  },
  perPost: {
    title: "How per-post pricing works",
    items: [
      { title: "Creators set the price", body: "Every creator publishes a net price per post, from €20 up to the platform limit of €1,500, plus optional multi-post bundles." },
      { title: "You pay per published post", body: "No cost per click, no CPM, no retainer. Fund your wallet, book creators, and the post price is committed when the creator accepts." },
      { title: "Payouts are handled", body: "Approve content and pay every creator in one click via Stripe Connect. Contracts, invoices and approvals are handled for you." },
    ],
  },
  faqTitle: "Pricing questions",
  faqQuestions: ["How does per-post pricing work?", "What's the difference between Free and Done for you?", "Do you handle creator payouts?", "Can I upgrade or cancel anytime?"],
} as const;

export const FAQ_PAGE = {
  hero: { eyebrow: "FAQ", title: "Frequently asked questions.", sub: "For companies and for creators. Still stuck? Book a call from the CTA below." },
  companies: "For companies",
  creators: "For creators",
} as const;

export const CASE_STUDY_PAGE = {
  eyebrow: "Case study · LinkedIn creator campaign",
  brand: "BlogSEO",
  title: "How BlogSEO turned creator marketing into a measurable acquisition channel",
  sub: `After one €2,000 sponsored post returned just three sign-ups, BlogSEO rebuilt creator marketing on ${BRAND.name}, and turned it into predictable, trackable pipeline.`,
  tags: "B2B SaaS · SEO",
  video: { name: "Vincent Josse", role: "CEO & Founder, BlogSEO" },
  resultsTitle: "What one rebuilt quarter returned",
  headline: [
    { value: "9", label: "creators activated" },
    { value: "2,940", label: "qualified clicks" },
    { value: "512", label: "trials started" },
  ],
  detail: [
    { value: "150%", label: "Return on ad spend (ROAS)" },
    { value: "1,500+", label: "Qualified leads surfaced" },
    { value: "€5,000", label: "Campaign budget" },
  ],
  sections: [
    {
      n: "01",
      title: "The challenge",
      lead: `Before ${BRAND.name}, BlogSEO had already tested influencer marketing. They paid €2,000 for a single sponsored post and generated only three sign-ups.`,
      body: ["The conclusion was simple: creator marketing looked expensive, difficult to track, and impossible to scale with confidence.", "They didn't need more reach. They needed a predictable way to find relevant creators, activate them at scale, and turn engagement into pipeline."],
      compare: [
        { label: "Old approach", value: "€2,000", sub: "one sponsored post" },
        { label: "Result", value: "3 sign-ups", sub: "no way to trace or repeat it" },
      ],
    },
    {
      n: "02",
      title: "The campaign",
      lead: `BlogSEO launched a LinkedIn creator campaign with ${BRAND.name}, matched with ~10 relevant creators and a €5,000 budget.`,
      body: [`Over the campaign, creators published around 15 posts designed to reach BlogSEO's target audience and generate qualified demand. Every post was tracked through ${BRAND.name}, so the team could see which creators and which content generated real commercial intent.`],
      post: { title: "Creator campaign post", sub: `Tracked in ${BRAND.name} · LinkedIn`, text: "\"I fired my SEO agency. An AI agent now runs it.\", one of the creator posts that drove qualified demand for BlogSEO." },
    },
    {
      n: "03",
      title: "The results",
      lead: "For BlogSEO, the value wasn't just visibility. The campaign created a structured list of people who had engaged, 1,500+ qualified leads surfaced in the dashboard, ready to reactivate through outbound.",
      body: ["Instead of treating creator marketing as an awareness play, the team could connect creator content to leads, conversations, and revenue, landing at 150% ROAS."],
    },
  ],
  why: {
    n: "04",
    title: "Why it worked",
    sub: `The difference wasn't spending more on creators. ${BRAND.name} made the campaign operational.`,
    bullets: [
      "Relevant creator matching instead of one expensive bet on a single influencer",
      "Multiple posts and angles instead of relying on one piece of content",
      "Every post tracked, so the team knew which creators drove real intent",
      "A structured list of engaged accounts, ready for outbound follow-up",
    ],
  },
  quote: {
    text: `${BRAND.name} became one of our fastest acquisition channels. We know exactly what every creator brings.`,
    author: "Vincent Josse",
    role: "CEO & Founder, BlogSEO",
  },
} as const;

export const ABOUT_PAGE = {
  hero: { eyebrow: "Our story", title: "Built by founders, for founders.", sub: "The B2B LinkedIn creator marketplace connecting companies with vetted creators." },
  founders: [
    { name: "Alexis Jarre", first: "Alexis", role: "CMO & Co-founder" },
    { name: "Justine Namour", first: "Justine", role: "CTO & Co-founder" },
    { name: "Thomas Marcelle", first: "Thomas", role: "CEO & Co-founder" },
  ],
  facts: [
    { label: "Based in", value: "Paris" },
    { label: "Founded", value: "2025" },
    { label: "Creators", value: "2,000+" },
    { label: "Paying B2B brands", value: "30+" },
  ],
  started: {
    eyebrow: "How we started",
    title: "Built on Proven Results",
    paragraphs: [
      `${BRAND.name} connects companies that want to grow with LinkedIn creators who want to monetize their audience.`,
      "We believe growth works better when it's driven by people, not ads.",
      "That's why we help businesses scale through Creator-Led Growth: real professionals talking to real audiences.",
    ],
  },
  mission: {
    eyebrow: "Our mission",
    title: "Make creator marketing your most effective revenue channel.",
    lead: "We connect B2B companies with LinkedIn micro-creators who deliver:",
    bullets: ["Qualified traffic from audiences that already trust the creator", "Leads and pipeline you can trace back to the exact post", "A channel that costs a fraction of LinkedIn Ads per lead"],
  },
} as const;
