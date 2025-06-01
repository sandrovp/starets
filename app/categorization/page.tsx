import { getInstagramPosts } from "@/actions/get-instagram-posts"
import { getClassificationCategories } from "@/actions/classification-categories"
import PostCategorizationManager from "@/components/post-categorization-manager"
import { autoClassifyPost } from "@/actions/auto-classify-post" // Importar a nova ação

export default async function CategorizationPage() {
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

  const instagramPosts = await getInstagramPosts()
  const classificationCategories = await getClassificationCategories()
  const availableCategoryNames = classificationCategories.map((cat) => cat.name)

  // Lógica de auto-classificação
  const classificationPromises: Promise<any>[] = []
  for (const post of instagramPosts) {
    // Classifica apenas se não tiver categorias
    if (!post.categories || post.categories.length === 0) {
      console.log(`Auto-classificando post sem categorias: ${post.id}`)
      // Adiciona a promessa de classificação à lista
      classificationPromises.push(autoClassifyPost(post.id!, availableCategoryNames))
    }
  }

  // Aguarda todas as classificações automáticas
  // Usamos Promise.allSettled para que uma falha em uma classificação não impeça as outras
  await Promise.allSettled(classificationPromises)

  // Re-fetch posts para garantir que os dados mais recentes (incluindo os auto-classificados) sejam passados para o cliente
  const updatedInstagramPosts = await getInstagramPosts()

  return (
    <div className="container mx-auto px-4 py-8">
      <PostCategorizationManager
        initialPosts={updatedInstagramPosts} // Passa os posts atualizados
        availableClassificationCategories={classificationCategories}
      />
    </div>
  )
}
