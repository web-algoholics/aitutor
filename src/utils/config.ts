/**
 * Утилита для получения конфигов из bro.js
 * Конфиги инжектятся через webpack.DefinePlugin
 */

// Конфиг инжектится через webpack.DefinePlugin
declare const __BRO_CONFIG__: { [key: string]: string } | undefined;

/**
 * Получить значение конфига по ключу
 * @param key - ключ конфига (например, 'aitutor.api')
 * @param defaultValue - значение по умолчанию, если конфиг не найден
 * @returns значение конфига или значение по умолчанию
 */
export function getConfig(key: string, defaultValue?: string): string | undefined {
  // Пытаемся получить конфиг из __BRO_CONFIG__ (инжектится через webpack.DefinePlugin)
  if (typeof __BRO_CONFIG__ !== 'undefined' && __BRO_CONFIG__[key]) {
    return __BRO_CONFIG__[key];
  }
  
  // Fallback: используем значение по умолчанию
  return defaultValue;
}

/**
 * Получить API URL из конфига
 * @returns API URL или значение по умолчанию
 */
export function getApiUrl(): string {
  return getConfig('aitutor.api', 'http://localhost:8000') || 'http://localhost:8000';
}

