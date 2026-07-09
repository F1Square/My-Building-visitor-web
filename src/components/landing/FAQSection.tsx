import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollReveal } from "@/components/landing/scroll/ScrollReveal";
import { FAQ_ITEMS } from "@/components/landing/faqData";

const FAQSection = () => (
  <section id="faq" className="py-24 px-4 bg-muted/30">
    <div className="max-w-3xl mx-auto">
      <ScrollReveal className="text-center mb-12">
        <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
          FAQ
        </p>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
          Common questions
        </h2>
        <p className="text-muted-foreground text-lg">
          Everything societies ask before getting started with MyBuilding.
        </p>
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <Accordion type="single" collapsible className="rounded-2xl border border-border bg-card px-6 shadow-sm">
          {FAQ_ITEMS.map((item) => (
            <AccordionItem key={item.id} value={item.id}>
              <AccordionTrigger className="text-left text-base font-semibold hover:no-underline">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ScrollReveal>
    </div>
  </section>
);

export default FAQSection;
