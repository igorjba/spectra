import { Opening } from "@/components/landing/opening";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <Opening />
      </main>
      <SiteFooter />
    </>
  );
}
