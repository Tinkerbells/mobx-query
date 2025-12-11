import hash from '@emotion/hash';

/**
 * Создает базовый ключ на основе хэша от configurator
 */
export const generateQuerySetBaseKey = (
  configurator: (...args: any[]) => any,
) => hash(configurator.toString());
