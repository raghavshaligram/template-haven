// Server-side product catalog — the single source of truth for prices at checkout.
// The browser only ever sends slugs; amounts and file keys live here so a
// tampered client can never change what gets charged or delivered.
//
// KEEP IN SYNC with src/data/shop.ts (slug, sale_price, name).
// Prices are integer cents.

export type CatalogItem = {
  name: string;
  priceCents: number;
  fileKey: string; // object path inside the private `product-files` bucket
};

export const CATALOG: Record<string, CatalogItem> = {
  "smart-budget-spreadsheet": {
    name: "Smart Budget Spreadsheet",
    priceCents: 1050,
    fileKey: "smart-budget-spreadsheet.zip",
  },
  "debt-payoff-tracker": {
    name: "Debt Payoff Tracker",
    priceCents: 900,
    fileKey: "debt-payoff-tracker.zip",
  },
  "bill-calendar": {
    name: "Bill Calendar",
    priceCents: 800,
    fileKey: "bill-calendar.zip",
  },
  "budget-debt-bill-bundle": {
    name: "Budget + Debt + Bill Bundle",
    priceCents: 2750,
    fileKey: "budget-debt-bill-bundle.zip",
  },
  "small-business-profit-sheet": {
    name: "Small Business Profit Sheet",
    priceCents: 1450,
    fileKey: "small-business-profit-sheet.zip",
  },
  "weekly-life-planner": {
    name: "Weekly Life Planner",
    priceCents: 700,
    fileKey: "weekly-life-planner.zip",
  },
  "free-monthly-expense-tracker": {
    name: "Free Monthly Expense Tracker",
    priceCents: 0,
    fileKey: "free-monthly-expense-tracker.zip",
  },
  "plr-finance-template-vault": {
    name: "PLR Finance Template Vault",
    priceCents: 19850,
    fileKey: "plr-finance-template-vault.zip",
  },
};

export const TOKEN_TTL_DAYS = 30;
export const TOKEN_MAX_DOWNLOADS = 25;
