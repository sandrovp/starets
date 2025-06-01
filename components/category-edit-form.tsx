"use client"
import { useState, useEffect } from "react"
import { useFormStatus } from "react-dom"
import { useActionState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Plus } from "lucide-react"
import { updatePostCategories } from "@/actions/update-post-categories" // Importação atualizada

interface CategoryEditFormProps {
  // Renomeado de TagEditFormProps
  postId: string
  initialCategories: string[] // Renomeado de initialTags
  onCancelEdit: () => void
  onSaveSuccess: () => void
}

export function CategoryEditForm({ postId, initialCategories, onCancelEdit, onSaveSuccess }: CategoryEditFormProps) {
  // Renomeado
  const [localCategories, setLocalCategories] = useState<string[]>(initialCategories || []) // Renomeado
  const [newCategoryInput, setNewCategoryInput] = useState("") // Renomeado

  const [state, formAction] = useActionState(updatePostCategories, {
    // Ação atualizada
    success: false,
    message: "",
  })
  const { pending } = useFormStatus()

  console.log("CategoryEditForm rendered. Pending:", pending, "State:", state)

  useEffect(() => {
    if (state.success) {
      console.log("CategoryEditForm: Save successful, calling onSaveSuccess.")
      onSaveSuccess() // Notifica o componente pai sobre o sucesso
    }
    if (state.message) {
      console.log("CategoryEditForm state message:", state.message)
    }
  }, [state.success, state.message, onSaveSuccess])

  const handleAddCategory = () => {
    // Renomeado
    console.log("CategoryEditForm: handleAddCategory called. New category input:", newCategoryInput)
    if (newCategoryInput.trim() && !localCategories.includes(newCategoryInput.trim())) {
      setLocalCategories((prev) => {
        const updatedCategories = [...prev, newCategoryInput.trim()]
        console.log("CategoryEditForm: localCategories updated to:", updatedCategories)
        return updatedCategories
      })
      setNewCategoryInput("")
    }
  }

  const handleRemoveCategory = (categoryToRemove: string) => {
    // Renomeado
    console.log("CategoryEditForm: handleRemoveCategory called. Category to remove:", categoryToRemove)
    setLocalCategories((prev) => {
      const updatedCategories = prev.filter((category) => category !== categoryToRemove)
      console.log("CategoryEditForm: localCategories updated to:", updatedCategories)
      return updatedCategories
    })
  }

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="postId" value={postId} />
      <input type="hidden" name="categories" value={localCategories.join(",")} /> {/* Nome do campo atualizado */}
      <div className="flex flex-wrap gap-1">
        {localCategories.map(
          (
            category,
            index, // Renomeado
          ) => (
            <Badge
              key={index}
              variant="outline"
              className="text-xs bg-mustard text-dark-text border-mustard flex items-center gap-1 rounded-md"
            >
              {category.replace("#", "")}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 text-dark-text hover:text-primary-foreground"
                onClick={() => {
                  console.log("CategoryEditForm: Remove category button clicked for:", category)
                  handleRemoveCategory(category)
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ),
        )}
      </div>
      <div className="flex gap-2">
        <Input
          type="text"
          value={newCategoryInput}
          onChange={(e) => setNewCategoryInput(e.target.value)}
          placeholder="Nova categoria" // Texto atualizado
          className="flex-grow px-2 py-1 border rounded-md text-sm border-muted focus:border-mustard focus:ring-mustard"
          disabled={pending}
        />
        <Button
          type="button"
          size="sm"
          onClick={handleAddCategory} // Função atualizada
          disabled={pending}
          className="bg-mustard text-dark-text font-semibold hover:bg-mustard-hover hover:scale-105 shadow-sm transition-transform"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex gap-2">
        <Button
          type="submit"
          size="sm"
          className="flex-grow bg-mustard text-dark-text font-semibold hover:bg-mustard-hover hover:scale-105 shadow-sm transition-transform"
          disabled={pending}
        >
          {pending ? "Salvando..." : "Salvar Alterações"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            console.log("CategoryEditForm: Cancel button clicked, calling onCancelEdit.")
            onCancelEdit()
          }}
          disabled={pending}
          className="border-muted text-secondary-text hover:bg-muted hover:text-primary-foreground"
        >
          Cancelar
        </Button>
      </div>
      {state.message && (
        <p className={`text-sm ${state.success ? "text-green-600" : "text-red-600"}`}>{state.message}</p>
      )}
    </form>
  )
}
