/**
 * ModuleSelector - компонент для выбора модуля
 */

import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/shared/hooks/redux';
import { AVAILABLE_MODULES } from '@/app/constants';
import { setCurrentModule } from '@/features/vocabulary/vocabularySlice';

interface ModuleSelectorProps {
  currentModule?: string | null;
}

function ModuleSelector({ currentModule }: ModuleSelectorProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleModuleSelect = (moduleId: typeof AVAILABLE_MODULES[number]) => {
    dispatch(setCurrentModule(moduleId));
    navigate(`/module/${moduleId}`);
  };

  return (
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
  );
}

export default ModuleSelector;

