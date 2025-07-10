"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Wine } from "lucide-react"
import { cn } from "@/lib/utils"

// Mock data for wine cellar
const wineCellarData = {
  title: "Vinný sklep",
  description: "Náš penzion disponuje vlastním vinným sklípkem, který je ideálním místem pro posezení s přáteli, rodinou či kolegy. Nabízíme možnost degustace vín od místních vinařů, rauty a další společenské akce. Kapacita sklípku je až 20 osob.",
  features: [
    "Ochutnávky vín",
    "Řízené degustace",
    "Posezení až pro 20 osob",
    "Občerstvení k vínu",
    "Možnost zakoupení vín"
  ],
  images: [
    "/images/wine-cellar/sklep.png",
    "/images/wine-cellar/cellar-1.jpg",
    "/images/wine-cellar/cellar-2.jpg"
  ]
}

export default function WineCellar() {
  const [currentImage, setCurrentImage] = useState(0)

  const nextImage = () => {
    setCurrentImage((prev) => (prev === wineCellarData.images.length - 1 ? 0 : prev + 1))
  }

  const prevImage = () => {
    setCurrentImage((prev) => (prev === 0 ? wineCellarData.images.length - 1 : prev - 1))
  }

  return (
    <section id="wine-cellar" className="py-24 md:py-32 px-6 md:px-20 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif tracking-wider uppercase text-center mb-4">
          {wineCellarData.title}
        </h2>
        <div className="w-24 h-px bg-dark-gray/30 mx-auto mb-12" />

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <p className="text-lg mb-10 leading-relaxed">
              {wineCellarData.description}
            </p>

            <h3 className="uppercase tracking-widest text-sm mb-4">Co nabízíme:</h3>
            <ul className="space-y-3 mb-8">
              {wineCellarData.features.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <Wine className="h-5 w-5 text-purple" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Button 
              className="rounded-full bg-dark-gray text-white px-8 py-6 uppercase tracking-widest text-sm hover:bg-black transition-colors"
            >
              Rezervovat degustaci
            </Button>
          </div>

          <div className="relative h-[400px] md:h-[500px] rounded-lg overflow-hidden order-1 md:order-2">
            <Image
              src={wineCellarData.images[currentImage]}
              alt={`Vinný sklep - obrázek ${currentImage + 1}`}
              fill
              className="object-cover"
            />

            <div className="absolute bottom-6 right-6 flex gap-3">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full bg-white/30 backdrop-blur-sm hover:bg-white/50 border-none"
                onClick={prevImage}
              >
                <ChevronLeft className="h-5 w-5" />
                <span className="sr-only">Předchozí</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full bg-white/30 backdrop-blur-sm hover:bg-white/50 border-none"
                onClick={nextImage}
              >
                <ChevronRight className="h-5 w-5" />
                <span className="sr-only">Další</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
