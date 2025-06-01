"use server"

import { supabase } from "@/lib/supabase"

export interface Post {
  id?: string // Supabase will add an ID
  post_url: string // Renomeado de 'url'
  caption: string
  post_date: string // Renomeado de 'date'
  image_urls: string[] // Renomeado de 'img_urls'
  categories: string[] // Renomeado de 'tags'
}

export async function getInstagramPosts(): Promise<Post[]> {
  const { data, error } = await supabase
    .from("posts_instagram") // Tabela atualizada
    .select("id, post_url, caption, post_date, image_urls, categories") // Selecionando campos específicos
    .order("post_date", { ascending: false }) // Ordenando pela nova coluna de data

  if (error) {
    console.error("Error fetching posts from Supabase:", error)
    return []
  }

  return data as Post[]
}
