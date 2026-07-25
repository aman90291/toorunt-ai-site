import { Container, Heading, Accent, Button } from "./ui";
import { DemoButton } from "./DemoButton";
import { Doodle } from "./Doodle";

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
        <p className="eyebrow flex items-center justify-center gap-2">
          {/* Teal, not gold: sunglow is 1.4:1 on white — the gold token only
              reads inside `.on-dark`. */}
          <Doodle name="burst" width={13} className="text-pass" />
          {eyebrow}
        </p>
        <Heading as="h2" className="mx-auto mt-5 max-w-3xl text-[clamp(32px,5vw,56px)] leading-[1.08]">
          {title} {accent && <Accent>{accent}</Accent>}
        </Heading>
        {sub && <p className="mx-auto mt-5 max-w-xl text-[17px] text-ink-dim">{sub}</p>}
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <DemoButton>Book a demo</DemoButton>
          <Button href="/product/" variant="ghost">
            See how it ships →
          </Button>
        </div>
      </Container>
    </section>
  );
}
