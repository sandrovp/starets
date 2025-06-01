"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Calendar, Edit } from "lucide-react"
import type { Post } from "@/actions/get-instagram-posts"
import { ImageCarousel } from "./image-carousel"
import { CategoryEditForm } from "./category-edit-form"

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function extractHashtags(caption: string) {
  const hashtagRegex = /#[\w\u00C0-\u017F]+/g
  return caption.match(hashtagRegex) || []
}

function removeHashtags(caption: string) {
  return caption.replace(/#[\w\u00C0-\u017F]+/g, "").trim()
}

// Alterado para default export
export default function PostCard({ post }: { post: Post }) {
  const [showFullCaption, setShowFullCaption] = useState(false)
  const [isEditingCategories, setIsEditingCategories] = useState(false)

  // Dentro da função `PostCard`, antes de `return (`
  // Adicione esta linha:
  console.log("PostCard: image_urls recebidas:", post.image_urls)

  const hashtags = extractHashtags(post.caption)
  const cleanCaption = removeHashtags(post.caption)
  const isLongCaption = cleanCaption.length > 150

  const handleCancelEdit = () => {
    console.log("PostCard: handleCancelEdit called. Setting isEditingCategories to false.")
    setIsEditingCategories(false)
  }

  const handleSaveSuccess = () => {
    console.log("PostCard: handleSaveSuccess called. Setting isEditingCategories to false.")
    setIsEditingCategories(false)
  }

  return (
    <Card className="w-full mb-6 rounded-xl shadow-sm border border-muted">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-secondary-text">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(post.post_date)}</span>
          </div>
          <Button
            variant="default"
            size="sm"
            onClick={() => window.open(post.post_url, "_blank")}
            className="flex items-center space-x-1 bg-mustard text-dark-text font-semibold hover:bg-mustard-hover shadow-sm transition-transform"
          >
            <ExternalLink className="h-3 w-3" />
            <span className="hidden sm:inline">Ver</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {post.image_urls.length > 0 && <ImageCarousel images={post.image_urls} />}

        <div className="space-y-3">
          <div className="text-sm leading-relaxed text-dark-text">
            {isLongCaption && !showFullCaption ? (
              <>
                {cleanCaption.substring(0, 150)}...
                <Button
                  variant="link"
                  className="p-0 h-auto text-mustard ml-1 text-sm font-semibold hover:underline"
                  onClick={() => setShowFullCaption(true)}
                >
                  ver mais
                </Button>
              </>
            ) : (
              <span className="whitespace-pre-line">{cleanCaption}</span>
            )}
            {isLongCaption && showFullCaption && (
              <Button
                variant="link"
                className="p-0 h-auto text-mustard ml-1 text-sm font-semibold hover:underline"
                onClick={() => setShowFullCaption(false)}
              >
                ver menos
              </Button>
            )}
          </div>

          {hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {hashtags.slice(0, 3).map((hashtag, index) => (
                <Badge
                  key={index}
                  variant="default"
                  className="text-xs bg-white text-secondary-text border border-muted rounded-md"
                >
                  {hashtag}
                </Badge>
              ))}
              {hashtags.length > 3 && (
                <Badge
                  variant="default"
                  className="text-xs bg-white text-secondary-text border border-muted rounded-md"
                >
                  +{hashtags.length - 3}
                </Badge>
              )}
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium text-secondary-text uppercase tracking-wide">Categorias</div>
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  console.log(
                    "PostCard: Edit/Concluído button clicked. Current isEditingCategories:",
                    isEditingCategories,
                  )
                  setIsEditingCategories(!isEditingCategories)
                }}
                className="flex items-center bg-mustard text-dark-text font-semibold hover:bg-mustard-hover shadow-sm transition-transform"
              >
                <Edit className="h-3 w-3 mr-1" />
                {isEditingCategories ? "Concluído" : "Editar"}
              </Button>
            </div>

            {isEditingCategories ? (
              <CategoryEditForm
                postId={post.id || ""}
                initialCategories={post.categories || []}
                onCancelEdit={handleCancelEdit}
                onSaveSuccess={handleSaveSuccess}
              />
            ) : (
              <div className="flex flex-wrap gap-1">
                {post.categories && post.categories.length > 0 ? (
                  post.categories.slice(0, 4).map((category, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="text-xs bg-white text-secondary-text border border-muted rounded-md"
                    >
                      {category.replace("#", "")}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-secondary-text font-inter">{"Nenhuma categoria"}</span>
                )}
                {post.categories && post.categories.length > 4 && (
                  <Badge
                    variant="outline"
                    className="text-xs bg-white text-secondary-text border border-muted rounded-md"
                  >
                    +{post.categories.length - 4}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
