"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useFormStatus } from "react-dom"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Loader2, Sparkles, Edit, Save, X, ExternalLink, Calendar, Plus } from "lucide-react"
import type { Post } from "@/actions/get-instagram-posts"
import type { ClassificationCategory } from "@/actions/classification-categories"
import { classifyPostWithAI } from "@/actions/classify-post-ai"
import { updatePostCategories } from "@/actions/update-post-categories" // Reutiliza a ação existente
import { useActionState } from "react"
import ClassificationCategoryManager from "@/components/classification-category-manager"

interface PostCategorizationManagerProps {
  initialPosts: Post[]
  availableClassificationCategories: ClassificationCategory[]
}

// Componente auxiliar para o botão de submit com status de formulário
function ActionButton({
  children,
  pendingText,
  // Removido onClick daqui
  disabled,
}: { children: React.ReactNode; pendingText: string; disabled?: boolean }) {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      // Removido onClick={onClick}
      disabled={pending || disabled}
      className="bg-mustard text-dark-text font-semibold hover:bg-mustard-hover hover:scale-105 shadow-sm transition-transform"
    >
      {pending ? (
        <span className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /> {pendingText}
        </span>
      ) : (
        children
      )}
    </Button>
  )
}

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

export default function PostCategorizationManager({
  initialPosts,
  availableClassificationCategories,
}: PostCategorizationManagerProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [editingPostId, setEditingPostId] = useState<string | null>(null)
  const [localCategories, setLocalCategories] = useState<string[]>([])
  const [newCategoryInput, setNewCategoryInput] = useState("")

  const [aiClassificationState, aiClassificationAction] = useActionState(classifyPostWithAI, {
    success: false,
    suggestedCategories: [],
    message: "",
  })
  const [saveCategoriesState, saveCategoriesAction] = useActionState(updatePostCategories, {
    success: false,
    message: "",
  })

  const availableCategoryNames = availableClassificationCategories.map((cat) => cat.name)

  // Efeito para lidar com o resultado da classificação por IA
  useEffect(() => {
    if (aiClassificationState.success) {
      setLocalCategories(aiClassificationState.suggestedCategories)
      // Encontra o post que foi classificado para entrar no modo de edição
      const classifiedPostId = (aiClassificationState as any).postId // Ação de IA não retorna postId, mas podemos inferir se necessário ou passar como parte do estado
      // Para simplificar, vamos assumir que o `editingPostId` já está definido se o botão de IA foi clicado para um post específico.
      // Se não, precisaríamos de uma forma de `classifyPostWithAI` retornar o ID do post ou de `aiClassificationAction` ser chamada com um `bind`
      // que inclua o ID do post no `prevState` para que possamos acessá-lo aqui.
      // Por enquanto, vamos apenas garantir que se estivermos editando, as categorias sejam atualizadas.
      if (editingPostId) {
        alert(`Sugestão de IA para o post ${editingPostId}: ${aiClassificationState.suggestedCategories.join(", ")}`)
      }
    } else if (aiClassificationState.message) {
      alert(`Erro na classificação por IA: ${aiClassificationState.message}`)
    }
  }, [aiClassificationState, editingPostId]) // Adicionado editingPostId como dependência

  // Efeito para lidar com o resultado de salvar categorias
  useEffect(() => {
    if (saveCategoriesState.success) {
      setEditingPostId(null) // Sai do modo de edição
      // Atualiza o post na lista localmente
      setPosts((prevPosts) =>
        prevPosts.map((post) => (post.id === editingPostId ? { ...post, categories: localCategories } : post)),
      )
    } else if (saveCategoriesState.message) {
      alert(`Erro ao salvar categorias: ${saveCategoriesState.message}`)
    }
  }, [saveCategoriesState.success, saveCategoriesState.message, editingPostId, localCategories])

  const handleEditCategories = (post: Post) => {
    setEditingPostId(post.id || null)
    setLocalCategories(post.categories || [])
    setNewCategoryInput("")
  }

  const handleCancelEdit = () => {
    setEditingPostId(null)
    setLocalCategories([])
    setNewCategoryInput("")
  }

  const handleAddCategory = () => {
    if (newCategoryInput.trim() && !localCategories.includes(newCategoryInput.trim())) {
      setLocalCategories((prev) => [...prev, newCategoryInput.trim()])
      setNewCategoryInput("")
    }
  }

  const handleRemoveCategory = (categoryToRemove: string) => {
    setLocalCategories((prev) => prev.filter((category) => category !== categoryToRemove))
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold font-playfair-display text-dark-text mb-6">Gerenciar Categorização de Posts</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna de Posts */}
        <div className="lg:col-span-2 space-y-6">
          {posts.length === 0 ? (
            <p className="text-center text-secondary-text py-8 font-inter">Nenhum post encontrado.</p>
          ) : (
            posts.map((post) => (
              <Card key={post.id} className="rounded-xl shadow-sm border border-muted">
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
                      <span className="hidden sm:inline">Ver Post</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm leading-relaxed text-dark-text line-clamp-3">{post.caption}</p>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-medium text-secondary-text uppercase tracking-wide">
                        Categorias Atuais
                      </div>
                      <div className="flex gap-2">
                        <form action={aiClassificationAction}>
                          <input type="hidden" name="postId" value={post.id} />
                          <input type="hidden" name="availableCategories" value={availableCategoryNames.join(",")} />
                          <ActionButton pendingText="Classificando...">
                            <Sparkles className="h-3 w-3 mr-1" /> Classificar com IA
                          </ActionButton>
                        </form>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleEditCategories(post)}
                          className="flex items-center bg-mustard text-dark-text font-semibold hover:bg-mustard-hover shadow-sm transition-transform"
                        >
                          <Edit className="h-3 w-3 mr-1" /> Editar
                        </Button>
                      </div>
                    </div>

                    {editingPostId === post.id ? (
                      <form action={saveCategoriesAction} className="space-y-2">
                        <input type="hidden" name="postId" value={post.id} />
                        <input type="hidden" name="categories" value={localCategories.join(",")} />
                        <div className="flex flex-wrap gap-1">
                          {localCategories.map((category, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs bg-mustard text-dark-text border-mustard flex items-center gap-1 rounded-md"
                            >
                              {category}
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 p-0 text-dark-text hover:text-primary-foreground"
                                onClick={() => handleRemoveCategory(category)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            type="text"
                            value={newCategoryInput}
                            onChange={(e) => setNewCategoryInput(e.target.value)}
                            placeholder="Nova categoria"
                            className="flex-grow px-2 py-1 border rounded-md text-sm border-muted focus:border-mustard focus:ring-mustard"
                          />
                          <Button
                            type="button"
                            size="sm"
                            onClick={handleAddCategory}
                            className="bg-mustard text-dark-text font-semibold hover:bg-mustard-hover hover:scale-105 shadow-sm transition-transform"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          <ActionButton pendingText="Salvando...">
                            <Save className="h-4 w-4 mr-1" /> Salvar Alterações
                          </ActionButton>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleCancelEdit}
                            className="border-muted text-secondary-text hover:bg-muted hover:text-primary-foreground"
                          >
                            Cancelar
                          </Button>
                        </div>
                        {saveCategoriesState.message && (
                          <p className={`text-sm ${saveCategoriesState.success ? "text-green-600" : "text-red-600"}`}>
                            {saveCategoriesState.message}
                          </p>
                        )}
                      </form>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {post.categories && post.categories.length > 0 ? (
                          post.categories.map((category, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs bg-white text-secondary-text border border-muted rounded-md"
                            >
                              {category}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-secondary-text font-inter">{"Nenhuma categoria"}</span>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Coluna de Gerenciamento de Categorias */}
        <div className="lg:col-span-1">
          <ClassificationCategoryManager initialCategories={availableClassificationCategories} />
        </div>
      </div>
    </div>
  )
}
