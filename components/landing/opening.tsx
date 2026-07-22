import { HeroCopy } from "@/components/landing/hero";
import { LabCatalog } from "@/components/landing/lab-field";
import { SpectraField } from "@/components/landing/spectra-field";

/**
 * A home é uma superfície só: o campo ocupa a viewport inteira e permanece
 * fixo enquanto a página rola, então o hero e o catálogo aparecem sobre o mesmo
 * shader em vez de se anunciarem como seções empilhadas. O véu é uma camada
 * fixa também — escurece de cima para baixo para segurar a leitura dos cartões
 * sem nunca cortar a imagem em faixas.
 */
export function Opening() {
  return (
    <section className="relative">
      <div aria-hidden="true" className="fixed inset-0 -z-10">
        <SpectraField />
        <div className="absolute inset-0 bg-linear-to-b from-background/10 via-background/45 to-background/75" />
        <div className="absolute inset-0 bg-[radial-gradient(100%_75%_at_50%_40%,transparent_35%,var(--background)_100%)] opacity-55" />
      </div>

      <HeroCopy />
      <LabCatalog />
    </section>
  );
}
