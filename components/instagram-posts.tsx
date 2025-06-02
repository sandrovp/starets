"use client"

import { useState } from "react"
import type { Post } from "@/actions/get-instagram-posts"
import type { AIInstruction } from "@/actions/ai-instructions"
import { AIContentGenerator } from "./ai-content-generator"
import PostCard from "./post-card"
import AnalyticsPanel from "./analytics-panel" // Importação atualizada para default import

interface InstagramPostsProps {
  initialPosts: Post[]
  initialAllCategories: string[]
  initialActiveInstructions: AIInstruction[]
}

export default function InstagramPosts({
  initialPosts,
  initialAllCategories,
  initialActiveInstructions,
}: InstagramPostsProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [allUniqueCategories, setAllUniqueCategories] = useState<string[]>(initialAllCategories)
  const [activeInstructions, setActiveInstructions] = useState<AIInstruction[]>(initialActiveInstructions)

  return (
    <div className="container mx-auto px-6 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
        {/* <div className="lg:col-span-1">
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
          <div className="text-center mt-6 text-sm text-secondary-text font-inter">Total de {posts.length} posts</div>
        </div> */}
        <div className="lg:col-span-2">
          <div>
            <AnalyticsPanel posts={posts} />
          </div>
        </div>
        <div className="lg:col-span-4">
          <div>
            <AIContentGenerator allCategories={allUniqueCategories} activeInstructions={activeInstructions} />
          </div>
        </div>
      </div>
    </div>
  )
}
