import { defineConfig } from '@prisma/client/scripts'

export default defineConfig({
  // Define the schema file location
  schema: './prisma/schema.prisma',
  
  // Seed script configuration
  seed: {
    script: './prisma/seed.js'
  },
  
  // Generator configuration
  generator: {
    provider: 'prisma-client-js',
    output: './node_modules/@prisma/client'
  }
})