import { lazy, Suspense, useRef, type ReactNode } from "react"
import { motion, useScroll, useTransform } from "motion/react"
import { MousePointerClick } from "lucide-react"
import { SectionHeading } from "@/components/SectionHeading"
import { cn } from "@/lib/utils"
import { EASE_OUT } from "@/lib/motion"

// Demos are split out of the main bundle, same trick as the portals.
const AuthDemo = lazy(() => import("@/components/demos/AuthDemo").then((m) => ({ default: m.AuthDemo })))
const ChatDemo = lazy(() => import("@/components/demos/ChatDemo").then((m) => ({ default: m.ChatDemo })))
const CampaignDemo = lazy(() =>
  import("@/components/demos/CampaignDemo").then((m) => ({ default: m.CampaignDemo }))
)

type Project = {
  id: string
  name: string
  kind: string
  backdrop: string
  summary: string
  points: { lead: string; rest: string }[]
  stack: string[]
  tryIt: string
  demo: ReactNode
}

const PROJECTS: Project[] = [
  {
    id: "portals",
    name: "PNB MetLife portals",
    kind: "Distribution and Customer portals, at Pelocal Fintech",
    backdrop: "Portals",
    summary:
      "A 20-year-old legacy system rebuilt as two React and TypeScript portals that serve thousands of agents and customers.",
    points: [
      { lead: "Login errors down 30%.", rest: " OTP sign-in, JWT session handling and RBAC route guards." },
      { lead: "First render 3.2s to 1.6s.", rest: " Code splitting and lazy loading, with a bundle 30% smaller." },
      { lead: "Lookups in seconds, not minutes.", rest: " REST APIs wired into role-based workflows cut manual processing by 35%." },
    ],
    stack: ["React", "TypeScript", "JWT", "OTP", "RBAC", "REST"],
    tryIt: "Sign in with a one-time code, then open routes your role can and can't reach.",
    demo: <AuthDemo />,
  },
  {
    id: "chatbot",
    name: "PeLocal AI Chatbot",
    kind: "Embeddable conversational support widget",
    backdrop: "Chatbot",
    summary:
      "A support widget any site can embed. AI replies stream in as they're generated, and a person can take over the conversation.",
    points: [
      { lead: "20+ dynamic message types,", rest: " from plain text to cards, quick replies and contact handoffs." },
      { lead: "Streaming over SSE", rest: " with auto-reconnect, retry and heartbeat, plus handoff from AI to a live agent." },
      { lead: "OTP sign-in, voice, and three languages:", rest: " English, Hindi and Marathi through i18next." },
    ],
    stack: ["React 19", "TypeScript", "Vite", "Zustand", "TanStack Query"],
    tryIt: "Ask a question, switch the language, or drop the connection mid-reply.",
    demo: <ChatDemo />,
  },
  {
    id: "peconnect",
    name: "PeConnect",
    kind: "Multi-channel campaign management panel",
    backdrop: "PeConnect",
    summary:
      "One panel for 6+ operational modules: campaigns, templates, reports, admin and payments.",
    points: [
      { lead: "Campaign setup effort down 35–40%", rest: " with CSV upload, template selection, scheduling and test sends." },
      { lead: "Real-time reporting", rest: " for delivered, read, failed and throughput." },
      { lead: "A template builder", rest: " that previews the message live as you type." },
    ],
    stack: ["React", "TypeScript", "TanStack Query", "Zustand", "Zod"],
    tryIt: "Watch the live report, edit a template, or walk through setting up a campaign.",
    demo: <CampaignDemo />,
  },
]

export function Projects() {
  return (
    <section id="projects" className="relative scroll-mt-24 overflow-x-clip py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <SectionHeading title="Projects you can try">
          Three things I've built, each with a small working version running in your browser on
          sample data.
        </SectionHeading>
      </div>

      <div className="mt-20 space-y-36 sm:space-y-48">
        {PROJECTS.map((p, i) => (
          <ProjectBlock key={p.id} project={p} flip={i % 2 === 1} />
        ))}
      </div>
    </section>
  )
}

function ProjectBlock({ project: p, flip }: { project: Project; flip: boolean }) {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const backdropX = useTransform(scrollYProgress, [0, 1], flip ? ["-25%", "5%"] : ["5%", "-25%"])
  const rotateX = useTransform(scrollYProgress, [0.05, 0.35], [16, 0])
  const demoY = useTransform(scrollYProgress, [0.05, 0.35], [80, 0])
  const demoOpacity = useTransform(scrollYProgress, [0.05, 0.25], [0, 1])

  return (
    <article ref={ref} id={`project-${p.id}`} className="relative isolate">
      {/* giant outlined word drifting with scroll */}
      <motion.p
        aria-hidden
        style={{ x: backdropX, WebkitTextStroke: "1px rgb(19 19 22 / 0.09)", fontVariationSettings: '"wdth" 125, "wght" 800' }}
        className="pointer-events-none absolute -top-16 left-0 -z-10 text-[clamp(7rem,22vw,20rem)] leading-none whitespace-nowrap text-transparent select-none sm:-top-24"
      >
        {p.backdrop}
      </motion.p>

      <div
        className={cn(
          "mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-8 lg:gap-16",
          flip ? "lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]" : "lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"
        )}
      >
        <motion.div
          className={cn(flip && "lg:order-2")}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.35 }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
        >
          <Reveal>
            <p className="text-sm text-ink-2">{p.kind}</p>
          </Reveal>
          <Reveal>
            <h3 className="display mt-2 text-[clamp(2.25rem,4.6vw,3.75rem)] text-ink">{p.name}</h3>
          </Reveal>
          <Reveal>
            <p className="mt-5 max-w-[52ch] text-lg leading-relaxed text-ink">{p.summary}</p>
          </Reveal>
          <ul className="mt-7 space-y-3.5">
            {p.points.map((pt) => (
              <Reveal key={pt.lead} as="li" className="flex gap-3 leading-relaxed text-ink-2">
                <span className="mt-[0.7em] h-px w-4 shrink-0 bg-ink" aria-hidden />
                <span>
                  <strong className="font-semibold text-ink">{pt.lead}</strong>
                  {pt.rest}
                </span>
              </Reveal>
            ))}
          </ul>
          <Reveal>
            <ul className="mt-7 flex flex-wrap gap-1.5" aria-label="Stack">
              {p.stack.map((s) => (
                <li key={s} className="rounded-full border border-ink/12 bg-card px-3 py-1 text-[0.8rem] text-ink-2">
                  {s}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal>
            <p className="mt-8 flex items-start gap-2.5 text-[0.95rem] font-medium text-ink">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-sun" aria-hidden>
                <MousePointerClick className="size-3.5" />
              </span>
              {p.tryIt}
            </p>
          </Reveal>
        </motion.div>

        <motion.div
          className={cn("relative", flip && "lg:order-1")}
          style={{ rotateX, y: demoY, opacity: demoOpacity, transformPerspective: 1400 }}
        >
          <Suspense fallback={<div className="skeleton h-[32rem] rounded-2xl" aria-label="Loading demo" />}>
            {p.demo}
          </Suspense>
        </motion.div>
      </div>
    </article>
  )
}

function Reveal({
  children,
  as = "div",
  className,
}: {
  children: ReactNode
  as?: "div" | "li"
  className?: string
}) {
  const Comp = as === "li" ? motion.li : motion.div
  return (
    <Comp
      className={className}
      variants={{
        hidden: { opacity: 0, y: 22, filter: "blur(6px)" },
        show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: EASE_OUT } },
      }}
    >
      {children}
    </Comp>
  )
}
