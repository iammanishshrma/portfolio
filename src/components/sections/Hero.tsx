import { useEffect, useState } from "react"
import {
  AnimatePresence,
  animate,
  motion,
    useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "motion/react"
import { useLenis } from "lenis/react"
import { ArrowDown, Download, Mail } from "lucide-react"
import { VariableText } from "@/components/VariableText"
import { RenderTrace } from "@/components/hero/RenderTrace"
import { Portrait } from "@/components/hero/Portrait"
import { profile } from "@/data/resume"
import { EASE_OUT, HERO_REPLAY_EVENT } from "@/lib/motion"

type Run = { id: number; ms: number }

export function Hero() {
  const reduce = useReducedMotion()
  const lenis = useLenis()
  const [run, setRun] = useState<Run>({ id: 0, ms: reduce ? 0 : 1600 })
  const [rendered, setRendered] = useState(!!reduce)
  const elapsed = useMotionValue(0)
  const elapsedLabel = useTransform(elapsed, (v) => `${(v / 1000).toFixed(2)}s`)
  const progress = useMotionValue(reduce ? 1 : 0)

  useEffect(() => {
    if (run.ms === 0) {
      progress.set(1)
      setRendered(true)
      return
    }
    setRendered(false)
    elapsed.set(0)
    progress.set(0)
    const opts = { duration: run.ms / 1000, ease: "linear" } as const
    const p = animate(progress, 1, opts)
    const c = animate(elapsed, run.ms, { ...opts, onComplete: () => setRendered(true) })
    return () => {
      c.stop()
      p.stop()
    }
  }, [run, elapsed, progress])

  useEffect(() => {
    const onReplay = (e: Event) => {
      const ms = (e as CustomEvent<number>).detail
      if (lenis) lenis.scrollTo(0, { duration: 0.8 })
      else window.scrollTo({ top: 0 })
      setRun((r) => ({ id: r.id + 1, ms: reduce ? 0 : ms }))
    }
    window.addEventListener(HERO_REPLAY_EVENT, onReplay)
    return () => window.removeEventListener(HERO_REPLAY_EVENT, onReplay)
  }, [lenis, reduce])

  return (
    <section
      id="top"
      className="relative isolate flex min-h-svh flex-col overflow-hidden pt-24 pb-12 sm:pt-28"
    >
      {/* ambient layer */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="dot-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_40%_35%,black_20%,transparent_70%)]" />
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 sm:px-8">
        <RenderClock rendered={rendered} label={elapsedLabel} progress={progress} legacy={run.ms > 2000} instant={run.ms === 0} />

        <AnimatePresence mode="wait" initial={false}>
          {rendered ? (
            <motion.div
              key={`content-${run.id}`}
              className="flex flex-1 flex-col"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
            >
              <HeroContent />
            </motion.div>
          ) : (
            <motion.div
              key={`skeleton-${run.id}`}
              className="flex flex-1 flex-col"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, filter: "blur(6px)", transition: { duration: 0.2 } }}
            >
              <HeroSkeleton />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

function RenderClock({
  rendered,
  label,
  progress,
  legacy,
  instant,
}: {
  instant: boolean
  rendered: boolean
  label: MotionValue<string>
  progress: MotionValue<number>
  legacy: boolean
}) {
  return (
    <div className="mb-6 flex items-center gap-3" role="status" aria-live="polite">
      <div className="relative inline-flex items-center gap-2.5 overflow-hidden rounded-full border border-ink/10 bg-card py-1.5 pr-3.5 pl-2.5 text-sm">
        <motion.span
          aria-hidden
          className="absolute inset-y-0 left-0 origin-left bg-sun/55"
          style={{ scaleX: progress, width: "100%" }}
        />
        <span className="relative flex size-2.5 items-center justify-center">
          {rendered ? (
            <span className="size-2.5 animate-heartbeat rounded-full bg-good" />
          ) : (
            <span className="size-2.5 animate-spin rounded-full border-2 border-ink border-t-transparent" />
          )}
        </span>
        <span className="relative text-ink-2">
          {instant
            ? "Rendered right away, since you prefer less motion"
            : rendered
              ? "First render in"
              : legacy
                ? "Rendering like it's the old portal"
                : "Rendering"}
        </span>
        {!instant && (
          <motion.span className="relative font-mono text-[0.8rem] font-semibold text-ink tabular">
            {label}
          </motion.span>
        )}
      </div>
    </div>
  )
}

// Wide screens: right of the name, top-aligned with the render clock above it.
const PORTRAIT_WIDE = "!absolute right-0 top-[-3.6rem] w-[clamp(260px,22vw,330px)]"
// Narrower screens: a byline photo beside the first paragraph.
const PORTRAIT_INLINE = "w-28 shrink-0 sm:w-36 lg:w-32 xl:hidden"

const rise = {
  hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, delay: 0.55 + i * 0.12, ease: EASE_OUT },
  }),
}

function HeroContent() {
  const lenis = useLenis()
  const go = (id: string) => (lenis ? lenis.scrollTo(`#${id}`, { offset: -24 }) : document.getElementById(id)?.scrollIntoView())

  return (
    <>
      <div className="relative">
        <VariableText
          as="h1"
          lines={["Manish", "Sharma"]}
          rest={{ wdth: 100, wght: 780 }}
          className="text-[clamp(4.25rem,24vw,11.5rem)] md:text-[clamp(4.25rem,18vw,11.5rem)] leading-[0.86] tracking-[-0.035em]"
          lineClassName={(i) => (i === 1 ? "md:pl-[0.9em]" : "")}
        />
        <Portrait className={`${PORTRAIT_WIDE} hidden xl:block`} delay={0.2} />
      </div>

      <div className="mt-10 grid flex-1 items-end gap-10 lg:mt-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:gap-16">
        <div className="max-w-[34rem]">
          <div className="flex items-start gap-4 sm:gap-6 xl:block">
            <Portrait className={PORTRAIT_INLINE} delay={0.35} />
            <motion.p
              variants={rise}
              initial="hidden"
              animate="show"
              custom={0}
              className="text-lg leading-relaxed text-ink sm:text-[1.375rem]"
            >
              {profile.role[0].toUpperCase() + profile.role.slice(1)} and {profile.title.toLowerCase()} at{" "}
              {profile.company}. For {profile.years} years I've built front ends in React and TypeScript.
            </motion.p>
          </div>
          <motion.p
            variants={rise}
            initial="hidden"
            animate="show"
            custom={1}
            className="mt-4 leading-relaxed text-ink-2"
          >
            Most recently I led a team of 4 that rebuilt PNB MetLife's 20-year-old Distribution and
            Customer portals. This page renders the way those portals do now.
          </motion.p>

          <motion.div
            variants={rise}
            initial="hidden"
            animate="show"
            custom={2}
            className="mt-7 flex flex-wrap items-center gap-3"
          >
            <a
              href="#projects"
              onClick={(e) => {
                e.preventDefault()
                go("projects")
              }}
              className="group inline-flex h-12 items-center gap-2 rounded-full bg-sun px-6 font-semibold text-ink transition-transform hover:-translate-y-0.5"
            >
              Try the project demos
              <ArrowDown className="size-4 transition-transform group-hover:translate-y-0.5" />
            </a>
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault()
                go("contact")
              }}
              className="inline-flex h-12 items-center gap-2 rounded-full border border-ink/15 px-5 text-ink transition-colors hover:border-ink/30 hover:bg-ink/5"
            >
              <Mail className="size-4" />
              Get in touch
            </a>
            <a
              href={profile.resume}
              download
              className="inline-flex h-12 items-center gap-2 rounded-full px-4 text-ink-2 transition-colors hover:text-ink"
            >
              <Download className="size-4" />
              Resume (PDF)
            </a>
          </motion.div>
        </div>

        <motion.div
          className="relative z-10"
          initial={{ opacity: 0, y: 40, rotateX: 18, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.1, delay: 0.35, ease: EASE_OUT }}
          style={{ transformPerspective: 1200 }}
        >
          <RenderTrace play />
        </motion.div>
      </div>
    </>
  )
}

function HeroSkeleton() {
  return (
    <div aria-hidden className="flex flex-1 flex-col">
      <div className="relative space-y-[0.12em] text-[clamp(4.25rem,24vw,11.5rem)] md:text-[clamp(4.25rem,18vw,11.5rem)] leading-[0.86]">
        <div className="skeleton h-[0.8em] w-[58%] rounded-2xl" />
        <div className="skeleton h-[0.8em] w-[62%] rounded-2xl md:ml-[0.9em]" />
        <div className={`${PORTRAIT_WIDE} skeleton hidden aspect-[720/988] rounded-[14px] xl:block`} />
      </div>
      <div className="mt-10 grid flex-1 items-end gap-10 lg:mt-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:gap-16">
        <div className="max-w-[34rem] space-y-3">
          <div className="flex items-start gap-4 sm:gap-6 xl:block">
            <div className={`${PORTRAIT_INLINE} skeleton aspect-[720/988] rounded-[14px]`} />
            <div className="flex-1 space-y-3">
              <div className="skeleton h-5 w-full rounded-md" />
              <div className="skeleton h-5 w-[92%] rounded-md" />
              <div className="skeleton h-5 w-[60%] rounded-md" />
            </div>
          </div>
          <div className="h-3" />
          <div className="skeleton h-4 w-[95%] rounded-md" />
          <div className="skeleton h-4 w-[70%] rounded-md" />
          <div className="flex gap-3 pt-6">
            <div className="skeleton h-12 w-[55%] max-w-52 rounded-full" />
            <div className="skeleton h-12 w-[35%] max-w-36 rounded-full" />
          </div>
        </div>
        <div className="skeleton h-[19rem] rounded-2xl" />
      </div>
    </div>
  )
}
