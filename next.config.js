/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // EZ KELL A CLOUDFLARE-NEK:
  experimental: {
    runtime: 'edge',
  },
  webpack: (config, { isServer }) => {
    if (!isServer && process.env.NODE_ENV === 'production') {
      // Dinamikusan töltjük be, hogy ne akadjon meg a build az elején
      const JavaScriptObfuscator = require('javascript-obfuscator');
      const WebpackObfuscator = require('webpack-obfuscator');
      
      config.plugins.push(
        new WebpackObfuscator({
          compact: true,
          controlFlowFlattening: false,
          stringArray: true,
          stringArrayThreshold: 0.75,
          unicodeEscapeSequence: true,
        }, [])
      );
    }
    return config;
  },
}

module.exports = nextConfig;
