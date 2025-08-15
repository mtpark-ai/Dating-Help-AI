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
                href="mailto:contact@datinghelpai.com"
                className="w-10 h-10 bg-white hover:bg-purple-500 hover:text-white rounded-lg flex items-center justify-center transition-colors duration-200 shadow-sm border border-gray-200"
                title="contact@datinghelpai.com"
              >
                <Mail className="w-5 h-5" />
              </Link>
              
              {/* Instagram */}
              <Link
                href="https://instagram.com/datinghelpai"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white hover:bg-gradient-to-r hover:from-pink-500 hover:to-purple-500 hover:text-white rounded-lg flex items-center justify-center transition-all duration-200 shadow-sm border border-gray-200 group"
                title="Follow us on Instagram"
              >
                <Instagram className="w-5 h-5 text-gray-600 group-hover:text-white" />
              </Link>
              
              {/* Facebook */}
              <Link
                href="https://facebook.com/datinghelpai"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white hover:bg-blue-600 hover:text-white rounded-lg flex items-center justify-center transition-all duration-200 shadow-sm border border-gray-200 group"
                title="Follow us on Facebook"
              >
                <svg className="w-5 h-5 text-gray-600 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </Link>
              
              {/* Twitter */}
              <Link
                href="https://twitter.com/datinghelpai"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white hover:bg-blue-400 hover:text-white rounded-lg flex items-center justify-center transition-all duration-200 shadow-sm border border-gray-200 group"
                title="Follow us on Twitter"
              >
                <Twitter className="w-5 h-5 text-gray-600 group-hover:text-white" />
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
              <li>
                <Link href="/admin/questions" className="text-gray-600 hover:text-purple-600 transition-colors duration-200">
                  Admin
                </Link>
              </li>
            </ul>
          </div>

          {/* Products Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Products</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/upload-screenshot" className="text-gray-600 hover:text-purple-600 transition-colors duration-200">
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
                  AI Pickup Lines
                </Link>
              </li>
              <li className="relative group">
                <span className="text-gray-400 cursor-default font-medium whitespace-nowrap">Profile Review</span>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                  Launching Soon
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900"></div>
                </div>
              </li>
              <li className="relative group">
                <span className="text-gray-400 cursor-default font-medium whitespace-nowrap">AI Enhanced Photos</span>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                  Launching Soon
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900"></div>
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
