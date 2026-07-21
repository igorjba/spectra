import { Approach } from "@/components/landing/approach";
import { ClosingCta } from "@/components/landing/closing-cta";
import { Hero } from "@/components/landing/hero";
import { LabField } from "@/components/landing/lab-field";
import { SystemShowcase } from "@/components/landing/system-showcase";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <Hero />
        <Approach />
        <LabField />
        <SystemShowcase />
        <ClosingCta />
      </main>
      <SiteFooter />
    </>
  );
}
