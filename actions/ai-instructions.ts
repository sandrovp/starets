"use server"

import { supabase } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

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
    console.error("Erro ao buscar instruções de IA:", error)
    return []
  }
  return data as AIInstruction[]
}

export async function createAIInstruction(prevState: { success: boolean; message: string }, formData: FormData) {
  const name = formData.get("name") as string
  const instruction = formData.get("instruction") as string

  if (!name || !instruction) {
    return { success: false, message: "Nome e instrução são obrigatórios." }
  }

  try {
    const { error } = await supabase.from("ai_instructions").insert({
      name,
      instruction,
    })

    if (error) {
      console.error("Erro ao criar instrução de IA:", error)
      return { success: false, message: `Erro ao criar: ${error.message}` }
    }

    revalidatePath("/settings/ai-instructions")
    return { success: true, message: "Instrução criada com sucesso!" }
  } catch (error: any) {
    console.error("Erro inesperado ao criar instrução:", error)
    return { success: false, message: `Erro inesperado: ${error.message || "Verifique o console."}` }
  }
}

export async function updateAIInstruction(prevState: { success: boolean; message: string }, formData: FormData) {
  const id = formData.get("id") as string
  const name = formData.get("name") as string
  const instruction = formData.get("instruction") as string
  const is_active = formData.get("is_active") === "true" // Convert string to boolean

  if (!id || !name || !instruction) {
    return { success: false, message: "ID, nome e instrução são obrigatórios." }
  }

  try {
    const { error } = await supabase
      .from("ai_instructions")
      .update({
        name,
        instruction,
        is_active,
      })
      .eq("id", id)

    if (error) {
      console.error("Erro ao atualizar instrução de IA:", error)
      return { success: false, message: `Erro ao atualizar: ${error.message}` }
    }

    revalidatePath("/settings/ai-instructions")
    return { success: true, message: "Instrução atualizada com sucesso!" }
  } catch (error: any) {
    console.error("Erro inesperado ao atualizar instrução:", error)
    return { success: false, message: `Erro inesperado: ${error.message || "Verifique o console."}` }
  }
}

export async function deleteAIInstruction(id: string) {
  try {
    const { error } = await supabase.from("ai_instructions").delete().eq("id", id)

    if (error) {
      console.error("Erro ao deletar instrução de IA:", error)
      return { success: false, message: `Erro ao deletar: ${error.message}` }
    }

    revalidatePath("/settings/ai-instructions")
    return { success: true, message: "Instrução deletada com sucesso!" }
  } catch (error: any) {
    console.error("Erro inesperado ao deletar instrução:", error)
    return { success: false, message: `Erro inesperado: ${error.message || "Verifique o console."}` }
  }
}

export async function toggleAIInstructionActive(id: string, currentStatus: boolean) {
  try {
    const { error } = await supabase
      .from("ai_instructions")
      .update({
        is_active: !currentStatus,
      })
      .eq("id", id)

    if (error) {
      console.error("Erro ao alternar status da instrução de IA:", error)
      return { success: false, message: `Erro ao alternar status: ${error.message}` }
    }

    revalidatePath("/settings/ai-instructions")
    return { success: true, message: "Status da instrução atualizado!" }
  } catch (error: any) {
    console.error("Erro inesperado ao alternar status:", error)
    return { success: false, message: `Erro inesperado: ${error.message || "Verifique o console."}` }
  }
}
