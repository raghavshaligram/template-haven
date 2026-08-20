import { createFileRoute } from "@tanstack/react-router";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqs } from "@/data/shop";

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z]+/g, "-");

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ & Help — ReadyTrackers Templates" },
      {
        name: "description",
        content:
          "Answers about digital downloads, Excel and Google Sheets compatibility, access issues and our refund policy.",
      },
      { property: "og:title", content: "FAQ & Help — ReadyTrackers" },
      {
        property: "og:description",
        content: "Downloads, compatibility, access and refunds — answered.",
      },
    ],
  }),
  component: Faq,
});

function Faq() {
  return (
    <div className="container-page max-w-3xl py-12">
      <h1 className="font-display text-4xl">FAQ &amp; Help</h1>
      <p className="mt-2 text-muted-foreground">
        Everything about downloads, templates and refunds — in plain language.
      </p>

      <div className="mt-10 space-y-10">
        {faqs.map((group) => (
          <section key={group.topic} id={slugify(group.topic)} className="scroll-mt-24">
            <h2 className="mb-3 font-display text-2xl text-primary">{group.topic}</h2>
            <Accordion type="single" collapsible className="rounded-2xl bg-card px-5 shadow-soft">
              {group.items.map((item) => (
                <AccordionItem key={item.q} value={item.q}>
                  <AccordionTrigger className="text-left text-base">{item.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        ))}
      </div>
    </div>
  );
}
