/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.datinghelpai.com', // 请替换为您的实际网站URL
  generateRobotsTxt: true, // 生成robots.txt文件
  sitemapSize: 7000, // 每个sitemap文件的最大URL数量
  exclude: ['/server-sitemap.xml'], // 排除的路径
  robotsTxtOptions: {
    additionalSitemaps: [
      'https://www.datinghelpai.com/server-sitemap.xml', // 如果有动态生成的sitemap，可以在这里添加
    ],
  },
  // 自定义转换函数，可以根据需要修改
  transform: async (config, path) => {
    // 自定义优先级和更改频率
    return {
      loc: path, // 页面URL
      changefreq: path === '/' ? 'daily' : 'weekly',
      priority: path === '/' ? 1.0 : 0.8,
      lastmod: new Date().toISOString(),
    };
  },
};
