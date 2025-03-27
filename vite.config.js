import { defineConfig } from 'vite';

// Assuming your repository name is 'Neurogame' based on the provided link
const repositoryName = 'Neurogame';

export default defineConfig({
  // Set base path for GitHub Pages deployment
  // Example: https://rogerjs93.github.io/Neurogame/
  base: `/${repositoryName}/`,
  build: {
    outDir: 'dist', // Ensure the output directory is 'dist'
  },
  server: {
    // Optional: configure the dev server if needed
    port: 3000,
    open: true, // Automatically open in browser
  },
  // Optional: If you have assets in public folder, ensure they are handled correctly
  // publicDir: 'public' // This is the default
});