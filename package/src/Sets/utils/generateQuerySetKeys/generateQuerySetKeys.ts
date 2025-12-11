import { isPlainObject } from '@astral/utils';
import stringify from 'fast-json-stable-stringify';

import { type CacheKey } from '../../../types';

/**
 * Создает ключи на основе каждого параметра
 * @param additionalKeys - Создает для каждого параметра отдельный ключ, чтобы по нему можно было инвалидировать query
 * @example
 * // Создаст ключи ['22f4', ['22f4', 'organizationID', '1'], ['22f4', 'employeeID', '2']]
 * generateQuerySetKeys('22f4', params)
 */
export const generateQuerySetKeys = (baseKey: CacheKey, params: CacheKey[]) => {
  const resultKeys: CacheKey[] = [];

  params.forEach((param) => {
    if (isPlainObject(param)) {
      // Нормализуем объект через стабильную сериализацию для консистентных ключей
      const normalizedParam = JSON.parse(stringify(param));

      resultKeys.push(
        ...Object.entries(normalizedParam).map(([key, value]) => [
          baseKey,
          key,
          value as CacheKey,
        ]),
      );
    } else {
      resultKeys.push(param);
    }
  });

  return [baseKey, ...resultKeys];
};
