/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Webpack optimizations for better caching performance
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Optimize webpack caching for large strings
    if (config.cache && typeof config.cache === 'object') {
      config.cache = {
        ...config.cache,
        type: 'filesystem',
        // Use more efficient serialization for large content
        compression: 'gzip',
        // Split cache by content type to avoid large string serialization issues
        name: `${config.name || 'default'}-${process.env.NODE_ENV || 'development'}`,
      };
    }

    // Configure module rules for better handling of text files
    config.module.rules.push({
      test: /\.txt$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/prompts/[name]-[hash][ext]'
      }
    });

    // Optimize chunk splitting to separate large configuration data
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks?.cacheGroups,
            // Separate prompts and configuration into their own chunks
            prompts: {
              test: /[\\/]lib[\\/]config[\\/]/,
              name: 'prompts',
              chunks: 'all',
              priority: 30,
            },
            // Group other utilities
            utils: {
              test: /[\\/]lib[\\/](?!config)/,
              name: 'utils',
              chunks: 'all',
              priority: 20,
            },
          },
        },
      };
    }

    return config;
  },
  images: {
    unoptimized: true,
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // 重定向设置 - 确保重定向次数少于2次
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      {
        source: '/index.html',
        destination: '/',
        permanent: true,
      },
    ]
  },
  // 性能优化
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  // 压缩设置
  compress: true,
  // 安全头设置
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

export default nextConfig
