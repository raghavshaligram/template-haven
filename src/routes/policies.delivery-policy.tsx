import { createFileRoute, Link } from "@tanstack/react-router";
import { PolicyList, PolicyPage, PolicySection } from "@/components/site/PolicyPage";
import { PAYMENT_PROCESSOR, RETENTION, SHOP_NAME, SUPPORT_EMAIL } from "@/data/policies";

export const Route = createFileRoute("/policies/delivery-policy")({
  head: () => ({
    meta: [
      { title: `Digital Delivery Policy — ${SHOP_NAME}` },
      {
        name: "description",
        content: "How your templates reach you: instant download, nothing shipped, ever.",
      },
    ],
  }),
  component: DeliveryPolicy,
});

function DeliveryPolicy() {
  return (
    <PolicyPage
      policyKey="delivery"
      title="Digital Delivery Policy"
      intro="Everything we sell is a digital file you download. This page explains how it reaches you and what to do if it doesn't."
    >
      <PolicySection title="Nothing is ever shipped">
        <p className="rounded-xl border border-border bg-secondary/50 p-4">
          <strong className="font-semibold text-foreground">
            {SHOP_NAME} does not ship physical products.
          </strong>{" "}
          There is no postage, no delivery address, no tracking number and no waiting for a parcel.
          Every product is a file you download and keep. If you were expecting something in the
          post, nothing has gone wrong — there was never anything to post.
        </p>
      </PolicySection>

      <PolicySection title="When you get your files">
        <p>
          Immediately. As soon as {PAYMENT_PROCESSOR} confirms your payment, your download links are
          generated and made available — normally within a few seconds. There's no manual approval
          step and no business-hours delay; buying at 3am works exactly like buying at 3pm.
        </p>
      </PolicySection>

      <PolicySection title="How you get them">
        <p>You'll receive your files two ways, so one failing doesn't lock you out:</p>
        <PolicyList
          items={[
            <>
              <strong className="font-semibold text-foreground">On screen, straight away</strong> —
              the confirmation page shown right after payment lists every file with a download
              button.
            </>,
            <>
              <strong className="font-semibold text-foreground">By email</strong> — a confirmation
              email with the same links goes to the address associated with your payment.
            </>,
            <>
              <strong className="font-semibold text-foreground">
                In your account, if you have one
              </strong>{" "}
              — purchases made while signed in also appear on your{" "}
              <Link to="/account" className="font-medium text-accent hover:underline">
                account page
              </Link>
              , ready to download again whenever you need. Accounts are optional.
            </>,
          ]}
        />
        <p>
          Files are delivered as ZIP archives. Unzip before opening — most computers and phones do
          this with a double-tap or long-press.
        </p>
      </PolicySection>

      <PolicySection title="How long your links last">
        <p>
          Download links stay active for {RETENTION.downloadLinks} and allow a generous number of
          downloads, so you can grab your files on more than one device. Save them somewhere safe
          once downloaded — but if a link expires, just email us and we'll issue a fresh one. We
          don't charge for that, and there's no time limit on asking.
        </p>
      </PolicySection>

      <PolicySection title="If your download doesn't arrive">
        <p>Work through these in order — the first one solves it most of the time:</p>
        <PolicyList
          items={[
            "Check your spam, junk and promotions folders. Automated order emails land there more often than anyone would like.",
            "Search your inbox for the shop name rather than scrolling — the email may have been filed somewhere unexpected.",
            "Check the email address you used at checkout, especially if you paid via PayPal with a different address than you normally use. The confirmation goes wherever the payment says.",
            "Look at the confirmation page again if it's still open — the links are right there and work independently of email.",
            <>
              Still nothing? Email{" "}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="font-medium text-accent hover:underline"
              >
                {SUPPORT_EMAIL}
              </a>{" "}
              with the email address you used and roughly when you ordered. We'll find the order and
              resend your files, usually within one business day.
            </>,
          ]}
        />
      </PolicySection>

      <PolicySection title="If a file is broken">
        <p>
          If a download is corrupted, incomplete, or won't open in the software the product page
          says it supports, tell us and we'll fix it — either by reissuing the file or correcting
          it. See our{" "}
          <Link to="/policies/refund-policy" className="font-medium text-accent hover:underline">
            Refund Policy
          </Link>{" "}
          for how we handle technical problems.
        </p>
      </PolicySection>

      <PolicySection title="Bought on Etsy?">
        <p>
          Etsy delivers your files through their own downloads page and confirmation email. If
          something goes wrong there, message us through Etsy and we'll help the same way.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
