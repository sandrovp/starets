"use server"

import { generateText } from "ai"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { supabase } from "@/lib/supabase" // Importar supabase

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
})

export async function generateAIContent(
  prevState: { generatedContent: string | null; error: string | null },
  formData: FormData,
) {
  const selectedTags = formData.get("selectedTags") as string
  const userPrompt = formData.get("userPrompt") as string
  const modelId = formData.get("modelId") as string
  const instructionId = formData.get("instructionId") as string // Novo: Obter o instructionId

  if (!userPrompt) {
    return { generatedContent: null, error: "Por favor, digite um prompt." }
  }

  if (!modelId) {
    return { generatedContent: null, error: "Por favor, selecione um modelo de IA." }
  }

  let baseInstruction = ""
  if (instructionId) {
    const { data: instructionData, error: instructionError } = await supabase
      .from("ai_instructions")
      .select("instruction") // Seleciona o texto da instrução
      .eq("id", instructionId)
      .single()

    if (instructionError || !instructionData) {
      console.error("Erro ao buscar instrução de IA:", instructionError)
      return { generatedContent: null, error: "Erro ao carregar instrução de IA. Tente novamente." }
    }
    baseInstruction = instructionData.instruction // Atribui o texto da instrução buscada
  }

  const tagsArray = selectedTags ? selectedTags.split(",").filter(Boolean) : []
  const tagsPrompt = tagsArray.length > 0 ? `Baseado nas seguintes tags: ${tagsArray.join(", ")}. ` : ""

  // Combinar a instrução base com o prompt do usuário e tags
  const fullPrompt = `${tagsPrompt}${userPrompt}` // Este é o prompt do usuário + tags
  const systemPrompt = baseInstruction || "Você é um assistente útil e criativo." // Este é o estilo/instrução selecionada, ou um fallback

  try {
    const { text } = await generateText({
      model: openrouter.chat(modelId),
      prompt: fullPrompt, // Passa o prompt do usuário + tags
      system: systemPrompt, // Passa o estilo/instrução
      temperature: 0.7,
      maxTokens: 500,
    })

    return { generatedContent: text, error: null }
  } catch (error) {
    console.error("Erro ao gerar conteúdo com IA:", error)
    return { generatedContent: null, error: "Erro ao gerar conteúdo. Tente novamente." }
  }
}
