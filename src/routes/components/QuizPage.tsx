/**
 * Quiz Page
 * Страница прохождения квиза
 */

import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/shared/hooks/redux';
import {
  selectCurrentQuiz,
  selectCurrentQuestion,
  selectQuizProgress,
  selectIsActive,
  selectIsQuizCompleted,
  selectQuizStats,
  resetQuiz,
  answerQuestion,
  nextQuestion,
  completeQuiz,
} from '@/features/quizzes/quizzesSlice';
import { saveQuizResult } from '@/features/progress/progressSlice';
import QuizQuestion from '@/features/quizzes/components/QuizQuestion';
import QuizProgress from '@/features/quizzes/components/QuizProgress';
import QuizResults from '@/features/quizzes/components/QuizResults';

export default function QuizPage() {
  const navigate = useNavigate();
  const { moduleId } = useParams<{ moduleId: string }>();
  const dispatch = useAppDispatch();

  const currentQuiz = useAppSelector(selectCurrentQuiz);
  const currentQuestion = useAppSelector(selectCurrentQuestion);
  const progress = useAppSelector(selectQuizProgress);
  const isActive = useAppSelector(selectIsActive);
  const isCompleted = useAppSelector(selectIsQuizCompleted);
  const stats = useAppSelector(selectQuizStats);

  // Если нет активного квиза, перенаправляем на setup
  useEffect(() => {
    if (!isActive && !isCompleted) {
      navigate(`/quiz/${moduleId}/setup`);
    }
  }, [isActive, isCompleted, navigate, moduleId]);

  // Обработчик ответа на вопрос
  const handleAnswer = (answer: string) => {
    if (!currentQuestion) return;

    dispatch(answerQuestion(answer));

    // Небольшая задержка перед переходом к следующему вопросу
    setTimeout(() => {
      if (progress.current < progress.total) {
        dispatch(nextQuestion());
      } else {
        // Это был последний вопрос, завершаем квиз
        handleCompleteQuiz();
      }
    }, 800);
  };

  // Завершение квиза
  const handleCompleteQuiz = () => {
    dispatch(completeQuiz());

    // Сохраняем результат в прогресс
    if (currentQuiz && stats) {
      const mistakes = currentQuiz.questions
        .filter((q) => q.isCorrect === false)
        .map((q) => q.word.id);

      dispatch(
        saveQuizResult({
          quizId: currentQuiz.id,
          quizType: currentQuiz.type,
          moduleId: currentQuiz.moduleId,
          collectionId: currentQuiz.collectionId,
          category: currentQuiz.category,
          completedAt: new Date().toISOString(),
          score: stats.accuracy,
          totalQuestions: stats.totalQuestions,
          correctAnswers: stats.correctAnswers,
          timeSpent: currentQuiz.timeSpent || 0,
          mistakes,
        })
      );
    }
  };

  // Повторить квиз
  const handleRetry = () => {
    dispatch(resetQuiz());
    navigate(`/quiz/${moduleId}/setup`);
  };

  // На главную
  const handleExit = () => {
    dispatch(resetQuiz());
    navigate(`/module/${moduleId}`);
  };

  // Если квиз завершен, показываем результаты
  if (isCompleted && stats) {
    return (
      <QuizResults
        stats={stats}
        quiz={currentQuiz!}
        onRetry={handleRetry}
        onExit={handleExit}
      />
    );
  }

  // Показываем текущий вопрос
  if (currentQuestion && currentQuiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 py-8">
        <div className="container mx-auto px-4">
          {/* Progress */}
          <QuizProgress
            current={progress.current}
            total={progress.total}
            percentage={progress.percentage}
          />

          {/* Question */}
          <div className="mt-8">
            <QuizQuestion
              question={currentQuestion}
              quizType={currentQuiz.type}
              onAnswer={handleAnswer}
              showCorrectAnswer={currentQuiz.settings.showCorrectAnswer}
            />
          </div>

          {/* Exit button */}
          <div className="mt-8 text-center">
            <button
              onClick={handleExit}
              className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Выйти из квиза
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
