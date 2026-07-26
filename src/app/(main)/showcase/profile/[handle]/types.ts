export interface ShowcaseItem {
  id: string;
  cardId: string;
  name: string;
  imageUrl: string;
  setCode: string;
  setName: string | null;
  setSlug: string | null;
  collectorNumber: string | null;
  rarity: string;
  tcgName: string | null;
  tcgSlug: string | null;
  productType: "SINGLE" | "SEALED";
  language: string;
  quantity: number;
  condition: string;
  unitValue: number;
  priceChange: number;
  changePercent: number;
  totalValue: number;
}

export interface ShowcasePortfolio {
  id: string;
  name: string;
  itemCount: number;
  totalValue: number;
  items: ShowcaseItem[];
}

export type { Cover, CoverType } from "@/app/components/ProfileCover";
import type { Cover } from "@/app/components/ProfileCover";

export interface Showcase {
  handle: string;
  displayName: string;
  image: string | null;
  isPro: boolean;
  memberSince: string;
  cover: Cover;
  totalCards: number;
  totalSealed: number;
  totalValue: number;
  portfolios: ShowcasePortfolio[];
}
