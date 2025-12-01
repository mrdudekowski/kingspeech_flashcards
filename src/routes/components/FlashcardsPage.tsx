/**
 * FlashcardsPage - страница для изучения слов с помощью карточек
 */

import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/shared/hooks/redux';
import {
  loadVocabularyModule,
  setCurrentModule,
  setCurrentCollection,
  setCurrentCategory,
  selectVocabularyData,
  selectLoading,
  selectCurrentCollectionData,
  selectCurrentCategory,
} from '@/features/vocabulary/vocabularySlice';
import FlashcardDeck from '@/features/flashcards/FlashcardDeck';
import { selectCurrentCategoryProgress, selectCurrentCategoryStats } from '@/features/progress/progressSlice';
import type { ModuleId, WordCategory } from '@/app/constants';

function FlashcardsPage() {
  const { moduleId, collectionId, category } = useParams<{
    moduleId: string;
    collectionId?: string;
    category?: string;
  }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const vocabularyData = useAppSelector(selectVocabularyData);
  const loading = useAppSelector(selectLoading);
  const collectionData = useAppSelector(selectCurrentCollectionData);
  const currentCategory = useAppSelector(selectCurrentCategory);
  
  // Диагностика: проверяем currentCategory в Redux
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      return;
    }
    console.log('🔍 [FlashcardsPage] currentCategory в Redux:', currentCategory);
    console.log('🔍 [FlashcardsPage] category из URL:', category);
    console.log('🔍 [FlashcardsPage] Совпадают?', currentCategory === category);
  }, [currentCategory, category]);
  
  // Диагностика: проверяем состояние vocabulary
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      return;
    }
    console.log('🔍 [FlashcardsPage] Диагностика состояния vocabulary:', {
      moduleId,
      collectionId,
      category,
      currentModule: vocabularyData?.moduleId,
      currentCollection: collectionData?.id,
      currentCategory,
      hasVocabularyData: !!vocabularyData,
      hasCollectionData: !!collectionData,
      collectionCategories: collectionData ? Object.keys(collectionData.categories) : [],
    });
  }, [moduleId, collectionId, category, vocabularyData, collectionData, currentCategory]);
  
  // Логируем состояние для дебага (всегда вызываем useEffect, но логируем только в dev)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔵 [FlashcardsPage] Состояние:', {
        moduleId,
        collectionId,
        category,
        currentCategory,
        hasVocabularyData: !!vocabularyData,
        loading,
        hasCollectionData: !!collectionData,
      });
    }
  }, [moduleId, collectionId, category, currentCategory, vocabularyData, loading, collectionData]);
  
  // Селекторы прогресса - используем мемоизацию через useMemo для избежания лишних ре-рендеров
  const categoryProgress = useAppSelector((state) => {
    if (!currentCategory) {
      return 0;
    }
    try {
      return selectCurrentCategoryProgress(state);
    } catch (error) {
      console.error('❌ [FlashcardsPage] Ошибка в selectCurrentCategoryProgress:', error);
      return 0;
    }
  });
  
  // Мемоизируем пустой объект для categoryStats, чтобы избежать предупреждений Redux
  const emptyStats = useMemo(() => ({
    total: 0,
    studied: 0,
    difficult: 0,
    studying: 0,
    progress: 0,
  }), []);
  
  const categoryStats = useAppSelector((state) => {
    if (!currentCategory) {
      return emptyStats;
    }
    try {
      return selectCurrentCategoryStats(state);
    } catch (error) {
      console.error('❌ [FlashcardsPage] Ошибка в selectCurrentCategoryStats:', error);
      return emptyStats;
    }
  });

  // Загружаем модуль при монтировании
  useEffect(() => {
    if (moduleId && moduleId !== vocabularyData?.moduleId) {
      dispatch(loadVocabularyModule(moduleId as ModuleId));
    }
  }, [moduleId, dispatch, vocabularyData?.moduleId]);

  // Устанавливаем выбранные значения
  // КРИТИЧНО: Проверяем, что значения действительно изменились, чтобы избежать циклов
  const prevParamsRef = useRef({ moduleId, collectionId, category });
  const currentModule = useAppSelector((state) => state.vocabulary.currentModule);
  const currentCollection = useAppSelector((state) => state.vocabulary.currentCollection);
  
  useEffect(() => {
    const prevParams = prevParamsRef.current;
    const hasChanged = 
      prevParams.moduleId !== moduleId ||
      prevParams.collectionId !== collectionId ||
      prevParams.category !== category;
    
    if (!hasChanged) {
      console.log('⏭️ [FlashcardsPage] Параметры не изменились, пропускаем обновление');
      return; // Параметры не изменились, пропускаем обновление
    }
    
    console.log('🔄 [FlashcardsPage] useEffect установки параметров вызван');
    console.log('📋 [FlashcardsPage] Параметры:', {
      moduleId,
      collectionId,
      category,
      prev: prevParams,
      currentState: {
        currentModule,
        currentCollection,
        currentCategory,
      },
    });
    
    try {
      // Устанавливаем модуль только если он изменился И отличается от текущего в state
      if (moduleId && moduleId !== prevParams.moduleId && moduleId !== currentModule) {
        console.log('⚡ [FlashcardsPage] Диспатчу setCurrentModule:', moduleId);
        dispatch(setCurrentModule(moduleId as ModuleId));
        console.log('✅ [FlashcardsPage] setCurrentModule выполнен');
      } else {
        console.log('⏭️ [FlashcardsPage] Модуль не изменился или уже установлен:', {
          moduleId,
          prevModuleId: prevParams.moduleId,
          currentModule,
        });
      }
      
      // Устанавливаем подборку только если она изменилась И отличается от текущей в state
      if (collectionId && collectionId !== prevParams.collectionId && collectionId !== currentCollection) {
        console.log('⚡ [FlashcardsPage] Диспатчу setCurrentCollection:', collectionId);
        dispatch(setCurrentCollection(collectionId));
        console.log('✅ [FlashcardsPage] setCurrentCollection выполнен');
      } else {
        console.log('⏭️ [FlashcardsPage] Подборка не изменилась или уже установлена:', {
          collectionId,
          prevCollectionId: prevParams.collectionId,
          currentCollection,
        });
      }
      
      // Устанавливаем категорию если она изменилась ИЛИ если она не установлена в state
      // Это важно для первого рендера, когда category из URL есть, но currentCategory в Redux еще null
      if (category && (category !== prevParams.category || category !== currentCategory)) {
        console.log('⚡ [FlashcardsPage] Диспатчу setCurrentCategory:', category);
        dispatch(setCurrentCategory(category as WordCategory));
        console.log('✅ [FlashcardsPage] setCurrentCategory выполнен');
      } else {
        console.log('⏭️ [FlashcardsPage] Категория не изменилась или уже установлена:', {
          category,
          prevCategory: prevParams.category,
          currentCategory,
        });
      }
      
      prevParamsRef.current = { moduleId, collectionId, category };
      console.log('🏁 [FlashcardsPage] useEffect установки параметров завершен');
    } catch (error) {
      console.error('❌ [FlashcardsPage] Ошибка при установке параметров:', error);
      console.error('❌ [FlashcardsPage] Стек ошибки:', (error as Error)?.stack);
      throw error;
    }
  }, [moduleId, collectionId, category, dispatch, currentModule, currentCollection, currentCategory]);

  const handleBack = () => {
    if (collectionId && category) {
      navigate(`/module/${moduleId}/${collectionId}`);
    } else if (collectionId) {
      navigate(`/module/${moduleId}`);
    } else {
      navigate(`/module/${moduleId}`);
    }
  };

  if (loading === 'loading') {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Загрузка модуля...</p>
        </div>
      </div>
    );
  }

  if (!vocabularyData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-2">Модуль не загружен</p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Назад
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Заголовок и навигация */}
      <div className="mb-6 glass-strong rounded-xl p-4 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              Изучение карточек
            </h1>
            <div className="text-sm text-gray-600">
              <span className="font-medium">{vocabularyData.name}</span>
              {collectionData && (
                <>
                  {' > '}
                  <span className="font-medium">{collectionData.name}</span>
                </>
              )}
              {category && (
                <>
                  {' > '}
                  <span className="font-medium capitalize">{category}</span>
                </>
              )}
            </div>
          </div>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            ← Назад
          </button>
        </div>

        {/* Прогресс категории */}
        {category && (
          <div className="border-t border-gray-200 dark:border-slate-600 pt-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Прогресс категории
              </span>
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {categoryProgress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden mb-4">
              <div
                className="bg-blue-500 dark:bg-blue-600 h-full transition-all duration-300 rounded-full"
                style={{ width: `${categoryProgress}%` }}
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="glass rounded-lg p-3">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Всего слов</div>
                <div className="text-lg font-bold text-gray-800 dark:text-gray-100">
                  {categoryStats.total}
                </div>
              </div>
              <div className="glass rounded-lg p-3">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Изучено</div>
                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                  {categoryStats.studied}
                </div>
              </div>
              <div className="glass rounded-lg p-3">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Изучается</div>
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {categoryStats.studying}
                </div>
              </div>
              <div className="glass rounded-lg p-3">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Сложные</div>
                <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  {categoryStats.difficult}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Колода карточек */}
      <FlashcardDeck />
    </div>
  );
}

export default FlashcardsPage;

