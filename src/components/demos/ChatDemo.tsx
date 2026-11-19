import { useCallback, useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Bot, Mail, Phone, SendHorizontal, Volume2, WifiOff } from "lucide-react"
import { LinkedInIcon } from "@/components/icons"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { profile } from "@/data/resume"
import { EASE_OUT } from "@/lib/motion"

type Lang = "en" | "hi" | "mr"
type Topic = "about" | "speed" | "stack" | "widget" | "human"

type Msg =
  | { id: number; kind: "text"; from: "bot" | "user" | "agent"; text: string; streaming?: boolean; lang?: Lang }
  | { id: number; kind: "chips" }
  | { id: number; kind: "metric" }
  | { id: number; kind: "stack" }
  | { id: number; kind: "contact" }
  | { id: number; kind: "system"; text: string }

const LANGS: { id: Lang; label: string; speech: string }[] = [
  { id: "en", label: "EN", speech: "en-IN" },
  { id: "hi", label: "हि", speech: "hi-IN" },
  { id: "mr", label: "म", speech: "mr-IN" },
]

const COPY: Record<Lang, { greeting: string; placeholder: string; chips: Record<Topic, string> }> = {
  en: {
    greeting: "Hi! I'm a small demo of the support widget Manish built. Ask me about his work.",
    placeholder: "Ask about Manish's work",
    chips: {
      about: "What does Manish do?",
      speed: "How fast are his apps?",
      stack: "What's his stack?",
      widget: "How was this widget built?",
      human: "Talk to Manish",
    },
  },
  hi: {
    greeting: "नमस्ते! मैं मनीष के बनाए सपोर्ट विजेट का छोटा डेमो हूँ। उनके काम के बारे में पूछिए। (जवाब अंग्रेज़ी में आएँगे)",
    placeholder: "मनीष के काम के बारे में पूछें",
    chips: {
      about: "मनीष क्या करते हैं?",
      speed: "उनके ऐप कितने तेज़ हैं?",
      stack: "उनका टेक स्टैक क्या है?",
      widget: "यह विजेट कैसे बना?",
      human: "मनीष से बात करें",
    },
  },
  mr: {
    greeting: "नमस्कार! मी मनीषने बनवलेल्या सपोर्ट विजेटचा छोटा डेमो आहे. त्यांच्या कामाबद्दल विचारा. (उत्तरे इंग्रजीत येतील)",
    placeholder: "मनीषच्या कामाबद्दल विचारा",
    chips: {
      about: "मनीष काय करतात?",
      speed: "त्यांचे ॲप्स किती वेगवान आहेत?",
      stack: "त्यांचा टेक स्टॅक काय आहे?",
      widget: "हे विजेट कसे बनवले?",
      human: "मनीषशी बोला",
    },
  },
}

const ANSWERS: Record<Exclude<Topic, "human">, { text: string; extra?: Msg["kind"] }> = {
  about: {
    text: "Manish is a React developer and associate technical lead at Pelocal Fintech in Noida. He leads a team of 4 and has 6 years of front-end experience, mostly in React and TypeScript, with the last 2+ in fintech and insurance.",
  },
  speed: {
    text: "On the PNB MetLife portals his team halved first render time and cut the bundle by 30%, mostly through code splitting and lazy loading.",
    extra: "metric",
  },
  stack: {
    text: "Day to day: React, TypeScript, Zustand, TanStack Query, React Hook Form and Zod, built with Vite. He also works with REST, GraphQL and server-sent events, like the stream you're reading now.",
    extra: "stack",
  },
  widget: {
    text: "This is a small copy of an embeddable widget he architected. The real one handles 20+ message types, streams AI replies over SSE with auto-reconnect, retry and heartbeat, hands off to live agents, and supports OTP sign-in, voice, and English, Hindi and Marathi. Try the wifi button above to drop the connection mid-reply.",
  },
}

const KEYWORDS: [RegExp, Topic][] = [
  [/(human|agent|contact|email|hire|talk|call|reach|मनीष से|मनीषशी)/i, "human"],
  [/(fast|speed|perf|render|bundle|quick|load|तेज़|वेगवान)/i, "speed"],
  [/(stack|tech|tool|react|typescript|library|framework|स्टैक|स्टॅक)/i, "stack"],
  [/(widget|chat|bot|sse|stream|built|विजेट)/i, "widget"],
  [/(who|what|about|do|role|job|experience|क्या करते|काय करतात)/i, "about"],
]

let uid = 0
const nextId = () => ++uid

export function ChatDemo() {
  const [lang, setLang] = useState<Lang>("en")
  const [messages, setMessages] = useState<Msg[]>(() => greet("en"))
  const [typing, setTyping] = useState(false)
  const [busy, setBusy] = useState(false)
  const [conn, setConn] = useState<{ state: "live" | "reconnecting"; attempt: number }>({ state: "live", attempt: 0 })
  const [input, setInput] = useState("")
  const connRef = useRef(conn)
  useEffect(() => {
    connRef.current = conn
  }, [conn])
  const listRef = useRef<HTMLDivElement>(null)
  const timers = useRef<number[]>([])
  const canSpeak = typeof window !== "undefined" && "speechSynthesis" in window

  useEffect(() => {
    const t = timers.current
    return () => {
      t.forEach(clearTimeout)
      if (canSpeak) window.speechSynthesis.cancel()
    }
  }, [canSpeak])

  useEffect(() => {
    const el = listRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
  }, [messages, typing])

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms))
  }

  const push = (...m: Msg[]) => setMessages((prev) => [...prev.filter((x) => x.kind !== "chips"), ...m])

  /** Simulates an SSE stream: tokens arrive one by one and pause while the connection is down. */
  const stream = useCallback((text: string, from: "bot" | "agent", then?: () => void) => {
    const id = nextId()
    const tokens = text.split(/(\s+)/)
    let i = 0
    setMessages((prev) => [...prev, { id, kind: "text", from, text: "", streaming: true }])
    const tick = () => {
      if (connRef.current.state !== "live") {
        timers.current.push(window.setTimeout(tick, 150))
        return
      }
      i += 1
      const chunk = tokens.slice(0, i).join("")
      const done = i >= tokens.length
      setMessages((prev) =>
        prev.map((m) => (m.id === id && m.kind === "text" ? { ...m, text: chunk, streaming: !done } : m))
      )
      if (done) then?.()
      else timers.current.push(window.setTimeout(tick, 28 + Math.random() * 40))
    }
    timers.current.push(window.setTimeout(tick, 60))
  }, [])

  const ask = (topic: Topic, label: string) => {
    if (busy) return
    setBusy(true)
    push({ id: nextId(), kind: "text", from: "user", text: label })
    setTyping(true)

    if (topic === "human") {
      later(() => {
        setTyping(false)
        push({ id: nextId(), kind: "system", text: "Handing over to a person" })
        later(() => {
          push({ id: nextId(), kind: "system", text: "Manish joined the chat" })
          stream("Hi, Manish here. Email is the fastest way to reach me, and the details are below.", "agent", () => {
            push({ id: nextId(), kind: "contact" }, { id: nextId(), kind: "chips" })
            setBusy(false)
          })
        }, 900)
      }, 600)
      return
    }

    const a = ANSWERS[topic]
    later(() => {
      setTyping(false)
      stream(a.text, "bot", () => {
        const extra = a.extra ? [{ id: nextId(), kind: a.extra } as Msg] : []
        push(...extra, { id: nextId(), kind: "chips" })
        setBusy(false)
      })
    }, 650)
  }

  const askFree = (q: string) => {
    const match = KEYWORDS.find(([re]) => re.test(q))
    if (match) return ask(match[1], q)
    if (busy) return
    setBusy(true)
    push({ id: nextId(), kind: "text", from: "user", text: q })
    setTyping(true)
    later(() => {
      setTyping(false)
      stream("I'm a demo with a few prepared answers, so I didn't catch that one. Try one of these:", "bot", () => {
        push({ id: nextId(), kind: "chips" })
        setBusy(false)
      })
    }, 500)
  }

  const dropConnection = () => {
    if (conn.state !== "live") return
    setConn({ state: "reconnecting", attempt: 1 })
    later(() => setConn({ state: "reconnecting", attempt: 2 }), 900)
    later(() => {
      setConn({ state: "live", attempt: 0 })
      setMessages((prev) => {
        const streaming = prev.some((m) => m.kind === "text" && m.streaming)
        return streaming
          ? [...prev.slice(0, -1), { id: nextId(), kind: "system", text: "Reconnected. Resuming from the last event" }, prev[prev.length - 1]]
          : [...prev, { id: nextId(), kind: "system", text: "Reconnected after 2 attempts" }]
      })
    }, 2100)
  }

  const switchLang = (l: Lang) => {
    if (l === lang) return
    timers.current.forEach(clearTimeout)
    timers.current = []
    setBusy(false)
    setTyping(false)
    setLang(l)
    setMessages(greet(l))
  }

  const speak = (text: string, l: Lang = "en") => {
    if (!canSpeak) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = LANGS.find((x) => x.id === l)!.speech
    window.speechSynthesis.speak(u)
  }

  const live = conn.state === "live"

  return (
    <div className="mx-auto flex h-[34rem] w-full max-w-md flex-col overflow-hidden rounded-[1.75rem] border border-ink/10 bg-card shadow-[0_1px_2px_rgb(19_19_22/0.05),0_24px_48px_-28px_rgb(19_19_22/0.28)]">
      {/* header */}
      <div className="flex items-center gap-3 border-b border-ink/10 bg-card px-4 py-3">
        <span className="grid size-9 place-items-center rounded-full bg-sun text-ink">
          <Bot className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">PeLocal Assistant</p>
          <p className="flex items-center gap-1.5 text-xs text-ink-2" role="status">
            <span
              className={cn(
                "size-1.5 rounded-full",
                live ? "animate-heartbeat bg-good" : "animate-pulse bg-[#d97706]"
              )}
            />
            {live ? "Streaming live" : `Reconnecting, attempt ${conn.attempt}`}
          </p>
        </div>
        <div className="flex rounded-full bg-well p-0.5" role="radiogroup" aria-label="Language">
          {LANGS.map((l) => (
            <button
              key={l.id}
              type="button"
              role="radio"
              aria-checked={lang === l.id}
              aria-label={{ en: "English", hi: "Hindi", mr: "Marathi" }[l.id]}
              onClick={() => switchLang(l.id)}
              className={cn(
                "relative min-w-7 rounded-full px-1.5 py-0.5 text-xs transition-colors",
                lang === l.id ? "text-ink" : "text-ink-2 hover:text-ink"
              )}
            >
              {lang === l.id && (
                <motion.span layoutId="lang-pill" className="absolute inset-0 rounded-full bg-sun" />
              )}
              <span className="relative" lang={l.id}>
                {l.label}
              </span>
            </button>
          ))}
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={dropConnection}
              aria-label="Drop the connection"
              className="grid size-8 place-items-center rounded-full text-ink-2 transition-colors hover:bg-ink/10 hover:text-ink"
            >
              <WifiOff className="size-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Drop the connection and watch it recover</TooltipContent>
        </Tooltip>
      </div>

      {/* messages */}
      <div ref={listRef} data-lenis-prevent className="no-scrollbar flex-1 space-y-3 overflow-y-auto px-4 py-4">
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              layout="position"
              initial={{ opacity: 0, y: 14, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.35, ease: EASE_OUT }}
            >
              <MessageView msg={m} lang={lang} onAsk={ask} onSpeak={canSpeak ? speak : undefined} busy={busy} />
            </motion.div>
          ))}
          {typing && (
            <motion.div
              key="typing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex w-fit gap-1 rounded-2xl rounded-bl-md bg-well px-3.5 py-3"
              aria-label="Assistant is typing"
            >
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="size-1.5 rounded-full bg-ink-2"
                  animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* composer */}
      <form
        className="flex items-center gap-2 border-t border-ink/10 p-3"
        onSubmit={(e) => {
          e.preventDefault()
          const q = input.trim()
          if (!q || busy) return
          setInput("")
          askFree(q)
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={COPY[lang].placeholder}
          lang={lang}
          aria-label="Message"
          className="h-10 min-w-0 flex-1 rounded-full bg-well px-4 text-sm text-ink outline-none placeholder:text-ink-3 focus:ring-2 focus:ring-ink/25"
        />
        <button
          type="submit"
          disabled={!input.trim() || busy}
          aria-label="Send"
          className="grid size-10 place-items-center rounded-full bg-sun text-ink transition-all hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
        >
          <SendHorizontal className="size-4" />
        </button>
      </form>
    </div>
  )
}

function greet(l: Lang): Msg[] {
  return [
    { id: nextId(), kind: "text", from: "bot", text: COPY[l].greeting, lang: l },
    { id: nextId(), kind: "chips" },
  ]
}

function MessageView({
  msg,
  lang,
  onAsk,
  onSpeak,
  busy,
}: {
  msg: Msg
  lang: Lang
  onAsk: (t: Topic, label: string) => void
  onSpeak?: (text: string, l?: Lang) => void
  busy: boolean
}) {
  switch (msg.kind) {
    case "text": {
      const mine = msg.from === "user"
      return (
        <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
          <div
            lang={msg.lang}
            className={cn(
              "group relative max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[0.9rem] leading-relaxed",
              mine
                ? "rounded-br-md bg-sun text-ink"
                : msg.from === "agent"
                  ? "rounded-bl-md border border-good/30 bg-good/10 text-ink"
                  : "rounded-bl-md bg-well text-ink"
            )}
          >
            {msg.from === "agent" && <p className="mb-0.5 text-xs font-semibold text-good">Manish</p>}
            {msg.text}
            {msg.streaming && (
              <span className="ml-0.5 inline-block h-4 w-1.5 translate-y-0.5 animate-pulse rounded-sm bg-sun" />
            )}
            {!mine && !msg.streaming && onSpeak && (
              <button
                type="button"
                onClick={() => onSpeak(msg.text, msg.lang ?? "en")}
                aria-label="Read this message aloud"
                className="absolute -right-8 bottom-1 grid size-6 place-items-center rounded-full text-ink-3 opacity-0 transition-opacity group-hover:opacity-100 hover:text-ink focus-visible:opacity-100"
              >
                <Volume2 className="size-3.5" />
              </button>
            )}
          </div>
        </div>
      )
    }
    case "system":
      return (
        <p className="flex items-center justify-center gap-2 text-center text-xs text-ink-3">
          <span className="h-px w-6 bg-ink/10" />
          {msg.text}
          <span className="h-px w-6 bg-ink/10" />
        </p>
      )
    case "chips":
      return (
        <div className="flex flex-wrap gap-1.5" lang={lang}>
          {(Object.keys(COPY[lang].chips) as Topic[]).map((t, i) => (
            <motion.button
              key={t}
              type="button"
              disabled={busy}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * i }}
              onClick={() => onAsk(t, COPY[lang].chips[t])}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[0.8rem] transition-colors disabled:opacity-50",
                t === "human"
                  ? "border-good/40 text-good hover:bg-good/10"
                  : "border-ink/15 text-ink hover:border-sun hover:bg-sun"
              )}
            >
              {COPY[lang].chips[t]}
            </motion.button>
          ))}
        </div>
      )
    case "metric":
      return (
        <div className="max-w-[85%] rounded-2xl border border-ink/10 bg-paper p-3.5">
          <p className="text-xs text-ink-2">First render, PNB MetLife portals</p>
          <div className="mt-2 space-y-1.5">
            {[
              { label: "Before", v: 3.2, w: 1 },
              { label: "After", v: 1.6, w: 0.5 },
            ].map((r, i) => (
              <div key={r.label} className="grid grid-cols-[3.25rem_1fr_2.5rem] items-center gap-2 text-xs">
                <span className="text-ink-2">{r.label}</span>
                <span className="h-2 overflow-hidden rounded-full bg-ink/5">
                  <motion.span
                    className={cn("block h-full rounded-full", i ? "bg-ink" : "bg-ink-3/45")}
                    initial={{ width: 0 }}
                    animate={{ width: `${r.w * 100}%` }}
                    transition={{ duration: 0.9, delay: 0.2 + i * 0.25, ease: EASE_OUT }}
                  />
                </span>
                <span className="text-right font-mono text-ink tabular">{r.v}s</span>
              </div>
            ))}
          </div>
        </div>
      )
    case "stack":
      return (
        <div className="flex max-w-[90%] flex-wrap gap-1.5">
          {["React 19", "TypeScript", "Vite", "Zustand", "TanStack Query", "Zod", "SSE", "i18next"].map((s, i) => (
            <motion.span
              key={s}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 * i, type: "spring", stiffness: 400, damping: 20 }}
              className="rounded-md bg-well px-2 py-1 font-mono text-[0.72rem] text-ink-2"
            >
              {s}
            </motion.span>
          ))}
        </div>
      )
    case "contact":
      return (
        <div className="max-w-[85%] divide-y divide-ink/10 overflow-hidden rounded-2xl border border-ink/10 bg-paper text-sm">
          {[
            { icon: Mail, label: profile.email, href: `mailto:${profile.email}` },
            { icon: LinkedInIcon, label: "LinkedIn profile", href: profile.linkedin },
            { icon: Phone, label: profile.phone, href: profile.phoneHref },
          ].map(({ icon: Icon, label, href }) => (
            <a
              key={href}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              className="flex items-center gap-2.5 px-3.5 py-2.5 text-ink transition-colors hover:bg-ink/5"
            >
              <Icon className="size-4 text-ink-2" />
              <span className="truncate">{label}</span>
            </a>
          ))}
        </div>
      )
  }
}
