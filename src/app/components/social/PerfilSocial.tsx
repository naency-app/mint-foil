"use client";

import { useSession } from "@/lib/auth-client";
import { useShowcase } from "@/lib/queries";
import { FollowButton } from "./FollowButton";
import { SocialStats } from "./SocialStats";

/**
 * Bloco social do perfil PÚBLICO: contagens + botão de seguir.
 *
 * A página é renderizada no servidor sem sessão, então `followStatus` chega
 * sempre "none". Com sessão, o perfil é pedido de novo no navegador (mesma
 * chave ['showcase', handle] que o resto usa) e o status certo assume.
 */
export function PerfilSocial({
  handle,
  followers,
  following,
}: {
  handle: string;
  followers: number;
  following: number;
}) {
  const { data: session } = useSession();
  const logado = !!session?.user;
  const { data } = useShowcase(handle, logado);

  const status = data?.followStatus ?? "none";
  // Logado e o status ainda não chegou: nada de "Seguir" piscando para quem
  // já segue (ou para o dono) — o espaço fica reservado até o servidor dizer.
  const esperando = logado && !data;
  return (
    <>
      <SocialStats
        handle={handle}
        followers={data?.followers ?? followers}
        following={data?.following ?? following}
      />
      {esperando ? (
        <div className="mt-3 h-9" />
      ) : (
        status !== "self" && (
          <div className="mt-3 flex justify-center">
            {/* Sem sessão o botão continua à vista e leva ao login */}
            <FollowButton handle={handle} status={status} tamanho="md" />
          </div>
        )
      )}
    </>
  );
}
