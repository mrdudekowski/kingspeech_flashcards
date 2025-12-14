/**
 * Error Boundary
 * Ловит ошибки в дереве компонентов и показывает fallback UI
 */

import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Обновляем состояние, чтобы показать fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Логируем ошибку
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Сохраняем errorInfo в state
    this.setState({
      errorInfo,
    });

    // Вызываем кастомный обработчик, если он передан
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Используем кастомный fallback, если передан
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Иначе показываем дефолтный UI
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

// Дефолтный fallback компонент
interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  onReset: () => void;
}

function ErrorFallback({ error, errorInfo, onReset }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 px-4">
      <div className="max-w-2xl w-full glass-strong rounded-2xl p-8 shadow-2xl">
        {/* Иконка */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
            <svg
              className="w-10 h-10 text-red-600 dark:text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Упс! Что-то пошло не так
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Произошла непредвиденная ошибка. Не волнуйтесь, ваш прогресс сохранен.
          </p>
        </div>

        {/* Информация об ошибке (только в dev режиме) */}
        {process.env.NODE_ENV === 'development' && error && (
          <div className="mb-6">
            <details className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
              <summary className="cursor-pointer font-semibold text-red-900 dark:text-red-200 mb-2">
                Детали ошибки (только в dev режиме)
              </summary>
              <div className="mt-4 space-y-2">
                <div>
                  <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">
                    Сообщение:
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-400 font-mono bg-red-100 dark:bg-red-900/40 p-2 rounded">
                    {error.message}
                  </p>
                </div>
                {error.stack && (
                  <div>
                    <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">
                      Stack trace:
                    </p>
                    <pre className="text-xs text-red-700 dark:text-red-400 font-mono bg-red-100 dark:bg-red-900/40 p-2 rounded overflow-x-auto whitespace-pre-wrap">
                      {error.stack}
                    </pre>
                  </div>
                )}
                {errorInfo && errorInfo.componentStack && (
                  <div>
                    <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">
                      Component stack:
                    </p>
                    <pre className="text-xs text-red-700 dark:text-red-400 font-mono bg-red-100 dark:bg-red-900/40 p-2 rounded overflow-x-auto whitespace-pre-wrap">
                      {errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          </div>
        )}

        {/* Действия */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onReset}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors shadow-lg hover:shadow-xl"
          >
            Попробовать снова
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-800 dark:text-gray-200 font-semibold rounded-lg transition-colors"
          >
            На главную
          </button>
        </div>

        {/* Дополнительная информация */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Если проблема повторяется, попробуйте обновить страницу или очистить кэш браузера.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ErrorBoundary;
