import { useEffect, useRef, useState } from "react"
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react"
import portrait from "@/assets/portrait.webp"
import { CodeLines, PaintFlash, ReservedBox, useRenderPhase } from "@/components/hero/Source"
import { cn } from "@/lib/utils"
import { EASE_IN_OUT, EASE_OUT, useMediaQuery } from "@/lib/motion"

const W = 720
const H = 988

const SOURCE = ["<img", '  className="portrait"', '  src="/portrait.webp"', '  alt="Manish Sharma"', "/>"]
const SOURCE_COMPACT = ["<img", "  src={photo}", "/>"]

const CLOSED = "inset(0 0 100% 0 round 14px)"
const OPEN = "inset(0 0 0% 0 round 14px)"

/**
 * Before the render the portrait is a dashed reserved box holding its own <img>
 * source. On render it paints in top to bottom behind a scan line, covering the
 * code. On hover it tilts toward the cursor and shows a DevTools-style
 * "inspect element" label with its live rendered size.
 */
export function Portrait({
  className,
  delay = 0.25,
  compact = false,
  typing = [0.15, 0.6],
}: {
  className?: string
  delay?: number
  /** smaller source text for the inline placement */
  compact?: boolean
  /** progress window in which the source types itself */
  typing?: [number, number]
}) {
  const reduce = useReducedMotion()
  const phase = useRenderPhase()
  const play = phase?.rendered ?? true
  const fine = useMediaQuery("(hover: hover) and (pointer: fine)")
  const ref = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [inspecting, setInspecting] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([e]) =>
      setSize({ w: Math.round(e.contentRect.width), h: Math.round(e.contentRect.height) })
    )
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // pointer position in the card, -0.5 to 0.5 on each axis
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const spring = { stiffness: 180, damping: 18, mass: 0.5 }
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-9, 9]), spring)
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [7, -7]), spring)
  const imgX = useSpring(useTransform(px, [-0.5, 0.5], [10, -10]), spring)
  const imgY = useSpring(useTransform(py, [-0.5, 0.5], [8, -8]), spring)

  return (
    <motion.div
      ref={ref}
      className={cn("group relative select-none", className)}
      style={{ rotateX, rotateY, transformPerspective: 900, aspectRatio: `${W} / ${H}` }}
      onPointerMove={(e) => {
        if (!fine || !play || !ref.current) return
        const r = ref.current.getBoundingClientRect()
        px.set((e.clientX - r.left) / r.width - 0.5)
        py.set((e.clientY - r.top) / r.height - 0.5)
      }}
      onPointerEnter={() => fine && play && setInspecting(true)}
      onPointerLeave={() => {
        px.set(0)
        py.set(0)
        setInspecting(false)
      }}
    >
      {/* the source, underneath the photo so the paint covers it */}
      <AnimatePresence initial={false}>
        {!play && (
          <motion.span
            key="source"
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { delay: delay + 1.2, duration: 0.2 } }}
          >
            <ReservedBox className="rounded-[14px]">
              <CodeLines
                lines={compact ? SOURCE_COMPACT : SOURCE}
                from={typing[0]}
                to={typing[1]}
                className={compact ? "text-[0.62rem] sm:text-[0.7rem]" : "text-[0.78rem]"}
              />
            </ReservedBox>
          </motion.span>
        )}
      </AnimatePresence>

      <motion.div
        className="absolute inset-0 overflow-hidden rounded-[14px] bg-well ring-1 ring-ink/10"
        initial={reduce ? false : { clipPath: CLOSED }}
        animate={{ clipPath: reduce || play ? OPEN : CLOSED }}
        transition={play ? { duration: 1.15, delay, ease: EASE_IN_OUT } : { duration: 0.25 }}
      >
        <motion.img
          src={portrait}
          width={W}
          height={H}
          alt="Manish Sharma"
          draggable={false}
          decoding="async"
          className="absolute inset-0 h-full w-full scale-[1.06] object-cover"
          style={{ x: imgX, y: imgY }}
          initial={reduce ? false : { filter: "blur(12px)" }}
          animate={{ filter: reduce || play ? "blur(0px)" : "blur(12px)" }}
          transition={{ duration: 0.9, delay: play ? delay + 0.35 : 0, ease: EASE_OUT }}
        />

        {/* DevTools element highlight */}
        <AnimatePresence>
          {inspecting && (
            <motion.span
              aria-hidden
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="pointer-events-none absolute inset-0 bg-[rgb(111_168_220/0.28)] ring-2 ring-[rgb(111_168_220)] ring-inset"
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* scan line that leads the paint; remounts each render */}
      {play && !reduce && (
        <motion.span
          key={phase?.runId ?? 0}
          aria-hidden
          className="pointer-events-none absolute inset-x-0 h-[3px] rounded-full bg-sun"
          initial={{ top: "0%", opacity: 1 }}
          animate={{ top: "100%", opacity: [1, 1, 0] }}
          transition={{
            top: { duration: 1.15, delay, ease: EASE_IN_OUT },
            opacity: { duration: 1.15, delay, times: [0, 0.85, 1] },
          }}
        />
      )}
      {play && phase && <PaintFlash key={`flash-${phase.runId}`} delay={delay + 1.1} className="rounded-[18px]" />}

      <AnimatePresence>
        {inspecting && size.w > 0 && (
          <motion.span
            aria-hidden
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-none absolute bottom-full left-0 mb-2.5 flex items-center gap-2 rounded-md border border-ink/10 bg-card px-2 py-1 font-mono text-[0.7rem] whitespace-nowrap shadow-[0_6px_20px_-8px_rgb(19_19_22/0.35)]"
          >
            <span>
              <span className="text-[#881280]">img</span>
              <span className="text-[#1a1aa6]">.portrait</span>
            </span>
            <span className="text-ink-3 tabular">
              {size.w} × {size.h}
            </span>
            <span className="absolute top-full left-3 size-2 -translate-y-1 rotate-45 border-r border-b border-ink/10 bg-card" />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
