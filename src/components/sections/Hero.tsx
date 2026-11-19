import { useEffect, useState } from "react"
import {
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
import {
  CodeLines,
  RenderBlock,
  RenderPhaseContext,
  ReservedBox,
  TypedLine,
} from "@/components/hero/Source"
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

        <RenderPhaseContext.Provider value={{ rendered, progress, runId: run.id }}>
          <HeroBody rendered={rendered} />
        </RenderPhaseContext.Provider>
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

// Seconds after the render at which each block turns from code into view.
const AT = { name: 0, portrait: 0.2, trace: 0.3, lede: 0.35, more: 0.45, actions: 0.55 }

// The JSX each block is "written" as before it renders.
const SOURCE = {
  lede: ['<p className="lede">', "  {role} at {company}.", "  {years} years of React + TS.", "</p>"],
  more: ['<p className="muted">', "  Led a team of {4} rebuilding {client}.", "</p>"],
  actions: ['<Button to="#projects" primary />', '<Button to="#contact" />', "<a href={resume} download />"],
  trace: ["<RenderTrace", '  title="PNB MetLife portal"', "  legacy={3.2}", "  rebuilt={1.6}", "/>"],
}

const CODE_TEXT = "text-[0.68rem] sm:text-[0.8rem]"

const rise = {
  hidden: { opacity: 0, y: 14, filter: "blur(8px)", transition: { duration: 0.2 } },
  show: (delay: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, delay, ease: EASE_OUT },
  }),
}

function HeroBody({ rendered }: { rendered: boolean }) {
  const lenis = useLenis()
  const go = (id: string) =>
    lenis ? lenis.scrollTo(`#${id}`, { offset: -24 }) : document.getElementById(id)?.scrollIntoView()
  const state = rendered ? "show" : "hidden"

  return (
    <div className="flex flex-1 flex-col">
      <div className="relative text-[clamp(4.25rem,24vw,11.5rem)] leading-[0.86] tracking-[-0.035em] md:text-[clamp(4.25rem,18vw,11.5rem)]">
        <RenderBlock source={<NameSource />} delay={AT.name} className="w-fit">
          <VariableText
            as="h1"
            lines={["Manish", "Sharma"]}
            rest={{ wdth: 100, wght: 780 }}
            play={rendered}
            rise={false}
            lineClassName={(i) => (i === 1 ? "md:pl-[0.9em]" : "")}
          />
        </RenderBlock>
        <Portrait className={`${PORTRAIT_WIDE} hidden xl:block`} delay={AT.portrait} typing={[0.15, 0.6]} />
      </div>

      <div className="mt-10 grid flex-1 items-end gap-10 lg:mt-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:gap-16">
        <div className="max-w-[34rem]">
          <div className="flex items-start gap-4 sm:gap-6 xl:block">
            <Portrait className={PORTRAIT_INLINE} delay={AT.portrait} compact typing={[0.15, 0.55]} />
            <RenderBlock
              className="flex-1"
              delay={AT.lede}
              source={<CodeLines lines={SOURCE.lede} from={0.3} to={0.7} className={CODE_TEXT} />}
            >
              <motion.p
                variants={rise}
                initial="hidden"
                animate={state}
                custom={AT.lede}
                className="text-lg leading-relaxed text-ink sm:text-[1.375rem]"
              >
                {profile.role[0].toUpperCase() + profile.role.slice(1)} and {profile.title.toLowerCase()} at{" "}
                {profile.company}. For {profile.years} years I've built front ends in React and TypeScript.
              </motion.p>
            </RenderBlock>
          </div>

          <RenderBlock
            className="mt-4"
            delay={AT.more}
            source={<CodeLines lines={SOURCE.more} from={0.45} to={0.8} className={CODE_TEXT} />}
          >
            <motion.p variants={rise} initial="hidden" animate={state} custom={AT.more} className="leading-relaxed text-ink-2">
              Most recently I led a team of 4 that rebuilt PNB MetLife's 20-year-old Distribution and
              Customer portals. This page renders the way those portals do now.
            </motion.p>
          </RenderBlock>

          <RenderBlock
            className="mt-7"
            delay={AT.actions}
            source={<CodeLines lines={SOURCE.actions} from={0.55} to={0.9} className={CODE_TEXT} />}
          >
            <motion.div
              variants={rise}
              initial="hidden"
              animate={state}
              custom={AT.actions}
              className="flex flex-wrap items-center gap-3"
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
          </RenderBlock>
        </div>

        <RenderBlock
          className="z-10"
          delay={AT.trace}
          source={
            <ReservedBox className="rounded-2xl">
              <CodeLines lines={SOURCE.trace} from={0.35} to={0.95} className={CODE_TEXT} />
            </ReservedBox>
          }
        >
          <motion.div
            initial={{ opacity: 0, y: 24, rotateX: 14, filter: "blur(10px)" }}
            animate={
              rendered
                ? { opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)" }
                : { opacity: 0, y: 24, rotateX: 14, filter: "blur(10px)" }
            }
            transition={rendered ? { duration: 1, delay: AT.trace, ease: EASE_OUT } : { duration: 0.2 }}
            style={{ transformPerspective: 1200 }}
          >
            <RenderTrace play={rendered} />
          </motion.div>
        </RenderBlock>
      </div>
    </div>
  )
}

/** The name as source: the opening tag, the words in faint mono at full size, the closing tag. */
function NameSource() {
  return (
    <>
      <span className="absolute bottom-full left-0 mb-1 font-mono text-[0.78rem] leading-normal tracking-normal">
        <TypedLine text={'<h1 className="display">'} from={0} to={0.1} />
      </span>
      <span className="block font-mono font-light tracking-[-0.05em] text-ink/25">
        <TypedLine plain text="Manish" from={0.08} to={0.3} />
        <span className="flex items-baseline md:pl-[0.9em]">
          <TypedLine plain text="Sharma" from={0.3} to={0.5} />
          <TypedLine
            text="</h1>"
            from={0.5}
            to={0.56}
            className="ml-3 font-mono text-[0.78rem] font-normal tracking-normal"
          />
        </span>
      </span>
    </>
  )
}
