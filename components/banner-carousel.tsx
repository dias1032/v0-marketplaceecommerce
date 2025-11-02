"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface Banner {
  id: string
  title: string
  subtitle: string | null
  image_url: string
  link_url: string | null
  button_text: string | null
}

interface BannerCarouselProps {
  banners: Banner[]
  autoPlayInterval?: number
}

export function BannerCarousel({ banners, autoPlayInterval = 5000 }: BannerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (banners.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length)
    }, autoPlayInterval)

    return () => clearInterval(interval)
  }, [banners.length, autoPlayInterval])

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length)
  }

  if (banners.length === 0) return null

  const currentBanner = banners[currentIndex]

  return (
    <div className="relative aspect-[16/7] md:aspect-[21/7] overflow-hidden rounded-2xl bg-gradient-to-br from-pink-100 to-purple-100 group">
      <Image
        src={currentBanner.image_url || "/placeholder.svg"}
        alt={currentBanner.title}
        fill
        className="object-cover transition-opacity duration-500"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex items-center">
        <div className="container">
          <Badge className="mb-3 bg-yellow-400 text-black font-bold">NOVO</Badge>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 max-w-lg">{currentBanner.title}</h1>
          {currentBanner.subtitle && <p className="text-white/90 mb-4 text-lg">{currentBanner.subtitle}</p>}
          {currentBanner.link_url && (
            <Button size="lg" className="bg-white text-black hover:bg-gray-100 font-bold" asChild>
              <Link href={currentBanner.link_url}>{currentBanner.button_text || "Comprar Agora"}</Link>
            </Button>
          )}
        </div>
      </div>

      {banners.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Banner anterior"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Próximo banner"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex ? "w-8 bg-white" : "w-2 bg-white/50"
                }`}
                aria-label={`Ir para banner ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
