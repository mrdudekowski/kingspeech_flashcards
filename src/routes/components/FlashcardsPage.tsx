/**
 * FlashcardsPage - страница для изучения слов с помощью карточек
 */

import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/shared/hooks/redux';
import {
  loadVocabularyModule,
  setCurrentModule,
  setCurrentCollection,
  setCurrentCategory,
  selectVocabularyData,
  selectLoading,
  selectCurrentCollectionData,
} from '@/features/vocabulary/vocabularySlice';
import { resetFlashcards } from '@/features/flashcards/flashcardsSlice';
import FlashcardDeck from '@/features/flashcards/FlashcardDeck';
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

  // Загружаем модуль при монтировании
  useEffect(() => {
    if (moduleId && moduleId !== vocabularyData?.moduleId) {
      dispatch(loadVocabularyModule(moduleId as ModuleId));
    }
  }, [moduleId, dispatch, vocabularyData?.moduleId]);

  // Устанавливаем выбранные значения
  useEffect(() => {
    if (moduleId) {
      dispatch(setCurrentModule(moduleId as ModuleId));
    }
    if (collectionId) {
      dispatch(setCurrentCollection(collectionId));
    }
    if (category) {
      dispatch(setCurrentCategory(category as WordCategory));
    }
  }, [moduleId, collectionId, category, dispatch]);

  // Сбрасываем flashcards при размонтировании
  useEffect(() => {
    return () => {
      dispatch(resetFlashcards());
    };
  }, [dispatch]);

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
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
      </div>

      {/* Колода карточек */}
      <FlashcardDeck />
    </div>
  );
}

export default FlashcardsPage;

