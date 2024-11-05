"use client";
import { motion } from "framer-motion";
import { Beer, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/75 border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Beer className="h-8 w-8 text-amber-500" />
            <span className="text-xl font-semibold">My Opensea Listings</span>
          </Link>
          <nav className="hidden md:flex space-x-8">
            {/* <Link
              href='#'
              className='text-sm font-medium hover:text-amber-500 transition-colors'
            >
              About
            </Link> */}
          </nav>
          <div className="hidden md:flex space-x-4">
            <ConnectButton showBalance={false} />
          </div>
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </header>

      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden absolute top-16 inset-x-0 bg-white shadow-lg z-40"
        >
          <nav className="flex flex-col p-4 space-y-4">
            {/* <Link
              href='#'
              className='text-sm font-medium hover:text-amber-500 transition-colors'
            >
              About
            </Link> */}
            <ConnectButton showBalance={false} />
          </nav>
        </motion.div>
      )}
    </>
  );
}
