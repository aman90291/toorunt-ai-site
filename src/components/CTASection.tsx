import { Container, Heading, Accent, Button } from "./ui";

export function CTASection({
  eyebrow = "Get started",
  title,
  accent,
  sub,
  id,
}: {
  eyebrow?: string;
  title: string;
  accent?: string;
  sub?: string;
  id?: string;
}) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-line py-24 sm:py-32">
      <Container className="text-center">
        <p className="eyebrow justify-center">{eyebrow}</p>
        <Heading as="h2" split className="mx-auto mt-5 max-w-3xl text-[clamp(32px,5vw,56px)] leading-[1.08]">
          {title} {accent && <Accent>{accent}</Accent>}
        </Heading>
        {sub && <p className="mx-auto mt-5 max-w-xl text-[17px] text-ink-dim">{sub}</p>}
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Button href="mailto:hello@devagent.dev?subject=DevAgent%20demo">Book a demo</Button>
          <Button href="/product/" variant="ghost">
            See how it ships →
          </Button>
        </div>
      </Container>
    </section>
  );
}
