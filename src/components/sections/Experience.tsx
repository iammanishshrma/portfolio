import { useRef } from "react"
import { motion, useScroll, useSpring } from "motion/react"
import { ArrowUp, GraduationCap } from "lucide-react"
import { SectionHeading } from "@/components/SectionHeading"
import { education, experience, type Role } from "@/data/resume"
import { cn } from "@/lib/utils"
import { EASE_OUT } from "@/lib/motion"

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

function tenure(start: string, end: string) {
  const parse = (s: string) => {
    if (s === "Present") {
      const d = new Date()
      return d.getFullYear() * 12 + d.getMonth()
    }
    const [m, y] = s.split(" ")
    return Number(y) * 12 + MONTHS.indexOf(m)
  }
  const months = parse(end) - parse(start) + 1
  const y = Math.floor(months / 12)
  const m = months % 12
  return [y && `${y} yr${y > 1 ? "s" : ""}`, m && `${m} mo${m > 1 ? "s" : ""}`].filter(Boolean).join(" ")
}

export function Experience() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 55%"] })
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 })

  return (
    <section id="experience" className="relative scroll-mt-24 py-28 sm:py-36">
      <div className="mx-auto grid max-w-7xl gap-14 px-4 sm:px-8 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-20">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <SectionHeading title="Experience">
            Six years of front-end work, the last two and a half in fintech and insurance at
            Pelocal, where I moved from engineer to team lead.
          </SectionHeading>
        </div>

        <div ref={ref} className="relative pl-10 sm:pl-14">
          <div aria-hidden className="absolute top-2 bottom-2 left-[calc(0.625rem-0.5px)] w-px bg-ink/10 sm:left-[calc(0.75rem-0.5px)]">
            <motion.div
              className="h-full w-full origin-top bg-ink"
              style={{ scaleY: fill }}
            />
          </div>

          <div className="space-y-16">
            {experience.map((job) => (
              <div key={job.company}>
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.8 }}
                  transition={{ duration: 0.8, ease: EASE_OUT }}
                  className="mb-6 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1"
                >
                  <h3 className="text-2xl font-semibold text-ink" style={{ fontVariationSettings: '"wdth" 112' }}>
                    {job.company}
                  </h3>
                  <p className="text-sm text-ink-3">{job.location}</p>
                </motion.div>

                <div className="space-y-6">
                  {job.roles.map((role, ri) => (
                    <div key={role.title + role.start}>
                      {ri > 0 && job.promotion && (
                        <motion.p
                          initial={{ opacity: 0, scale: 0.9 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          className="mb-6 -ml-1 inline-flex items-center gap-1.5 rounded-full bg-sun px-3 py-1 text-xs font-medium text-ink"
                        >
                          <ArrowUp className="size-3.5" />
                          {job.promotion}
                        </motion.p>
                      )}
                      <RoleCard role={role} />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div>
              <h3 className="mb-6 text-2xl font-semibold text-ink" style={{ fontVariationSettings: '"wdth" 112' }}>
                Education
              </h3>
              <div className="space-y-4">
                {education.map((e) => (
                  <motion.div
                    key={e.degree}
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.8 }}
                    transition={{ duration: 0.8, ease: EASE_OUT }}
                    className="relative"
                  >
                    <Node icon />
                    <p className="font-mono text-xs text-ink-3 tabular">
                      {e.start} – {e.end}
                    </p>
                    <p className="mt-1 font-semibold text-ink">{e.degree}</p>
                    <p className="text-[0.95rem] text-ink-2">{e.school}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Node({ current, icon, className }: { current?: boolean; icon?: boolean; className?: string }) {
  return (
    <motion.span
      aria-hidden
      initial={{ scale: 0.4, backgroundColor: "#ebebe7" }}
      whileInView={{ scale: 1, backgroundColor: icon ? "#ffffff" : "#ffd23f" }}
      viewport={{ once: true, margin: "0px 0px -45% 0px" }}
      transition={{ type: "spring", stiffness: 300, damping: 18 }}
      className={cn(
        "absolute top-0.5 -left-10 grid size-5 place-items-center rounded-full border-2 border-paper ring-1 ring-ink/25 sm:-left-14 sm:size-6",
        current && "ring-ink/40",
        className
      )}
    >
      {icon && <GraduationCap className="size-3 text-ink-2" />}
      {current && <span className="absolute inset-0 animate-ping rounded-full bg-sun/40" />}
    </motion.span>
  )
}

function RoleCard({ role }: { role: Role }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
      className={cn(
        "relative rounded-2xl border p-5 transition-colors sm:p-6",
        role.current
          ? "border-ink/25 bg-card"
          : "border-ink/[0.08] bg-card/70 hover:border-ink/20"
      )}
    >
      <Node current={role.current} className="top-5 -left-[calc(2.5rem+1px)] sm:top-6 sm:-left-[calc(3.5rem+1px)]" />
      <motion.div
        variants={{
          hidden: { opacity: 0, x: 30, filter: "blur(6px)" },
          show: { opacity: 1, x: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: EASE_OUT } },
        }}
        className="flex flex-wrap items-center gap-x-3 gap-y-1"
      >
        <p className="font-mono text-xs text-ink-2 tabular">
          {role.start} – {role.end}
        </p>
        <span className="text-xs text-ink-3">{tenure(role.start, role.end)}</span>
        {role.current && (
          <span className="rounded-full bg-sun px-2 py-0.5 text-[0.7rem] font-semibold text-ink">Current role</span>
        )}
      </motion.div>
      <motion.p
        variants={{
          hidden: { opacity: 0, x: 30 },
          show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE_OUT } },
        }}
        className="mt-2 text-xl font-semibold text-ink sm:text-[1.4rem]"
        style={{ fontVariationSettings: '"wdth" 108' }}
      >
        {role.title}
      </motion.p>
      <ul className="mt-4 space-y-2.5">
        {role.points.map((pt) => (
          <motion.li
            key={pt.lead}
            variants={{
              hidden: { opacity: 0, y: 12 },
              show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
            }}
            className="flex gap-3 text-[0.98rem] leading-relaxed text-ink-2"
          >
            <span className="mt-[0.72em] size-1 shrink-0 rounded-full bg-ink-3" aria-hidden />
            <span>
              <strong className="font-semibold text-ink">{pt.lead}</strong>
              {pt.rest}
            </span>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  )
}
