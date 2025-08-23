"use client"
import { Heart, Menu, X, User } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { UserAvatar } from "@/components/user-avatar"

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user } = useAuth()

  return (
    <header className="w-full py-4 md:py-6 px-4 md:px-8">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
            <Heart className="w-5 h-5 md:w-7 md:h-7 text-white" />
          </div>
          <span className="text-[22px] md:text-[23.6px] font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Dating Help AI
          </span>
        </Link>

        {/* Desktop Navigation Menu */}
        <nav className="hidden md:flex items-center flex-1 justify-evenly ml-8 lg:ml-10">
          <div className="relative group">
            <span className="text-[15px] md:text-base lg:text-[17px] text-gray-700 hover:text-purple-600 transition-colors duration-200 font-medium whitespace-nowrap cursor-pointer">
              Dating AI Coach
            </span>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-20 min-w-48">
              <Link
                href="/upload-screenshot"
                className="block px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors duration-200 border-b border-gray-100"
              >
                Upload Screenshot
              </Link>
              <Link
                href="/conversation"
                className="block px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors duration-200"
              >
                Type a Conversation
              </Link>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-white"></div>
            </div>
          </div>
          <Link
            href="/pickup-lines"
            className="text-[15px] md:text-base lg:text-[17px] text-gray-700 hover:text-purple-600 transition-colors duration-200 font-medium whitespace-nowrap"
          >
            AI Pickup Lines
          </Link>
          <div className="relative group">
            <span className="text-[15px] md:text-base lg:text-[17px] text-gray-400 cursor-default font-medium whitespace-nowrap">Dating Profile Review</span>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
              Launching Soon
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900"></div>
            </div>
          </div>
          <div className="relative group">
            <span className="text-[15px] md:text-base lg:text-[17px] text-gray-400 cursor-default font-medium whitespace-nowrap">Dating App Photo</span>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
              Launching Soon
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900"></div>
            </div>
          </div>
        </nav>

        {/* User Menu / Auth Buttons */}
        <div className="hidden md:flex items-center">
          {user ? (
            <UserAvatar size="md" showDropdown={true} />
          ) : (
            <Link href="/login">
              <Button size="default" className="rounded-full px-6 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white border-0">
                Sign In
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-3 rounded-lg hover:bg-gray-100 transition-colors duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? (
            <X className="w-7 h-7 text-gray-700" />
          ) : (
            <Menu className="w-7 h-7 text-gray-700" />
          )}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-4 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <div className="py-3">
            {/* User Info Section */}
            {user && (
              <div className="px-5 py-4 border-b border-gray-100">
                <UserAvatar size="lg" showDropdown={true} onSignOut={() => setIsMobileMenuOpen(false)} />
              </div>
            )}

            {/* Auth Button (if not signed in) */}
            {!user && (
              <div className="px-5 py-4 border-b border-gray-100">
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full h-11 text-base px-5">
                    Sign In
                  </Button>
                </Link>
              </div>
            )}

            {/* Dating AI Coach Section */}
            <div className="px-5 py-4 border-b border-gray-100">
              <div className="text-base font-semibold text-gray-900 mb-3">Dating AI Coach</div>
              <div className="space-y-3">
                <Link
                  href="/upload-screenshot"
                  className="block px-4 py-3 text-base text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors duration-200 rounded-lg min-h-[44px] flex items-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Upload Screenshot
                </Link>
                <Link
                  href="/conversation"
                  className="block px-4 py-3 text-base text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors duration-200 rounded-lg min-h-[44px] flex items-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Type a Conversation
                </Link>
              </div>
            </div>

            {/* AI Pickup Lines */}
            <Link
              href="/pickup-lines"
              className="block px-5 py-4 text-base text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors duration-200 border-b border-gray-100 min-h-[44px] flex items-center"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              AI Pickup Lines
            </Link>

            {/* Dating Profile Review */}
            <div className="px-5 py-4 border-b border-gray-100">
              <div className="text-base text-gray-400">Dating Profile Review</div>
              <div className="text-sm text-gray-500 mt-1">Launching Soon</div>
            </div>

            {/* Dating App Photo */}
            <div className="px-5 py-4">
              <div className="text-base text-gray-400">Dating App Photo</div>
              <div className="text-sm text-gray-500 mt-1">Launching Soon</div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
