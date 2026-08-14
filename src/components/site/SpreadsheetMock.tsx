/**
 * Pure-CSS mockup of the SmartBudget dashboard — no images, renders crisp at
 * any size. Used as the hero visual and on product pages ("Inside the template").
 */
const TABS = [
  "Start Here",
  "Import",
  "Dashboard",
  "Monthly View",
  "Bills",
  "Income Smoothing",
  "50/30/20",
  "Debt Payoff",
  "Net Worth",
];

const BARS = [42, 68, 55, 80, 62, 90, 74, 58, 84, 66, 95, 71];

const CATS = [
  { name: "Housing", pct: 78, val: "1,500" },
  { name: "Groceries", pct: 52, val: "384" },
  { name: "Transport", pct: 34, val: "185" },
  { name: "Dining", pct: 26, val: "96" },
];

export function SpreadsheetMock({
  compact = false,
  title = "Budget Dashboard — Excel & Google Sheets",
}: {
  compact?: boolean;
  title?: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lift">
      {/* window chrome */}
      <div className="flex items-center gap-2 border-b border-border bg-secondary/60 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#f26b64]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#f5b942]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#4cc164]" />
        <span className="ml-3 hidden rounded-md bg-background px-3 py-1 text-[11px] font-medium text-muted-foreground sm:block">
          {title}
        </span>
        <span className="ml-auto rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold text-accent">
          Auto-synced
        </span>
      </div>

      <div className="flex">
        {/* tab rail */}
        {!compact && (
          <div className="hidden w-36 shrink-0 border-r border-border bg-secondary/40 p-2 md:block">
            {TABS.map((t, i) => (
              <div
                key={t}
                className={`mb-1 truncate rounded-md px-2.5 py-1.5 text-[11px] font-medium ${
                  i === 2 ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                }`}
              >
                {t}
              </div>
            ))}
          </div>
        )}

        {/* main panel */}
        <div className="flex-1 p-4 md:p-5">
          {/* KPI row */}
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { label: "Income", val: "$3,058", tone: "text-foreground" },
              { label: "Expenses", val: "$2,641", tone: "text-foreground" },
              { label: "Net saved", val: "+$417", tone: "text-accent" },
            ].map((k) => (
              <div key={k.label} className="rounded-xl border border-border bg-background p-3">
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  {k.label}
                </p>
                <p className={`mt-0.5 font-display text-lg font-semibold md:text-xl ${k.tone}`}>
                  {k.val}
                </p>
              </div>
            ))}
          </div>

          {/* bar chart */}
          <div className="mt-3 rounded-xl border border-border bg-background p-3.5">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[11px] font-semibold text-foreground">Spending by month</p>
              <p className="text-[10px] text-muted-foreground">Jan – Dec</p>
            </div>
            <div className="flex h-20 items-end gap-1.5 md:h-24">
              {BARS.map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className={`flex-1 rounded-t-sm ${i === 10 ? "bg-accent" : "bg-primary/15"}`}
                />
              ))}
            </div>
          </div>

          {/* category rows */}
          <div className="mt-3 space-y-2">
            {CATS.map((c) => (
              <div key={c.name} className="flex items-center gap-3">
                <span className="w-20 truncate text-[11px] font-medium text-foreground">
                  {c.name}
                </span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${c.pct}%` }} />
                </div>
                <span className="w-12 text-right text-[11px] tabular-nums text-muted-foreground">
                  ${c.val}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
