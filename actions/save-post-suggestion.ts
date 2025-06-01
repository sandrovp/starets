"use server"

import { supabase } from "@/lib/supabase"

export async function savePostSuggestion(prevState: { success: boolean; message: string }, formData: FormData) {
  const suggestionText = formData.get("suggestionText") as string
  const suggestedCategories = formData.get("suggestedCategories") as string // Renomeado de 'suggestedCategory'

  console.log(
    "Server Action: savePostSuggestion called with text:",
    suggestionText.substring(0, 50) + "...",
    "and categories:",
    suggestedCategories,
  )

  if (!suggestionText) {
    console.error("Server Action: O texto da sugestão não pode estar vazio.")
    return { success: false, message: "O texto da sugestão não pode estar vazio." }
  }

  try {
    const { error } = await supabase.from("post_suggestions").insert({
      suggestion_text: suggestionText,
      suggested_category: suggestedCategories || null, // Mantém o nome da coluna no DB, mas usa a nova variável
    })

    if (error) {
      console.error("Server Action: Erro ao salvar sugestão de post no Supabase:", error)
      return { success: false, message: `Erro ao salvar sugestão: ${error.message}` }
    }

    console.log("Server Action: Sugestão salva com sucesso!")
    return { success: true, message: "Sugestão salva com sucesso!" }
  } catch (error: any) {
    console.error("Server Action: Erro inesperado ao salvar sugestão:", error)
    return { success: false, message: `Erro inesperado: ${error.message || "Verifique o console."}` }
  }
}
