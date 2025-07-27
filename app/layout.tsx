import type { Metadata } from 'next'
import './globals.css'
import { ErrorBoundary } from '@/components/error-boundary'

export const metadata: Metadata = {
  title: 'Dating Help AI - Your AI Dating Coach for Tinder, Bumble & Hinge Success',
  description: 'Boost your dating app success with Dating Help AI. Get AI-powered conversation assistance, pickup lines, profile reviews, and photo optimization for Tinder, Bumble, Hinge & more. Try free today!',
  keywords: 'dating help ai, ai dating coach, tinder ai, bumble ai, hinge ai, dating app assistant, ai pickup lines, dating profile review, dating conversation help, online dating success',
  generator: 'Dating Help AI',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#ec4899' },
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: 'Dating Help AI - Your AI Dating Coach for Tinder, Bumble & Hinge Success',
    description: 'Boost your dating app success with Dating Help AI. Get AI-powered conversation assistance, pickup lines, profile reviews, and photo optimization for Tinder, Bumble, Hinge & more. Try free today!',
    type: 'website',
    siteName: 'Dating Help AI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dating Help AI - Your AI Dating Coach for Tinder, Bumble & Hinge Success',
    description: 'Boost your dating app success with Dating Help AI. Get AI-powered conversation assistance, pickup lines, profile reviews, and photo optimization for Tinder, Bumble, Hinge & more. Try free today!',
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-PR33CYNQW3"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-PR33CYNQW3');
            `,
          }}
        />
        {/* Schema.org Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Dating Help AI",
              "description": "Your AI Dating Coach for Tinder, Bumble & Hinge Success",
              "url": "https://dating-help-ai.com",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://dating-help-ai.com/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              },
              "publisher": {
                "@type": "Organization",
                "name": "Dating Help AI",
                "url": "https://dating-help-ai.com",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://dating-help-ai.com/placeholder-logo.png"
                }
              },
              "sameAs": [
                "https://twitter.com/datinghelpai",
                "https://facebook.com/datinghelpai"
              ]
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Dating Help AI",
              "description": "AI-powered dating app assistant for Tinder, Bumble, and Hinge",
              "applicationCategory": "LifestyleApplication",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "featureList": [
                "AI Pickup Lines",
                "Dating AI Coach", 
                "Profile Review",
                "Photo Generator"
              ]
            })
          }}
        />
      </head>
      <body>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  )
}
