"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils" // Importa a função cn para mesclar classes Tailwind

interface TextRevealCardProps {
  text: string
  revealText: string
  className?: string
}

export const TextRevealCard = ({ text, revealText, className }: TextRevealCardProps) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={cn(
        "relative w-full overflow-hidden bg-white p-8 rounded-xl shadow-sm border border-muted flex items-center justify-center cursor-pointer", // Atualizado para rounded-xl, shadow-sm, border-muted
        className,
      )}
    >
      <motion.p
        initial={{ opacity: 1 }}
        animate={{ opacity: isHovered ? 0 : 1 }}
        transition={{ duration: 0.3 }}
        className="text-2xl font-bold text-dark-text absolute whitespace-nowrap font-playfair-display" // Fontes e cores atualizadas
      >
        {text}
      </motion.p>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="text-2xl font-bold text-mustard absolute whitespace-nowrap font-playfair-display" // Fontes e cores atualizadas
      >
        {revealText}
      </motion.p>
    </motion.div>
  )
}
