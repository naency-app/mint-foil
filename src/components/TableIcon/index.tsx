/**
 * Central icon export with stroke=1.5 as default.
 * Import icons from here instead of @tabler/icons-react directly.
 *
 * Usage:
 *   import { IconPlus, IconX } from "@/components/TableIcon"
 *
 * For icons not listed here, use createIcon:
 *   import { createIcon } from "@/components/TableIcon"
 *   import { IconSomething } from "@tabler/icons-react"
 *   const Icon = createIcon(IconSomething)
 */

import type { Icon } from "@tabler/icons-react";
import * as _Icons from "@tabler/icons-react";

type IconProps = React.ComponentPropsWithoutRef<Icon>;

export function createIcon(Comp: Icon, defaultStroke = 1.5): Icon {
  function Wrapped({ stroke = defaultStroke, ...props }: IconProps) {
    return <Comp stroke={stroke} {...props} />;
  }
  Wrapped.displayName = (Comp as { displayName?: string }).displayName ?? "Icon";
  return Wrapped as unknown as Icon;
}

// ── Icons used in this project ───────────────────────────────────────────────

export const IconArrowLeft   = createIcon(_Icons.IconArrowLeft);
export const IconCards       = createIcon(_Icons.IconCards);
export const IconCheck       = createIcon(_Icons.IconCheck);
export const IconFolder      = createIcon(_Icons.IconFolder);
export const IconLayoutGrid  = createIcon(_Icons.IconLayoutGrid);
export const IconListDetails = createIcon(_Icons.IconListDetails);
export const IconLoader      = createIcon(_Icons.IconLoader);
export const IconLoader2     = createIcon(_Icons.IconLoader2);
export const IconLogout      = createIcon(_Icons.IconLogout);
export const IconLogout2     = createIcon(_Icons.IconLogout2);
export const IconMail        = createIcon(_Icons.IconMail);
export const IconMinus       = createIcon(_Icons.IconMinus);
export const IconPlus        = createIcon(_Icons.IconPlus);
export const IconSend        = createIcon(_Icons.IconSend);
export const IconSettings    = createIcon(_Icons.IconSettings);
export const IconTrendingDown = createIcon(_Icons.IconTrendingDown);
export const IconTrendingUp  = createIcon(_Icons.IconTrendingUp);
export const IconX           = createIcon(_Icons.IconX);
