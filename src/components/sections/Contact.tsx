import { useEffect, useRef, useState } from "react"
import { motion, useMotionValue, useSpring } from "motion/react"
import { Copy, Download, Mail, MapPin, Phone } from "lucide-react"
import { VariableText } from "@/components/VariableText"
import { LinkedInIcon } from "@/components/icons"
import { profile } from "@/data/resume"
import { copyText, EASE_OUT, useMediaQuery } from "@/lib/motion"

export function Contact() {
  return (
    <section id="contact" className="relative isolate scroll-mt-24 overflow-hidden pt-28 pb-10 sm:pt-40">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="dot-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_50%_100%,black_10%,transparent_65%)]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <VariableText
          lines={["Got a slow", "front end?"]}
          trigger="view"
          rest={{ wdth: 100, wght: 760 }}
          className="text-[clamp(3.25rem,11vw,9.5rem)] leading-[0.9] tracking-[-0.03em]"
          lineClassName={(i) => (i === 1 ? "md:pl-[1.2em]" : "")}
        />

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 0.8, delay: 0.4, ease: EASE_OUT }}
          className="mt-8 max-w-[52ch] text-xl leading-relaxed text-ink-2"
        >
          Or a legacy one that needs rebuilding, or a team that needs a lead. Email is the quickest
          way to reach me.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.9, delay: 0.5, ease: EASE_OUT }}
          className="mt-12"
        >
          <EmailButton />
        </motion.div>

        <motion.ul
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.6 }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.6 } } }}
          className="mt-10 flex flex-wrap gap-3"
        >
          {[
            { icon: Mail, label: "Write an email", href: `mailto:${profile.email}`, primary: true },
            { icon: LinkedInIcon, label: "LinkedIn", href: profile.linkedin },
            { icon: Phone, label: profile.phone, href: profile.phoneHref },
            { icon: Download, label: "Resume (PDF)", href: profile.resume, download: true },
          ].map(({ icon: Icon, label, href, primary, download }) => (
            <motion.li
              key={label}
              variants={{
                hidden: { opacity: 0, y: 16 },
                show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
              }}
            >
              <Magnetic>
                <a
                  href={href}
                  download={download || undefined}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  className={
                    primary
                      ? "inline-flex h-12 items-center gap-2 rounded-full bg-sun px-6 font-semibold text-ink"
                      : "inline-flex h-12 items-center gap-2 rounded-full border border-ink/15 bg-card px-5 text-ink transition-colors hover:border-ink/30 hover:bg-ink/5"
                  }
                >
                  <Icon className="size-4" />
                  {label}
                </a>
              </Magnetic>
            </motion.li>
          ))}
        </motion.ul>

        <LocalTime />
      </div>

      <Footer />
    </section>
  )
}

function EmailButton() {
  return (
    <button
      type="button"
      onClick={() => copyText(profile.email, "Email copied")}
      className="group relative block max-w-full text-left"
      aria-label={`Copy email address ${profile.email}`}
    >
      <span
        className="relative block overflow-hidden text-[clamp(1.35rem,4.6vw,3.6rem)] leading-tight break-all text-ink-2 transition-colors sm:break-normal"
        style={{ fontVariationSettings: '"wdth" 106, "wght" 600' }}
      >
        {profile.email}
        <span
          aria-hidden
          className="absolute inset-0 bg-sun text-ink transition-[clip-path] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] [clip-path:inset(0_100%_0_0)] group-hover:[clip-path:inset(0_0_0_0)] group-focus-visible:[clip-path:inset(0_0_0_0)]"
        >
          {profile.email}
        </span>
      </span>
      <span className="mt-2 inline-flex items-center gap-1.5 text-sm text-ink-3 transition-colors group-hover:text-ink-2">
        <Copy className="size-3.5" />
        Click to copy
      </span>
    </button>
  )
}

/** Gently pulls its child toward the cursor. */
function Magnetic({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const fine = useMediaQuery("(hover: hover) and (pointer: fine)")
  const x = useSpring(useMotionValue(0), { stiffness: 250, damping: 18, mass: 0.4 })
  const y = useSpring(useMotionValue(0), { stiffness: 250, damping: 18, mass: 0.4 })
  return (
    <motion.div
      ref={ref}
      style={{ x, y }}
      onPointerMove={(e) => {
        if (!fine || !ref.current) return
        const r = ref.current.getBoundingClientRect()
        x.set((e.clientX - (r.left + r.width / 2)) * 0.3)
        y.set((e.clientY - (r.top + r.height / 2)) * 0.4)
      }}
      onPointerLeave={() => {
        x.set(0)
        y.set(0)
      }}
    >
      {children}
    </motion.div>
  )
}

function LocalTime() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000 * 15)
    return () => clearInterval(id)
  }, [])
  const time = new Intl.DateTimeFormat("en-IN", {
    timeZone: profile.timeZone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(now)
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", { timeZone: profile.timeZone, hour: "numeric", hour12: false }).format(now)
  )
  const awake = hour >= 9 && hour < 22

  return (
    <p className="mt-14 flex flex-wrap items-center gap-x-2 gap-y-1 text-ink-2">
      <MapPin className="size-4 text-ink" aria-hidden />
      {profile.location}, where it's
      <span className="font-semibold text-ink tabular">{time.toLowerCase()}</span>
      <span className="text-ink-3">{awake ? "and I'm likely around." : "so expect a reply in the morning."}</span>
    </p>
  )
}

function Footer() {
  const [fcp, setFcp] = useState<number | null>(null)
  useEffect(() => {
    const entry = performance.getEntriesByName("first-contentful-paint")[0]
    if (entry) {
      setFcp(entry.startTime)
      return
    }
    try {
      const po = new PerformanceObserver((list) => {
        const e = list.getEntriesByName("first-contentful-paint")[0]
        if (e) setFcp(e.startTime)
      })
      po.observe({ type: "paint", buffered: true })
      return () => po.disconnect()
    } catch {
      return
    }
  }, [])

  return (
    <footer className="mx-auto mt-28 flex max-w-7xl flex-col gap-3 border-t border-ink/10 px-4 pt-8 text-sm text-ink-3 sm:flex-row sm:items-center sm:justify-between sm:px-8">
      <p>© {new Date().getFullYear()} {profile.name}. Built with React 19, Tailwind CSS, shadcn/ui and Motion.</p>
      {fcp !== null && (
        <p className="tabular">
          This page's real first paint on your device:{" "}
          <span className="font-mono text-ink-2">{(fcp / 1000).toFixed(2)}s</span>
        </p>
      )}
    </footer>
  )
}
