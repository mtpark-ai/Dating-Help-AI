import type { Metadata } from 'next'
import './globals.css'
import { ErrorBoundary } from '@/components/error-boundary'

export const metadata: Metadata = {
  title: 'Dating Help AI - Your AI Dating Coach for Tinder, Bumble & Hinge Success',
  description: 'Boost your dating app success with Dating Help AI. Get AI-powered conversation assistance, pickup lines, profile reviews, and photo optimization for Tinder, Bumble, Hinge & more. Try free today!',
  keywords: 'dating help ai, ai dating coach, tinder ai, bumble ai, hinge ai, dating app assistant, ai pickup lines, dating profile review, dating conversation help, online dating success',
  generator: 'Dating Help AI',
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
      </head>
      <body>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  )
}
