import { createFileRoute, Link } from "@tanstack/react-router";
import { PolicyList, PolicyPage, PolicySection } from "@/components/site/PolicyPage";
import {
  GOVERNING_LAW_COUNTRY,
  PAYMENT_PROCESSOR,
  SHOP_NAME,
  SUPPORT_EMAIL,
} from "@/data/policies";

export const Route = createFileRoute("/policies/terms-of-service")({
  head: () => ({
    meta: [
      { title: `Terms of Service — ${SHOP_NAME}` },
      {
        name: "description",
        content: `The terms that apply when you buy or use a ${SHOP_NAME} digital template.`,
      },
    ],
  }),
  component: TermsOfService,
});

function TermsOfService() {
  return (
    <PolicyPage
      policyKey="terms"
      title="Terms of Service"
      intro={`These terms apply whenever you use this website or buy a template from ${SHOP_NAME}. They're written to be readable — if anything here is unclear, email us and ask.`}
    >
      <PolicySection title="Accepting these terms">
        <p>
          By browsing this site, signing up for a free template, or making a purchase, you agree to
          these terms. If you don't agree with them, please don't use the site.
        </p>
      </PolicySection>

      <PolicySection title="What we sell">
        <p>
          {SHOP_NAME} sells digital templates — spreadsheets for Excel and Google Sheets, and
          printable trackers and planners. Everything is a{" "}
          <strong className="font-semibold text-foreground">
            one-time purchase and a digital download
          </strong>
          . There are no subscriptions, no recurring charges, and no physical products. Nothing will
          ever be shipped to you.
        </p>
      </PolicySection>

      <PolicySection title="What you may and may not do with your files">
        <p>
          When you buy a template, you get a personal, non-exclusive, non-transferable licence to
          use it. You do not buy the copyright — we keep that.
        </p>
        <p className="font-medium text-foreground">You may:</p>
        <PolicyList
          items={[
            "Use the template for your own personal or household purposes.",
            "Use it for your own business's internal record-keeping — running your own budget, tracking your own numbers.",
            "Edit, customise and adapt your copy however you like.",
            "Print as many copies as you need for your own use.",
          ]}
        />
        <p className="font-medium text-foreground">You may not:</p>
        <PolicyList
          items={[
            "Resell, redistribute, share, gift, or give away the file — edited or unedited.",
            "Upload it anywhere others can download it, including file-sharing sites, course platforms, or free-resource libraries.",
            "Sell it as your own product, or bundle it into a product you sell.",
            "Use it as a template you provide to clients as a deliverable, or claim it as your own work.",
            "Sell prints or digital copies of the design itself.",
            "Share your download link or account access with anyone else.",
          ]}
        />
        <p>
          The short version: buy it once, use it as much as you like, but don't pass it on. This
          mirrors the licence terms included with every listing in our Etsy shop.
        </p>
        <p>
          Some products are explicitly sold as{" "}
          <strong className="font-semibold text-foreground">PLR (Private Label Rights)</strong>.
          Those carry different, broader rights, which are stated on the product page and in the
          files themselves. Where PLR terms and these general terms disagree, the PLR terms win for
          that product.
        </p>
      </PolicySection>

      <PolicySection title="Orders and delivery">
        <p>
          Payment is taken by {PAYMENT_PROCESSOR}. Once payment is confirmed, your download links
          are generated immediately and emailed to you; you can also find them in your account if
          you created one. Full detail is in our{" "}
          <Link to="/policies/delivery-policy" className="font-medium text-accent hover:underline">
            Digital Delivery Policy
          </Link>
          .
        </p>
        <p>
          Prices are shown in US dollars and may change at any time, but the price you paid is the
          price you paid — changes are never applied retroactively. We may run discounts or offers
          and withdraw them at any time.
        </p>
        <p>
          We reserve the right to refuse or cancel an order where we reasonably suspect fraud, a
          payment dispute, or breach of the licence terms above.
        </p>
      </PolicySection>

      <PolicySection title="Refunds">
        <p>
          Because these are instantly downloadable digital files, refunds are limited. Our full
          position is on the{" "}
          <Link to="/policies/refund-policy" className="font-medium text-accent hover:underline">
            Refund Policy
          </Link>{" "}
          page. Nothing in that policy removes rights you have under mandatory consumer law where
          you live.
        </p>
      </PolicySection>

      <PolicySection title="Accounts">
        <p>
          You can buy as a guest; an account is optional. If you create one, you're responsible for
          keeping your login details to yourself and for anything done through your account. Tell us
          promptly if you think someone else has access. We may suspend an account being used to
          redistribute files.
        </p>
      </PolicySection>

      <PolicySection title="Our intellectual property">
        <p>
          Everything on this site — the templates, designs, product photography, written copy, logo
          and branding — belongs to {SHOP_NAME} and is protected by copyright. You may not copy,
          reproduce, scrape or reuse any of it without our written permission. That includes using
          our product images or descriptions in your own listings.
        </p>
      </PolicySection>

      <PolicySection title="These are organisational tools, not professional advice">
        <p className="rounded-xl border border-border bg-secondary/50 p-4">
          Our budgeting, debt and business templates are{" "}
          <strong className="font-semibold text-foreground">organisational tools only</strong>. They
          are not financial, investment, tax, accounting or legal advice, and we are not financial
          advisors, accountants or lawyers. Any figures, examples or demo data included are
          illustrative. Decisions you make using these templates are your own, and for advice
          specific to your circumstances you should speak to a qualified professional.
        </p>
      </PolicySection>

      <PolicySection title="Limitation of liability">
        <p>
          We provide the templates "as is". We've tested them carefully and we'll fix genuine
          faults, but we can't guarantee they will be uninterrupted, error-free, or fit for any
          particular purpose you have in mind.
        </p>
        <p>
          To the fullest extent the law allows, {SHOP_NAME} is not liable for any indirect or
          consequential loss arising from your use of a template — including lost profits, lost
          data, or decisions made on the basis of calculations in a file. Where liability cannot be
          excluded, it is limited to the amount you paid for the product in question.
        </p>
        <p>
          Nothing here excludes liability for fraud, or for anything that cannot lawfully be
          excluded under the consumer law that applies to you.
        </p>
      </PolicySection>

      <PolicySection title="Third-party software">
        <p>
          Our templates run in Microsoft Excel and Google Sheets, which we don't control. We can't
          guarantee behaviour in every version, on every device, or after those platforms change.
          Product pages state which versions each template is built and tested for.
        </p>
      </PolicySection>

      <PolicySection title="Governing law">
        <p>
          These terms are governed by the laws of {GOVERNING_LAW_COUNTRY}, and the courts of{" "}
          {GOVERNING_LAW_COUNTRY} have jurisdiction over any dispute.
        </p>
        <p>
          If you are a consumer in the EU, UK, Australia or anywhere else with mandatory consumer
          protection law,{" "}
          <strong className="font-semibold text-foreground">
            that law still applies to you regardless of this clause
          </strong>
          , and you keep the right to bring proceedings in your own country. Choosing{" "}
          {GOVERNING_LAW_COUNTRY} law here does not take away protections you're entitled to at
          home.
        </p>
      </PolicySection>

      <PolicySection title="Changes to these terms">
        <p>
          We may update these terms as the business changes. The current version always lives on
          this page, with the "last updated" date at the top. Changes apply to purchases made after
          they're posted — we won't retroactively change the terms of an order you've already
          placed.
        </p>
      </PolicySection>

      <PolicySection title="Contact">
        <p>
          Questions about these terms, licensing, or anything else — email{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-accent hover:underline">
            {SUPPORT_EMAIL}
          </a>
          .
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
