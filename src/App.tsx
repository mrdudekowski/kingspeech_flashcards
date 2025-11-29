import { useAppDispatch, useAppSelector } from '@/shared/hooks/redux';
import {
  setCurrentModule,
  setCurrentCollection,
  loadVocabularyModule,
  selectCurrentModule,
  selectCurrentCollection,
  selectLoading,
  selectVocabularyData,
  selectError,
  selectCurrentCollectionData,
  selectAllWordsInModule,
  selectCurrentCollectionWords,
} from '@/features/vocabulary/vocabularySlice';
import { AVAILABLE_MODULES } from '@/app/constants';

function App() {
  const dispatch = useAppDispatch();
  const currentModule = useAppSelector(selectCurrentModule);
  const currentCollection = useAppSelector(selectCurrentCollection);
  const loading = useAppSelector(selectLoading);
  const vocabularyData = useAppSelector(selectVocabularyData);
  const error = useAppSelector(selectError);
  const collectionData = useAppSelector(selectCurrentCollectionData);
  const allWords = useAppSelector(selectAllWordsInModule);
  const collectionWords = useAppSelector(selectCurrentCollectionWords);

  const handleModuleSelect = (moduleId: typeof AVAILABLE_MODULES[number]) => {
    dispatch(setCurrentModule(moduleId));
  };

  const handleLoadModule = async (moduleId: typeof AVAILABLE_MODULES[number]) => {
    try {
      await dispatch(loadVocabularyModule(moduleId)).unwrap();
    } catch (err) {
      console.error('Ошибка загрузки модуля:', err);
    }
  };

  const handleCollectionSelect = (collectionId: string) => {
    dispatch(setCurrentCollection(collectionId));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          English Learning
        </h1>

        {/* Redux Store Test */}
        <div className="max-w-2xl mx-auto glass-strong rounded-2xl p-6 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Redux Store - Тестирование ✅
          </h2>

          {/* Статус */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-2">Состояние загрузки:</p>
            <div className="flex items-center gap-3">
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  loading === 'idle'
                    ? 'bg-gray-200 text-gray-700'
                    : loading === 'loading'
                      ? 'bg-blue-200 text-blue-700'
                      : loading === 'succeeded'
                        ? 'bg-green-200 text-green-700'
                        : 'bg-red-200 text-red-700'
                }`}
              >
                {loading}
              </span>
              {loading === 'loading' && (
                <span className="text-sm text-blue-600">⏳ Загрузка...</span>
              )}
            </div>
            {error && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700 font-medium">Ошибка:</p>
                <p className="text-xs text-red-600 mt-1">{error}</p>
              </div>
            )}
          </div>

          {/* Загрузка модуля */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-2">Загрузить модуль:</p>
            <div className="flex gap-2 flex-wrap">
              {AVAILABLE_MODULES.map((module) => (
                <button
                  key={module}
                  onClick={() => handleLoadModule(module)}
                  disabled={loading === 'loading'}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    loading === 'loading'
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : vocabularyData?.moduleId === module
                        ? 'bg-purple-500 text-white'
                        : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                  }`}
                >
                  {vocabularyData?.moduleId === module ? '✓ ' : ''}Загрузить {module}
                </button>
              ))}
            </div>
          </div>

          {/* Выбор модуля */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-2">Выбранный модуль:</p>
            <div className="flex gap-2 flex-wrap">
              {AVAILABLE_MODULES.map((module) => (
                <button
                  key={module}
                  onClick={() => handleModuleSelect(module)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentModule === module
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-blue-100'
                  }`}
                >
                  {module}
                </button>
              ))}
            </div>
          </div>

          {/* Загруженные подборки */}
          {vocabularyData && (
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">
                Подборки модуля {vocabularyData.moduleId} ({vocabularyData.name}):
              </p>
              <div className="flex gap-2 flex-wrap">
                {vocabularyData.collections.map((collection) => (
                  <button
                    key={collection.id}
                    onClick={() => handleCollectionSelect(collection.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      currentCollection === collection.id
                        ? 'bg-green-500 text-white'
                        : 'bg-white text-gray-700 hover:bg-green-100'
                    }`}
                  >
                    {collection.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Статистика загруженного модуля */}
          {vocabularyData && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-900 mb-2">📊 Статистика модуля:</p>
              <div className="text-xs text-blue-700 space-y-1">
                <p>• Подборок: {vocabularyData.collections.length}</p>
                <p>• Всего слов: {allWords.length}</p>
                {currentCollection && (
                  <p>• Слов в выбранной подборке "{collectionData?.name || currentCollection}": {collectionWords.length}</p>
                )}
              </div>
            </div>
          )}

          {/* Слова выбранной подборки */}
          {currentCollection && collectionWords.length > 0 && (
            <div className="mb-6 p-4 bg-white rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-3">
                Слова в подборке "{collectionData?.name || currentCollection}" ({collectionWords.length}):
              </p>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {collectionWords.slice(0, 20).map((word) => (
                  <div
                    key={word.id}
                    className="p-2 bg-gray-50 rounded border border-gray-200"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-800">{word.english}</p>
                        <p className="text-sm text-gray-600">{word.translation}</p>
                        {word.subcategory && (
                          <span className="text-xs text-gray-500 mt-1 inline-block">
                            {word.subcategory}
                          </span>
                        )}
                      </div>
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                        {word.category}
                      </span>
                    </div>
                  </div>
                ))}
                {collectionWords.length > 20 && (
                  <p className="text-xs text-gray-500 text-center mt-2">
                    ... и еще {collectionWords.length - 20} слов
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Текущее состояние */}
          <div className="mt-6 p-4 bg-white rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">Текущее состояние Redux:</p>
            <pre className="text-xs text-gray-600 overflow-x-auto max-h-64 overflow-y-auto">
              {JSON.stringify(
                {
                  currentModule,
                  currentCollection,
                  loading,
                  error,
                  vocabularyData: vocabularyData
                    ? {
                        moduleId: vocabularyData.moduleId,
                        name: vocabularyData.name,
                        collectionsCount: vocabularyData.collections.length,
                        collections: vocabularyData.collections.map((c) => ({
                          id: c.id,
                          name: c.name,
                          categoriesCount: Object.keys(c.categories).length,
                        })),
                      }
                    : null,
                },
                null,
                2
              )}
            </pre>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              🎉 Redux Store настроен и работает!
              <br />
              Откройте Redux DevTools в браузере для просмотра состояния
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

