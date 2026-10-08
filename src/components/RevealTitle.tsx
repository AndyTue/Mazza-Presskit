import { motion, useReducedMotion, type Variants } from 'motion/react'
import type { ReactNode } from 'react'

const line: Variants = {
  hidden: { y: '108%' },
  shown: (i: number) => ({ y: '0%', transition: { duration: 0.9, ease: [0.2, 0.8, 0.2, 1], delay: i * 0.08 } }),
}

// Section heading revealed line by line as it enters the viewport. The clipping wrapper is
// what gets observed: the translated inner line is fully clipped, so observing it directly
// would never report it as visible.
export function RevealTitle({ id, lines, className = '' }: { id: string; lines: ReactNode[]; className?: string }) {
  const reduce = useReducedMotion()
  return (
    <h2 id={id} className={`disp h2 ${className}`}>
      {lines.map((content, i) => (
        <motion.span
          className="ln"
          key={i}
          initial={reduce ? false : 'hidden'}
          whileInView="shown"
          viewport={{ once: true, amount: 0.5 }}
        >
          <motion.span className="ln-in" variants={line} custom={i}>
            {content}
          </motion.span>
        </motion.span>
      ))}
    </h2>
  )
}
