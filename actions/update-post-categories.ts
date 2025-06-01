"use server"

import { supabase } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export async function updatePostCategories(prevState: { success: boolean; message: string }, formData: FormData) {
  const postId = formData.get("postId") as string
  const categoriesString = formData.get("categories") as string // Renomeado de 'tags'

  console.log("Server Action: updatePostCategories called for postId:", postId, "with categories:", categoriesString)

  if (!postId) {
    console.error("Server Action: ID do post não fornecido.")
    return { success: false, message: "ID do post não fornecido." }
  }

  const newCategories = categoriesString
    .split(",")
    .map((category) => category.trim())
    .filter(Boolean)

  try {
    const { error } = await supabase.from("posts_instagram").update({ categories: newCategories }).eq("id", postId) // Tabela e campo atualizados

    if (error) {
      console.error("Server Action: Erro ao atualizar categorias no Supabase:", error)
      return { success: false, message: `Erro ao salvar categorias: ${error.message}` }
    }

    console.log("Server Action: Categorias salvas com sucesso para postId:", postId)
    revalidatePath("/") // Revalida a página principal para mostrar as alterações
    return { success: true, message: "Categorias salvas com sucesso!" }
  } catch (error: any) {
    console.error("Server Action: Erro inesperado ao atualizar categorias:", error)
    return { success: false, message: `Erro inesperado: ${error.message || "Verifique o console."}` }
  }
}
