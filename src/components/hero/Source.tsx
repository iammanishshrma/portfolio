import { createContext, useContext, type ReactNode } from "react"
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "motion/react"
import { cn } from "@/lib/utils"

/**
 * The hero starts as its own JSX source, typed in place, and each block turns
 * into the rendered element once the render clock finishes.
 */
type Phase = {
  rendered: boolean
  /** 0 to 1 across the render, drives the typing */
  progress: MotionValue<number>
  runId: number
}

export const RenderPhaseContext = createContext<Phase | null>(null)
export const useRenderPhase = () => useContext(RenderPhaseContext)

/* ----------------------------- syntax colours ----------------------------- */

type Kind = "punct" | "tag" | "attr" | "str" | "expr" | "text"

// Colours from the Chrome DevTools Elements panel, light theme.
const COLOR: Record<Kind, string> = {
  punct: "text-ink-3",
  tag: "text-[#881280]",
  attr: "text-[#994500]",
  str: "text-[#1a1aa6]",
  expr: "text-[#0f6b47]",
  text: "text-ink-2",
}

const TOKEN = /(<\/?)([A-Za-z][\w.]*)|(\/?>)|("[^"]*")|(\{[^}]*\})|([A-Za-z][\w-]*)(?==)|(=)/g

function tokenize(line: string) {
  const out: { t: string; k: Kind }[] = []
  let last = 0
  for (const m of line.matchAll(TOKEN)) {
    const at = m.index ?? 0
    if (at > last) out.push({ t: line.slice(last, at), k: "text" })
    if (m[1]) out.push({ t: m[1], k: "punct" }, { t: m[2], k: "tag" })
    else if (m[3]) out.push({ t: m[3], k: "punct" })
    else if (m[4]) out.push({ t: m[4], k: "str" })
    else if (m[5]) out.push({ t: m[5], k: "expr" })
    else if (m[6]) out.push({ t: m[6], k: "attr" })
    else if (m[7]) out.push({ t: m[7], k: "punct" })
    last = at + m[0].length
  }
  if (last < line.length) out.push({ t: line.slice(last), k: "text" })
  return out
}

/* ------------------------------ typed lines ------------------------------ */

/** One line of code that types itself in between `from` and `to` of the render progress. */
export function TypedLine({
  text,
  from,
  to,
  plain,
  className,
}: {
  text: string
  from: number
  to: number
  /** skip highlighting and inherit colour (used for the giant name) */
  plain?: boolean
  className?: string
}) {
  const phase = useRenderPhase()
  const fallback = useMotionValue(1)
  const clipPath = useTransform(phase?.progress ?? fallback, [from, to], [
    "inset(-0.2em 100% -0.2em 0)",
    "inset(-0.2em 0% -0.2em 0)",
  ])
  return (
    <motion.span className={cn("block w-fit whitespace-pre", className)} style={{ clipPath }}>
      {plain
        ? text
        : tokenize(text).map((tok, i) => (
            <span key={i} className={COLOR[tok.k]}>
              {tok.t}
            </span>
          ))}
    </motion.span>
  )
}

/** A block of lines typed one after another inside the [from, to] window. */
export function CodeLines({
  lines,
  from,
  to,
  className,
}: {
  lines: string[]
  from: number
  to: number
  className?: string
}) {
  const step = (to - from) / lines.length
  return (
    // line-height set inline: a later text-[size] class would otherwise drop a leading-* class in cn()
    <span className={cn("block font-mono tracking-normal", className)} style={{ lineHeight: 1.6 }}>
      {lines.map((l, i) => (
        <TypedLine key={i} text={l} from={from + step * i} to={from + step * (i + 1)} />
      ))}
    </span>
  )
}

/* ------------------------------ render blocks ----------------------------- */

/**
 * Wraps a rendered element. Before the render it shows `source` on top of the
 * element's reserved box; at render the source fades out on `delay` while the
 * element runs its own entrance, and the box flashes like DevTools paint flashing.
 */
export function RenderBlock({
  source,
  delay,
  className,
  children,
}: {
  source: ReactNode
  delay: number
  className?: string
  children: ReactNode
}) {
  const phase = useRenderPhase()
  const rendered = phase?.rendered ?? true

  return (
    <div className={cn("relative", className)}>
      {children}
      <AnimatePresence initial={false}>
        {!rendered && (
          <motion.div
            key="source"
            aria-hidden
            className="pointer-events-none absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.25 } }}
            exit={{ opacity: 0, filter: "blur(6px)", transition: { delay, duration: 0.4 } }}
          >
            {source}
          </motion.div>
        )}
      </AnimatePresence>
      {rendered && phase && <PaintFlash key={phase.runId} delay={delay + 0.05} />}
    </div>
  )
}

/** Chrome's "Paint flashing" tool outlines each area as it paints. */
export function PaintFlash({ delay, className }: { delay: number; className?: string }) {
  const reduce = useReducedMotion()
  if (reduce) return null
  return (
    <motion.span
      aria-hidden
      className={cn(
        "pointer-events-none absolute -inset-1.5 z-20 rounded-lg bg-paint/15 ring-1 ring-paint/60",
        className
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0] }}
      transition={{ delay, duration: 0.7, times: [0, 0.15, 1] }}
    />
  )
}

/** Dashed reserved box for replaced elements (img, the trace panel) before they paint. */
export function ReservedBox({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <span
      className={cn(
        "absolute inset-0 flex items-center justify-center border border-dashed border-ink/25 bg-[repeating-linear-gradient(135deg,rgb(19_19_22/0.035)_0_1px,transparent_1px_9px)]",
        className
      )}
    >
      {children}
    </span>
  )
}
