import Image from "next/image"
import Link from "next/link"
import React from "react"
import { Button } from "./ui/button"

const Header = () => {
  return (
    <header className="w-full px-6 py-5">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/">
          <Image
            src="/icons/logo.png"
            alt="CryptoSeven Logo"
            width={60}
            height={60}
            className="hover:opacity-90 transition-opacity"
          />
        </Link>

        <Button
          className="font-medium bg-[#6969fc] hover:bg-[#6969fc]/90"
        >
          <Link href="/sign-up">Get Started</Link>
        </Button>
      </div>
    </header>
  )
}

export default Header
