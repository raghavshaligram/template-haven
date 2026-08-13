# Template Haven

Build a digital template shop website — a storefront selling productivity 

and finance spreadsheet templates (Excel + Google Sheets). Model the 

structure and information architecture after a proven template-shop pattern, 

described in full below. Do not copy any specific brand's visual design, 

copy, or imagery — this is a structural brief, build original visuals.

## TECH & COMMERCE

- E-commerce enabled: product listings, cart, checkout (Stripe integration)

- Each product supports variants (colorways: e.g. Light / Dark / Sage)

- Digital delivery: after purchase, buyer gets a download link (files hosted 

  externally — assume a placeholder download URL field per product for now)

- Responsive, mobile-first

## SITE STRUCTURE

### Global navigation (header)

- Logo (left) — placeholder wordmark

- Primary nav links: "Best Sellers" | "Bundles" | "Personal Finance" | 

  "Business Tools" | "Organization" | "PLR" 

- Utility icons (right): Search, Cart, Account/Login

### Homepage

1. Hero section — headline + subheadline making the core promise 

   ("organization tools that are accessible, beautiful, and easy to use" 

   — style of copy, not exact wording), primary CTA button to shop

2. Trust bar — 3 icon+text badges in a row: "Save Time — pre-built and 

   ready to use", "One-time Purchase — no subscriptions", "Trusted by 

   Thousands — [X] people bought our products"

3. Best Sellers grid — 4-8 product cards, each showing: product image, 

   name, star rating, strikethrough original price + sale price, colorway 

   swatches if applicable

4. Category tiles — visual grid linking to each collection (Personal 

   Finance, Business Tools, Organization, Bundles, PLR)

5. Testimonial/quote carousel — rotating customer quotes styled as 

   inspirational cards (placeholder quotes about organization/budgeting)

6. "Welcome" founder section — short personal blurb with a founder photo 

   placeholder, warm first-person tone, signed with a name

7. Newsletter signup — email capture with a one-line incentive

### Collection/category pages (template — reused per category)

- Category title + one-line description

- Filter/sort bar: sort by Best Selling / Newest / Price

- Product grid: image, name, star rating + review count, price 

  (strikethrough original, sale price), "on sale" badge, colorway swatches

- Pagination

### Product detail page

- Image gallery (left/main) — main image + thumbnail strip, support for 

  a video thumbnail

- Right column, top to bottom:

  - Product title

  - Star rating + review count (clickable, jumps to reviews)

  - Price: sale price large, original price strikethrough, "X% off" badge

  - Colorway/variant selector (swatches, e.g. Light/Dark/Sage)

  - "Add to Cart" button (primary), "Buy Now" (secondary)

  - Short trust line: "Instant digital download — no physical item shipped"

- Below the fold:

  - Full description (rich text — headline, feature bullets grouped by 

    section, "What You'll Receive" list, "After Your Purchase" instructions)

  - Disclaimers/compatibility notes (collapsible section)

  - "Frequently bought together" — 1-2 related product cards with a 

    bundle discount shown

  - Reviews section: overall rating breakdown (bars per star level), 

    individual review cards (reviewer name, star rating, date, text, 

    optional photo), pagination

  - "You may also like" — related products carousel

### Bundle product pages

- Same layout as product detail, but "What's Included" section lists 

  each component product with its own thumbnail and name

### PLR (resell rights) page

- Distinct positioning: sell the *source files* with commercial resale 

  rights to other sellers/entrepreneurs

- Headline framing: "already-designed, proven products with resell rights"

- Pricing tier shown clearly higher than individual retail products

- Short explainer: "download → customize with your branding → resell it 

  as your own"

### About page

- Founder story section (placeholder narrative: personal need → built for 

  self → grew into a shop)

- "Why customers trust us" — 3 stat/trust blocks (rating, review count, 

  product count)

- Social links (Instagram, Pinterest, YouTube, TikTok — placeholder icons)

### Footer

- 4 columns: Shop (links to each collection), Resources (FAQ pages), 

  Company (About, Affiliate Program, Contact), Legal (Terms, Privacy, 

  Refund Policy)

- Newsletter signup repeated

- Payment method icons row

- Copyright line

### FAQ / Help page

- Accordion-style Q&A, grouped by topic: Digital Downloads, How Templates 

  Work, Access Issues, Refund Policy

## DESIGN DIRECTION

- Aesthetic: warm, clean, trustworthy — not corporate-cold, not overly 

  playful. This is a finance/productivity brand, so calm and competent.

- Color palette: deep sage green (#2D5F4F) as primary, warm gold (#E8A94A) 

  as accent/CTA color, cream (#F7F5F0) background, dark charcoal (#2B2B2B) 

  text. Soft rounded corners on cards, generous whitespace.

- Typography: a warm serif for headings (e.g. Fraunces or Playfair 

  Display), clean sans-serif for body/UI (e.g. Inter)

- Product cards: consistent aspect ratio, hover state shows a secondary 

  image or quick-view

## DATA MODEL (for Lovable's backend)

Product: id, name, description, price, sale_price, category, 

  colorway_variants[], images[], download_url, rating_avg, review_count, 

  tags[], is_bundle (bool), bundle_components[] (if bundle), is_plr (bool)

Review: product_id, reviewer_name, rating, text, date, photo_url (optional)

Category: id, name, slug, description

## SEED DATA

Populate with placeholder products matching these real categories and 

naming patterns so the structure can be tested immediately:

- "Smart Budget Spreadsheet" (Personal Finance) — 3 colorways

- "Debt Payoff Tracker" (Personal Finance) — 2 colorways  

- "Bill Calendar" (Personal Finance) — 2 colorways

- "Budget + Debt + Bill Bundle" (Bundles)

- A free/low-cost lead-magnet product (Freebies)

Use realistic placeholder pricing with a 50%-off anchor pattern (e.g. list 

$21.00, sale $10.50) throughout, matching the strikethrough price pattern 

described above.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/bda139d7-54e4-4757-bdc5-7205393c60c4).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
