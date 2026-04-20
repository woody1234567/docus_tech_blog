import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  css: ['katex/dist/katex.min.css'],
  compatibilityDate: '2024-11-01',
  content: {
    build: {
      markdown: {
        highlight: {
          // Theme used in all color schemes.
          theme: 'github-dark',
          // List of languages to bundle
          langs: [
            'python', 'ts', 'js', 'vue', 'bash', 'yaml', 'md', 'html', 'css', 
            'sql', 'json', 'mermaid', 'diff', 'shell'
          ]
        },
        remarkPlugins: {
          'remark-math': {}
        },
        rehypePlugins: {
          'rehype-katex': {
            strict: false
          }
        }
      }
    }
  },
  assistant: {
    // AI model (uses AI SDK Gateway format)
    model: 'google/gemini-3-flash',

    // MCP server (path or URL)
    mcpServer: '/mcp',
  }
})
