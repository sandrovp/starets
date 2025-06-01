import { getInstagramPosts } from "@/actions/get-instagram-posts"
import { getAIInstructions } from "@/lib/get-ai-instructions"
import { getClassificationCategories } from "@/actions/classification-categories" // Importar para auto-classificação
import { autoClassifyPost } from "@/actions/auto-classify-post" // Importar a nova ação
import InstagramPosts from "../components/instagram-posts"

export default async function Page() {
  console.log("App Page: Iniciando carregamento da página principal.")

  // Fetch initial data
  let posts = await getInstagramPosts()
  const classificationCategories = await getClassificationCategories()
  const availableCategoryNames = classificationCategories.map((cat) => cat.name)
  const activeInstructions = (await getAIInstructions()).filter((inst) => inst.is_active)

  // Lógica de auto-classificação para posts sem categorias ou com "uncategorized"
  const classificationPromises: Promise<any>[] = []
  for (const post of posts) {
    const shouldAutoClassify =
      !post.categories ||
      post.categories.length === 0 ||
      (post.categories.length === 1 && post.categories[0] === "uncategorized")

    if (shouldAutoClassify) {
      console.log(
        `App Page: Auto-classificando post sem categorias ou 'uncategorized': ${post.id} (categorias atuais: ${post.categories?.join(", ") || "nenhuma"})`,
      )
      classificationPromises.push(autoClassifyPost(post.id!, availableCategoryNames))
    }
  }

  // Aguarda todas as classificações automáticas
  if (classificationPromises.length > 0) {
    console.log(`App Page: Aguardando ${classificationPromises.length} classificações automáticas...`)
    await Promise.allSettled(classificationPromises)
    console.log("App Page: Classificações automáticas concluídas. Re-buscando posts para atualização da UI.")
    // Re-fetch posts para garantir que os dados mais recentes (incluindo os auto-classificados) sejam exibidos
    posts = await getInstagramPosts()
  } else {
    console.log("App Page: Nenhum post para auto-classificar.")
  }

  const allUniqueCategories = (() => {
    const categoriesSet = new Set<string>()
    posts.forEach((post) => {
      post.categories?.forEach((category) => categoriesSet.add(category.replace("#", "")))
    })
    return Array.from(categoriesSet).sort()
  })()

  return (
    <InstagramPosts
      initialPosts={posts}
      initialAllCategories={allUniqueCategories}
      initialActiveInstructions={activeInstructions}
    />
  )
}
