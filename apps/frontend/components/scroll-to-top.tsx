"use client"

import { useState, useEffect } from "react"
import { ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 500) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener("scroll", toggleVisibility)
    return () => window.removeEventListener("scroll", toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  return (
    isVisible && (
      <div className="fixed bottom-8 right-8 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={scrollToTop}
          className="rounded-full bg-white/80 backdrop-blur-sm hover:bg-white border-none shadow-lg transition-all duration-300 hover:scale-110"
        >
          <ChevronUp className="h-6 w-6 text-dark-gray" />
          <span className="sr-only">Návrat nahoru</span>
        </Button>
      </div>
    )
  )
}
