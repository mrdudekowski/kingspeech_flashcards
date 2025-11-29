/**
 * CollectionSelector - компонент для выбора подборки
 */

import { useNavigate, useParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/shared/hooks/redux';
import { selectVocabularyData, setCurrentCollection } from '@/features/vocabulary/vocabularySlice';

interface CollectionSelectorProps {
  currentCollection?: string | null;
}

function CollectionSelector({ currentCollection }: CollectionSelectorProps) {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const vocabularyData = useAppSelector(selectVocabularyData);

  const handleCollectionSelect = (collectionId: string) => {
    dispatch(setCurrentCollection(collectionId));
    if (moduleId) {
      navigate(`/module/${moduleId}/${collectionId}`);
    }
  };

  if (!vocabularyData) {
    return (
      <div className="text-sm text-gray-500">Модуль не загружен</div>
    );
  }

  return (
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
  );
}

export default CollectionSelector;

