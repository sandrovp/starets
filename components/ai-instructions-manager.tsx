"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useFormStatus } from "react-dom"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Plus, Edit, Trash2, Loader2 } from "lucide-react"
import {
  type AIInstruction,
  createAIInstruction,
  updateAIInstruction,
  deleteAIInstruction,
  toggleAIInstructionActive,
  getAIInstructions,
} from "@/actions/ai-instructions"
import { useActionState } from "react"

interface AIInstructionsManagerProps {
  initialInstructions: AIInstruction[]
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

export function AIInstructionsManager({ initialInstructions }: AIInstructionsManagerProps) {
  const [instructions, setInstructions] = useState<AIInstruction[]>(initialInstructions)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentInstruction, setCurrentInstruction] = useState<AIInstruction | null>(null)

  const [createState, createFormAction] = useActionState(createAIInstruction, {
    success: false,
    message: "",
  })

  const [updateState, updateFormAction] = useActionState(updateAIInstruction, {
    success: false,
    message: "",
  })

  useEffect(() => {
    if (createState.success) {
      const fetchAndUpdate = async () => {
        const updatedInstructions = await getAIInstructions()
        setInstructions(updatedInstructions)
        setIsAddDialogOpen(false)
      }
      fetchAndUpdate()
    }
  }, [createState.success])

  useEffect(() => {
    if (updateState.success) {
      const fetchAndUpdate = async () => {
        const updatedInstructions = await getAIInstructions()
        setInstructions(updatedInstructions)
        setIsEditDialogOpen(false)
      }
      fetchAndUpdate()
    }
  }, [updateState.success])

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja deletar esta instrução?")) {
      const result = await deleteAIInstruction(id)
      if (result.success) {
        setInstructions(instructions.filter((inst) => inst.id !== id))
      } else {
        alert(result.message)
      }
    }
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const result = await toggleAIInstructionActive(id, currentStatus)
    if (result.success) {
      setInstructions(instructions.map((inst) => (inst.id === id ? { ...inst, is_active: !currentStatus } : inst)))
    } else {
      alert(result.message)
    }
  }

  return (
    <Card className="rounded-xl shadow-sm border border-muted">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-semibold font-playfair-display text-dark-text">Instruções Atuais</CardTitle>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="h-8 gap-1 bg-mustard text-dark-text font-semibold hover:bg-mustard-hover hover:scale-105 shadow-sm transition-transform"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Adicionar Instrução</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-white rounded-xl shadow-lg border border-muted">
            <DialogHeader>
              <DialogTitle className="font-playfair-display text-dark-text">Adicionar Nova Instrução de IA</DialogTitle>
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
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="instruction" className="text-right text-secondary-text font-inter">
                  Instrução
                </label>
                <Textarea
                  id="instruction"
                  name="instruction"
                  className="col-span-3 border-muted text-dark-text font-inter focus:border-mustard focus:ring-mustard"
                  rows={5}
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
        {instructions.length === 0 ? (
          <p className="text-center text-secondary-text py-8 font-inter">
            Nenhuma instrução de IA encontrada. Adicione uma!
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-muted">
                <TableHead className="text-secondary-text font-inter">Nome</TableHead>
                <TableHead className="text-secondary-text font-inter">Instrução</TableHead>
                <TableHead className="text-center text-secondary-text font-inter">Ativa</TableHead>
                <TableHead className="text-right text-secondary-text font-inter">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {instructions.map((instruction) => (
                <TableRow key={instruction.id} className="border-muted">
                  <TableCell className="font-medium text-dark-text font-inter">{instruction.name}</TableCell>
                  <TableCell className="text-sm text-secondary-text max-w-[300px] truncate font-inter">
                    {instruction.instruction}
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={instruction.is_active}
                      onCheckedChange={() => handleToggleActive(instruction.id, instruction.is_active)}
                      aria-label={`Toggle ${instruction.name} active status`}
                    />
                  </TableCell>
                  <TableCell className="text-right flex gap-1 justify-end">
                    <Dialog
                      open={isEditDialogOpen && currentInstruction?.id === instruction.id}
                      onOpenChange={setIsEditDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setCurrentInstruction(instruction)
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
                          <DialogTitle className="font-playfair-display text-dark-text">
                            Editar Instrução de IA
                          </DialogTitle>
                        </DialogHeader>
                        <form action={updateFormAction} className="grid gap-4 py-4">
                          <input type="hidden" name="id" value={currentInstruction?.id || ""} />
                          <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="edit-name" className="text-right text-secondary-text font-inter">
                              Nome
                            </label>
                            <Input
                              id="edit-name"
                              name="name"
                              defaultValue={currentInstruction?.name}
                              className="col-span-3 border-muted text-dark-text font-inter focus:border-mustard focus:ring-mustard"
                              required
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="edit-instruction" className="text-right text-secondary-text font-inter">
                              Instrução
                            </label>
                            <Textarea
                              id="edit-instruction"
                              name="instruction"
                              defaultValue={currentInstruction?.instruction}
                              className="col-span-3 border-muted text-dark-text font-inter focus:border-mustard focus:ring-mustard"
                              rows={5}
                              required
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="edit-is_active" className="text-right text-secondary-text font-inter">
                              Ativa
                            </label>
                            <Switch
                              id="edit-is_active"
                              name="is_active"
                              defaultChecked={currentInstruction?.is_active}
                              className="col-span-3"
                              value={currentInstruction?.is_active ? "true" : "false"}
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
                      onClick={() => handleDelete(instruction.id)}
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
