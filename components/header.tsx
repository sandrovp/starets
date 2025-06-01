"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import Link from "next/link" // Importar Link para o botão de sair, se for para uma rota de logout

export default function Header() {
  return (
    <header className="w-full bg-cream py-4 px-6 flex items-center justify-between border-b border-muted shadow-sm">
      <div className="flex items-center">
        <Link href="/" className="flex items-center">
          <Image src="/images/starets-logo.png" alt="Starets Logo" width={200} height={50} className="h-auto" />
        </Link>
      </div>
      <nav>{/* Aqui você pode adicionar outros links de navegação se necessário */}</nav>
      <div>
        <Button
          variant="outline"
          className="border-muted text-dark-text font-semibold hover:bg-muted hover:text-primary-foreground rounded-md px-4 py-2"
          // Adicione a lógica de logout aqui, por exemplo, um Server Action ou redirecionamento
          onClick={() => {
            // Exemplo: window.location.href = '/api/auth/logout';
            alert("Funcionalidade de Sair (Logout) a ser implementada.")
          }}
        >
          Sair
        </Button>
      </div>
    </header>
  )
}
