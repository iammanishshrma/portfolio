import { useEffect, useMemo, useRef, useState } from "react"
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react"
import { Check, CircleX, FileSpreadsheet, Loader2, Send } from "lucide-react"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { EASE_OUT } from "@/lib/motion"

type Tab = "report" | "template" | "setup"

const TABS: { id: Tab; label: string }[] = [
  { id: "report", label: "Live report" },
  { id: "template", label: "Template builder" },
  { id: "setup", label: "Campaign setup" },
]

export function CampaignDemo() {
  const [tab, setTab] = useState<Tab>("report")

  return (
    <div className="overflow-hidden rounded-2xl border border-ink/10 bg-card shadow-[0_1px_2px_rgb(19_19_22/0.05),0_24px_48px_-28px_rgb(19_19_22/0.28)]">
      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)} className="gap-0">
        <div className="flex items-center justify-between gap-3 border-b border-ink/10 bg-well px-3 py-2.5 sm:px-4">
          <TabsList className="h-9 bg-ink/[0.04] p-1 group-data-horizontal/tabs:h-9">
            {TABS.map((t) => (
              <TabsTrigger
                key={t.id}
                value={t.id}
                className="relative h-7 px-2.5 text-[0.8rem] text-ink-2 hover:text-ink data-active:bg-transparent data-active:text-ink data-active:shadow-none sm:px-3"
              >
                {tab === t.id && (
                  <motion.span
                    layoutId="peconnect-tab"
                    className="absolute inset-0 rounded-md bg-sun"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <span className="relative">{t.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          <span className="hidden text-xs font-semibold text-ink-2 sm:block">PeConnect</span>
        </div>

        <div className="min-h-[29rem] p-4 sm:p-5">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: EASE_OUT }}
            >
              <TabsContent value={tab} forceMount>
                {tab === "report" && <LiveReport />}
                {tab === "template" && <TemplateBuilder />}
                {tab === "setup" && <CampaignSetup />}
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </div>
      </Tabs>
    </div>
  )
}

/* ------------------------------ live report ------------------------------ */

const POINTS = 40

function LiveReport() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { amount: 0.3 })
  const reduce = useReducedMotion()
  const [totals, setTotals] = useState({ sent: 18420, delivered: 17758, read: 12612, failed: 331 })
  const [series, setSeries] = useState<number[]>(() => {
    let v = 46
    return Array.from({ length: POINTS }, () => (v = clamp(v + (Math.random() - 0.5) * 12, 24, 72)))
  })

  const lastRef = useRef(series[series.length - 1])

  useEffect(() => {
    if (!inView || reduce) return
    const id = window.setInterval(() => {
      const next = clamp(lastRef.current + (Math.random() - 0.5) * 14, 22, 74)
      lastRef.current = next
      const sent = Math.round(next)
      const delivered = Math.round(sent * (0.95 + Math.random() * 0.03))
      const read = Math.round(delivered * (0.66 + Math.random() * 0.1))
      const failed = Math.max(0, Math.round(sent * (0.01 + Math.random() * 0.015)))
      setSeries((s) => [...s.slice(1), next])
      setTotals((t) => ({
        sent: t.sent + sent,
        delivered: t.delivered + delivered,
        read: t.read + read,
        failed: t.failed + failed,
      }))
    }, 1000)
    return () => clearInterval(id)
  }, [inView, reduce])

  const pct = (a: number, b: number) => `${((a / b) * 100).toFixed(1)}%`

  return (
    <div ref={ref} className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-ink">Policy renewal reminders</p>
          <p className="text-xs text-ink-2">WhatsApp and SMS, sample data</p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-good/10 px-2.5 py-1 text-xs text-good">
          <span className="size-1.5 animate-heartbeat rounded-full bg-good" />
          Live
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Tile label="Sent" value={totals.sent} />
        <Tile label="Delivered" value={totals.delivered} note={`${pct(totals.delivered, totals.sent)} of sent`} />
        <Tile label="Read" value={totals.read} note={`${pct(totals.read, totals.delivered)} of delivered`} />
        <Tile
          label="Failed"
          value={totals.failed}
          note={`${pct(totals.failed, totals.sent)} of sent`}
          icon={<CircleX className="size-3.5 text-bad" aria-hidden />}
        />
      </div>

      <Sparkline series={series} />
    </div>
  )
}

function Tile({ label, value, note, icon }: { label: string; value: number; note?: string; icon?: React.ReactNode }) {
  const spring = useSpring(value, { stiffness: 70, damping: 18 })
  const text = useTransform(spring, (v) => Math.round(v).toLocaleString("en-IN"))
  useEffect(() => {
    spring.set(value)
  }, [value, spring])

  return (
    <div className="rounded-xl border border-ink/[0.08] bg-paper p-3">
      <p className="flex items-center gap-1.5 text-xs text-ink-2">
        {icon}
        {label}
      </p>
      <motion.p
        className="mt-1 text-xl text-ink tabular"
        style={{ fontVariationSettings: '"wdth" 108, "wght" 700' }}
      >
        {text}
      </motion.p>
      <p className="mt-0.5 h-4 text-[0.7rem] text-ink-3">{note}</p>
    </div>
  )
}

function Sparkline({ series }: { series: number[] }) {
  const W = 560
  const H = 120
  const max = 80
  const [hover, setHover] = useState<number | null>(null)
  const pts = series.map((v, i) => [(i / (POINTS - 1)) * W, H - (v / max) * H] as const)
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ")
  const area = `${line} L${W},${H} L0,${H} Z`
  const last = series[series.length - 1]
  const hv = hover !== null ? series[hover] : null

  return (
    <div className="rounded-xl border border-ink/[0.08] bg-paper p-3">
      <div className="flex items-baseline justify-between">
        <p className="text-xs text-ink-2">Throughput, messages per second</p>
        <p className="font-mono text-sm text-ink tabular">
          {Math.round(hv ?? last)}
          <span className="text-ink-3"> msg/s{hover !== null ? `, ${POINTS - 1 - hover}s ago` : ", now"}</span>
        </p>
      </div>
      <div className="relative mt-2">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-44 w-full overflow-visible"
          preserveAspectRatio="none"
          role="img"
          aria-label={`Throughput over the last ${POINTS} seconds, currently ${Math.round(last)} messages per second`}
          onPointerMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect()
            const i = Math.round(((e.clientX - r.left) / r.width) * (POINTS - 1))
            setHover(clamp(i, 0, POINTS - 1))
          }}
          onPointerLeave={() => setHover(null)}
        >
          <defs>
            <linearGradient id="spark-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#ffd23f" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#ffd23f" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map((g) => (
            <line key={g} x1="0" x2={W} y1={H * g} y2={H * g} stroke="rgb(19 19 22 / 0.07)" vectorEffect="non-scaling-stroke" />
          ))}
          <path d={area} fill="url(#spark-fill)" />
          <path d={line} fill="none" stroke="#131316" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
          {hover !== null && (
            <line
              x1={pts[hover][0]}
              x2={pts[hover][0]}
              y1="0"
              y2={H}
              stroke="rgb(19 19 22 / 0.35)"
              strokeDasharray="3 3"
              vectorEffect="non-scaling-stroke"
            />
          )}
        </svg>
        {/* markers drawn in HTML so they stay round under preserveAspectRatio="none" */}
        {(hover !== null ? [hover] : [POINTS - 1]).map((i) => (
          <span
            key={i}
            className="pointer-events-none absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-ink bg-sun"
            style={{ left: `${(pts[i][0] / W) * 100}%`, top: `${(pts[i][1] / H) * 100}%` }}
          />
        ))}
      </div>
    </div>
  )
}

/* ---------------------------- template builder ---------------------------- */

const DEFAULT_TEMPLATE =
  "Hi {{name}}, your policy {{policy}} is due for renewal on {{date}}. Renew in one tap: pay.example/{{policy}}"

function TemplateBuilder() {
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE)
  const [values, setValues] = useState<Record<string, string>>({ name: "Aarav", policy: "PL-20931", date: "28 Nov" })
  const vars = useMemo(() => [...new Set([...template.matchAll(/\{\{\s*(\w+)\s*\}\}/g)].map((m) => m[1]))], [template])
  const parts = useMemo(() => template.split(/(\{\{\s*\w+\s*\}\})/g), [template])

  const rendered = parts.map((p) => {
    const m = p.match(/^\{\{\s*(\w+)\s*\}\}$/)
    return m ? values[m[1]] || p : p
  }).join("")
  // GSM-7 vs Unicode decides how many characters fit in one SMS
  const unicode = /[^\x20-\x7E\n£¥èéùìòÇØøÅå]/.test(rendered)
  const single = unicode ? 70 : 160
  const multi = unicode ? 67 : 153
  const segments = rendered.length <= single ? 1 : Math.ceil(rendered.length / multi)

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="space-y-3">
        <label className="block">
          <span className="mb-1.5 block text-xs text-ink-2">Template</span>
          <textarea
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            rows={5}
            data-lenis-prevent
            className="w-full resize-none rounded-xl border border-ink/10 bg-well p-3 font-mono text-[0.78rem] leading-relaxed text-ink outline-none focus:border-ink/50"
          />
        </label>
        <div>
          <p className="mb-1.5 text-xs text-ink-2">
            Variables found: {vars.length ? "" : "none yet, type {{name}} to add one"}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <AnimatePresence initial={false}>
              {vars.map((v) => (
                <motion.label
                  key={v}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="block"
                >
                  <span className="mb-1 block font-mono text-[0.7rem] text-sun-ink">{`{{${v}}}`}</span>
                  <input
                    value={values[v] ?? ""}
                    onChange={(e) => setValues((s) => ({ ...s, [v]: e.target.value }))}
                    placeholder={`Value for ${v}`}
                    className="h-9 w-full rounded-lg border border-ink/10 bg-well px-2.5 text-sm text-ink outline-none placeholder:text-ink-3 focus:border-ink/50"
                  />
                </motion.label>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="flex flex-col">
        <span className="mb-1.5 block text-xs text-ink-2">Preview, updates as you type</span>
        <div className="flex-1 rounded-2xl bg-paper p-4 ring-1 ring-ink/[0.06]">
          <motion.div
            layout
            className="ml-auto max-w-[92%] rounded-2xl rounded-br-md bg-[#d6f0e0] px-3.5 py-2.5 text-[0.88rem] leading-relaxed text-ink"
          >
            {parts.map((p, i) => {
              const m = p.match(/^\{\{\s*(\w+)\s*\}\}$/)
              if (!m) return <span key={i}>{p}</span>
              const val = values[m[1]]
              return val ? (
                <motion.span
                  key={`${i}-${val}`}
                  initial={{ backgroundColor: "rgba(255,210,63,1)" }}
                  animate={{ backgroundColor: "rgba(255,210,63,0.55)" }}
                  transition={{ duration: 0.8 }}
                  className="rounded-sm px-0.5 font-semibold text-ink"
                >
                  {val}
                </motion.span>
              ) : (
                <span key={i} className="rounded border border-dashed border-bad/70 px-1 font-mono text-[0.75rem] text-bad">
                  {p}
                </span>
              )
            })}
            <span className="mt-1 block text-right text-[0.65rem] text-ink/60">10:24 am</span>
          </motion.div>
        </div>
        <p className="mt-2 text-xs text-ink-2 tabular">
          {rendered.length} characters, {segments} SMS {segments === 1 ? "segment" : "segments"}
          {unicode ? " (Unicode, 70 per segment)" : ""}
        </p>
      </div>
    </div>
  )
}

/* ----------------------------- campaign setup ----------------------------- */

const SAMPLE = [
  { name: "Aarav Mehta", phone: "+91 98•••• 4410" },
  { name: "Diya Kapoor", phone: "+91 99•••• 1287" },
  { name: "Kabir Rao", phone: "+91 97•••• 9053" },
  { name: "Ira Joshi", phone: "+91 90•••• 3364" },
]
const TEMPLATES = ["Renewal reminder", "Payment receipt", "Welcome message"]
const SLOTS = ["Send now", "Today, 6:00 pm", "Tomorrow, 10:00 am"]

function CampaignSetup() {
  const [uploaded, setUploaded] = useState(false)
  const [tpl, setTpl] = useState<string | null>(null)
  const [slot, setSlot] = useState<string | null>(null)
  const [testing, setTesting] = useState<"idle" | "sending" | "sent">("idle")

  const done = [uploaded, !!tpl, !!slot, testing === "sent"]
  const current = done.findIndex((d) => !d)
  const progress = (current === -1 ? 4 : current) / 4

  const steps = [
    {
      title: "Upload the audience",
      body: (
        <>
          {!uploaded ? (
            <button
              type="button"
              onClick={() => setUploaded(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-dashed border-ink/20 px-3 py-2 text-sm text-ink transition-colors hover:border-ink/40 hover:bg-sun/30"
            >
              <FileSpreadsheet className="size-4 text-sun-ink" />
              Use a sample CSV
            </button>
          ) : (
            <div className="overflow-hidden rounded-lg border border-ink/10 text-xs">
              {SAMPLE.map((r, i) => (
                <motion.div
                  key={r.name}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex justify-between border-b border-ink/5 px-3 py-1.5 last:border-0"
                >
                  <span className="text-ink">{r.name}</span>
                  <span className="font-mono text-ink-2">{r.phone}</span>
                </motion.div>
              ))}
            </div>
          )}
        </>
      ),
    },
    {
      title: "Pick a template",
      body: (
        <div className="flex flex-wrap gap-1.5">
          {TEMPLATES.map((t) => (
            <Choice key={t} active={tpl === t} onClick={() => setTpl(t)}>
              {t}
            </Choice>
          ))}
        </div>
      ),
    },
    {
      title: "Schedule it",
      body: (
        <div className="flex flex-wrap gap-1.5">
          {SLOTS.map((s) => (
            <Choice key={s} active={slot === s} onClick={() => setSlot(s)}>
              {s}
            </Choice>
          ))}
        </div>
      ),
    },
    {
      title: "Send a test first",
      body: (
        <button
          type="button"
          disabled={testing !== "idle"}
          onClick={() => {
            setTesting("sending")
            window.setTimeout(() => {
              setTesting("sent")
              toast.success("Test sent to 3 numbers", {
                description:
                  slot === "Send now"
                    ? `${tpl} campaign goes out after the test`
                    : `${tpl} campaign scheduled for ${slot?.toLowerCase()}`,
              })
            }, 1200)
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-sun px-3.5 py-2 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-70"
        >
          {testing === "sending" ? <Loader2 className="size-4 animate-spin" /> : testing === "sent" ? <Check className="size-4" /> : <Send className="size-4" />}
          {testing === "sending" ? "Sending test" : testing === "sent" ? "Test sent" : "Send test to 3 numbers"}
        </button>
      ),
    },
  ]

  return (
    <div className="relative">
      <div className="absolute top-3 bottom-3 left-[0.9rem] w-px bg-ink/10" aria-hidden>
        <motion.div
          className="w-full origin-top bg-ink"
          style={{ height: "100%" }}
          animate={{ scaleY: progress }}
          transition={{ type: "spring", stiffness: 80, damping: 18 }}
        />
      </div>
      <ol className="space-y-4">
        {steps.map((s, i) => {
          const isDone = done[i]
          const locked = current !== -1 && i > current
          return (
            <li key={s.title} className={cn("relative flex gap-4 transition-opacity", locked && "opacity-40")}>
              <motion.span
                animate={isDone ? { scale: [1, 1.25, 1] } : { scale: 1 }}
                className={cn(
                  "relative z-10 grid size-7 shrink-0 place-items-center rounded-full border text-xs font-semibold",
                  isDone ? "border-ink bg-sun text-ink" : i === current ? "border-ink bg-card text-ink" : "border-ink/15 bg-card text-ink-3"
                )}
              >
                {isDone ? <Check className="size-3.5" /> : i + 1}
              </motion.span>
              <div className={cn("min-w-0 flex-1 pt-0.5", locked && "pointer-events-none")} aria-disabled={locked}>
                <p className="mb-2 text-sm font-semibold text-ink">{s.title}</p>
                {s.body}
              </div>
            </li>
          )
        })}
      </ol>
      <AnimatePresence>
        {testing === "sent" && (
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setUploaded(false)
              setTpl(null)
              setSlot(null)
              setTesting("idle")
            }}
            className="mt-4 ml-11 text-sm text-ink-2 underline-offset-4 hover:text-ink hover:underline"
          >
            Start over
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}

function Choice({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-lg border px-3 py-1.5 text-sm transition-colors",
        active ? "border-ink bg-sun text-ink" : "border-ink/10 text-ink-2 hover:border-ink/25 hover:text-ink"
      )}
    >
      {children}
    </button>
  )
}

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v))
}
