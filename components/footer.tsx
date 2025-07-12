"use client"

import { Heart, Instagram, Twitter, Mail } from "lucide-react"
import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-gray-100 text-gray-800 py-12">
      <div className="max-w-screen-xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and Social Media */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">Dating Help AI</span>
            </div>
            <p className="text-gray-600 mb-6 max-w-md">
              Maximizing your dating success with AI-powered conversation assistance and profile optimization.
            </p>

            {/* Social Media Icons */}
            <div className="flex space-x-4">
              <Link
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white hover:bg-pink-500 hover:text-white rounded-lg flex items-center justify-center transition-colors duration-200 shadow-sm border border-gray-200"
              >
                <Instagram className="w-5 h-5" />
              </Link>
              <Link
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white hover:bg-blue-500 hover:text-white rounded-lg flex items-center justify-center transition-colors duration-200 shadow-sm border border-gray-200"
              >
                <Twitter className="w-5 h-5" />
              </Link>
              <Link
                href="mailto:contact@datinghelpai.com"
                className="w-10 h-10 bg-white hover:bg-purple-500 hover:text-white rounded-lg flex items-center justify-center transition-colors duration-200 shadow-sm border border-gray-200"
              >
                <Mail className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* General Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">General</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-gray-600 hover:text-purple-600 transition-colors duration-200">
                  Home
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-purple-600 transition-colors duration-200">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-purple-600 transition-colors duration-200">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-purple-600 transition-colors duration-200">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Products Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Products</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/upload" className="text-gray-600 hover:text-purple-600 transition-colors duration-200">
                  Upload Screenshot
                </Link>
              </li>
              <li>
                <Link
                  href="/conversation"
                  className="text-gray-600 hover:text-purple-600 transition-colors duration-200"
                >
                  Type a Conversation
                </Link>
              </li>
              <li>
                <Link
                  href="/pickup-lines"
                  className="text-gray-600 hover:text-purple-600 transition-colors duration-200"
                >
                  Smart Icebreakers
                </Link>
              </li>
              <li className="relative group">
                <span className="text-gray-400 cursor-not-allowed">Profile Review</span>
                <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                  Launching Soon
                  <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              </li>
              <li className="relative group">
                <span className="text-gray-400 cursor-not-allowed">AI Enhanced Photos</span>
                <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                  Launching Soon
                  <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-purple-600 transition-colors duration-200">
                  All Tools
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-300 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-500 text-sm">© 2024 Dating Help AI. All rights reserved.</div>
            <div className="flex space-x-6 text-sm">
              <Link href="#" className="text-gray-500 hover:text-purple-600 transition-colors duration-200">
                Privacy Policy
              </Link>
              <Link href="#" className="text-gray-500 hover:text-purple-600 transition-colors duration-200">
                Terms of Service
              </Link>
              <Link href="#" className="text-gray-500 hover:text-purple-600 transition-colors duration-200">
                Refund Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
