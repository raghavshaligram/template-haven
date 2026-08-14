// Blog content — typed blocks instead of markdown so the article template
// can render rich, on-brand layouts (callouts, product CTAs) with no parser.

export type BlogBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "list"; items: string[] }
  | { type: "callout"; title: string; text: string }
  | { type: "cta"; slug: string; heading: string; text: string };

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  meta_description: string;
  cluster: string; // topic cluster, e.g. "Irregular Income"
  date: string; // ISO
  reading_minutes: number;
  author: string;
  cover: "budget" | "debt" | "bills" | "business" | "freebie" | "bundle";
  blocks: BlogBlock[];
};

export const clusters = ["Budgeting Basics", "Irregular Income", "Spreadsheet How-To"] as const;

export const posts: BlogPost[] = [
  {
    slug: "budget-with-irregular-income",
    title: "How to Budget With Irregular Income (Without Guessing)",
    excerpt:
      "Freelance, gig, commission — when every month pays differently, normal budgets break. Here's the system that doesn't.",
    meta_description:
      "A practical system for budgeting on irregular income: find your baseline, pay yourself a steady amount, and build a buffer that absorbs the swings.",
    cluster: "Irregular Income",
    date: "2026-08-10",
    reading_minutes: 6,
    author: "Elena",
    cover: "budget",
    blocks: [
      {
        type: "p",
        text: "Most budgets quietly assume one thing: that the same paycheck lands on the same day every month. If you freelance, drive gigs, work shifts, or earn commission, that assumption fails in the first week — and the budget usually gets abandoned by the second.",
      },
      {
        type: "p",
        text: "The fix isn't discipline. It's changing what you budget against. Instead of budgeting against this month's income (unknowable), you budget against a steady number you pay yourself — and let a buffer absorb the difference.",
      },
      { type: "h2", text: "Step 1: Find your baseline" },
      {
        type: "p",
        text: "Pull your last six months of income and write down each month's total. Your baseline is not the average — it's closer to your lower months. A simple rule that works: take the average of your three lowest months. That's income you can rely on almost regardless of how the month goes.",
      },
      { type: "h2", text: "Step 2: Pay yourself a salary" },
      {
        type: "p",
        text: "Treat your income like a small business treats revenue. Everything you earn lands in one pool; on the 1st, you 'pay yourself' the baseline amount and budget only that. A $6,400 month doesn't change your spending — it fills the pool.",
      },
      { type: "h2", text: "Step 3: Let the buffer do its job" },
      {
        type: "p",
        text: "The pool's surplus is your buffer. Good months feed it; lean months draw from it. Once it holds roughly two months of baseline income, the feast-and-famine cycle stops reaching your actual life — bills feel the same in your best month and your worst.",
      },
      {
        type: "callout",
        title: "The number that matters",
        text: "Track one figure weekly: buffer balance ÷ monthly baseline. Above 2.0, you're safe — consider raising your paycheck. Below 1.0, hold spending steady and let good months rebuild it.",
      },
      { type: "h2", text: "Why spreadsheets beat apps for this" },
      {
        type: "p",
        text: "Budget apps almost universally hard-code the salaried assumption: one income, twice a month. A spreadsheet lets the math match your reality — a rolling average that updates as deposits land, a recommended paycheck that adjusts each quarter, and a buffer line you can actually see.",
      },
      {
        type: "cta",
        slug: "smart-budget-spreadsheet",
        heading: "This system is a tab, not a project",
        text: "The Smart Budget Spreadsheet ships with an Income Smoothing tab that does all of the above — log deposits, get a recommended steady paycheck, watch the buffer build.",
      },
    ],
  },
  {
    slug: "50-30-20-rule-explained",
    title: "The 50/30/20 Rule, Explained — and When to Break It",
    excerpt:
      "The most-quoted budgeting rule is a great starting point and a mediocre finish line. Here's how it works and when to bend it.",
    meta_description:
      "How the 50/30/20 budget works, a worked example, and the three situations where you should deliberately break the rule.",
    cluster: "Budgeting Basics",
    date: "2026-08-04",
    reading_minutes: 5,
    author: "Elena",
    cover: "freebie",
    blocks: [
      {
        type: "p",
        text: "50/30/20 says: put 50% of after-tax income toward needs, 30% toward wants, and 20% toward savings and debt beyond minimums. Its real value isn't precision — it's that it gives every dollar one of three jobs, which is the part most budgets skip.",
      },
      { type: "h2", text: "A worked example" },
      {
        type: "p",
        text: "On $4,000 a month after tax: $2,000 covers rent, utilities, groceries, transport, insurance and minimum debt payments. $1,200 covers dining out, subscriptions, travel and shopping. $800 goes to savings, investments, and extra debt payments.",
      },
      {
        type: "list",
        items: [
          "Needs (50% · $2,000): housing, utilities, groceries, transport, insurance, minimums",
          "Wants (30% · $1,200): dining, entertainment, subscriptions, travel, shopping",
          "Savings (20% · $800): emergency fund, investing, extra debt paydown",
        ],
      },
      { type: "h2", text: "The hard part nobody mentions" },
      {
        type: "p",
        text: "The rule is easy. The bookkeeping isn't: every transaction has to get sorted into a bucket, every month, or the percentages are fiction. This is where most people quit — not at the math, at the typing.",
      },
      { type: "h2", text: "When to break the rule" },
      {
        type: "list",
        items: [
          "High-cost city: if rent alone eats 40%, run 60/20/20 honestly rather than 50/30/20 dishonestly.",
          "High-interest debt: above ~8% interest, shrink wants and push savings' share at the debt first — the guaranteed return beats most investments.",
          "Irregular income: apply the percentages to your baseline paycheck, not to whatever landed this month.",
        ],
      },
      {
        type: "callout",
        title: "Rule of thumb",
        text: "50/30/20 is a diagnostic, not a commandment. If your real split is 70/25/5, that's not failure — it's the most useful fact you've learned about your money all year.",
      },
      {
        type: "cta",
        slug: "smart-budget-spreadsheet",
        heading: "See your real split, automatically",
        text: "The Smart Budget Spreadsheet auto-categorizes your transactions and its 50/30/20 tab shows your true needs/wants/savings split against target — no manual sorting.",
      },
    ],
  },
  {
    slug: "import-bank-statement-into-spreadsheet",
    title: "How to Import a Bank Statement Into a Spreadsheet (CSV Guide)",
    excerpt:
      "Stop typing transactions by hand. Every bank exports CSV — here's how to get it, clean it, and make a spreadsheet sort it for you.",
    meta_description:
      "Step-by-step guide to exporting your bank statement as CSV and importing it into Excel or Google Sheets — including fixes for the formats banks get wrong.",
    cluster: "Spreadsheet How-To",
    date: "2026-07-28",
    reading_minutes: 7,
    author: "Elena",
    cover: "business",
    blocks: [
      {
        type: "p",
        text: "Manual entry is the silent killer of budgets. Ten minutes of typing per week doesn't sound like much until week four, when it quietly becomes the reason the spreadsheet stops getting opened. The alternative has been sitting in your banking app the whole time: the CSV export.",
      },
      { type: "h2", text: "Getting the file out of your bank" },
      {
        type: "list",
        items: [
          "Log into online banking (the website usually offers more formats than the app).",
          "Open the account's transaction history and look for Export, Download, or a share icon.",
          "Choose CSV — not PDF. A PDF is a picture of your data; a CSV is the data.",
          "Pick the date range you want (last month is the usual rhythm).",
        ],
      },
      { type: "h2", text: "The shape you want" },
      {
        type: "p",
        text: "A clean import needs four columns: date, description, amount, account — one row per transaction, spending negative, income positive. Most banks give you exactly this. Some don't, and the fixes are quick.",
      },
      {
        type: "list",
        items: [
          "Everything crammed in one column? The file uses semicolons — use Data → Text to Columns and split on semicolon.",
          "Separate debit and credit columns? Add a column combining them: credits positive, debits negative.",
          "Dates arriving as text? Select the column and set its format to Date, or re-paste with Paste Special → Values.",
        ],
      },
      { type: "h2", text: "Make the spreadsheet do the sorting" },
      {
        type: "p",
        text: "Pasting rows in is half the win. The other half is categorization — and that's automatable with keyword rules. 'Contains STARBUCKS → Dining.' 'Contains PAYROLL → Income.' Build the list once, and next month's paste categorizes itself; only genuinely new merchants ask for your attention.",
      },
      {
        type: "callout",
        title: "Order matters",
        text: "Keyword rules should run top to bottom with specific rules first: UBER EATS must match before UBER, or every burrito becomes a taxi ride.",
      },
      {
        type: "cta",
        slug: "smart-budget-spreadsheet",
        heading: "The rules are already written",
        text: "The Smart Budget Spreadsheet ships with 150+ merchant rules built in — paste your statement into the Import tab and watch it categorize itself. Add your own rules anytime.",
      },
    ],
  },
];

export const getPost = (slug: string) => posts.find((p) => p.slug === slug);
export const postsInCluster = (cluster: string) => posts.filter((p) => p.cluster === cluster);
export const relatedPosts = (post: BlogPost, n = 2) =>
  posts.filter((p) => p.slug !== post.slug && p.cluster === post.cluster).slice(0, n).length > 0
    ? posts.filter((p) => p.slug !== post.slug && p.cluster === post.cluster).slice(0, n)
    : posts.filter((p) => p.slug !== post.slug).slice(0, n);
