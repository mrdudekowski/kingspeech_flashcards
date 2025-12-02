/**
 * FlashcardsPage - страница для изучения слов с помощью карточек
 */

import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/shared/hooks/redux';
import {
  loadVocabularyModule,
  setCurrentModule,
  setCurrentCollection,
  setCurrentCategory,
  setCurrentSubcategory,
  selectVocabularyData,
  selectLoading,
  selectCurrentCollectionData,
  selectCurrentCategory,
  selectCurrentSubcategory,
} from '@/features/vocabulary/vocabularySlice';
import FlashcardDeck from '@/features/flashcards/FlashcardDeck';
import type { ModuleId, WordCategory, WordSubcategory } from '@/app/constants';
import { WORD_CATEGORIES, WORD_SUBCATEGORIES } from '@/app/constants';

function FlashcardsPage() {
  const { moduleId, collectionId, category, subcategory } = useParams<{
    moduleId: string;
    collectionId?: string;
    category?: string;
    subcategory?: string;
  }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const vocabularyData = useAppSelector(selectVocabularyData);
  const loading = useAppSelector(selectLoading);
  const collectionData = useAppSelector(selectCurrentCollectionData);
  const currentCategory = useAppSelector(selectCurrentCategory);
  const currentSubcategory = useAppSelector(selectCurrentSubcategory);
  
  // Проверяем, находимся ли мы в режиме Irregular Verbs
  const isIrregularVerbsMode = collectionId === 'irregular-verbs';
  
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
        subcategory,
        currentModule: vocabularyData?.moduleId,
        currentCollection: collectionData?.id,
        currentCategory,
        currentSubcategory,
        hasVocabularyData: !!vocabularyData,
        hasCollectionData: !!collectionData,
        collectionCategories: collectionData?.categories ? Object.keys(collectionData.categories) : [],
      });
    }, [moduleId, collectionId, category, subcategory, vocabularyData, collectionData, currentCategory, currentSubcategory]);
  
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
  

  // Загружаем модуль при монтировании
  useEffect(() => {
    if (moduleId && moduleId !== vocabularyData?.moduleId) {
      dispatch(loadVocabularyModule(moduleId as ModuleId));
    }
  }, [moduleId, dispatch, vocabularyData?.moduleId]);

  // Устанавливаем выбранные значения
  // КРИТИЧНО: Проверяем, что значения действительно изменились, чтобы избежать циклов
  const prevParamsRef = useRef({ moduleId, collectionId, category, subcategory });
  const currentModule = useAppSelector((state) => state.vocabulary.currentModule);
  const currentCollection = useAppSelector((state) => state.vocabulary.currentCollection);
  
  useEffect(() => {
    const prevParams = prevParamsRef.current;
    const hasChanged = 
      prevParams.moduleId !== moduleId ||
      prevParams.collectionId !== collectionId ||
      prevParams.category !== category ||
      prevParams.subcategory !== subcategory;
    
    // Для Irregular Verbs всегда проверяем состояние, даже если параметры не изменились
    // (на случай, если состояние было сброшено или установлено неправильно)
    const shouldCheckIrregularVerbs = isIrregularVerbsMode && (
      currentCollection !== 'irregular-verbs' ||
      currentCategory !== WORD_CATEGORIES.VERBS ||
      currentSubcategory !== WORD_SUBCATEGORIES.IRREGULAR_VERBS
    );
    
    if (!hasChanged && !shouldCheckIrregularVerbs) {
      console.log('⏭️ [FlashcardsPage] Параметры не изменились, пропускаем обновление');
      return; // Параметры не изменились, пропускаем обновление
    }
    
    console.log('🔄 [FlashcardsPage] useEffect установки параметров вызван');
      console.log('📋 [FlashcardsPage] Параметры:', {
        moduleId,
        collectionId,
        category,
        subcategory,
        prev: prevParams,
        currentState: {
          currentModule,
          currentCollection,
          currentCategory,
          currentSubcategory,
        },
        isIrregularVerbsMode,
        shouldCheckIrregularVerbs,
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
      
      // Специальная обработка для режима Irregular Verbs
      if (isIrregularVerbsMode) {
        // Устанавливаем collectionId, категорию и подкатегорию для Irregular Verbs
        // Проверяем, нужно ли обновить состояние (даже если уже установлено, но параметры изменились)
        const needsUpdate = 
          currentCollection !== 'irregular-verbs' ||
          currentCategory !== WORD_CATEGORIES.VERBS ||
          currentSubcategory !== WORD_SUBCATEGORIES.IRREGULAR_VERBS;
        
        if (needsUpdate || shouldCheckIrregularVerbs) {
          console.log('⚡ [FlashcardsPage] Устанавливаю состояние для Irregular Verbs', {
            currentCollection,
            currentCategory,
            currentSubcategory,
            needsUpdate,
            shouldCheckIrregularVerbs,
          });
          dispatch(setCurrentCollection('irregular-verbs'));
          dispatch(setCurrentCategory(WORD_CATEGORIES.VERBS));
          dispatch(setCurrentSubcategory(WORD_SUBCATEGORIES.IRREGULAR_VERBS));
          console.log('✅ [FlashcardsPage] Состояние для Irregular Verbs установлено');
        } else {
          console.log('⏭️ [FlashcardsPage] Состояние для Irregular Verbs уже установлено правильно');
        }
      } else {
        // Обычная логика для обычных подборок
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

        // Устанавливаем подкатегорию, если она есть в URL
        if (subcategory && subcategory !== prevParams.subcategory) {
          console.log('⚡ [FlashcardsPage] Диспатчу setCurrentSubcategory:', subcategory);
          dispatch(setCurrentSubcategory(subcategory as WordSubcategory | string));
          console.log('✅ [FlashcardsPage] setCurrentSubcategory выполнен');
        } else if (!subcategory && currentSubcategory) {
          // Если в URL подкатегории нет, а в состоянии она установлена — сбрасываем
          console.log('⚡ [FlashcardsPage] Сбрасываю currentSubcategory (подкатегория не указана в URL)');
          dispatch(setCurrentSubcategory(null));
        }
      }

      prevParamsRef.current = { moduleId, collectionId, category, subcategory };
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
              {isIrregularVerbsMode ? (
                <>
                  {' > '}
                  <span className="font-medium">Irregular Verbs</span>
                </>
              ) : collectionData ? (
                <>
                  {' > '}
                  <span className="font-medium">{collectionData.name}</span>
                  {category && (
                    <>
                      {' > '}
                      <span className="font-medium capitalize">{category}</span>
                    </>
                  )}
                </>
              ) : null}
            </div>
          </div>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            ← Назад
          </button>
        </div>
      </div>

      {/* Колода карточек */}
      <FlashcardDeck />
    </div>
  );
}

export default FlashcardsPage;

