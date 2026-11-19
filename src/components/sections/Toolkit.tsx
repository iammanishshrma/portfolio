import { useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { ChevronRight } from "lucide-react"
import { SectionHeading } from "@/components/SectionHeading"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { toolkit, type Skill } from "@/data/resume"
import { cn } from "@/lib/utils"
import { EASE_OUT } from "@/lib/motion"

const LINE = "flex min-h-7 items-start gap-4 pr-4"

export function Toolkit() {
  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(toolkit.map((g) => [g.tag, true]))
  )
  const usedCount = toolkit.flatMap((g) => g.items).filter((s) => s.usedIn).length

  let ln = 0
  const lineNo = () => ++ln

  return (
    <section id="toolkit" className="relative scroll-mt-24 py-28 sm:py-36">
      <div className="mx-auto grid max-w-7xl gap-14 px-4 sm:px-8 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-20">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <SectionHeading title="Toolkit">
            What I reach for, written the way I spend most days. Fold a group to collapse it.
            The {usedCount} highlighted tags appear in the projects above; hover one to see where.
          </SectionHeading>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40, rotateX: 10 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 1, ease: EASE_OUT }}
          style={{ transformPerspective: 1400 }}
          className="surface-dark overflow-hidden rounded-2xl border border-ink/10 shadow-[0_1px_2px_rgb(19_19_22/0.05),0_24px_48px_-28px_rgb(19_19_22/0.28)]"
        >
          <div className="flex items-center gap-2 border-b border-ink/10 bg-well px-4">
            <span className="-mb-px border-b-2 border-sun px-1 py-2.5 font-mono text-xs text-ink">Toolkit.tsx</span>
          </div>

          <motion.div
            className="overflow-x-auto py-4 font-mono text-[0.8rem] leading-7 sm:text-[0.85rem]"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.035, delayChildren: 0.3 } } }}
          >
            <CodeLine n={lineNo()}>
              <Punct>&lt;</Punct>
              <Comp>Toolkit</Comp> <Attr>owner</Attr>
              <Punct>=</Punct>
              <Str>"Manish Sharma"</Str> <Attr>years</Attr>
              <Punct>={"{"}</Punct>
              <Num>6</Num>
              <Punct>{"}"}&gt;</Punct>
            </CodeLine>

            {toolkit.map((g) => {
              const isOpen = open[g.tag]
              const openLine = lineNo()
              return (
                <div key={g.tag}>
                  <CodeLine n={openLine} indent={1}>
                    <button
                      type="button"
                      onClick={() => setOpen((o) => ({ ...o, [g.tag]: !o[g.tag] }))}
                      aria-expanded={isOpen}
                      aria-label={`${isOpen ? "Collapse" : "Expand"} ${g.label}`}
                      className="group -ml-5 inline-flex items-center rounded text-left hover:bg-ink/5"
                    >
                      <motion.span animate={{ rotate: isOpen ? 90 : 0 }} className="mr-1 inline-flex text-ink-3 group-hover:text-ink">
                        <ChevronRight className="size-3.5" />
                      </motion.span>
                      <Punct>&lt;</Punct>
                      <span className="text-sun">{g.tag}</span>
                      {g.note && (
                        <>
                          {"\u00a0"}
                          <Attr>level</Attr>
                          <Punct>=</Punct>
                          <Str>"{g.note}"</Str>
                        </>
                      )}
                      <Punct>{isOpen ? ">" : " />"}</Punct>
                      {!isOpen && <span className="ml-2 text-ink-3">{`{/* ${g.items.length} hidden */}`}</span>}
                    </button>
                  </CodeLine>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: EASE_OUT }}
                        className="overflow-hidden"
                      >
                        <CodeLine n={lineNo()} indent={2} plain>
                          <span className="flex flex-wrap gap-x-1.5 gap-y-1 py-1">
                            {g.items.map((s) => (
                              <SkillTag key={s.tag} skill={s} />
                            ))}
                          </span>
                        </CodeLine>
                        <CodeLine n={lineNo()} indent={1} plain>
                          <Punct>&lt;/</Punct>
                          <span className="text-sun">{g.tag}</span>
                          <Punct>&gt;</Punct>
                        </CodeLine>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}

            <CodeLine n={lineNo()}>
              <Punct>&lt;/</Punct>
              <Comp>Toolkit</Comp>
              <Punct>&gt;</Punct>
            </CodeLine>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

function CodeLine({
  n,
  indent = 0,
  plain,
  children,
}: {
  n: number
  indent?: number
  plain?: boolean
  children: React.ReactNode
}) {
  const content = (
    <>
      <span className="w-8 shrink-0 text-right text-ink-3/60 select-none tabular">{n}</span>
      <span className="min-w-0 flex-1" style={{ paddingLeft: `${indent * 1.5}rem` }}>
        {children}
      </span>
    </>
  )
  if (plain) return <div className={LINE}>{content}</div>
  return (
    <motion.div
      className={LINE}
      variants={{
        hidden: { opacity: 0, x: -12 },
        show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: EASE_OUT } },
      }}
    >
      {content}
    </motion.div>
  )
}

function SkillTag({ skill }: { skill: Skill }) {
  const tag = (
    <motion.span
      whileHover={{ y: -2 }}
      tabIndex={skill.usedIn ? 0 : undefined}
      className={cn(
        "inline-flex items-center rounded-md px-1.5 transition-colors",
        skill.usedIn
          ? "cursor-help bg-sun/15 ring-1 ring-sun/40 hover:bg-sun/25"
          : "hover:bg-ink/5"
      )}
    >
      <Punct>&lt;</Punct>
      <Comp>{skill.tag}</Comp>
      {skill.attrs && (
        <>
          {"\u00a0"}
          <Attr>{skill.attrs.split("=")[0]}</Attr>
          <Punct>=</Punct>
          <Str>{skill.attrs.split("=")[1]}</Str>
        </>
      )}
      <Punct>&nbsp;/&gt;</Punct>
    </motion.span>
  )
  if (!skill.usedIn) return tag
  return (
    <Tooltip>
      <TooltipTrigger asChild>{tag}</TooltipTrigger>
      <TooltipContent side="top" sideOffset={6} className="max-w-64 flex-col items-start gap-0.5 font-sans">
        <span className="font-semibold">{skill.name}</span>
        <span className="opacity-80">{skill.usedIn}</span>
      </TooltipContent>
    </Tooltip>
  )
}

const Punct = ({ children }: { children: React.ReactNode }) => <span className="text-ink-3">{children}</span>
const Comp = ({ children }: { children: React.ReactNode }) => <span className="text-[#e8e8e3]">{children}</span>
const Attr = ({ children }: { children: React.ReactNode }) => <span className="text-[#8ec5ff]">{children}</span>
const Str = ({ children }: { children: React.ReactNode }) => <span className="text-[#b9e3a3]">{children}</span>
const Num = ({ children }: { children: React.ReactNode }) => <span className="text-[#ffb38a]">{children}</span>
