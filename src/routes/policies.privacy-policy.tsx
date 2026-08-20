import { createFileRoute, Link } from "@tanstack/react-router";
import { PolicyList, PolicyPage, PolicySection } from "@/components/site/PolicyPage";
import { PAYMENT_PROCESSOR, RETENTION, SHOP_NAME, SUPPORT_EMAIL } from "@/data/policies";

export const Route = createFileRoute("/policies/privacy-policy")({
  head: () => ({
    meta: [
      { title: `Privacy Policy — ${SHOP_NAME}` },
      {
        name: "description",
        content: `How ${SHOP_NAME} collects, uses and protects your personal information.`,
      },
    ],
  }),
  component: PrivacyPolicy,
});

function PrivacyPolicy() {
  return (
    <PolicyPage
      policyKey="privacy"
      title="Privacy Policy"
      intro={`${SHOP_NAME} sells digital spreadsheet and printable templates. This page explains, in plain language, what personal information we collect, why we collect it, who else sees it, and what you can ask us to do with it.`}
    >
      <PolicySection title="Who we are">
        <p>
          {SHOP_NAME} is a small independent business selling digital templates. We operate from
          India and sell to customers worldwide, including in the EU, UK, US, Canada and Australia.
          For privacy questions, or to exercise any of the rights described below, email{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-accent hover:underline">
            {SUPPORT_EMAIL}
          </a>
          .
        </p>
      </PolicySection>

      <PolicySection title="What we collect">
        <p>Only what we actually need to sell you a file and send it to you:</p>
        <PolicyList
          items={[
            <>
              <strong className="font-semibold text-foreground">Your email address</strong> — when
              you buy something, and separately if you sign up for a free template.
            </>,
            <>
              <strong className="font-semibold text-foreground">Your name</strong>, if you give it
              to us or {PAYMENT_PROCESSOR} passes it along with your order.
            </>,
            <>
              <strong className="font-semibold text-foreground">Order details</strong> — which
              templates you bought, when, and the amount paid.
            </>,
            <>
              <strong className="font-semibold text-foreground">Payment information</strong> —
              handled entirely by {PAYMENT_PROCESSOR}. We never see or store your card number. We
              receive only a confirmation that payment succeeded, plus the email address associated
              with it.
            </>,
            <>
              <strong className="font-semibold text-foreground">Analytics data</strong> — if you
              accept analytics cookies, aggregate information about how the site is used: pages
              viewed, roughly where in the world you are, and what kind of device you're on. See{" "}
              <Link
                to="/policies/cookie-policy"
                className="font-medium text-accent hover:underline"
              >
                our Cookie Policy
              </Link>
              .
            </>,
            <>
              <strong className="font-semibold text-foreground">Account details</strong>, if you
              choose to create an account — your email and a securely hashed password, or your
              Google sign-in. Accounts are optional; you can buy as a guest.
            </>,
          ]}
        />
        <p>
          We do not collect a shipping address, because nothing is ever shipped. We do not ask for
          your date of birth, phone number, or any financial details beyond what {PAYMENT_PROCESSOR}{" "}
          handles.
        </p>
      </PolicySection>

      <PolicySection title="How we collect it">
        <PolicyList
          items={[
            "Directly from you — at checkout, when signing up for a free template, when creating an account, or when you email us.",
            `From ${PAYMENT_PROCESSOR}, which passes us the payer's email and confirmation of payment so we can send your download.`,
            "Automatically through analytics cookies — but only after you have accepted them. Decline, and no analytics cookies are set at all.",
          ]}
        />
      </PolicySection>

      <PolicySection title="Why we use it">
        <PolicyList
          items={[
            "To deliver what you paid for — generating your download links and emailing them to you.",
            "To send the free template you asked for, when you sign up for one.",
            "To provide customer support when you contact us about an order.",
            "To send occasional emails about new templates or offers — only if you opted in, and with an unsubscribe link in every one.",
            "To understand which templates and pages people find useful, so we can improve the site — only with your consent, and only in aggregate.",
            "To keep records we're required to keep for tax and accounting purposes.",
          ]}
        />
        <p>
          We do not use your information to make automated decisions about you, and we do not build
          advertising profiles.
        </p>
      </PolicySection>

      <PolicySection title="Who we share it with">
        <p>
          We share personal information only with the services that make the shop function, and only
          as much as each one needs:
        </p>
        <PolicyList
          items={[
            <>
              <strong className="font-semibold text-foreground">{PAYMENT_PROCESSOR}</strong> — to
              take payment. They are the controller of your payment details under their own privacy
              policy.
            </>,
            <>
              <strong className="font-semibold text-foreground">Our email provider</strong> — to
              send order confirmations and download links.
            </>,
            <>
              <strong className="font-semibold text-foreground">
                Our hosting and database provider
              </strong>{" "}
              — where order records are stored.
            </>,
            <>
              <strong className="font-semibold text-foreground">Google Analytics</strong> — if, and
              only if, you accepted analytics cookies.
            </>,
            <>
              <strong className="font-semibold text-foreground">Etsy</strong>, for anything you buy
              through our Etsy shop rather than this site. Those purchases are governed by Etsy's
              own privacy policy, and we only see what Etsy shows sellers.
            </>,
          ]}
        />
        <p className="rounded-xl border border-border bg-secondary/50 p-4">
          <strong className="font-semibold text-foreground">
            We never sell your personal information to anyone.
          </strong>{" "}
          We don't rent, trade, or share it with third parties for their own marketing. There is no
          circumstance in which we would.
        </p>
        <p>
          We may disclose information if legally required to — for example, in response to a valid
          court order or tax authority request.
        </p>
      </PolicySection>

      <PolicySection title="International transfers">
        <p>
          We operate from India, and the services we rely on store data in various countries
          including the United States and the EU. This means your information may be transferred
          outside the country you live in. Where we transfer personal data out of the EU or UK, we
          rely on the safeguards offered by those providers, such as Standard Contractual Clauses.
        </p>
      </PolicySection>

      <PolicySection title="Cookies and tracking">
        <p>
          We use one strictly necessary cookie to remember your cookie choice itself, and local
          browser storage to remember your cart. Neither tracks you across other websites.
        </p>
        <p>
          Analytics cookies are{" "}
          <strong className="font-semibold text-foreground">off by default</strong>. Nothing
          analytics-related loads until you press Accept on the cookie banner, and you can change
          your mind at any time from{" "}
          <Link to="/policies/cookie-policy" className="font-medium text-accent hover:underline">
            the Cookie Policy page
          </Link>
          .
        </p>
      </PolicySection>

      <PolicySection title="How long we keep it">
        <PolicyList
          items={[
            <>
              <strong className="font-semibold text-foreground">Order records</strong> —{" "}
              {RETENTION.orders}, because tax rules require us to keep records of sales.
            </>,
            <>
              <strong className="font-semibold text-foreground">Download links</strong> —{" "}
              {RETENTION.downloadLinks} from purchase, after which they expire. Email us and we'll
              happily reissue them.
            </>,
            <>
              <strong className="font-semibold text-foreground">Marketing email address</strong> —{" "}
              {RETENTION.marketingEmail}. Unsubscribing removes you from the list.
            </>,
            <>
              <strong className="font-semibold text-foreground">Analytics data</strong> —{" "}
              {RETENTION.analytics}, then automatically deleted.
            </>,
            <>
              <strong className="font-semibold text-foreground">Account data</strong> — until you
              ask us to delete your account.
            </>,
          ]}
        />
      </PolicySection>

      <PolicySection title="Your rights">
        <p>
          Wherever you live, you can ask us to do any of the following, and we'll action it free of
          charge within 30 days:
        </p>
        <PolicyList
          items={[
            "Tell you what personal information we hold about you.",
            "Give you a copy of it in a portable format.",
            "Correct anything that's wrong.",
            "Delete it — though we may need to keep basic order records to satisfy tax law.",
            "Stop using it for marketing. Every marketing email also has a one-click unsubscribe link.",
            "Withdraw your cookie consent, at any time, without giving a reason.",
          ]}
        />
        <p>
          If you are in the EU or UK, these rights come from the GDPR, and our legal bases for
          processing are: performing our contract with you (delivering your order), your consent
          (marketing emails and analytics cookies), and our legitimate interests and legal
          obligations (keeping accounting records, preventing fraud). You also have the right to
          complain to your local data protection authority.
        </p>
        <p>
          To exercise any of these, email{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-accent hover:underline">
            {SUPPORT_EMAIL}
          </a>
          . We may ask you to confirm the email address you used at checkout so we don't hand your
          data to the wrong person.
        </p>
      </PolicySection>

      <PolicySection title="Children">
        <p>
          Our templates are intended for adults, and we don't knowingly collect information from
          anyone under 16. If you believe a child has given us personal information, email us and
          we'll delete it.
        </p>
      </PolicySection>

      <PolicySection title="Security">
        <p>
          Payment details never touch our servers. Passwords, where you create an account, are
          stored hashed, never in plain text. Download links are unique, expiring, and tied to a
          single order. No system is perfectly secure, but we keep the amount of data we hold
          deliberately small — the most reliable protection is not collecting things in the first
          place.
        </p>
      </PolicySection>

      <PolicySection title="Changes to this policy">
        <p>
          If we change how we handle personal information, we'll update this page and change the
          "last updated" date at the top. If the change is significant, and you're on our email
          list, we'll tell you directly.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
