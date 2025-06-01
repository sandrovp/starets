"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useFormStatus } from "react-dom"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Plus, Edit, Trash2, Loader2, Tag } from "lucide-react"
import {
  type ClassificationCategory,
  getClassificationCategories,
  createClassificationCategory,
  updateClassificationCategory,
  deleteClassificationCategory,
} from "@/actions/classification-categories"
import { useActionState } from "react"

interface ClassificationCategoryManagerProps {
  initialCategories: ClassificationCategory[]
}

function FormSubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      disabled={pending}
      className="bg-mustard text-dark-text font-semibold hover:bg-mustard-hover hover:scale-105 shadow-sm transition-transform"
    >
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : children}
    </Button>
  )
}

// Alterado para default export
export default function ClassificationCategoryManager({ initialCategories }: ClassificationCategoryManagerProps) {
  const [categories, setCategories] = useState<ClassificationCategory[]>(initialCategories)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentCategory, setCurrentCategory] = useState<ClassificationCategory | null>(null)

  const [createState, createFormAction] = useActionState(createClassificationCategory, {
    success: false,
    message: "",
  })

  const [updateState, updateFormAction] = useActionState(updateClassificationCategory, {
    success: false,
    message: "",
  })

  useEffect(() => {
    if (createState.success) {
      const fetchAndUpdate = async () => {
        const updatedCategories = await getClassificationCategories()
        setCategories(updatedCategories)
        setIsAddDialogOpen(false)
      }
      fetchAndUpdate()
    }
  }, [createState.success])

  useEffect(() => {
    if (updateState.success) {
      const fetchAndUpdate = async () => {
        const updatedCategories = await getClassificationCategories()
        setCategories(updatedCategories)
        setIsEditDialogOpen(false)
      }
      fetchAndUpdate()
    }
  }, [updateState.success])

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja deletar esta categoria?")) {
      const result = await deleteClassificationCategory(id)
      if (result.success) {
        setCategories(categories.filter((cat) => cat.id !== id))
      } else {
        alert(result.message)
      }
    }
  }

  return (
    <Card className="rounded-xl shadow-sm border border-muted">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-semibold font-playfair-display text-dark-text">
          <Tag className="h-6 w-6" />
          Gerenciar Categorias de Classificação
        </CardTitle>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="h-8 gap-1 bg-mustard text-dark-text font-semibold hover:bg-mustard-hover hover:scale-105 shadow-sm transition-transform"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Adicionar Categoria</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-white rounded-xl shadow-lg border border-muted">
            <DialogHeader>
              <DialogTitle className="font-playfair-display text-dark-text">Adicionar Nova Categoria</DialogTitle>
            </DialogHeader>
            <form action={createFormAction} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="name" className="text-right text-secondary-text font-inter">
                  Nome
                </label>
                <Input
                  id="name"
                  name="name"
                  className="col-span-3 border-muted text-dark-text font-inter focus:border-mustard focus:ring-mustard"
                  required
                />
              </div>
              <DialogFooter>
                <FormSubmitButton>Salvar</FormSubmitButton>
              </DialogFooter>
              {createState.message && (
                <p className={`text-sm mt-2 font-inter ${createState.success ? "text-green-600" : "text-red-600"}`}>
                  {createState.message}
                </p>
              )}
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {categories.length === 0 ? (
          <p className="text-center text-secondary-text py-8 font-inter">
            Nenhuma categoria de classificação encontrada. Adicione uma!
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-muted">
                <TableHead className="text-secondary-text font-inter">Nome</TableHead>
                <TableHead className="text-right text-secondary-text font-inter">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id} className="border-muted">
                  <TableCell className="font-medium text-dark-text font-inter">{category.name}</TableCell>
                  <TableCell className="text-right flex gap-1 justify-end">
                    <Dialog
                      open={isEditDialogOpen && currentCategory?.id === category.id}
                      onOpenChange={setIsEditDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setCurrentCategory(category)
                            setIsEditDialogOpen(true)
                          }}
                          className="text-secondary-text hover:bg-muted hover:text-primary-foreground"
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px] bg-white rounded-xl shadow-lg border border-muted">
                        <DialogHeader>
                          <DialogTitle className="font-playfair-display text-dark-text">Editar Categoria</DialogTitle>
                        </DialogHeader>
                        <form action={updateFormAction} className="grid gap-4 py-4">
                          <input type="hidden" name="id" value={currentCategory?.id || ""} />
                          <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="edit-name" className="text-right text-secondary-text font-inter">
                              Nome
                            </label>
                            <Input
                              id="edit-name"
                              name="name"
                              defaultValue={currentCategory?.name}
                              className="col-span-3 border-muted text-dark-text font-inter focus:border-mustard focus:ring-mustard"
                              required
                            />
                          </div>
                          <DialogFooter>
                            <FormSubmitButton>Atualizar</FormSubmitButton>
                          </DialogFooter>
                          {updateState.message && (
                            <p
                              className={`text-sm mt-2 font-inter ${updateState.success ? "text-green-600" : "text-red-600"}`}
                            >
                              {updateState.message}
                            </p>
                          )}
                        </form>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(category.id)}
                      className="text-secondary-text hover:bg-muted hover:text-primary-foreground"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Deletar</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
