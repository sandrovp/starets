"use server"

import { generateText } from "ai"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { supabase } from "@/lib/supabase"

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
})

export async function classifyPostWithAI(
  prevState: { success: boolean; suggestedCategories: string[]; message: string }, // Adicionado prevState
  formData: FormData, // Alterado para FormData
): Promise<{ success: boolean; suggestedCategories: string[]; message: string }> {
  const postId = formData.get("postId") as string // Extrai postId do FormData
  const availableCategoriesString = formData.get("availableCategories") as string // Extrai availableCategories do FormData
  const availableCategories = availableCategoriesString ? availableCategoriesString.split(",").filter(Boolean) : []

  if (!process.env.OPENROUTER_API_KEY) {
    return { success: false, suggestedCategories: [], message: "OPENROUTER_API_KEY não configurada." }
  }

  if (!postId) {
    return { success: false, suggestedCategories: [], message: "ID do post não fornecido." }
  }

  if (availableCategories.length === 0) {
    return {
      success: false,
      suggestedCategories: [],
      message: "Nenhuma categoria de classificação definida. Por favor, adicione categorias.",
    }
  }

  try {
    // 1. Buscar o post pelo ID para obter a legenda
    const { data: postData, error: postError } = await supabase
      .from("posts_instagram")
      .select("caption")
      .eq("id", postId)
      .single()

    if (postError || !postData) {
      console.error("Erro ao buscar post para classificação:", postError)
      return { success: false, suggestedCategories: [], message: `Erro ao buscar post: ${postError?.message}` }
    }

    const postCaption = postData.caption

    // 2. Construir o prompt para a IA
    const systemPrompt = `Você é um assistente de categorização de conteúdo. Sua tarefa é analisar a legenda de um post e atribuir a ele uma ou mais categorias relevantes de uma lista fornecida.
    As categorias disponíveis são: ${availableCategories.join(", ")}.
    Responda APENAS com uma lista de categorias separadas por vírgula, sem texto adicional. Se nenhuma categoria for relevante, responda com "Outros".`

    const userPrompt = `Legenda do post: "${postCaption}"`

    // 3. Chamar o modelo de IA
    const { text } = await generateText({
      model: openrouter.chat("openai/gpt-4o"), // Usando GPT-4o como modelo padrão
      prompt: userPrompt,
      system: systemPrompt,
      temperature: 0.2, // Baixa temperatura para respostas mais diretas
      maxTokens: 100,
    })

    // 4. Processar a resposta da IA
    const rawCategories = text.trim()
    const suggestedCategories = rawCategories
      .split(",")
      .map((cat) => cat.trim())
      .filter(Boolean) // Remove strings vazias

    // Opcional: Filtrar para garantir que as categorias sugeridas estão na lista de disponíveis
    const validSuggestedCategories = suggestedCategories.filter((cat) => availableCategories.includes(cat))

    return {
      success: true,
      suggestedCategories: validSuggestedCategories.length > 0 ? validSuggestedCategories : ["Outros"],
      message: "Classificação por IA concluída.",
    }
  } catch (error: any) {
    console.error("Erro ao classificar post com IA:", error)
    return {
      success: false,
      suggestedCategories: [],
      message: `Erro ao classificar com IA: ${error.message || "Verifique o console."}`,
    }
  }
}
