import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

export function ClosingCta() {
  return (
    <section className="relative overflow-hidden border-t border-border py-32 sm:py-44">
      {/* Spectral wash, masked to a soft bloom behind the copy. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.18] [mask-image:radial-gradient(60%_60%_at_50%_45%,black,transparent)]"
      >
        <div className="absolute inset-0 bg-[conic-gradient(from_180deg_at_50%_50%,var(--spectra-1),var(--spectra-2),var(--spectra-3),var(--spectra-4),var(--spectra-5),var(--spectra-1))] blur-3xl" />
      </div>

      <Reveal className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="font-display text-hero font-semibold text-balance text-foreground">
          The lab is open.
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
          Everything here renders in real time — no video, no screenshots. Move
          your cursor across the field and watch the shader answer.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/#lab" size="lg">
            Enter the lab
          </ButtonLink>
          <ButtonLink href="/#system" size="lg" variant="outline">
            View the system
          </ButtonLink>
        </div>
      </Reveal>
    </section>
  );
}
