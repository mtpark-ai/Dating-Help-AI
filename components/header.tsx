"use client"
import { Heart } from "lucide-react"
import Link from "next/link"

export default function Header() {
  return (
    <header className="w-full py-6 px-4 md:px-8">
      <div className="max-w-screen-xl mx-auto flex items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Dating Help AI
          </span>
        </Link>

        {/* Navigation Menu - Evenly distributed with logo */}
        <nav className="hidden md:flex items-center flex-1 justify-evenly ml-8 lg:ml-10">
          <div className="relative group">
            <span className="text-gray-700 hover:text-purple-600 transition-colors duration-200 font-medium whitespace-nowrap cursor-pointer">
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
            className="text-gray-700 hover:text-purple-600 transition-colors duration-200 font-medium whitespace-nowrap"
          >
            AI Pickup Lines
          </Link>
          <div className="relative group">
            <span className="text-gray-400 cursor-default font-medium whitespace-nowrap">Dating Profile Review</span>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
              Launching Soon
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900"></div>
            </div>
          </div>
          <div className="relative group">
            <span className="text-gray-400 cursor-default font-medium whitespace-nowrap">Dating App Photo</span>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
              Launching Soon
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900"></div>
            </div>
          </div>
        </nav>
      </div>
    </header>
  )
}
