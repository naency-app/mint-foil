/**
 * A navbar vira a pílula flutuante ao rolar, e volta a ficar larga no topo.
 *
 * Um limite só (era `scrollY > 30`) fazia ela piscar: o trackpad sobe e desce
 * alguns pixels em volta do limite, e a cada passagem a navbar trocava de
 * forma — com a transição de 300 ms, um pula-pula sem fim (24/10). Com dois
 * limites, vira pílula depois de 48 px e só volta abaixo de 8 px: o vaivém
 * pequeno perto do topo não troca mais nada.
 */
export function navbarRolada(antes: boolean, y: number): boolean {
  return antes ? y > 8 : y > 48;
}
