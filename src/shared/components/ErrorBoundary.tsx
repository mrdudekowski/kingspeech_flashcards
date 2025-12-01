/**
 * Error Boundary - перехватывает ошибки React и отображает информацию для дебага
 */

import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
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

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Логируем ошибку в консоль для дебага
    console.error('🚨 ErrorBoundary перехватил ошибку:', error);
    console.error('📋 Error Info:', errorInfo);
    console.error('📍 Component Stack:', errorInfo.componentStack);
    console.error('🔍 Error Stack:', error.stack);

    this.setState({
      error,
      errorInfo,
    });

    // В development режиме показываем детальную информацию
    if (process.env.NODE_ENV === 'development') {
      // Можно отправить на сервер для логирования
      // logErrorToService(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
          <div className="max-w-4xl w-full glass-strong rounded-2xl p-8 shadow-lg">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">💥</div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                Произошла ошибка
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Приложение столкнулось с неожиданной ошибкой
              </p>
            </div>

            {this.state.error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <h2 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                  Ошибка:
                </h2>
                <p className="text-sm text-red-700 dark:text-red-300 font-mono mb-2">
                  {this.state.error.name}: {this.state.error.message}
                </p>
                {this.state.error.stack && (
                  <details className="mt-2">
                    <summary className="text-sm text-red-600 dark:text-red-400 cursor-pointer hover:underline">
                      Показать стек вызовов
                    </summary>
                    <pre className="mt-2 text-xs text-red-600 dark:text-red-400 overflow-x-auto p-2 bg-red-100 dark:bg-red-900/30 rounded">
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {this.state.errorInfo && (
              <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <h2 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                  Информация об ошибке:
                </h2>
                <details className="mt-2">
                  <summary className="text-sm text-yellow-600 dark:text-yellow-400 cursor-pointer hover:underline">
                    Показать детали
                  </summary>
                  <pre className="mt-2 text-xs text-yellow-600 dark:text-yellow-400 overflow-x-auto p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                Перезагрузить страницу
              </button>
              <button
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
              >
                Попробовать снова
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                  💡 <strong>Режим разработки:</strong> Откройте консоль браузера (F12) для детальной информации об ошибке
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Проверьте вкладки Console, Network и Redux DevTools
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

