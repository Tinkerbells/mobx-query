import hash from '@emotion/hash';

/**
 * Создает базовый ключ на основе хэша от configurator
 */
export const generateQuerySetBaseKey = (
  configurator: (...args: never[]) => unknown,
) => hash(configurator.toString());
