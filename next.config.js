const withJavaScriptObfuscator = require('next-javascript-obfuscator');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false
}

module.exports = withJavaScriptObfuscator(nextConfig, {
  compact: true,
  controlFlowFlattening: false,
  deadCodeInjection: false,
  debugProtection: false,
  disableConsoleOutput: false,
  stringArray: true,
  stringArrayThreshold: 0.75,
  unicodeEscapeSequence: true,
  reservedStrings: ['stripe', 'supabase', 'google'],
});
