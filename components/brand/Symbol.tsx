import { SYMBOL, LOGOTYPE } from "./paths";

type Props = { className?: string; title?: string };

/** Symbole Narcisse (arche et N à deux profils). Couleur héritée (currentColor). */
export function Symbol({ className, title }: Props) {
  return (
    <svg viewBox={`0 0 ${SYMBOL.w} ${SYMBOL.h}`} className={className} role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <path fill="currentColor" fillRule="evenodd" d={SYMBOL.d} />
    </svg>
  );
}

/** Logotype Narcisse (toujours en SVG, jamais en police). */
export function Logotype({ className, title }: Props) {
  return (
    <svg viewBox={`0 0 ${LOGOTYPE.w} ${LOGOTYPE.h}`} className={className} role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <path fill="currentColor" fillRule="evenodd" d={LOGOTYPE.d} />
    </svg>
  );
}
