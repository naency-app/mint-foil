import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333",
  fetchOptions: {
    credentials: "include",
  },
  plugins: [
    // Tipa os campos custom (User.additionalFields no backend) na sessão e no
    // updateUser — espelho do client do app. Sem isto, `user.handle` e
    // `updateUser({ nickname })` não existem para o TypeScript.
    inferAdditionalFields({
      user: {
        nickname: { type: "string", required: false },
        handle: { type: "string", required: false },
        handleEditCount: { type: "number", required: false },
        isPro: { type: "boolean", required: false },
        coverType: { type: "string", required: false },
        coverValue: { type: "string", required: false },
      },
    }),
  ],
});

export const { useSession, signOut, signIn } = authClient;
