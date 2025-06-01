import { getInstagramPosts } from "@/actions/get-instagram-posts"
import { getClassificationCategories } from "@/actions/classification-categories"
import PostCategorizationManager from "@/components/post-categorization-manager"

export default async function CategorizationPage() {
  console.log("CategorizationPage: Iniciando carregamento da página.")

  if (!process.env.OPENROUTER_API_KEY) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Erro de Configuração</h1>
        <p className="text-lg text-gray-700 mb-6">
          A chave da API do OpenRouter (`OPENROUTER_API_KEY`) não está configurada. Por favor, adicione-a às suas
          variáveis de ambiente na Vercel para usar a funcionalidade de classificação por IA.
        </p>
      </div>
    )
  }

  // Fetch Instagram posts and classification categories
  const instagramPosts = await getInstagramPosts()
  const classificationCategories = await getClassificationCategories()

  // Render the PostCategorizationManager component
  return (
    <div className="container mx-auto px-4 py-8">
      <PostCategorizationManager
        initialPosts={instagramPosts}
        availableClassificationCategories={classificationCategories}
      />
    </div>
  )
}
