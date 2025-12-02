/**
 * CollectionPage - страница подборки
 * Отображает категории подборки и позволяет выбрать категорию для изучения
 */

import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '@/shared/hooks/redux';
import {
  selectCurrentCollectionData,
  selectCurrentCollectionWords,
  setCurrentCategory,
  setCurrentModule,
  setCurrentCollection,
  loadVocabularyModule,
} from '@/features/vocabulary/vocabularySlice';
import type { ModuleId } from '@/app/constants';
import { selectCategoryProgressByCollection } from '@/features/progress/progressSlice';
import { WORD_CATEGORIES } from '@/app/constants';
import type { WordCategory } from '@/app/constants';
import type { RootState } from '@/app/store';

let categoryCallCount = 0;

/**
 * Компонент кнопки категории с прогрессом
 */
function CategoryButton({
  category,
  label,
  count,
  onSelect,
}: {
  category: WordCategory;
  label: string;
  count: number;
  onSelect: (category: WordCategory) => void;
}) {
  // Защита от undefined и проверка валидности category
  // Используем useMemo для мемоизации функции селектора
  const progressSelector = useMemo(
    () => (state: RootState) => {
      if (!category || typeof category !== 'string') return 0;
      try {
        return selectCategoryProgressByCollection(state, category);
      } catch (error) {
        console.error('Ошибка при вычислении прогресса категории:', error);
        return 0;
      }
    },
    [category]
  );
  
  const categoryProgress = useAppSelector(progressSelector);

  const handleClick = () => {
    console.log('🖱️ [CategoryButton] Кнопка нажата, category:', category);
    console.log('🖱️ [CategoryButton] Вызываю onSelect...');
    onSelect(category);
    console.log('🖱️ [CategoryButton] onSelect вызван');
  };

  return (
    <button
      onClick={handleClick}
      className="glass-card p-6 rounded-xl hover:scale-105 transition-transform text-left group relative"
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
            {label}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 capitalize mt-1">{category}</p>
        </div>
        <div className="flex flex-col items-end gap-2 ml-4">
          <span className="text-sm px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full">
            {count}
          </span>
          {categoryProgress > 0 && (
            <span className="text-xs font-semibold text-green-600 dark:text-green-400">
              {categoryProgress}%
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

function CollectionPage() {
  const { moduleId, collectionId } = useParams<{ moduleId: string; collectionId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const collectionData = useAppSelector(selectCurrentCollectionData);
  const collectionWords = useAppSelector(selectCurrentCollectionWords);

  // Устанавливаем текущий модуль и подборку
  // КРИТИЧНО: Проверяем, что значения действительно изменились, чтобы избежать циклов
  const prevParamsRef = useRef({ moduleId, collectionId });
  const currentModule = useAppSelector((state) => state.vocabulary.currentModule);
  const currentCollection = useAppSelector((state) => state.vocabulary.currentCollection);
  
  useEffect(() => {
    const prevParams = prevParamsRef.current;
    const hasChanged = 
      prevParams.moduleId !== moduleId ||
      prevParams.collectionId !== collectionId;
    
    if (!hasChanged) {
      console.log('⏭️ [CollectionPage] Параметры не изменились, пропускаем обновление');
      return;
    }
    
    console.log('🔄 [CollectionPage] useEffect установки модуля/подборки вызван');
    console.log('📋 [CollectionPage] Параметры:', {
      moduleId,
      collectionId,
      prev: prevParams,
      currentState: {
        currentModule,
        currentCollection,
      },
    });
    
    try {
      if (moduleId && moduleId !== prevParams.moduleId && moduleId !== currentModule) {
        console.log('⚡ [CollectionPage] Диспатчу setCurrentModule:', moduleId);
        dispatch(setCurrentModule(moduleId as ModuleId));
        console.log('✅ [CollectionPage] setCurrentModule выполнен');
        
        console.log('⚡ [CollectionPage] Диспатчу loadVocabularyModule:', moduleId);
        dispatch(loadVocabularyModule(moduleId as ModuleId));
        console.log('✅ [CollectionPage] loadVocabularyModule выполнен');
      } else {
        console.log('⏭️ [CollectionPage] Модуль не изменился или уже установлен');
      }
      
      if (collectionId && collectionId !== prevParams.collectionId && collectionId !== currentCollection) {
        console.log('⚡ [CollectionPage] Диспатчу setCurrentCollection:', collectionId);
        dispatch(setCurrentCollection(collectionId));
        console.log('✅ [CollectionPage] setCurrentCollection выполнен');
      } else {
        console.log('⏭️ [CollectionPage] Подборка не изменилась или уже установлена');
      }
      
      prevParamsRef.current = { moduleId, collectionId };
      console.log('🏁 [CollectionPage] useEffect установки модуля/подборки завершен');
    } catch (error) {
      console.error('❌ [CollectionPage] Ошибка при установке модуля/подборки:', error);
      console.error('❌ [CollectionPage] Стек ошибки:', (error as Error)?.stack);
    }
  }, [moduleId, collectionId, dispatch, currentModule, currentCollection]);

  const handleCategorySelect = (category: WordCategory) => {
    // Детальное логирование с подсчетом вызовов
    console.log('🚀 handleCategorySelect called with category:', category);
    
    // Добавляем счетчик вызовов
    categoryCallCount += 1;
    console.log('🔥 Call count:', categoryCallCount);
    
    // Логируем все параметры
    console.log('📋 [CollectionPage] Параметры функции:', {
      category,
      moduleId,
      collectionId,
      currentCollection: collectionData?.id,
      timestamp: new Date().toISOString(),
    });
    
    try {
      console.log('⚡ [CollectionPage] Выполняю dispatch(setCurrentCategory)...');
      dispatch(setCurrentCategory(category));
      console.log('✅ [CollectionPage] dispatch(setCurrentCategory) выполнен');
      
      // Переход на страницу flashcards
      if (moduleId && collectionId) {
        const targetPath = `/flashcards/${moduleId}/${collectionId}/${category}`;
        console.log('🔵 [CollectionPage] Навигация на:', targetPath);
        console.log('⚡ [CollectionPage] Выполняю navigate()...');
        navigate(targetPath);
        console.log('✅ [CollectionPage] navigate() выполнен');
      } else {
        console.warn('⚠️ [CollectionPage] Недостаточно данных для навигации:', {
          moduleId,
          collectionId,
        });
      }
    } catch (error) {
      console.error('❌ [CollectionPage] Ошибка при выборе категории:', error);
      console.error('❌ [CollectionPage] Стек ошибки:', (error as Error)?.stack);
      throw error; // Пробрасываем ошибку для ErrorBoundary
    }
    
    console.log('🏁 [CollectionPage] handleCategorySelect завершена');
  };

  if (!collectionData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">Подборка не найдена</p>
      </div>
    );
  }

  // Подсчет слов по категориям
  const categoryCounts: Record<WordCategory, number> = {
    phrases: 0,
    verbs: 0,
    nouns: 0,
    adjectives: 0,
  };

  collectionWords.forEach((word) => {
    categoryCounts[word.category]++;
  });

  const categoryLabels: Record<WordCategory, string> = {
    phrases: 'Фразы',
    verbs: 'Глаголы',
    nouns: 'Существительные',
    adjectives: 'Прилагательные',
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="glass-strong rounded-2xl p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          {collectionData.name}
        </h1>
        {collectionData.description && (
          <p className="text-gray-600 dark:text-gray-400 mb-6">{collectionData.description}</p>
        )}

        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">📊 Статистика:</p>
          <p className="text-xs text-blue-700 dark:text-blue-300">
            Всего слов в подборке: <strong>{collectionWords.length}</strong>
          </p>
        </div>

        <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">
          Выберите категорию для изучения:
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(Object.keys(WORD_CATEGORIES) as Array<keyof typeof WORD_CATEGORIES>).map((key) => {
            const category = WORD_CATEGORIES[key] as WordCategory;
            const count = categoryCounts[category];

            if (count === 0) return null;

            return (
              <CategoryButton
                key={category}
                category={category}
                label={categoryLabels[category]}
                count={count}
                onSelect={handleCategorySelect}
              />
            );
          })}
        </div>

        {/* Показ слов (для тестирования) */}
        {collectionWords.length > 0 && (
          <div className="mt-8 p-4 bg-white dark:bg-slate-800 rounded-lg">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Слова в подборке ({collectionWords.length}):
            </p>
            <div className="max-h-64 overflow-y-auto scrollbar-hide space-y-2">
              {collectionWords.slice(0, 20).map((word) => (
                <div
                  key={word.id}
                  className="p-2 bg-gray-50 dark:bg-slate-700 rounded border border-gray-200 dark:border-slate-600"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-100">{word.english}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{word.translation}</p>
                    </div>
                    <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded">
                      {word.category}
                    </span>
                  </div>
                </div>
              ))}
              {collectionWords.length > 20 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                  ... и еще {collectionWords.length - 20} слов
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CollectionPage;

