"use server" // Adicionado de volta

import { supabase } from "@/lib/supabase"

export interface AIInstruction {
  id: string
  name: string
  instruction: string
  is_active: boolean
  created_at: string
}

export async function getAIInstructions(): Promise<AIInstruction[]> {
  const { data, error } = await supabase.from("ai_instructions").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching AI instructions:", error)
    return []
  }
  return data as AIInstruction[]
}
