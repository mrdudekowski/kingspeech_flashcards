/**
 * HomePage - главная страница приложения
 * Отображает список доступных модулей для выбора
 */

import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/shared/hooks/redux';
import { AVAILABLE_MODULES } from '@/app/constants';
import { setCurrentModule } from '@/features/vocabulary/vocabularySlice';

function HomePage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleModuleSelect = (moduleId: typeof AVAILABLE_MODULES[number]) => {
    dispatch(setCurrentModule(moduleId));
    navigate(`/module/${moduleId}`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          Добро пожаловать!
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Выберите уровень для начала изучения английского языка
        </p>
      </div>

      <div className="glass-strong rounded-2xl p-8 shadow-lg">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100 text-center">
          Доступные модули
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {AVAILABLE_MODULES.map((module) => (
            <button
              key={module}
              onClick={() => handleModuleSelect(module)}
              className="glass-card p-6 rounded-xl hover:scale-105 transition-transform text-center group"
            >
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                {module}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {module === 'A1' && 'Beginner'}
                {module === 'A2' && 'Elementary'}
                {module === 'B1' && 'Intermediate'}
                {module === 'B2' && 'Upper-Intermediate'}
                {module === 'C1' && 'Advanced'}
                {module === 'C2' && 'Proficiency'}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default HomePage;

