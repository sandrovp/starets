import { getInstagramPosts } from "@/actions/get-instagram-posts"
import { getAIInstructions } from "@/lib/get-ai-instructions"
import InstagramPosts from "../components/instagram-posts"

export default async function Page() {
  const posts = await getInstagramPosts()
  const allUniqueCategories = (() => {
    // Renomeado de allUniqueTags
    const categoriesSet = new Set<string>()
    posts.forEach((post) => {
      post.categories?.forEach((category) => categoriesSet.add(category.replace("#", ""))) // Usando post.categories
    })
    return Array.from(categoriesSet).sort()
  })()

  const activeInstructions = (await getAIInstructions()).filter((inst) => inst.is_active)

  return (
    <InstagramPosts
      initialPosts={posts}
      initialAllCategories={allUniqueCategories} // Renomeado
      initialActiveInstructions={activeInstructions}
    />
  )
}
