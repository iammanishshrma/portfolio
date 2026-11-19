import { useEffect, useRef } from "react"
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react"
import { cn } from "@/lib/utils"
import { EASE_OUT, useMediaQuery } from "@/lib/motion"

type Props = {
  lines: string[]
  as?: "h1" | "h2"
  className?: string
  lineClassName?: (index: number) => string
  /** "mount" plays immediately, "view" waits until scrolled into view */
  trigger?: "mount" | "view"
  delay?: number
  /** resting width and weight once the intro finishes */
  rest?: { wdth: number; wght: number }
  /** drive the intro from outside; overrides `trigger` */
  play?: boolean
  /** letters rise into place; turn off to morph in place */
  rise?: boolean
}

/**
 * Text set in Archivo's variable width axis. Letters arrive condensed and light,
 * then stretch out to their resting width. With a fine pointer, letters near the
 * cursor widen further.
 */
export function VariableText({
  lines,
  as = "h2",
  className,
  lineClassName,
  trigger = "mount",
  delay = 0,
  rest = { wdth: 100, wght: 760 },
  play: playProp,
  rise = true,
}: Props) {
  const ref = useRef<HTMLHeadingElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.4 })
  const play = playProp ?? (trigger === "mount" || inView)
  const mouseX = useMotionValue(-9999)
  const mouseY = useMotionValue(-9999)
  const finePointer = useMediaQuery("(hover: hover) and (pointer: fine)")
  const Tag = as === "h1" ? motion.h1 : motion.h2

  let n = 0
  return (
    <Tag
      ref={ref}
      aria-label={lines.join(" ")}
      className={cn("select-none", className)}
      onPointerMove={(e) => {
        if (!finePointer) return
        mouseX.set(e.clientX)
        mouseY.set(e.clientY)
      }}
      onPointerLeave={() => {
        mouseX.set(-9999)
        mouseY.set(-9999)
      }}
    >
      {lines.map((line, li) => (
        <span key={li} aria-hidden className={cn("block whitespace-nowrap", lineClassName?.(li))}>
          {[...line].map((ch, i) => {
            const index = n++
            return ch === " " ? (
              <span key={i} className="inline-block w-[0.28em]" />
            ) : (
              <Letter
                key={i}
                ch={ch}
                index={index}
                play={play}
                delay={delay}
                rest={rest}
                rise={rise}
                mouseX={mouseX}
                mouseY={mouseY}
              />
            )
          })}
        </span>
      ))}
    </Tag>
  )
}

function Letter({
  ch,
  index,
  play,
  delay,
  rest,
  rise,
  mouseX,
  mouseY,
}: {
  ch: string
  index: number
  play: boolean
  delay: number
  rest: { wdth: number; wght: number }
  rise: boolean
  mouseX: MotionValue<number>
  mouseY: MotionValue<number>
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const reduce = useReducedMotion()
  const intro = useMotionValue(reduce ? 1 : 0)

  useEffect(() => {
    if (!play) {
      intro.set(reduce ? 1 : 0)
      return
    }
    if (reduce) {
      intro.set(1)
      return
    }
    const controls = animate(intro, 1, {
      duration: 1.2,
      delay: delay + index * 0.045,
      ease: EASE_OUT,
    })
    return () => controls.stop()
  }, [play, reduce, delay, index, intro])

  const proximity = useTransform<number, number>([mouseX, mouseY], ([x, y]) => {
    const el = ref.current
    if (!el || x < -9000) return 0
    const r = el.getBoundingClientRect()
    const d = Math.hypot(x - (r.left + r.width / 2), (y - (r.top + r.height / 2)) * 1.4)
    return Math.max(0, 1 - d / 240)
  })
  const near = useSpring(proximity, { stiffness: 260, damping: 26, mass: 0.6 })

  const fontVariationSettings = useTransform<number, string>([intro, near], ([t, p]) => {
    const wdth = Math.min(125, 62 + (rest.wdth - 62) * t + (125 - rest.wdth) * p)
    const wght = Math.min(900, 180 + (rest.wght - 180) * t + (900 - rest.wght) * p)
    return `"wdth" ${wdth.toFixed(1)}, "wght" ${wght.toFixed(0)}`
  })
  const opacity = useTransform(intro, [0, 0.35], [0, 1])
  const y = useTransform(intro, (v) => (rise ? `${(1 - v) * 55}%` : "0%"))
  const filter = useTransform(intro, (v) =>
    v > 0.995 ? "none" : `blur(${((1 - v) * 10).toFixed(1)}px)`
  )

  return (
    <motion.span
      ref={ref}
      className="inline-block will-change-transform"
      style={{ fontVariationSettings, opacity, y, filter }}
    >
      {ch}
    </motion.span>
  )
}
