import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { copyFileSync, readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read package.json to get the extension name
const packageJson = JSON.parse(
  readFileSync(resolve(__dirname, 'package.json'), 'utf-8')
);

// Validate that package.json has a name field
if (!packageJson.name || typeof packageJson.name !== 'string' || packageJson.name.trim() === '') {
  throw new Error(
    'Error: package.json must have a "name" field.\n' +
    'Please add a "name" field to your package.json file.\n' +
    'Example: "name": "my-checkout-extension"'
  );
}

// Convert package name (kebab-case) to PascalCase for the output filename
// e.g., "example-checkout-extension-js" -> "ExampleCheckoutExtensionJs"
const extensionName = packageJson.name
  .split('-')
  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
  .join('');

const outputFileName = `${extensionName}.js`;

export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'copy-output',
      closeBundle() {
        copyFileSync(
          resolve(__dirname, `dist/${outputFileName}`),
          resolve(__dirname, `../${outputFileName}`)
        );
      },
    },
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: extensionName,
      fileName: () => outputFileName,
      formats: ['cjs'],
    },
    outDir: 'dist',
    emptyOutDir: true,
    cssCodeSplit: false, // Don't split CSS into separate files
    rollupOptions: {
      external: ['vue'],
      output: {
        format: 'cjs',
        name: extensionName,
        exports: 'default',
        globals: {
          vue: 'Vue',
        },
      },
    },
    sourcemap: false,
  },
});

