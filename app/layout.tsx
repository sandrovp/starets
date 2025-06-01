import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
// Adicione o import do Header
import Header from "@/components/header"

export const metadata: Metadata = {
  title: "starets",
  description: "Created with v0",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Header />
        {/* Adicionado bg-transparent para permitir que o gradiente do body apareça */}
        <main className="bg-transparent">{children}</main>
      </body>
    </html>
  )
}
