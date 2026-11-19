import { useEffect, useState } from "react"
import { toast } from "sonner"

/** Long, soft deceleration used across the site so every entrance feels related. */
export const EASE_OUT = [0.16, 1, 0.3, 1] as const
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() =>
    typeof window === "undefined" ? false : window.matchMedia(query).matches
  )
  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = () => setMatches(mql.matches)
    onChange()
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [query])
  return matches
}

export async function copyText(text: string, message: string) {
  try {
    await navigator.clipboard.writeText(text)
    toast.success(message, { description: text })
  } catch {
    toast.error("Couldn't reach the clipboard", {
      description: `Select and copy it instead: ${text}`,
    })
  }
}

export const HERO_REPLAY_EVENT = "hero:replay"

export function replayHero(ms: number) {
  window.dispatchEvent(new CustomEvent(HERO_REPLAY_EVENT, { detail: ms }))
}
