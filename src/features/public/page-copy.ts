import { BRAND } from "@/config/brand";
// Copy for the static public pages (/for-creators, /pricing, /faq). Taken
// from the reference screenshots where they
// exist; anything paraphrased is marked in the stream report.

export const FOR_CREATORS = {
  hero: {
    title: "Get paid to post on LinkedIn",
    sub: "Choose deals from B2B brands you know, post in your own voice, and set your own price per post. No negotiating, no admin.",
    subStrong: "",
    primary: { href: "/register/creator", label: "Start earning" },
    secondary: { href: "/for-creators#how-it-works", label: "See how it works" },
    trust: "Free to join · No exclusivity · You set the price",
  },
  monetize: {
    title: `Monetize your content on ${BRAND.name}.`,
    sub: "Accept deals from brands you know, or bring your own onto the platform and get paid faster.",
    mediaKit: { name: "Robin Tempe", line: "B2B SaaS · Product", views: "97K views", reach: "34K reach", rateLabel: "Starting rate", rate: "€800 / post", caption: "Launch a professional media kit in minutes" },
    payment: { title: "Payment received", when: "Today", amount: "€5,000", method: "Instant · SEPA", campaign: "Attio campaign", line1: "Paid to your account", line2: "No invoice, no chasing", caption: "Instant payment" },
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
  faq: {
    title: "Frequently asked questions.",
    sub: "Everything you need to know before you start earning.",
    items: [
      { q: `What is ${BRAND.name}?`, a: `${BRAND.name} is the B2B LinkedIn creator marketplace: B2B brands book creators for sponsored LinkedIn posts at a fixed price per post that you set. Creators from about 1,000 to 500,000 followers use ${BRAND.name} to monetize their LinkedIn audience with deals from B2B brands they already know.` },
      { q: `Is ${BRAND.name} free for creators?`, a: "Yes. Joining is free and there is no monthly fee. You set a net price per post; the brand pays that price through the platform and you receive it in full." },
      { q: "How much can I earn?", a: `You set your own rate per post. The marketplace floor is €20 and the platform limit is €1,500 per post; typical rates sit between €300 and €1,500 depending on your audience, and creators earn around €500 per deal on average. ${BRAND.name} recommends a starting price from your public audience data when you build your card.` },
      { q: "How and when do I get paid?", a: `When the brand approves your live post, the amount moves from their wallet to your earnings in ${BRAND.name}, with a ledger row you can open. Payouts to a bank are a Stripe Connect stub in this build: the flow is shown, no money moves.` },
      { q: "Do I have to sign an exclusivity contract?", a: "No. There is no exclusivity. You choose which collaboration requests to accept and can keep working with brands directly." },
      { q: `What kind of brands are on ${BRAND.name}?`, a: `B2B software and services companies: SaaS, AI, sales tech, marketing tools, fintech, HR tech and more, mostly in Europe and North America.` },
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
