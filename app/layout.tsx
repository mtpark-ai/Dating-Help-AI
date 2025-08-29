import type { Metadata } from 'next'
import './globals.css'
import { ErrorBoundary } from '@/components/error-boundary'

// 检查是否为测试环境
const isTestEnv = process.env.NEXT_PUBLIC_ENV === 'test'

// 根据环境设置不同的元数据
const getSiteUrl = () => isTestEnv 
  ? 'https://test.datinghelpai.com'
  : 'https://datinghelpai.com'

export const metadata: Metadata = {
  title: `${isTestEnv ? '[TEST] ' : ''}Dating Help AI - Your AI Dating Coach for Tinder, Bumble & Hinge Success`,
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
    title: `${isTestEnv ? '[TEST] ' : ''}Dating Help AI - Your AI Dating Coach for Tinder, Bumble & Hinge Success`,
    description: 'Boost your dating app success with Dating Help AI. Get AI-powered conversation assistance, pickup lines, profile reviews, and photo optimization for Tinder, Bumble, Hinge & more. Try free today!',
    type: 'website',
    siteName: 'Dating Help AI',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${isTestEnv ? '[TEST] ' : ''}Dating Help AI - Your AI Dating Coach for Tinder, Bumble & Hinge Success`,
    description: 'Boost your dating app success with Dating Help AI. Get AI-powered conversation assistance, pickup lines, profile reviews, and photo optimization for Tinder, Bumble, Hinge & more. Try free today!',
  },
  robots: {
    index: !isTestEnv, // 测试环境不被索引
    follow: !isTestEnv,
    googleBot: {
      index: !isTestEnv,
      follow: !isTestEnv,
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
        {/* 关键CSS内联 - 移动端优化 */}
        <style dangerouslySetInnerHTML={{
          __html: `
            /* 关键渲染路径CSS - 移动端优先 */
            html{font-display:swap;scroll-behavior:smooth;zoom:0.9}
            body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;font-display:swap;text-rendering:optimizeSpeed;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
            .landing-page-zoom{zoom:1.00}
            .function-page-zoom{zoom:1.00}
            /* 防止移动端布局偏移 */
            img{height:auto;max-width:100%}
            /* 移动端触控优化 */
            button,a{min-height:44px;padding:12px 16px}
            @media(max-width:768px){
              html{font-size:16px}
              .mobile-optimized{font-size:16px}
              .touch-optimized *{-webkit-tap-highlight-color:transparent}
            }
          `
        }} />
        
        {/* 测试环境标识 */}
        {isTestEnv && (
          <style dangerouslySetInnerHTML={{
            __html: `
              body::before {
                content: "测试环境";
                position: fixed;
                top: 0;
                left: 0;
                background: #ff5722;
                color: white;
                padding: 2px 8px;
                font-size: 12px;
                z-index: 9999;
                pointer-events: none;
              }
              
              /* 测试环境边框标识 */
              body::after {
                content: "";
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                border: 4px solid #ff5722;
                pointer-events: none;
                z-index: 9998;
                opacity: 0.2;
              }
            `
          }} />
        )}
        
        {/* 预连接到外部资源 */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        
        {/* 优化后的GA - 移动端主线程友好 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // 使用 requestIdleCallback 延迟GA加载，减少主线程阻塞
              (function() {
                function loadGA() {
                  var ga = document.createElement('script');
                  ga.async = true;
                  ga.src = 'https://www.googletagmanager.com/gtag/js?id=G-PR33CYNQW3';
                  document.head.appendChild(ga);
                  
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', 'G-PR33CYNQW3', {
                    page_title: document.title,
                    page_location: window.location.href,
                    send_page_view: false, // 手动控制页面视图发送
                    ${isTestEnv ? "'debug_mode': true," : ""} // 测试环境启用调试模式
                    ${isTestEnv ? "'test_environment': true," : ""} // 测试环境标记
                  });
                  
                  // 延迟发送页面视图
                  setTimeout(() => gtag('event', 'page_view'), 100);
                }
                
                // 优先使用 requestIdleCallback，回退到 setTimeout
                if ('requestIdleCallback' in window) {
                  requestIdleCallback(loadGA, { timeout: 2000 });
                } else {
                  setTimeout(loadGA, 1000);
                }
              })();
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
              "name": `${isTestEnv ? '[TEST] ' : ''}Dating Help AI`,
              "description": "Your AI Dating Coach for Tinder, Bumble & Hinge Success",
              "url": getSiteUrl(),
              "potentialAction": {
                "@type": "SearchAction",
                "target": `${getSiteUrl()}/search?q={search_term_string}`,
                "query-input": "required name=search_term_string"
              },
              "publisher": {
                "@type": "Organization",
                "name": "Dating Help AI",
                "url": getSiteUrl(),
                "logo": {
                  "@type": "ImageObject",
                  "url": `${getSiteUrl()}/placeholder-logo.png`
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
              "name": `${isTestEnv ? '[TEST] ' : ''}Dating Help AI`,
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
        
        {/* 测试环境元标签 */}
        {isTestEnv && (
          <>
            <meta name="robots" content="noindex, nofollow" />
            <meta name="googlebot" content="noindex, nofollow" />
            <meta name="environment" content="test" />
          </>
        )}
      </head>
      <body>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  )
}