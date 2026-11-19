import { MotionConfig, useReducedMotion } from "motion/react"
import { ReactLenis } from "lenis/react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import { SiteNav } from "@/components/SiteNav"
import { Hero } from "@/components/sections/Hero"
import { Projects } from "@/components/sections/Projects"
import { Experience } from "@/components/sections/Experience"
import { Toolkit } from "@/components/sections/Toolkit"
import { Contact } from "@/components/sections/Contact"

export default function App() {
  const reduce = useReducedMotion()

  const page = (
    <MotionConfig reducedMotion="user">
      <TooltipProvider delayDuration={120}>
        <a
          href="#main"
          className="fixed top-3 left-3 z-[70] -translate-y-20 rounded-full bg-sun px-4 py-2 font-semibold text-ink focus:translate-y-0"
        >
          Skip to content
        </a>
        <div>
          <SiteNav />
          <main id="main">
            <Hero />
            <Projects />
            <Experience />
            <Toolkit />
            <Contact />
          </main>
        </div>
        <Toaster position="bottom-center" />
      </TooltipProvider>
    </MotionConfig>
  )

  if (reduce) return page
  return (
    <ReactLenis root options={{ lerp: 0.1, wheelMultiplier: 1 }}>
      {page}
    </ReactLenis>
  )
}
