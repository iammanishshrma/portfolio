import type { ReactNode } from "react"
import { motion } from "motion/react"
import { EASE_OUT } from "@/lib/motion"

/** Words slide up out of a clipping mask, one after another. */
export function SectionHeading({
  title,
  children,
  className,
}: {
  title: string
  children?: ReactNode
  className?: string
}) {
  const words = title.split(" ")
  return (
    <div className={className}>
      <motion.h2
        className="display max-w-5xl text-[clamp(2.6rem,6.5vw,5.25rem)] text-balance text-ink"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.6 }}
        aria-label={title}
      >
        {words.map((w, i) => (
          <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.08em] align-bottom">
            <motion.span
              className="inline-block"
              variants={{
                hidden: { y: "105%", rotate: 4 },
                show: { y: "0%", rotate: 0, transition: { duration: 0.9, delay: i * 0.07, ease: EASE_OUT } },
              }}
            >
              {w}
              {i < words.length - 1 ? " " : ""}
            </motion.span>
          </span>
        ))}
      </motion.h2>
      {children && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.8, delay: 0.25, ease: EASE_OUT }}
          className="mt-5 max-w-[60ch] text-lg leading-relaxed text-ink-2"
        >
          {children}
        </motion.div>
      )}
    </div>
  )
}
