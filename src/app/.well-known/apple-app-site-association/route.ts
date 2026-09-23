import { APP_ID } from "@/lib/app-links";

/**
 * Universal Links do iOS: é este arquivo que autoriza o app a abrir no lugar do
 * Safari quando alguém toca num link de mintfoil.com.
 *
 * É uma rota, e não um arquivo em `public/`, por causa do nome: sem extensão,
 * o Next serviria como `application/octet-stream` e o iOS descarta. Aqui o
 * `Content-Type: application/json` é explícito.
 *
 * ⚠️ O iOS busca este arquivo pela CDN da Apple no momento em que o app é
 * instalado — mudanças aqui só valem depois de reinstalar o app.
 *
 * Só `/showcase/*` entra: é o link que se compartilha. O resto da web
 * (explore, sets, card, portfólio) continua abrindo no navegador, que é o
 * combinado — só o scan é exclusivo do app.
 */
const APPLE_TEAM_ID = "6DAMQB8S68";

const AASA = {
  applinks: {
    details: [
      {
        appIDs: [`${APPLE_TEAM_ID}.${APP_ID}`],
        components: [{ "/": "/showcase/*", comment: "perfil público" }],
      },
    ],
  },
};

export const dynamic = "force-static";

export function GET() {
  return new Response(JSON.stringify(AASA), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
