"use server"

import { generateText } from "ai"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { supabase } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
})

export async function autoClassifyPost(postId: string, availableCategories: string[]) {
  if (!process.env.OPENROUTER_API_KEY) {
    console.error("OPENROUTER_API_KEY não configurada para auto-classificação.")
    return { success: false, message: "OPENROUTER_API_KEY não configurada." }
  }

  if (!postId) {
    return { success: false, message: "ID do post não fornecido para auto-classificação." }
  }

  if (availableCategories.length === 0) {
    return {
      success: false,
      message: "Nenhuma categoria de classificação definida para auto-classificação.",
    }
  }

  try {
    const { data: postData, error: postError } = await supabase
      .from("posts_instagram")
      .select("caption")
      .eq("id", postId)
      .single()

    if (postError || !postData) {
      console.error("Erro ao buscar post para auto-classificação:", postError)
      return { success: false, message: `Erro ao buscar post: ${postError?.message}` }
    }

    const postCaption = postData.caption

    const systemPrompt = `Você é um assistente de categorização de conteúdo. Sua tarefa é analisar a legenda de um post e atribuir a ele uma ou mais categorias relevantes de uma lista fornecida.
    As categorias disponíveis são: ${availableCategories.join(", ")}.
    Responda APENAS com uma lista de categorias separadas por vírgula, sem texto adicional. Se nenhuma categoria for relevante, responda com "Outros".`

    const userPrompt = `Legenda do post: "${postCaption}"`

    const { text } = await generateText({
      model: openrouter.chat("openai/gpt-4o"),
      prompt: userPrompt,
      system: systemPrompt,
      temperature: 0.2,
      maxTokens: 100,
    })

    const rawCategories = text.trim()
    const suggestedCategories = rawCategories
      .split(",")
      .map((cat) => cat.trim())
      .filter(Boolean)

    const validSuggestedCategories = suggestedCategories.filter((cat) => availableCategories.includes(cat))
    const finalCategories = validSuggestedCategories.length > 0 ? validSuggestedCategories : ["Outros"]

    // Salvar as categorias sugeridas no banco de dados
    const { error: updateError } = await supabase
      .from("posts_instagram")
      .update({ categories: finalCategories })
      .eq("id", postId)

    if (updateError) {
      console.error("Erro ao salvar categorias auto-classificadas:", updateError)
      return { success: false, message: `Erro ao salvar categorias auto-classificadas: ${updateError.message}` }
    }

    revalidatePath("/categorization") // Revalida a página para mostrar as alterações
    return { success: true, message: `Post ${postId} auto-classificado com sucesso.` }
  } catch (error: any) {
    console.error("Erro inesperado na auto-classificação:", error)
    return {
      success: false,
      message: `Erro inesperado na auto-classificação: ${error.message || "Verifique o console."}`,
    }
  }
}
