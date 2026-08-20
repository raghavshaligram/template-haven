import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage, PolicySection } from "@/components/site/PolicyPage";
import { SHOP_NAME, SUPPORT_EMAIL } from "@/data/policies";

export const Route = createFileRoute("/policies/refund-policy")({
  head: () => ({
    meta: [
      { title: `Refund Policy — ${SHOP_NAME}` },
      {
        name: "description",
        content: "Our refund position on instantly downloadable digital templates.",
      },
    ],
  }),
  component: RefundPolicy,
});

/**
 * Deliberately the shortest page here. A refund policy people actually read
 * beats a thorough one they don't — every extra clause is somewhere for the
 * real answer to hide.
 */
function RefundPolicy() {
  return (
    <PolicyPage policyKey="refund" title="Refund Policy">
      <PolicySection title="Digital products">
        <p>
          Due to the digital nature of our products, we do not offer refunds or exchanges once a
          file has been downloaded. If you experience a technical issue with your download — a
          broken link, a corrupted file, or difficulty accessing your purchase — contact us at{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-accent hover:underline">
            {SUPPORT_EMAIL}
          </a>{" "}
          and we'll resolve it directly.
        </p>
        <p>
          If you have not yet downloaded your purchase and believe it was made in error, contact us
          within 24 hours and we'll review your request.
        </p>
      </PolicySection>

      <PolicySection title="Your statutory rights">
        <p>
          Nothing above affects rights you have under the consumer law where you live, which apply
          in addition to this policy.
        </p>
      </PolicySection>

      <PolicySection title="Bought on Etsy?">
        <p>
          Orders placed through our Etsy shop are covered by Etsy's purchase policies and are
          handled through Etsy. Message us there and we'll sort it out the same way.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
