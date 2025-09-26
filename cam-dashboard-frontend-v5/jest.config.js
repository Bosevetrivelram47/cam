// frontend-v5/jest.config.js (or .mjs)

// You'll need to use `import` statements
// For example, if you had:
// const path = require('path');
// module.exports = { ... }

// It becomes:
import path from 'path'; // Example if you used path
// If you need __dirname or __filename, which are not available in ES Modules,
// you have to construct them:
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: path.resolve(__dirname, 'tsconfig.app.json'), // Use path.resolve
    }],
  },
  moduleNameMapper: {
    '^@/(.*)$': path.resolve(__dirname, 'src/$1'), // Use path.resolve
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  setupFilesAfterEnv: [path.resolve(__dirname, 'src/setupTests.ts')], // Use path.resolve
  testMatch: [
    `${__dirname}/src/**/*.test.(js|jsx|ts|tsx)`, // Use __dirname
    `${__dirname}/src/**/?(*.)+(spec|test).(js|jsx|ts|tsx)`
  ],
  globals: {
    // ts-jest specific config needs to be moved inside the transform property for ts-jest v29+
    // If you are using an older version of ts-jest, this might be okay,
    // but it's often better to put it directly in the transform array.
    // For ts-jest v29 and above, you configure it like this:
    // transform: {
    //   '^.+\\.tsx?$': ['ts-jest', { tsconfig: './tsconfig.json' }],
    // },
  },
};

// Use `export default` for ES Modules
export default config;