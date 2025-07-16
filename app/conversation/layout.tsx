import type { Metadata } from "next"

export const metadata: Metadata = {
  title: 'AI Dating Coach - Smart Conversation Assistant for Dating Apps | Dating Help AI',
  description: 'Get instant AI-powered dating advice and conversation suggestions. Our Dating AI Coach helps you create engaging responses that increase matches and date invitations on Tinder, Bumble, and Hinge',
  keywords: 'dating coach, ai dating assistant, conversation help, dating apps, tinder coach, bumble assistant, hinge helper, chat suggestions',
  openGraph: {
    title: 'AI Dating Coach - Smart Conversation Assistant for Dating Apps | Dating Help AI',
    description: 'Get instant AI-powered dating advice and conversation suggestions. Our Dating AI Coach helps you create engaging responses that increase matches and date invitations on Tinder, Bumble, and Hinge',
    type: 'website',
    siteName: 'Dating Help AI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Dating Coach - Smart Conversation Assistant for Dating Apps | Dating Help AI',
    description: 'Get instant AI-powered dating advice and conversation suggestions. Our Dating AI Coach helps you create engaging responses that increase matches and date invitations on Tinder, Bumble, and Hinge',
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

export default function ConversationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}