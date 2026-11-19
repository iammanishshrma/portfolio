import { useEffect } from "react"
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "motion/react"
import { RotateCcw, Turtle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { replayHero } from "@/lib/motion"

type Kind = "network" | "script" | "render" | "paint"

const KIND: Record<Kind, { label: string; bg: string; swatch: string }> = {
  network: { label: "Network", bg: "bg-net", swatch: "bg-net" },
  script: { label: "Scripting", bg: "bg-script", swatch: "bg-script" },
  render: { label: "Rendering", bg: "bg-render", swatch: "bg-render" },
  paint: { label: "Painting", bg: "bg-paint", swatch: "bg-paint" },
}

type Segment = { kind: Kind; start: number; end: number; note: string; lazy?: boolean }

const SCALE = 4 // seconds shown on the axis

const LANES: { id: string; label: string; fcp: number; segments: Segment[] }[] = [
  {
    id: "legacy",
    label: "Legacy portal",
    fcp: 3.2,
    segments: [
      { kind: "network", start: 0, end: 0.45, note: "HTML, then one large JavaScript bundle" },
      { kind: "script", start: 0.45, end: 2.3, note: "The whole app is parsed and run before anything shows" },
      { kind: "render", start: 2.3, end: 2.85, note: "Style and layout" },
      { kind: "paint", start: 2.85, end: 3.2, note: "First paint at 3.2s" },
    ],
  },
  {
    id: "rebuilt",
    label: "React rebuild",
    fcp: 1.6,
    segments: [
      { kind: "network", start: 0, end: 0.3, note: "HTML and the entry chunk only" },
      { kind: "script", start: 0.3, end: 0.95, note: "Only the current route runs; the rest is split out" },
      { kind: "render", start: 0.95, end: 1.3, note: "Style and layout" },
      { kind: "paint", start: 1.3, end: 1.6, note: "First paint at 1.6s" },
      { kind: "network", start: 2.5, end: 2.85, lazy: true, note: "Other routes lazy-load on demand, after first paint" },
      { kind: "script", start: 2.85, end: 3.1, lazy: true, note: "Lazy route chunk runs when it is needed" },
    ],
  },
]

const TICKS = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4]

export function RenderTrace({ play }: { play: boolean }) {
  const reduce = useReducedMotion()
  const t = useMotionValue(reduce ? SCALE : 0)

  useEffect(() => {
    if (!play) {
      t.set(0)
      return
    }
    if (reduce) {
      t.set(SCALE)
      return
    }
    t.set(0)
    const c = animate(t, SCALE, { duration: 2.8, ease: "linear", delay: 0.5 })
    return () => c.stop()
  }, [play, reduce, t])

  const playheadLeft = useTransform(t, (v) => `${(v / SCALE) * 100}%`)
  const playheadOpacity = useTransform(t, [0, 0.05, SCALE - 0.15, SCALE], [0, 1, 1, 0])

  return (
    <div className="relative overflow-hidden rounded-2xl border border-ink/10 bg-card shadow-[0_1px_2px_rgb(19_19_22/0.05),0_24px_48px_-28px_rgb(19_19_22/0.28)]">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-ink/10 px-4 py-3 sm:px-5">
        <p className="text-sm font-semibold text-ink">Performance trace, PNB MetLife portal</p>
        <p className="text-xs text-ink-3">Totals measured, breakdown illustrative</p>
      </div>

      <div className="px-4 pt-4 pb-3 sm:px-5">
        {/* time axis */}
        <div className="grid grid-cols-[5.5rem_1fr] gap-3 sm:grid-cols-[7rem_1fr]">
          <span />
          <div className="relative h-5">
            {TICKS.map((s) => (
              <span
                key={s}
                className={cn(
                  "absolute top-0 -translate-x-1/2 font-mono text-[0.7rem] text-ink-3 tabular first:translate-x-0 last:-translate-x-full",
                  !Number.isInteger(s) && "max-sm:hidden"
                )}
                style={{ left: `${(s / SCALE) * 100}%` }}
              >
                {s}s
              </span>
            ))}
          </div>
        </div>

        <div className="relative mt-1 space-y-3">
          {LANES.map((lane) => (
            <div key={lane.id} className="grid grid-cols-[5.5rem_1fr] items-center gap-3 sm:grid-cols-[7rem_1fr]">
              <span className="text-[0.8rem] leading-tight text-ink-2">{lane.label}</span>
              <div className="relative h-9 rounded-md bg-well">
                {TICKS.slice(1, -1).map((s) => (
                  <span
                    key={s}
                    className="absolute inset-y-0 w-px bg-ink/5"
                    style={{ left: `${(s / SCALE) * 100}%` }}
                  />
                ))}
                {lane.segments.map((seg, i) => (
                  <TraceSegment key={i} seg={seg} t={t} />
                ))}
                <FcpMarker t={t} at={lane.fcp} fast={lane.id === "rebuilt"} />
              </div>
            </div>
          ))}

          {/* playhead sweeping across both lanes */}
          <div className="pointer-events-none absolute inset-y-0 right-0 left-[calc(5.5rem+0.75rem)] sm:left-[calc(7rem+0.75rem)]">
            <motion.span
              className="absolute -top-1 -bottom-1 w-0.5 rounded-full bg-ink"
              style={{ left: playheadLeft, opacity: playheadOpacity }}
            />
          </div>
        </div>

        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-ink-2" aria-label="Legend">
          {(Object.keys(KIND) as Kind[]).map((k) => (
            <li key={k} className="flex items-center gap-1.5">
              <span className={cn("size-2.5 rounded-[3px]", KIND[k].swatch)} />
              {KIND[k].label}
            </li>
          ))}
          <li className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-[3px] border border-dashed border-ink-2" />
            After first paint
          </li>
        </ul>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-ink/10 px-4 py-3 sm:px-5">
        <button
          type="button"
          onClick={() => replayHero(1600)}
          className="inline-flex items-center gap-2 rounded-full bg-sun px-3.5 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-[#ffc714]"
        >
          <RotateCcw className="size-3.5" />
          Replay this page at 1.6s
        </button>
        <button
          type="button"
          onClick={() => replayHero(3200)}
          className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm text-ink-2 transition-colors hover:bg-ink/[0.06] hover:text-ink"
        >
          <Turtle className="size-3.5" />
          Feel the old 3.2s
        </button>
      </div>
    </div>
  )
}

function TraceSegment({ seg, t }: { seg: Segment; t: MotionValue<number> }) {
  const scaleX = useTransform(t, [seg.start, seg.end], [0, 1])
  const left = (seg.start / SCALE) * 100
  const width = ((seg.end - seg.start) / SCALE) * 100

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={`${KIND[seg.kind].label}, ${seg.start}s to ${seg.end}s. ${seg.note}`}
          className="group absolute inset-y-1.5 rounded-[4px] outline-offset-1"
          style={{ left: `${left}%`, width: `calc(${width}% - 2px)` }}
        >
          <motion.span
            className={cn(
              "absolute inset-0 origin-left rounded-[4px] transition-[filter] group-hover:brightness-125",
              seg.lazy ? "border border-dashed border-ink-2/60 bg-transparent" : KIND[seg.kind].bg
            )}
            style={{ scaleX }}
          />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={6} className="max-w-60 flex-col items-start gap-0.5">
        <span className="font-semibold">
          {KIND[seg.kind].label}, {seg.start.toFixed(2)}s to {seg.end.toFixed(2)}s
        </span>
        <span className="opacity-80">{seg.note}</span>
      </TooltipContent>
    </Tooltip>
  )
}

function FcpMarker({ t, at, fast }: { t: MotionValue<number>; at: number; fast: boolean }) {
  const opacity = useTransform(t, [at - 0.02, at + 0.12], [0, 1])
  const scale = useTransform(t, [at - 0.02, at + 0.2], [0.6, 1])
  const flip = at / SCALE > 0.9
  return (
    <motion.div
      className={cn(
        "pointer-events-none absolute -inset-y-1 flex items-center",
        flip && "-translate-x-full flex-row-reverse"
      )}
      style={{ left: `${(at / SCALE) * 100}%`, opacity }}
    >
      <span className={cn("h-full w-0.5 rounded-full", fast ? "bg-ink" : "bg-ink-3")} />
      <motion.span
        style={{ scale }}
        className={cn(
          flip ? "mr-1.5" : "ml-1.5",
          "rounded-md px-1.5 py-0.5 font-mono text-[0.7rem] font-semibold tabular",
          fast ? "bg-sun text-ink" : "bg-well text-ink-2"
        )}
      >
        {at}s
      </motion.span>
    </motion.div>
  )
}
