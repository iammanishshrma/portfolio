import { lazy, Suspense, useEffect, useState } from "react"
import { motion, useMotionValueEvent, useScroll, useSpring } from "motion/react"
import { useLenis } from "lenis/react"
import { Menu, Search } from "lucide-react"
import { Kbd } from "@/components/ui/kbd"
import { profile, sections } from "@/data/resume"
import { cn } from "@/lib/utils"

const CommandMenu = lazy(() => import("@/components/CommandMenu"))

export function SiteNav() {
  const lenis = useLenis()
  const [active, setActive] = useState("")
  const [hidden, setHidden] = useState(false)
  const [intro, setIntro] = useState(true)
  const [open, setOpen] = useState(false)
  const [paletteLoaded, setPaletteLoaded] = useState(false)
  const { scrollY, scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 40, mass: 0.3 })
  const [isMac, setIsMac] = useState(true)

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent))
    const t = window.setTimeout(() => setIntro(false), 2600)
    return () => clearTimeout(t)
  }, [])

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0
    setHidden(y > prev && y > 500)
  })

  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[]
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && setActive(e.target.id))
      },
      { rootMargin: "-45% 0px -50% 0px" }
    )
    els.forEach((el) => io.observe(el))
    const top = document.getElementById("top")
    const topIo = new IntersectionObserver(([e]) => e.isIntersecting && setActive(""), {
      rootMargin: "-45% 0px -50% 0px",
    })
    if (top) topIo.observe(top)
    return () => {
      io.disconnect()
      topIo.disconnect()
    }
  }, [])

  useEffect(() => {
    if (open) setPaletteLoaded(true)
  }, [open])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const go = (id: string) => {
    const target = id === "top" ? 0 : `#${id}`
    if (lenis) lenis.scrollTo(target, { offset: id === "top" ? 0 : -24, duration: 1.4 })
    else if (id === "top") window.scrollTo({ top: 0, behavior: "smooth" })
    else document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
  }

  const activeLabel = sections.find((s) => s.id === active)?.label

  return (
    <>
      <motion.div
        aria-hidden
        className="fixed inset-x-0 top-0 z-50 h-[3px] origin-left bg-ink"
        style={{ scaleX: progress }}
      />

      <motion.header
        initial={{ y: -90, opacity: 0 }}
        animate={{ y: hidden && !open ? -90 : 0, opacity: 1 }}
        transition={intro ? { delay: 1.8, duration: 0.9, ease: [0.16, 1, 0.3, 1] } : { duration: 0.35, ease: "easeOut" }}
        className="fixed inset-x-0 top-4 z-40 flex justify-center px-4"
      >
        <nav
          aria-label="Main"
          className="flex items-center gap-1 rounded-full border border-ink/10 bg-card/90 p-1.5 shadow-[0_8px_24px_-16px_rgb(19_19_22/0.3)] backdrop-blur-md"
        >
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault()
              go("top")
            }}
            aria-label={`${profile.name}, back to top`}
            className="grid size-9 place-items-center rounded-full bg-sun text-[0.8rem] text-ink transition-transform hover:rotate-[-8deg]"
            style={{ fontVariationSettings: '"wdth" 125, "wght" 850' }}
          >
            MS
          </a>

          <ul className="hidden items-center md:flex">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  onClick={(e) => {
                    e.preventDefault()
                    go(s.id)
                  }}
                  aria-current={active === s.id ? "true" : undefined}
                  className={cn(
                    "relative block rounded-full px-3.5 py-2 text-sm transition-colors",
                    active === s.id ? "text-ink" : "text-ink-2 hover:text-ink"
                  )}
                >
                  {active === s.id && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-full bg-sun"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="relative">{s.label}</span>
                </a>
              </li>
            ))}
          </ul>

          <span className="px-2 text-sm text-ink-2 md:hidden" aria-live="polite">
            {activeLabel ?? "Manish Sharma"}
          </span>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="ml-1 hidden items-center gap-2 rounded-full border border-ink/10 py-1.5 pr-1.5 pl-3 text-sm text-ink-2 transition-colors hover:border-ink/20 hover:text-ink md:inline-flex"
          >
            <Search className="size-3.5" />
            Jump to
            <Kbd className="bg-ink/10 text-ink-2">{isMac ? "⌘" : "Ctrl"} K</Kbd>
          </button>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="grid size-9 place-items-center rounded-full text-ink transition-colors hover:bg-ink/10 md:hidden"
          >
            <Menu className="size-4" />
          </button>
        </nav>
      </motion.header>

      {paletteLoaded && (
        <Suspense fallback={null}>
          <CommandMenu open={open} setOpen={setOpen} go={go} />
        </Suspense>
      )}
    </>
  )
}
