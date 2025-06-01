"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, TrendingUp, FileText, Settings } from "lucide-react"
import type { Post } from "@/actions/get-instagram-posts"
import Link from "next/link"
import { Button } from "@/components/ui/button"

function extractHashtags(caption: string) {
  const hashtagRegex = /#[\w\u00C0-\u017F]+/g
  return caption.match(hashtagRegex) || []
}

// Alterado para default export
export default function AnalyticsPanel({ posts }: { posts: Post[] }) {
  const analytics = (() => {
    const categoryCount: Record<string, number> = {}
    const hashtagCount: Record<string, number> = {}
    const monthlyPosts: Record<string, number> = {}

    posts.forEach((post) => {
      post.categories?.forEach((category) => {
        const cleanCategory = category.replace("#", "")
        categoryCount[cleanCategory] = (categoryCount[cleanCategory] || 0) + 1
      })

      const hashtags = extractHashtags(post.caption)
      hashtags.forEach((hashtag) => {
        const cleanHashtag = hashtag.toLowerCase()
        hashtagCount[cleanHashtag] = (hashtagCount[cleanHashtag] || 0) + 1
      })

      const date = new Date(post.post_date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      monthlyPosts[monthKey] = (monthlyPosts[monthKey] || 0) + 1
    })

    const topCategories = Object.entries(categoryCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)

    const topHashtags = Object.entries(hashtagCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)

    const recentMonths = Object.entries(monthlyPosts)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 6)

    return {
      totalPosts: posts.length,
      totalCategories: Object.keys(categoryCount).length,
      totalHashtags: Object.keys(hashtagCount).length,
      topCategories,
      topHashtags,
      recentMonths,
    }
  })()

  return (
    <div className="space-y-6">
      <Card className="rounded-xl shadow-sm border border-muted">
        <CardHeader>
          <CardTitle className="text-lg font-playfair-display text-dark-text flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Estatísticas Gerais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="text-center p-3 bg-cream rounded-lg border border-muted">
              <div className="text-2xl font-bold text-dark-text font-inter">{analytics.totalPosts}</div>
              <div className="text-sm text-secondary-text font-inter">Total de Posts</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center p-2 bg-cream rounded-lg border border-muted">
                <div className="text-lg font-bold text-dark-text font-inter">{analytics.totalCategories}</div>
                <div className="text-xs text-secondary-text font-inter">Categorias</div>
              </div>
              <div className="text-center p-2 bg-cream rounded-lg border border-muted">
                <div className="text-lg font-bold text-dark-text font-inter">{analytics.totalHashtags}</div>
                <div className="text-xs text-secondary-text font-inter">Hashtags</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="rounded-xl shadow-sm border border-muted">
        <CardHeader className="flex justify-between">
          <CardTitle className="text-lg font-playfair-display text-dark-text flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Top Categorias
          </CardTitle>
          <Link href="/categorization" passHref>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-muted text-secondary-text hover:bg-muted hover:text-dark-text"
            >
              <Settings className="h-4 w-4" />
              <span className="sr-only">Gerenciar Categorias</span>
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analytics.topCategories.map(([category, count], index) => (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-secondary-text font-inter">#{index + 1}</span>
                  <Badge
                    variant="outline"
                    className="text-xs bg-white text-secondary-text border border-muted rounded-md font-inter"
                  >
                    {category}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-muted rounded-full h-2">
                    <div
                      className="bg-pastel-bar-1 h-2 rounded-full"
                      style={{ width: `${(count / analytics.topCategories[0][1]) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-dark-text font-inter">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card className="rounded-xl shadow-sm border border-muted">
        <CardHeader>
          <CardTitle className="text-lg font-playfair-display text-dark-text flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Atividade Recente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analytics.recentMonths.map(([month, count]) => {
              const [year, monthNum] = month.split("-")
              const monthName = new Date(Number.parseInt(year), Number.parseInt(monthNum) - 1).toLocaleDateString(
                "pt-BR",
                {
                  month: "long",
                  year: "numeric",
                },
              )
              return (
                <div key={month} className="flex items-center justify-between">
                  <span className="text-sm text-secondary-text capitalize font-inter">{monthName}</span>
                  <div
                    className="w-12 bg-muted rounded-full h-2"
                    style={{ width: `${(count / Math.max(...analytics.recentMonths.map(([, c]) => c))) * 100}%` }}
                  >
                    <div className="bg-pastel-bar-2 h-2 rounded-full" />
                  </div>
                  <span className="text-sm font-medium text-dark-text font-inter">{count}</span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
