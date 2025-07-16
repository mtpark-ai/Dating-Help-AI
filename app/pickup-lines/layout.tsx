import type { Metadata } from "next"

export const metadata: Metadata = {
  title: 'AI Pickup Lines Generator - Best Openers for Dating Apps | Dating Help AI',
  description: 'Generate creative pickup lines and conversation starters for Tinder, Bumble, and Hinge. Break the ice effortlessly with AI-powered openers',
  keywords: 'ai pickup lines, dating app openers, conversation starters, tinder pickup lines, bumble openers, hinge starters, dating icebreakers',
  openGraph: {
    title: 'AI Pickup Lines Generator - Best Openers for Dating Apps | Dating Help AI',
    description: 'Generate creative pickup lines and conversation starters for Tinder, Bumble, and Hinge. Break the ice effortlessly with AI-powered openers',
    type: 'website',
    siteName: 'Dating Help AI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Pickup Lines Generator - Best Openers for Dating Apps | Dating Help AI',
    description: 'Generate creative pickup lines and conversation starters for Tinder, Bumble, and Hinge. Break the ice effortlessly with AI-powered openers',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function PickupLinesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}