"use client"

import { useState } from "react"
import { useFormStatus } from "react-dom"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Loader2, Save, Settings } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { AIInstruction } from "@/actions/ai-instructions"
import { generateAIContent } from "@/actions/generate-ai-content"
import { savePostSuggestion } from "@/actions/save-post-suggestion"
import { useActionState } from "react"

interface AIContentGeneratorProps {
  allTags: string[]
  activeInstructions: AIInstruction[]
}

// Componente auxiliar para o botão de submit com status de formulário
function SubmitButton() {
  const { pending } = useFormStatus()
  console.log("SubmitButton pending status:", pending) // Adicionado console.log

  return (
    <Button
      type="submit"
      className="w-full bg-mustard text-dark-text font-semibold hover:scale-105 shadow-sm transition-transform"
      disabled={pending}
    >
      {" "}
      {/* Estilo do botão mostarda */}
      {pending ? (
        <span className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /> Gerando...
        </span>
      ) : (
        "Gerar Conteúdo"
      )}
    </Button>
  )
}

// Componente auxiliar para o botão de salvar com status de formulário
function SaveButton({ suggestionText, suggestedCategory }: { suggestionText: string; suggestedCategory: string }) {
  const [saveState, saveAction] = useActionState(savePostSuggestion, {
    success: false,
    message: "",
  })
  const { pending } = useFormStatus()
  console.log("SaveButton pending status:", pending, "SaveState:", saveState) // Adicionado console.log

  return (
    <form action={saveAction} className="space-y-2">
      <input type="hidden" name="suggestionText" value={suggestionText} />
      <input type="hidden" name="suggestedCategory" value={suggestedCategory} />
      <Button
        type="submit"
        className="w-full bg-mustard text-dark-text font-semibold hover:scale-105 shadow-sm transition-transform"
        disabled={pending}
      >
        {" "}
        {/* Estilo do botão mostarda */}
        {pending ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Salvando...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Save className="h-4 w-4" /> Salvar Sugestão
          </span>
        )}
      </Button>
      {saveState.message && (
        <p className={`text-sm ${saveState.success ? "text-green-600" : "text-red-600"}`}>{saveState.message}</p>
      )}
    </form>
  )
}

// Modelos disponíveis do OpenRouter
const OPENROUTER_MODELS = [
  { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet" },
  { id: "openai/gpt-4o", name: "GPT-4o" },
  { id: "google/gemini-pro", name: "Google Gemini Pro" },
  { id: "mistralai/mistral-7b-instruct", name: "Mistral 7B Instruct" },
  { id: "nousresearch/nous-hermes-2-mixtral-8x7b-dpo", name: "Nous Hermes 2 Mixtral" },
]

export function AIContentGenerator({ allTags, activeInstructions }: AIContentGeneratorProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedModel, setSelectedModel] = useState<string>(OPENROUTER_MODELS[0].id)
  const [selectedInstructionId, setSelectedInstructionId] = useState<string>(activeInstructions[0]?.id || "")

  const [state, formAction] = useActionState(generateAIContent, {
    generatedContent: null,
    error: null,
  })

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  return (
    <Card className="rounded-xl shadow-sm border border-muted">
      {" "}
      {/* Estilo do card */}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-playfair-display text-dark-text flex items-center gap-2">
          {" "}
          {/* Fonte e cor do título */}
          <Sparkles className="h-5 w-5" />
          Gerar Conteúdo com IA
        </CardTitle>
        <Link href="/settings/ai-instructions" passHref>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-muted text-secondary-text hover:bg-muted hover:text-dark-text"
          >
            {" "}
            {/* Estilo do botão */}
            <Settings className="h-4 w-4" />
            <span className="sr-only">Configurações de IA</span>
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-2 text-dark-text font-inter">Modelo de IA</h3> {/* Fonte e cor */}
          <Select onValueChange={setSelectedModel} defaultValue={selectedModel}>
            <SelectTrigger className="w-full border-muted text-secondary-text font-inter">
              {" "}
              {/* Estilo do select */}
              <SelectValue placeholder="Selecione um modelo" />
            </SelectTrigger>
            <SelectContent className="font-inter">
              {" "}
              {/* Fonte do conteúdo do select */}
              {OPENROUTER_MODELS.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  {model.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="hidden" name="modelId" value={selectedModel} />
        </div>

        {activeInstructions.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-2 text-dark-text font-inter">Instrução de IA (Opcional)</h3>{" "}
            {/* Fonte e cor */}
            <Select onValueChange={setSelectedInstructionId} defaultValue={selectedInstructionId}>
              <SelectTrigger className="w-full border-muted text-secondary-text font-inter">
                {" "}
                {/* Estilo do select */}
                <SelectValue placeholder="Selecione uma instrução" />
              </SelectTrigger>
              <SelectContent className="font-inter">
                {" "}
                {/* Fonte do conteúdo do select */}
                {activeInstructions.map((instruction) => (
                  <SelectItem key={instruction.id} value={instruction.id}>
                    {instruction.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="instructionId" value={selectedInstructionId} />
          </div>
        )}

        <div>
          <h3 className="text-sm font-medium mb-2 text-dark-text font-inter">Tags para Contexto (Opcional)</h3>{" "}
          {/* Fonte e cor */}
          <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-1 border rounded-md bg-cream border-muted">
            {" "}
            {/* Fundo creme e borda */}
            {allTags.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "secondary"}
                className={`cursor-pointer rounded-md font-inter ${selectedTags.includes(tag) ? "bg-mustard text-dark-text" : "bg-white text-secondary-text border border-muted"}`} // Estilo do badge
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
          <input type="hidden" name="selectedTags" value={selectedTags.join(",")} />
        </div>
        <div>
          <h3 className="text-sm font-medium mb-2 text-dark-text font-inter">Seu Prompt</h3> {/* Fonte e cor */}
          <Textarea
            name="userPrompt"
            placeholder="Ex: Crie um post sobre a importância da comunicação na família."
            rows={4}
            required
            className="border-muted text-dark-text font-inter focus:border-mustard focus:ring-mustard" // Estilo do textarea
          />
        </div>
        <form action={formAction}>
          {" "}
          {/* O formulário deve envolver o SubmitButton */}
          <SubmitButton />
        </form>
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        {state.generatedContent && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-dark-text font-inter">Conteúdo Gerado:</h3>
            <Textarea
              value={state.generatedContent}
              rows={5}
              readOnly
              className="border-muted text-dark-text font-inter"
            />
            <SaveButton suggestionText={state.generatedContent} suggestedCategory={selectedTags.join(",")} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
