// Catálogo dos TCGs exibidos na grade da tela Explorar.
// Imagens vêm do getcollectr (public CDN). Apenas os 4 com `supported: true`
// têm dados no backend; os demais aparecem como "Em breve".

export interface TcgCatalogEntry {
  categoryId: number;
  name: string;
  image: string;
  slug: string | null;
  supported: boolean;
}

const IMG = "https://public.getcollectr.com/public-assets/images";

export const TCG_CATALOG: TcgCatalogEntry[] = [
  // ── Suportados (têm dados no backend) ───────────────────────
  {
    categoryId: 2,
    name: "Yu-Gi-Oh!",
    slug: "yugioh",
    supported: true,
    image: `${IMG}/f44a668c-3b84-40a7-90a1-6c4cd88a2d57.png?optimizer=image&format=webp&width=1200&quality=80&strip=metadata`,
  },
  {
    categoryId: 3,
    name: "Pokémon",
    slug: "pokemon",
    supported: true,
    image: `${IMG}/80150ac6-682a-4ffa-8ac1-420daecd50f6.png?optimizer=image&format=webp&width=1200&quality=80&strip=metadata`,
  },
  {
    categoryId: 1,
    name: "Magic: The Gathering",
    slug: "magic",
    supported: true,
    image: `${IMG}/a76a25e0-ab36-4ff2-bfc0-c9f365b40e91.png?optimizer=image&format=webp&width=1200&quality=80&strip=metadata`,
  },
  {
    categoryId: 68,
    name: "One Piece",
    slug: "onepiece",
    supported: true,
    image: `${IMG}/f8946b76-5018-4e2b-9ae2-ecaf91c08f39.png?optimizer=image&format=webp&width=1200&quality=80&strip=metadata`,
  },

  // ── Em breve (sem dados no backend) ─────────────────────────
  {
    categoryId: 63,
    name: "Digimon",
    slug: null,
    supported: false,
    image: `${IMG}/c26565ab-b555-483e-9e1f-ab53baa26329.png?optimizer=image&format=webp&width=1200&quality=80&strip=metadata`,
  },
  {
    categoryId: 27,
    name: "Dragon Ball Super",
    slug: null,
    supported: false,
    image: `${IMG}/44c326a5-0d8f-4106-8e41-7b809df95622.png?optimizer=image&format=webp&width=1200&quality=80&strip=metadata`,
  },
  {
    categoryId: 80,
    name: "Dragon Ball Super Fusion World",
    slug: null,
    supported: false,
    image: `${IMG}/e5da86e3-4ad3-4c2c-81c7-9c0afe592c52.png?optimizer=image&format=webp&width=1200&quality=80&strip=metadata`,
  },
  {
    categoryId: 24,
    name: "Final Fantasy TCG",
    slug: null,
    supported: false,
    image: `${IMG}/a27cba7a-1eaa-4ed9-b126-0938c9edb8f7.png?optimizer=image&format=webp&width=1200&quality=80&strip=metadata`,
  },
  {
    categoryId: 62,
    name: "Flesh and Blood",
    slug: null,
    supported: false,
    image: `${IMG}/89b37ca3-e0eb-46a2-a0ca-3ce8bea30ae0.png?optimizer=image&format=webp&width=1200&quality=80&strip=metadata`,
  },
  {
    categoryId: 74,
    name: "Grand Archive",
    slug: null,
    supported: false,
    image: `${IMG}/dbb61cac-d957-423a-aa2f-6f357e42fae8.png?optimizer=image&format=webp&width=1200&quality=80&strip=metadata`,
  },
  {
    categoryId: 86,
    name: "Gundam Card Game",
    slug: null,
    supported: false,
    image: `${IMG}/ae7701b2-60ae-45dc-9703-bad5ee102e2c.png?optimizer=image&format=webp&width=1200&quality=80&strip=metadata`,
  },
  {
    categoryId: 87,
    name: "hololive OFFICIAL CARD GAME",
    slug: null,
    supported: false,
    image: `${IMG}/d4acbe32-2c03-459c-8c2c-bf5fe28b884c.png?optimizer=image&format=webp&width=1200&quality=80&strip=metadata`,
  },
  {
    categoryId: 71,
    name: "Lorcana",
    slug: null,
    supported: false,
    image: `${IMG}/1da72a37-7edb-45ee-a6df-91bb41493dba.png?optimizer=image&format=webp&width=1200&quality=80&strip=metadata`,
  },
  {
    categoryId: 66,
    name: "MetaZoo",
    slug: null,
    supported: false,
    image: `${IMG}/dd021f3d-d8f1-4ca5-8792-30fd1f721913.png?optimizer=image&format=webp&width=1200&quality=80&strip=metadata`,
  },
  {
    categoryId: 89,
    name: "Riftbound",
    slug: null,
    supported: false,
    image: `${IMG}/a500af9d-5fba-4105-b0b9-27ac47f69a20.png?optimizer=image&format=webp&width=1200&quality=80&strip=metadata`,
  },
  {
    categoryId: 77,
    name: "Sorcery: Contested Realm",
    slug: null,
    supported: false,
    image: `${IMG}/6262c0b1-19db-4c8b-9399-505bb2ed3350.png?optimizer=image&format=webp&width=1200&quality=80&strip=metadata`,
  },
  {
    categoryId: 79,
    name: "Star Wars: Unlimited",
    slug: null,
    supported: false,
    image: `${IMG}/1498716f-778e-478a-9417-2cdb07d6369e.png?optimizer=image&format=webp&width=1200&quality=80&strip=metadata`,
  },
  {
    categoryId: 81,
    name: "Union Arena",
    slug: null,
    supported: false,
    image: `${IMG}/23518cf6-205a-41f1-b6e8-0719884ea0b6.png?optimizer=image&format=webp&width=1200&quality=80&strip=metadata`,
  },
  {
    categoryId: 20,
    name: "Weiss Schwarz",
    slug: null,
    supported: false,
    image: `${IMG}/4f24632c-4f5f-43ff-9a4f-d6b6ad614785.png?optimizer=image&format=webp&width=1200&quality=80&strip=metadata`,
  },
];
