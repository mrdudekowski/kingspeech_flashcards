/**
 * Централизованная система логирования
 * Все логи должны идти через эту систему
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

interface LogConfig {
  enabled: boolean;
  level: LogLevel;
  modules: Set<string> | null; // null = все модули, Set = только указанные
}

class Logger {
  private config: LogConfig = {
    enabled: process.env.NODE_ENV === 'development',
    level: LogLevel.DEBUG,
    modules: null, // Логировать все модули по умолчанию
  };

  /**
   * Настроить конфигурацию логгера
   */
  configure(config: Partial<LogConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Включить логирование только для определенных модулей
   */
  enableModules(modules: string[]): void {
    this.config.modules = new Set(modules);
  }

  /**
   * Включить логирование для всех модулей
   */
  enableAllModules(): void {
    this.config.modules = null;
  }

  /**
   * Проверить, должен ли логгер выводить сообщение
   */
  private shouldLog(level: LogLevel, module: string): boolean {
    if (!this.config.enabled) return false;
    if (level < this.config.level) return false;
    if (this.config.modules && !this.config.modules.has(module)) return false;
    return true;
  }

  /**
   * Форматировать префикс для сообщения
   */
  private formatPrefix(level: string, module: string): string {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    return `[${timestamp}][${level}][${module}]`;
  }

  /**
   * DEBUG - детальная отладочная информация
   */
  debug(module: string, message: string, data?: unknown): void {
    if (!this.shouldLog(LogLevel.DEBUG, module)) return;
    const prefix = this.formatPrefix('DEBUG', module);
    if (data !== undefined) {
      console.log(`%c${prefix}`, 'color: #9E9E9E', message, data);
    } else {
      console.log(`%c${prefix}`, 'color: #9E9E9E', message);
    }
  }

  /**
   * INFO - информационные сообщения
   */
  info(module: string, message: string, data?: unknown): void {
    if (!this.shouldLog(LogLevel.INFO, module)) return;
    const prefix = this.formatPrefix('INFO', module);
    if (data !== undefined) {
      console.info(`%c${prefix}`, 'color: #2196F3; font-weight: bold', message, data);
    } else {
      console.info(`%c${prefix}`, 'color: #2196F3; font-weight: bold', message);
    }
  }

  /**
   * WARN - предупреждения
   */
  warn(module: string, message: string, data?: unknown): void {
    if (!this.shouldLog(LogLevel.WARN, module)) return;
    const prefix = this.formatPrefix('WARN', module);
    if (data !== undefined) {
      console.warn(`%c${prefix}`, 'color: #FF9800; font-weight: bold', message, data);
    } else {
      console.warn(`%c${prefix}`, 'color: #FF9800; font-weight: bold', message);
    }
  }

  /**
   * ERROR - ошибки
   */
  error(module: string, message: string, error?: unknown): void {
    if (!this.shouldLog(LogLevel.ERROR, module)) return;
    const prefix = this.formatPrefix('ERROR', module);
    
    console.error(`%c${prefix}`, 'color: #F44336; font-weight: bold', message);
    
    if (error !== undefined) {
      if (error instanceof Error) {
        console.error('Error:', error.message);
        if (error.stack) {
          console.error('Stack:', error.stack);
        }
      } else {
        console.error('Error data:', error);
      }
    }

    // TODO: В будущем можно добавить отправку ошибок в сервис мониторинга
    // this.sendToErrorTracking(module, message, error);
  }

  /**
   * Группа логов (для структурирования связанных логов)
   */
  group(module: string, groupName: string, collapsed = false): void {
    if (!this.shouldLog(LogLevel.DEBUG, module)) return;
    const prefix = this.formatPrefix('GROUP', module);
    if (collapsed) {
      console.groupCollapsed(`${prefix} ${groupName}`);
    } else {
      console.group(`${prefix} ${groupName}`);
    }
  }

  /**
   * Завершить группу логов
   */
  groupEnd(): void {
    console.groupEnd();
  }

  /**
   * Замерить время выполнения
   */
  time(label: string): void {
    if (!this.config.enabled) return;
    console.time(label);
  }

  /**
   * Завершить замер времени
   */
  timeEnd(label: string): void {
    if (!this.config.enabled) return;
    console.timeEnd(label);
  }

  /**
   * Таблица (для красивого вывода данных)
   */
  table(module: string, data: unknown): void {
    if (!this.shouldLog(LogLevel.DEBUG, module)) return;
    const prefix = this.formatPrefix('TABLE', module);
    console.log(`%c${prefix}`, 'color: #9E9E9E');
    console.table(data);
  }
}

// Экспортируем singleton инстанс
export const logger = new Logger();

// Делаем logger доступным глобально для отладки в консоли браузера
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).logger = logger;
}

// Хелпер функции для быстрого доступа
export const log = {
  debug: (module: string, message: string, data?: unknown) => logger.debug(module, message, data),
  info: (module: string, message: string, data?: unknown) => logger.info(module, message, data),
  warn: (module: string, message: string, data?: unknown) => logger.warn(module, message, data),
  error: (module: string, message: string, error?: unknown) => logger.error(module, message, error),
  group: (module: string, groupName: string, collapsed?: boolean) => logger.group(module, groupName, collapsed),
  groupEnd: () => logger.groupEnd(),
  time: (label: string) => logger.time(label),
  timeEnd: (label: string) => logger.timeEnd(label),
  table: (module: string, data: unknown) => logger.table(module, data),
};

export default logger;
