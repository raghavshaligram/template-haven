import budgetImg from "@/assets/art-budget.svg";
import budgetDark from "@/assets/art-budget-dark.svg";
import debtImg from "@/assets/art-debt.svg";
import debtDark from "@/assets/art-debt-dark.svg";
import billsImg from "@/assets/art-bills.svg";
import billsDark from "@/assets/art-bills-dark.svg";
import bundleImg from "@/assets/art-bundle.svg";
import bundleDark from "@/assets/art-bundle-dark.svg";
import freebieImg from "@/assets/art-freebie.svg";
import freebieDark from "@/assets/art-freebie-dark.svg";
import businessImg from "@/assets/art-business.svg";
import businessDark from "@/assets/art-business-dark.svg";

export type Colorway = { name: string; hex: string };

export type ProductFaq = { q: string; a: string };

export type Product = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: {
    headline: string;
    sections: { title: string; bullets: string[] }[];
    receive: string[];
    after: string[];
    disclaimers: string[];
  };
  price: number;
  sale_price: number;
  category: string;
  colorway_variants: Colorway[];
  images: string[];
  download_url: string;
  rating_avg: number;
  review_count: number;
  tags: string[];
  is_bundle: boolean;
  bundle_components: string[];
  is_plr: boolean;
  best_seller?: boolean;
  created: string;
  // Optional rich marketing content — rendered on the product page when present.
  // Every future tracker can populate these with its own copy.
  hero_title?: string;
  hero_subtitle?: string;
  meta_description?: string;
  whats_included?: string[];
  how_it_works?: string[];
  perfect_for?: string[];
  why_this?: string[];
  faqs?: ProductFaq[];
  bundle_callout?: { text: string; slug: string };
};

export type Review = {
  id: string;
  product_id: string;
  reviewer_name: string;
  rating: number;
  text: string;
  date: string;
  photo_url?: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
};

const LIGHT: Colorway = { name: "Light", hex: "#F3EFE6" };
const DARK: Colorway = { name: "Dark", hex: "#2B2B2B" };
const SAGE: Colorway = { name: "Sage", hex: "#2D5F4F" };

export const categories: Category[] = [
  {
    id: "c1",
    name: "Personal Finance",
    slug: "personal-finance",
    description: "Budgets, debt payoff plans and bill trackers that keep your money calm.",
    image: budgetImg,
  },
  {
    id: "c2",
    name: "Business Tools",
    slug: "business-tools",
    description: "Profit, expense and invoicing sheets built for small teams of one.",
    image: businessImg,
  },
  {
    id: "c3",
    name: "Organization",
    slug: "organization",
    description: "Planners and trackers that turn a messy week into a clear one.",
    image: billsImg,
  },
  {
    id: "c4",
    name: "Bundles",
    slug: "bundles",
    description: "Our best templates grouped together for one lower price.",
    image: bundleImg,
  },
  {
    id: "c5",
    name: "Freebies",
    slug: "freebies",
    description: "Start with something free and see how the system feels.",
    image: freebieImg,
  },
  {
    id: "c6",
    name: "PLR",
    slug: "plr",
    description: "Source files with resell rights for creators building their own shop.",
    image: bundleImg,
  },
];

function desc(name: string, focus: string) {
  return {
    headline: `${name} — organized money, without the spreadsheet headache.`,
    sections: [
      {
        title: "What makes it different",
        bullets: [
          `Pre-built formulas for ${focus} — nothing to set up`,
          "Works in both Microsoft Excel and Google Sheets",
          "Auto-updating dashboard with charts and totals",
          "Colour-coded categories you can rename in one click",
        ],
      },
      {
        title: "Built for real life",
        bullets: [
          "Weekly, bi-weekly and monthly pay cycles supported",
          "Rollover balances so nothing is lost between months",
          "Print-friendly layout for anyone who likes paper",
        ],
      },
    ],
    receive: [
      "1 Excel (.xlsx) file",
      "1 Google Sheets copy link",
      "Illustrated PDF setup guide",
      "Lifetime free updates to this template",
    ],
    after: [
      "Your download link appears on the confirmation page immediately.",
      "A copy of the same link is emailed to you within a minute.",
      "Open in Excel, or choose “Make a copy” to use in Google Sheets.",
    ],
    disclaimers: [
      "This is a digital download. No physical item will be shipped.",
      "Requires Excel 2016 or newer, or a free Google account for Sheets.",
      "Mobile spreadsheet apps can view the file but editing is best on desktop.",
      "Due to the instant-delivery nature of digital files, all sales are final.",
    ],
  };
}

export const products: Product[] = [
  {
    id: "p1",
    slug: "smart-budget-spreadsheet",
    name: "Smart Budget Spreadsheet",
    tagline: "Auto-import your bank statement — the budget builds itself.",
    hero_title:
      "Smart Budget Spreadsheet — Paste Your Bank Statement, Watch Your Budget Build Itself",
    hero_subtitle:
      "Auto-import and categorize your transactions instead of typing them by hand. Built for irregular income, couples, and anyone who's abandoned a budget app before.",
    meta_description:
      "Paste your bank statement in. Watch your budget build itself. No manual typing — an Excel & Google Sheets budget tracker that keeps up with real life.",
    description: {
      headline: "Paste your bank statement in — watch your budget build itself.",
      sections: [
        {
          title: "What makes it different",
          bullets: [
            "Auto-imports and categorizes pasted bank transactions — no manual typing",
            "150+ pre-built merchant rules you can edit and add to",
            "Works in both Microsoft Excel and Google Sheets",
            "Auto-updating dashboards with charts, totals and top categories",
            "Colour-coded cells so you always know what's safe to edit",
          ],
        },
        {
          title: "Built for real life",
          bullets: [
            "Income Smoothing for freelance, gig and commission earners",
            "Recurring & Variable Bills tracker for bills that change amount or date",
            "Shared Household tab that splits shared costs fairly by income",
            "Mobile Quick Entry tab built to actually work on your phone",
            "Rollover balances so nothing is lost between months",
          ],
        },
      ],
      receive: [
        "DEMO version — pre-filled with a full sample year",
        "BLANK version — ready for your real numbers",
        "Excel file (.xlsx) — works instantly, no account needed",
        "Google Sheets version — link + “make a copy” instructions",
        "4-page Setup Guide (PDF)",
        "1-page Quick Start Card (PDF)",
      ],
      after: [
        "Your download link appears on the confirmation page immediately.",
        "A copy of the same link is emailed to you within a minute.",
        "Open in Excel, or choose “Make a copy” to use in Google Sheets.",
      ],
      disclaimers: [
        "This is a digital download. No physical item will be shipped.",
        "Excel works best on Windows; Mac Excel may show minor formatting differences. The Google Sheets version works on any device with a browser.",
        "Some banks export CSVs differently — the Setup Guide covers common formats. Message us if yours doesn't match.",
        "Due to the instant-delivery nature of digital files, all sales are final.",
      ],
    },
    whats_included: [
      "Smart Budget Spreadsheet — DEMO version, pre-filled with a full sample year",
      "Smart Budget Spreadsheet — BLANK version, ready for your real numbers",
      "Excel file (.xlsx) — works instantly, no account needed",
      "Google Sheets version — link + “make a copy” instructions",
      "16 tabs across 4 sections: Setup, Transactions, Dashboards, Build Your Wealth",
      "Auto-import & categorization engine with 150+ pre-built merchant rules",
      "Recurring & Variable Bills tracker for bills that change amount or date",
      "Income Smoothing tool for freelance, gig, or commission income",
      "Shared Household tab with fair-share expense splitting for couples",
      "Mobile Quick Entry tab, built to actually work on your phone",
      "Debt payoff, net worth, sinking funds, and 50/30/20 dashboards",
      "4-page Setup Guide (PDF) and 1-page Quick Start Card (PDF)",
    ],
    how_it_works: [
      "Download your files and open the DEMO version first to see it fully populated.",
      "Open the Start Here tab in your BLANK copy — answer 6 quick questions (currency, pay schedule, household type) and you're set up.",
      "Export a CSV from your bank or card app, paste it into the Import tab, and watch it auto-categorize.",
      "Check your Dashboard tab anytime for a full picture of your money.",
    ],
    perfect_for: [
      "Freelancers and contractors with income that changes month to month",
      "Couples who want to split shared bills fairly without a spreadsheet fight",
      "Anyone who's abandoned a budget app or template before",
      "Gig workers, shift workers, and commission-based earners",
      "A New Year money reset that doesn't require typing a year of data",
      "Small side-hustle owners separating business and personal spending",
      "Google Sheets users who want it to just work on mobile",
      "Debt payoff planning alongside everyday budgeting",
    ],
    why_this: [
      "Auto-import means you're not typing every transaction by hand",
      "A dedicated Variable Bills tracker for bills that don't arrive on a fixed schedule or amount",
      "Built for irregular income, not just salaried, twice-a-month paychecks",
      "Ships with a filled-in demo file, not just a blank one",
      "A genuinely usable mobile entry tab, not a 16-tab file stuck on your phone",
    ],
    faqs: [
      { q: "Do I need to know Excel formulas?", a: "No. Every formula is pre-built." },
      {
        q: "Will this work on Mac?",
        a: "Yes — the Google Sheets version works on any device with a browser, including Mac and mobile. The Excel version works best on Windows; Mac Excel may show minor formatting differences.",
      },
      {
        q: "What if my bank's CSV doesn't import cleanly?",
        a: "The Setup Guide covers common export formats. Message us if yours doesn't match and we'll help.",
      },
      {
        q: "Can I edit anything, or are cells locked?",
        a: "Everything is editable. Formula cells are colour-coded so you know what's safe to change.",
      },
      { q: "Is this a subscription?", a: "No — it's a one-time purchase, yours forever." },
      {
        q: "Can I use this if my income isn't the same every month?",
        a: "Yes — the Income Smoothing tab is built specifically for irregular income.",
      },
      {
        q: "Does it work for couples splitting expenses?",
        a: "Yes. The Shared Household tab handles fair-share splitting based on each partner's income.",
      },
    ],
    bundle_callout: {
      text: "Save more with the Budget + Debt Payoff Bundle",
      slug: "budget-debt-bill-bundle",
    },
    price: 21,
    sale_price: 10.5,
    category: "personal-finance",
    colorway_variants: [LIGHT, DARK, SAGE],
    images: [budgetImg, budgetDark],
    download_url: "https://example.com/downloads/smart-budget",
    rating_avg: 4.9,
    review_count: 1284,
    tags: ["budget", "monthly", "excel", "google sheets", "auto-import", "bank statement", "csv"],
    is_bundle: false,
    bundle_components: [],
    is_plr: false,
    best_seller: true,
    created: "2026-01-12",
  },
  {
    id: "p2",
    slug: "debt-payoff-tracker",
    name: "Debt Payoff Tracker",
    tagline: "Snowball or avalanche — watch the balance fall.",
    description: desc("Debt Payoff Tracker", "snowball and avalanche payoff schedules"),
    price: 18,
    sale_price: 9,
    category: "personal-finance",
    colorway_variants: [LIGHT, SAGE],
    images: [debtImg, debtDark],
    download_url: "https://example.com/downloads/debt-payoff",
    rating_avg: 4.8,
    review_count: 742,
    tags: ["debt", "payoff", "tracker"],
    is_bundle: false,
    bundle_components: [],
    is_plr: false,
    best_seller: true,
    created: "2026-02-02",
  },
  {
    id: "p3",
    slug: "bill-calendar",
    name: "Bill Calendar",
    tagline: "Never miss a due date again.",
    description: desc("Bill Calendar", "recurring bill due dates and reminders"),
    price: 16,
    sale_price: 8,
    category: "personal-finance",
    colorway_variants: [LIGHT, DARK],
    images: [billsImg, billsDark],
    download_url: "https://example.com/downloads/bill-calendar",
    rating_avg: 4.7,
    review_count: 508,
    tags: ["bills", "calendar", "reminders"],
    is_bundle: false,
    bundle_components: [],
    is_plr: false,
    best_seller: true,
    created: "2026-03-08",
  },
  {
    id: "p4",
    slug: "budget-debt-bill-bundle",
    name: "Budget + Debt + Bill Bundle",
    tagline: "The complete money system, in one download.",
    description: desc("Bundle", "budgeting, debt payoff and bill tracking together"),
    price: 55,
    sale_price: 27.5,
    category: "bundles",
    colorway_variants: [LIGHT, DARK, SAGE],
    images: [bundleImg, bundleDark],
    download_url: "https://example.com/downloads/money-bundle",
    rating_avg: 5,
    review_count: 419,
    tags: ["bundle", "save"],
    is_bundle: true,
    bundle_components: ["p1", "p2", "p3"],
    is_plr: false,
    best_seller: true,
    created: "2026-03-20",
  },
  {
    id: "p5",
    slug: "small-business-profit-sheet",
    name: "Small Business Profit Sheet",
    tagline: "Income, expenses and profit at a glance.",
    description: desc("Small Business Profit Sheet", "quarterly profit and expense tracking"),
    price: 29,
    sale_price: 14.5,
    category: "business-tools",
    colorway_variants: [LIGHT, SAGE],
    images: [businessImg, businessDark],
    download_url: "https://example.com/downloads/profit-sheet",
    rating_avg: 4.8,
    review_count: 233,
    tags: ["business", "profit", "expenses"],
    is_bundle: false,
    bundle_components: [],
    is_plr: false,
    best_seller: true,
    created: "2026-04-01",
  },
  {
    id: "p6",
    slug: "weekly-life-planner",
    name: "Weekly Life Planner",
    tagline: "Tasks, meals and habits on a single tab.",
    description: desc("Weekly Life Planner", "weekly planning and habit streaks"),
    price: 14,
    sale_price: 7,
    category: "organization",
    colorway_variants: [LIGHT, DARK, SAGE],
    images: [billsImg, billsDark],
    download_url: "https://example.com/downloads/weekly-planner",
    rating_avg: 4.6,
    review_count: 187,
    tags: ["planner", "weekly", "habits"],
    is_bundle: false,
    bundle_components: [],
    is_plr: false,
    best_seller: true,
    created: "2026-04-18",
  },
  {
    id: "p7",
    slug: "free-monthly-expense-tracker",
    name: "Free Monthly Expense Tracker",
    tagline: "A tiny taste of the whole system.",
    description: desc("Free Monthly Expense Tracker", "simple monthly expense logging"),
    price: 6,
    sale_price: 0,
    category: "freebies",
    colorway_variants: [LIGHT],
    images: [freebieImg, freebieDark],
    download_url: "https://example.com/downloads/free-tracker",
    rating_avg: 4.9,
    review_count: 3120,
    tags: ["free", "starter"],
    is_bundle: false,
    bundle_components: [],
    is_plr: false,
    created: "2026-01-02",
  },
  {
    id: "p8",
    slug: "plr-finance-template-vault",
    name: "PLR Finance Template Vault",
    tagline: "Six proven templates, yours to rebrand and resell.",
    description: {
      headline: "Skip a year of design work — start selling next week.",
      sections: [
        {
          title: "What resell rights give you",
          bullets: [
            "Full commercial resale rights on all six source files",
            "Editable master files — colours, logo, fonts, sheet names",
            "Sell on your own site, Etsy, Shopify or Gumroad",
            "No revenue share, no royalties, no expiry",
          ],
        },
        {
          title: "Included in the vault",
          bullets: [
            "Budget, debt, bills, planner, profit and savings templates",
            "Editable product mockup files for your listings",
            "Suggested listing copy you can adapt",
          ],
        },
      ],
      receive: [
        "6 unlocked Excel source files",
        "6 Google Sheets master copies",
        "Mockup pack + listing copy document",
        "PLR licence certificate (PDF)",
      ],
      after: [
        "Download the vault from the confirmation page.",
        "Customize with your branding — colours, logo, name.",
        "Publish and resell it as your own product.",
      ],
      disclaimers: [
        "Resell rights cover the customized templates only, not the licence document itself.",
        "You may not resell the vault as a PLR pack of its own.",
        "Digital download — all sales final.",
      ],
    },
    price: 397,
    sale_price: 198.5,
    category: "plr",
    colorway_variants: [LIGHT, DARK, SAGE],
    images: [bundleImg, bundleDark],
    download_url: "https://example.com/downloads/plr-vault",
    rating_avg: 4.9,
    review_count: 96,
    tags: ["plr", "resell", "commercial licence"],
    is_bundle: true,
    bundle_components: ["p1", "p2", "p3", "p5", "p6"],
    is_plr: true,
    created: "2026-05-05",
  },
];

export const reviews: Review[] = [
  {
    id: "r1",
    product_id: "p1",
    reviewer_name: "Maya R.",
    rating: 5,
    text: "I've tried a dozen budget spreadsheets and abandoned all of them. This one I actually opened again in month two — the dashboard does the thinking for me.",
    date: "2026-06-02",
  },
  {
    id: "r2",
    product_id: "p1",
    reviewer_name: "Devon C.",
    rating: 5,
    text: "Set it up in fifteen minutes on a Sunday. My partner and I finally agree on where the money goes.",
    date: "2026-05-21",
  },
  {
    id: "r3",
    product_id: "p1",
    reviewer_name: "Priya S.",
    rating: 4,
    text: "Beautiful and clear. Wish there was a savings-goal tab, but I added one myself easily enough.",
    date: "2026-05-11",
  },
  {
    id: "r4",
    product_id: "p2",
    reviewer_name: "Tomás L.",
    rating: 5,
    text: "Watching the payoff date move earlier every month is weirdly addictive. Cleared one card already.",
    date: "2026-06-08",
  },
  {
    id: "r5",
    product_id: "p2",
    reviewer_name: "Grace W.",
    rating: 5,
    text: "The snowball vs avalanche comparison made the decision for me in about a minute.",
    date: "2026-04-30",
  },
  {
    id: "r6",
    product_id: "p3",
    reviewer_name: "Ellis K.",
    rating: 5,
    text: "No more late fees. That alone paid for it three times over.",
    date: "2026-06-14",
  },
  {
    id: "r7",
    product_id: "p4",
    reviewer_name: "Nadia B.",
    rating: 5,
    text: "Bought the bundle instead of one sheet and it was clearly the right call. Everything matches.",
    date: "2026-06-19",
  },
  {
    id: "r8",
    product_id: "p5",
    reviewer_name: "Jordan M.",
    rating: 5,
    text: "My bookkeeper asked what I was using. Quarter-end took an hour instead of a weekend.",
    date: "2026-05-27",
  },
  {
    id: "r9",
    product_id: "p6",
    reviewer_name: "Sofia A.",
    rating: 4,
    text: "Simple, calm, not overloaded. Exactly what a weekly planner should be.",
    date: "2026-06-03",
  },
  {
    id: "r10",
    product_id: "p8",
    reviewer_name: "Ruth O.",
    rating: 5,
    text: "Rebranded three of the templates and listed them the same week. First sale on day four.",
    date: "2026-06-21",
  },
];

export const testimonials = [
  {
    quote: "Organization isn't a personality trait. It's a system you can download.",
    name: "Maya R.",
    role: "Smart Budget Spreadsheet",
  },
  {
    quote: "I stopped avoiding my bank app. That's the whole review.",
    name: "Tomás L.",
    role: "Debt Payoff Tracker",
  },
  {
    quote: "The first money tool I've used that doesn't make me feel behind.",
    name: "Grace W.",
    role: "Budget + Debt + Bill Bundle",
  },
  {
    quote: "Fifteen minutes on a Sunday buys back a whole month of guessing.",
    name: "Jordan M.",
    role: "Small Business Profit Sheet",
  },
];

export const faqs = [
  {
    topic: "Digital Downloads",
    items: [
      {
        q: "When do I get my files?",
        a: "Immediately. Your download link appears on the confirmation page the moment payment clears, and the same link is emailed to you.",
      },
      {
        q: "Is anything shipped to me?",
        a: "No. Every product here is a digital file — nothing physical is posted.",
      },
      {
        q: "How many times can I download?",
        a: "Your link stays active indefinitely, so you can re-download after a new laptop or a lost file.",
      },
    ],
  },
  {
    topic: "How Templates Work",
    items: [
      {
        q: "Excel or Google Sheets?",
        a: "Both. Every purchase includes an .xlsx file and a Google Sheets copy link, so use whichever you prefer.",
      },
      {
        q: "Do I need to know formulas?",
        a: "Not at all. Every calculation is pre-built — you type in the coloured cells and the dashboard updates itself.",
      },
      {
        q: "Can I change the categories and colours?",
        a: "Yes. Category names, currency symbol and accent colours are all editable in one settings tab.",
      },
    ],
  },
  {
    topic: "Access Issues",
    items: [
      {
        q: "My download link didn't arrive.",
        a: "Check your spam folder first, then contact us with your order email and we'll resend it within one business day.",
      },
      {
        q: "Google Sheets says I need permission.",
        a: "Choose File → Make a copy. That creates your own editable version in your Drive.",
      },
    ],
  },
  {
    topic: "Refund Policy",
    items: [
      {
        q: "Can I get a refund?",
        a: "Because files are delivered instantly, all sales are final. If a file is broken or you received the wrong product, we'll fix it or refund it — just contact us.",
      },
      {
        q: "I bought the same template twice.",
        a: "Duplicate orders are always refunded in full. Send us both order numbers.",
      },
    ],
  },
];

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);
export const getProductById = (id: string) => products.find((p) => p.id === id);
export const getCategory = (slug: string) => categories.find((c) => c.slug === slug);
export const productsByCategory = (slug: string) => products.filter((p) => p.category === slug);
export const reviewsFor = (id: string) => reviews.filter((r) => r.product_id === id);
export const bestSellers = () => products.filter((p) => p.best_seller);
export const money = (n: number) => (n === 0 ? "Free" : `$${n.toFixed(2)}`);
export const discountPct = (p: Product) =>
  p.price > 0 ? Math.round(((p.price - p.sale_price) / p.price) * 100) : 0;
