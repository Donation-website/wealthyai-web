const withObfuscator = require('nextjs-obfuscator');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false
}

module.exports = withObfuscator(nextConfig, {
  obfuscateFiles: {
    buildManifest: true,
    ssg: true,
    ssr: true,
    chunks: true,
    pages: true,
  },
  obfuscationOptions: {
    compact: true,
    controlFlowFlattening: false,
    deadCodeInjection: false,
    debugProtection: false,
    disableConsoleOutput: false,
    stringArray: true,
    stringArrayThreshold: 0.75,
    unicodeEscapeSequence: true,
  }
});
