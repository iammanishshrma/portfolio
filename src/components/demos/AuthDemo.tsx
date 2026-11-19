import { useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Check, KeyRound, Loader2, Lock, LogOut, ShieldCheck, ShieldX, Smartphone } from "lucide-react"
import { cn } from "@/lib/utils"
import { EASE_OUT } from "@/lib/motion"

type Role = "agent" | "customer" | "admin"

const ROLES: { id: Role; label: string; portal: string }[] = [
  { id: "agent", label: "Agent", portal: "Distribution portal" },
  { id: "customer", label: "Customer", portal: "Customer portal" },
  { id: "admin", label: "Admin", portal: "Both portals" },
]

const ROUTES: { path: string; roles: Role[] }[] = [
  { path: "/dashboard", roles: ["agent", "customer", "admin"] },
  { path: "/policies", roles: ["agent", "customer", "admin"] },
  { path: "/leads", roles: ["agent", "admin"] },
  { path: "/commissions", roles: ["agent"] },
  { path: "/payments", roles: ["customer"] },
  { path: "/admin/users", roles: ["admin"] },
]

const DEMO_CODE = "246810"
const PHONE = "+91 90000 00000"
const SESSION_SECONDS = 15 * 60

type Step = "phone" | "otp" | "verifying" | "session"

const b64url = (o: object) => btoa(JSON.stringify(o)).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_")

export function AuthDemo() {
  const [step, setStep] = useState<Step>("phone")
  const [role, setRole] = useState<Role>("agent")
  const [path, setPath] = useState("/sign-in")

  const signOut = () => {
    setStep("phone")
    setPath("/sign-in")
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-ink/10 bg-card shadow-[0_1px_2px_rgb(19_19_22/0.05),0_24px_48px_-28px_rgb(19_19_22/0.28)]">
      {/* browser chrome */}
      <div className="flex items-center gap-3 border-b border-ink/10 bg-well px-4 py-2.5">
        <div className="flex gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-ink/15" />
          <span className="size-2.5 rounded-full bg-ink/15" />
          <span className="size-2.5 rounded-full bg-ink/15" />
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-md bg-ink/[0.05] px-3 py-1 font-mono text-xs text-ink-2">
          <Lock className="size-3 shrink-0 text-good" />
          <span className="truncate">portal.example</span>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={path}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              className="-ml-2 text-ink"
            >
              {path}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      <div className="relative min-h-[27rem] p-5 sm:p-6">
        <AnimatePresence mode="wait" initial={false}>
          {step === "phone" && (
            <Pane key="phone">
              <PhoneStep
                role={role}
                setRole={setRole}
                onSend={() => {
                  setStep("otp")
                  setPath("/verify")
                }}
              />
            </Pane>
          )}
          {step === "otp" && (
            <Pane key="otp">
              <OtpStep
                onBack={signOut}
                onVerified={() => {
                  setStep("verifying")
                  window.setTimeout(() => {
                    setStep("session")
                    setPath("/dashboard")
                  }, 900)
                }}
              />
            </Pane>
          )}
          {step === "verifying" && (
            <Pane key="verifying" className="flex min-h-[23rem] flex-col items-center justify-center gap-3 text-ink-2">
              <Loader2 className="size-6 animate-spin text-sun-ink" />
              Checking the code and issuing a session token
            </Pane>
          )}
          {step === "session" && (
            <Pane key="session">
              <SessionStep role={role} path={path} setPath={setPath} onSignOut={signOut} />
            </Pane>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function Pane({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24, filter: "blur(6px)" }}
      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, x: -24, filter: "blur(6px)" }}
      transition={{ duration: 0.35, ease: EASE_OUT }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function PhoneStep({
  role,
  setRole,
  onSend,
}: {
  role: Role
  setRole: (r: Role) => void
  onSend: () => void
}) {
  return (
    <div className="flex min-h-[23rem] flex-col">
      <p className="text-xl font-semibold text-ink" style={{ fontVariationSettings: '"wdth" 110' }}>
        Sign in
      </p>
      <p className="mt-1 text-sm text-ink-2">Pick who you are. The role ends up inside the token.</p>

      <div className="mt-6" role="radiogroup" aria-label="Sign in as">
        <p className="mb-2 text-sm text-ink-2">Sign in as</p>
        <div className="grid grid-cols-3 gap-1 rounded-xl bg-well p-1">
          {ROLES.map((r) => (
            <button
              key={r.id}
              type="button"
              role="radio"
              aria-checked={role === r.id}
              onClick={() => setRole(r.id)}
              className={cn(
                "relative rounded-lg px-2 py-2 text-left transition-colors",
                role === r.id ? "text-ink" : "text-ink-2 hover:text-ink"
              )}
            >
              {role === r.id && (
                <motion.span
                  layoutId="role-pill"
                  className="absolute inset-0 rounded-lg bg-sun"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative block text-sm font-semibold">{r.label}</span>
              <span className="relative block text-[0.7rem] leading-tight opacity-75">{r.portal}</span>
            </button>
          ))}
        </div>
      </div>

      <label className="mt-5 block">
        <span className="mb-2 block text-sm text-ink-2">Mobile number</span>
        <span className="flex items-center gap-2 rounded-xl border border-ink/10 bg-well px-3 py-2.5 font-mono text-ink">
          <Smartphone className="size-4 text-ink-3" />
          <input readOnly value={PHONE} className="w-full bg-transparent outline-none" aria-readonly />
        </span>
      </label>

      <button
        type="button"
        onClick={onSend}
        className="mt-auto inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-sun font-semibold text-ink transition-transform hover:-translate-y-0.5"
      >
        <KeyRound className="size-4" />
        Send one-time code
      </button>
    </div>
  )
}

function OtpStep({ onVerified, onBack }: { onVerified: () => void; onBack: () => void }) {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""))
  const [error, setError] = useState(false)
  const refs = useRef<(HTMLInputElement | null)[]>([])
  const timers = useRef<number[]>([])

  useEffect(() => {
    refs.current[0]?.focus({ preventScroll: true })
    const t = timers.current
    return () => t.forEach(clearTimeout)
  }, [])

  const submit = (code: string) => {
    if (code.length < 6) return
    if (code === DEMO_CODE) onVerified()
    else {
      setError(true)
      window.setTimeout(() => {
        setDigits(Array(6).fill(""))
        refs.current[0]?.focus({ preventScroll: true })
      }, 450)
    }
  }

  const setAt = (i: number, v: string) => {
    const clean = v.replace(/\D/g, "")
    if (clean.length > 1) {
      // pasted a whole code
      const next = clean.slice(0, 6).split("")
      while (next.length < 6) next.push("")
      setDigits(next)
      submit(next.join(""))
      return
    }
    setError(false)
    const next = [...digits]
    next[i] = clean
    setDigits(next)
    if (clean && i < 5) refs.current[i + 1]?.focus({ preventScroll: true })
    submit(next.join(""))
  }

  const autofill = () => {
    setError(false)
    setDigits(Array(6).fill(""))
    DEMO_CODE.split("").forEach((d, i) => {
      timers.current.push(
        window.setTimeout(() => {
          setDigits((prev) => {
            const next = [...prev]
            next[i] = d
            return next
          })
          if (i === 5) window.setTimeout(onVerified, 250)
        }, 110 * (i + 1))
      )
    })
  }

  return (
    <div className="flex min-h-[23rem] flex-col">
      <p className="text-xl font-semibold text-ink" style={{ fontVariationSettings: '"wdth" 110' }}>
        Enter the code
      </p>
      <p className="mt-1 text-sm text-ink-2">
        Sent to <span className="font-mono text-ink">{PHONE}</span>. For this demo the code is{" "}
        <span className="rounded bg-sun px-1 font-mono text-ink">{DEMO_CODE}</span>.
      </p>

      <div className={cn("mt-7 flex gap-2 sm:gap-2.5", error && "shake")}>
        {digits.map((d, i) => (
          <motion.input
            key={i}
            ref={(el) => {
              refs.current[i] = el
            }}
            value={d}
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            aria-label={`Digit ${i + 1}`}
            maxLength={6}
            onChange={(e) => setAt(i, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus({ preventScroll: true })
            }}
            animate={d ? { scale: [1, 1.12, 1] } : { scale: 1 }}
            transition={{ duration: 0.25 }}
            className={cn(
              "h-14 w-full max-w-12 min-w-0 rounded-xl border bg-well text-center font-mono text-xl sm:h-16 sm:max-w-14 sm:text-2xl text-ink outline-none transition-colors focus:border-ink/50",
              error ? "border-bad" : d ? "border-ink/40" : "border-ink/10"
            )}
          />
        ))}
      </div>
      <p className={cn("mt-3 h-5 text-sm", error ? "text-bad" : "text-transparent")} role="alert">
        {error ? `That code doesn't match. Use ${DEMO_CODE}.` : "."}
      </p>

      <div className="mt-auto flex gap-2">
        <button
          type="button"
          onClick={onBack}
          className="h-11 rounded-xl px-4 text-sm text-ink-2 transition-colors hover:bg-ink/5 hover:text-ink"
        >
          Change role
        </button>
        <button
          type="button"
          onClick={autofill}
          className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-sun font-semibold text-ink transition-transform hover:-translate-y-0.5"
        >
          Fill the demo code
        </button>
      </div>
    </div>
  )
}

function SessionStep({
  role,
  path,
  setPath,
  onSignOut,
}: {
  role: Role
  path: string
  setPath: (p: string) => void
  onSignOut: () => void
}) {
  const [remaining, setRemaining] = useState(SESSION_SECONDS)
  const [denied, setDenied] = useState<{ path: string; n: number } | null>(null)

  const token = useMemo(() => {
    const now = Math.floor(Date.now() / 1000)
    const header = b64url({ alg: "HS256", typ: "JWT" })
    const payload = { sub: "demo-user", role, iat: now, exp: now + SESSION_SECONDS }
    const sig = Array.from({ length: 43 }, () =>
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"[Math.floor(Math.random() * 64)]
    ).join("")
    return { header, body: b64url(payload), sig, payload }
  }, [role])

  useEffect(() => {
    const id = window.setInterval(() => setRemaining((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(id)
  }, [])

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0")
  const ss = String(remaining % 60).padStart(2, "0")

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-ink">Session token (JWT)</p>
          <p className="font-mono text-xs text-ink-2 tabular">
            expires in <span className="font-semibold text-ink">{mm}:{ss}</span>
          </p>
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 line-clamp-2 font-mono text-[0.72rem] leading-relaxed break-all"
        >
          <span className="text-[#c2334d]">{token.header}</span>
          <span className="text-ink-3">.</span>
          <span className="text-[#6b4fd3]">{token.body}</span>
          <span className="text-ink-3">.</span>
          <span className="text-[#1f6fb2]">{token.sig}</span>
        </motion.p>
        <pre className="mt-3 overflow-x-auto rounded-xl bg-well p-3 font-mono text-[0.75rem] leading-relaxed text-ink-2">
          {"{\n"}
          {'  "sub": '}
          <span className="text-sun-ink">"demo-user"</span>
          {",\n"}
          {'  "role": '}
          <motion.span
            key={role}
            initial={{ backgroundColor: "rgba(255,210,63,1)" }}
            animate={{ backgroundColor: "rgba(255,210,63,0.45)" }}
            transition={{ duration: 1.2 }}
            className="rounded px-0.5 text-ink"
          >
            "{role}"
          </motion.span>
          {",\n"}
          {'  "exp": '}
          <span className="text-[#1f6fb2]">{token.payload.exp}</span>
          {"\n}"}
        </pre>
      </div>

      <div>
        <p className="text-sm font-semibold text-ink">Route guard</p>
        <p className="mt-0.5 text-xs text-ink-2">Open a route. The guard reads the role from the token.</p>
        <ul className="mt-3 grid grid-cols-2 gap-1.5">
          {ROUTES.map((r, i) => {
            const ok = r.roles.includes(role)
            const isDenied = denied?.path === r.path
            return (
              <motion.li
                key={r.path}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i, duration: 0.4, ease: EASE_OUT }}
              >
                <button
                  type="button"
                  key={isDenied ? denied?.n : 0}
                  onClick={() => {
                    if (ok) {
                      setPath(r.path)
                      setDenied(null)
                    } else {
                      setDenied((d) => ({ path: r.path, n: (d?.n ?? 0) + 1 }))
                    }
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg border px-2.5 py-2 text-left font-mono text-[0.78rem] transition-colors",
                    path === r.path && ok
                      ? "border-good/50 bg-good/10 text-ink"
                      : isDenied
                        ? "shake border-bad/50 bg-bad/10 text-ink"
                        : "border-ink/10 text-ink-2 hover:border-ink/20 hover:text-ink"
                  )}
                >
                  {ok ? (
                    <ShieldCheck className="size-3.5 shrink-0 text-good" aria-label="Allowed" />
                  ) : (
                    <ShieldX className="size-3.5 shrink-0 text-bad" aria-label="Blocked" />
                  )}
                  <span className="truncate">{r.path}</span>
                </button>
              </motion.li>
            )
          })}
        </ul>
        <div className="mt-2 h-5 text-xs" role="status">
          <AnimatePresence mode="wait">
            {denied ? (
              <motion.p
                key={`d${denied.n}`}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-bad"
              >
                403 for role "{role}". The guard kept you on {path}.
              </motion.p>
            ) : (
              <motion.p
                key={path}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1 text-good"
              >
                <Check className="size-3.5" /> {path} rendered for role "{role}"
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      <button
        type="button"
        onClick={onSignOut}
        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-2 transition-colors hover:bg-ink/5 hover:text-ink"
      >
        <LogOut className="size-4" />
        Sign out and try another role
      </button>
    </div>
  )
}
