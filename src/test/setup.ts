/**
 * Test Setup File
 * Выполняется перед запуском тестов
 */

import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Расширяем expect с матчерами от @testing-library/jest-dom
expect.extend(matchers);

// Очистка после каждого теста
afterEach(() => {
  cleanup();
});

// Mock для matchMedia (используется в некоторых компонентах)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {}, // deprecated
    removeListener: () => {}, // deprecated
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
