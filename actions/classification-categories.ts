"use server"

import { supabase } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export interface ClassificationCategory {
  id: string
  name: string
  created_at: string
}

export async function getClassificationCategories(): Promise<ClassificationCategory[]> {
  const { data, error } = await supabase
    .from("classification_categories")
    .select("*")
    .order("name", { ascending: true })

  if (error) {
    console.error("Erro ao buscar categorias de classificação:", error)
    return []
  }
  return data as ClassificationCategory[]
}

export async function createClassificationCategory(
  prevState: { success: boolean; message: string },
  formData: FormData,
) {
  const name = formData.get("name") as string

  if (!name) {
    return { success: false, message: "O nome da categoria é obrigatório." }
  }

  try {
    const { error } = await supabase.from("classification_categories").insert({
      name,
    })

    if (error) {
      console.error("Erro ao criar categoria de classificação:", error)
      return { success: false, message: `Erro ao criar: ${error.message}` }
    }

    revalidatePath("/categorization") // Revalida a nova página
    return { success: true, message: "Categoria criada com sucesso!" }
  } catch (error: any) {
    console.error("Erro inesperado ao criar categoria:", error)
    return { success: false, message: `Erro inesperado: ${error.message || "Verifique o console."}` }
  }
}

export async function updateClassificationCategory(
  prevState: { success: boolean; message: string },
  formData: FormData,
) {
  const id = formData.get("id") as string
  const name = formData.get("name") as string

  if (!id || !name) {
    return { success: false, message: "ID e nome da categoria são obrigatórios." }
  }

  try {
    const { error } = await supabase
      .from("classification_categories")
      .update({
        name,
      })
      .eq("id", id)

    if (error) {
      console.error("Erro ao atualizar categoria de classificação:", error)
      return { success: false, message: `Erro ao atualizar: ${error.message}` }
    }

    revalidatePath("/categorization")
    return { success: true, message: "Categoria atualizada com sucesso!" }
  } catch (error: any) {
    console.error("Erro inesperado ao atualizar categoria:", error)
    return { success: false, message: `Erro inesperado: ${error.message || "Verifique o console."}` }
  }
}

export async function deleteClassificationCategory(id: string) {
  try {
    const { error } = await supabase.from("classification_categories").delete().eq("id", id)

    if (error) {
      console.error("Erro ao deletar categoria de classificação:", error)
      return { success: false, message: `Erro ao deletar: ${error.message}` }
    }

    revalidatePath("/categorization")
    return { success: true, message: "Categoria deletada com sucesso!" }
  } catch (error: any) {
    console.error("Erro inesperado ao deletar categoria:", error)
    return { success: false, message: `Erro inesperado: ${error.message || "Verifique o console."}` }
  }
}
