import { getAIInstructions } from "@/lib/get-ai-instructions" // CORRIGIDO: Importado do novo arquivo
import { AIInstructionsManager } from "@/components/ai-instructions-manager"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Settings } from "lucide-react"

export default async function AIInstructionsPage() {
  const instructions = await getAIInstructions()

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Configurações de Instruções de IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Gerencie as instruções e prompts base que a IA utilizará para gerar conteúdo. Você pode ativar/desativar
            instruções e definir qual delas será usada como prompt principal.
          </p>
        </CardContent>
      </Card>
      <AIInstructionsManager initialInstructions={instructions} />
    </div>
  )
}
