const JavaScriptObfuscator = require('webpack-obfuscator');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  webpack: (config, { isServer }) => {
    if (!isServer && process.env.NODE_ENV === 'production') {
      config.plugins.push(
        new JavaScriptObfuscator({
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
