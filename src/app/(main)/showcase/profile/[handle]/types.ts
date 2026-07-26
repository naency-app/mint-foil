// Tipos do showcase agora moram em @/lib/showcase (compartilhados com /portfolio
// e a API). Este arquivo re-exporta para não quebrar imports existentes.
export type {
  Cover,
  CoverType,
  Showcase,
  ShowcaseItem,
  ShowcasePortfolio,
} from "@/lib/showcase";
