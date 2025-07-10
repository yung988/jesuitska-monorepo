"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center p-6 bg-transparent">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            className="rounded-full px-6 uppercase tracking-widest text-sm bg-white/90 hover:bg-white text-dark-gray md:text-xs"
          >
            <Menu className="mr-2 h-4 w-4" /> Menu
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="bg-white w-full sm:max-w-md">
          <SheetTitle className="sr-only">Navigační menu</SheetTitle>
          <nav className="flex flex-col gap-8 mt-16">
            <Link href="#intro" className="text-xl uppercase tracking-widest hover:text-black transition-colors">
              O pensionu
            </Link>
            <Link href="#rooms" className="text-xl uppercase tracking-widest hover:text-black transition-colors">
              Pokoje
            </Link>
            <Link href="#booking" className="text-xl uppercase tracking-widest hover:text-black transition-colors">
              Rezervace
            </Link>
            <Link href="#gallery" className="text-xl uppercase tracking-widest hover:text-black transition-colors">
              Galerie
            </Link>
            <Link href="#location" className="text-xl uppercase tracking-widest hover:text-black transition-colors">
              Lokalita
            </Link>
            <Link href="#contact" className="text-xl uppercase tracking-widest hover:text-black transition-colors">
              Kontakt
            </Link>
          </nav>
        </SheetContent>
      </Sheet>

      <Link href="/" className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
        <div className="font-serif text-2xl tracking-wider">PENSION JESUITSKÁ</div>
      </Link>

      <Link
        href="#booking"
        className="rounded-full bg-dark-gray text-white px-6 py-2 uppercase tracking-widest text-sm hover:bg-black transition-colors"
      >
        Rezervovat
      </Link>
    </header>
  )
}
