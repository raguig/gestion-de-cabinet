import { mkdir, cp } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

async function build() {
  try {
    // Create dist directory if it doesn't exist
    if (!existsSync('dist')) {
      await mkdir('dist', { recursive: true });
    }

    // Copy src directory to dist
    await cp('src', path.join('dist', 'src'), { recursive: true });

    // Copy api directory to dist
    await cp('api', path.join('dist', 'api'), { recursive: true });

    // Copy package.json to dist
    await cp('package.json', path.join('dist', 'package.json'));

    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build();