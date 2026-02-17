import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, Clock, AlertCircle, CheckCircle, Send } from 'lucide-react';
import Button from '../../components/ui/Button/Button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/Card/Card';
import {
  useAssessment,
  useStartAttempt,
  useSaveAnswers,
  useSubmitAttempt,
  useActiveAttempt,
} from '../../hooks/useAssessments';
import { useAuth } from '../../hooks/useAuth';
import type { QuestionForStudent } from '../../types/entities';
import { isAxiosError } from 'axios';
import { toast } from 'react-hot-toast';

export default function TakeAssessmentPage() {
  const { courseId, assessmentId } = useParams<{
    courseId: string;
    assessmentId: string;
  }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const isContinuing = location.state?.isContinuing || false;

  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, number | string>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [attemptQuestions, setAttemptQuestions] = useState<
    QuestionForStudent[]
  >([]);

  const hasAutoSubmittedRef = useRef(false);
  const hasShownRecoveryToastRef = useRef(false);

  const { data: assessment, isLoading } = useAssessment(assessmentId);
  const { data: activeAttempt, isLoading: isCheckingAttempt } =
    useActiveAttempt(assessmentId);
  const startAttemptMutation = useStartAttempt();
  const saveAnswersMutation = useSaveAnswers();
  const submitAttemptMutation = useSubmitAttempt();

  const handleSubmit = useCallback(
    async (forceSubmit = false) => {
      if (!attemptId) return;

      // Stop the timer immediately
      setTimeLeft(null);
      hasAutoSubmittedRef.current = true;

      if (!forceSubmit && Object.keys(answers).length === 0) {
        alert(
          'Debes responder al menos una pregunta para enviar la evaluación.',
        );
        return;
      }

      const answersArray = Object.entries(answers).map(
        ([questionId, answer]) => ({
          questionId,
          answer,
        }),
      );

      try {
        if (answersArray.length > 0) {
          await submitAttemptMutation.mutateAsync({
            attemptId,
            submitData: { attemptId, answers: answersArray },
          });

          // Clean up localStorage
          const storageKey = `assessment_answers_${attemptId}`;
          localStorage.removeItem(storageKey);

          navigate(
            `/courses/${courseId}/assessments/${assessmentId}/results/${attemptId}`,
          );
        } else if (forceSubmit) {
          // Clean up localStorage even on forced submit
          const storageKey = `assessment_answers_${attemptId}`;
          localStorage.removeItem(storageKey);
          
          toast.error('El tiempo se agotó y no hubo respuestas registradas.');
          navigate(`/courses/${courseId}/assessments`);
        }
      } catch (error) {
        console.error('Error submitting attempt:', error);
        if (forceSubmit) {
          // Clean up localStorage even on error during forced submit
          const storageKey = `assessment_answers_${attemptId}`;
          localStorage.removeItem(storageKey);
          navigate(`/courses/${courseId}/assessments`);
        } else {
          toast.error('Hubo un error al enviar la evaluación.');
        }
      }
    },
    [
      attemptId,
      answers,
      submitAttemptMutation,
      navigate,
      courseId,
      assessmentId,
    ],
  );

  const handleStartAttempt = useCallback(async () => {
    const studentId = user?.studentProfile?.id;
    if (!studentId || !assessmentId) {
      toast.error(
        'No se pudo iniciar el intento: falta información del estudiante o de la evaluación.',
      );
      return;
    }

    try {
      const attempt = await startAttemptMutation.mutateAsync({
        assessmentId,
        studentId,
      });
      setAttemptId(attempt.id);
      setHasStarted(true);
      hasAutoSubmittedRef.current = false;

      if (attempt.assessment?.questions) {
        setAttemptQuestions(attempt.assessment.questions);
      }

      // Load answers from server or localStorage
      const savedAnswers: Record<string, number | string> = {};

      if (attempt.answers && attempt.answers.length > 0) {
        attempt.answers.forEach((answer) => {
          if (answer.question?.id) {
            savedAnswers[answer.question.id] = answer.answer;
          }
        });
      } else {
        // Try to recover from localStorage if server has no answers (resumed attempt)
        const storageKey = `assessment_answers_${attempt.id}`;
        const storedAnswers = localStorage.getItem(storageKey);
        if (storedAnswers) {
          try {
            const parsedAnswers = JSON.parse(storedAnswers);
            Object.assign(savedAnswers, parsedAnswers);
            
            if (!hasShownRecoveryToastRef.current) {
              toast.success('Respuestas recuperadas del almacenamiento local', { duration: 2000 });
              hasShownRecoveryToastRef.current = true;
            }
          } catch (e) {
            console.error('Error parsing stored answers:', e);
          }
        }
      }

      if (Object.keys(savedAnswers).length > 0) {
        setAnswers(savedAnswers);
      }

      // Calculate remaining time from server
      if (attempt.assessment?.durationMinutes && attempt.startedAt) {
        const startedAt = new Date(attempt.startedAt).getTime();
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - startedAt) / 1000);
        const totalSeconds = attempt.assessment.durationMinutes * 60;
        const remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds);

        setTimeLeft(remainingSeconds);

        if (remainingSeconds === 0) {
          hasAutoSubmittedRef.current = true;
          handleSubmit(true);
        }
      }
    } catch (error) {
      console.error('Error starting attempt:', error);

      if (isAxiosError(error)) {
        const errorMsg = error.response?.data?.errors;

        if (
          typeof errorMsg === 'string' &&
          (errorMsg.includes('no longer available') ||
            errorMsg.includes('not yet available'))
        ) {
          toast.error(
            'El tiempo para realizar esta evaluación ha finalizado.',
            {
              duration: 5000,
            },
          );

          navigate(`/courses/${courseId}/assessments`);
          return;
        }

        if (typeof errorMsg === 'string') {
          toast.error(errorMsg);
          return;
        }
      }

      toast.error('No se pudo iniciar la evaluación. Inténtalo de nuevo.');
    }
  }, [
    user?.studentProfile?.id,
    assessmentId,
    startAttemptMutation,
    handleSubmit,
    navigate,
    courseId,
  ]);

  const handleAnswerChange = useCallback(
    (questionId: string, answer: number | string) => {
      const finalAnswer =
        typeof answer === 'string' && !isNaN(parseInt(answer, 10))
          ? parseInt(answer, 10)
          : answer;
      setAnswers((prev) => ({
        ...prev,
        [questionId]: finalAnswer,
      }));
    },
    [],
  );

  // Resume active attempt if one exists or auto-start if continuing
  useEffect(() => {
    if (activeAttempt && !hasStarted) {
      setAttemptId(activeAttempt.id);
      setHasStarted(true);
      hasAutoSubmittedRef.current = false;

      if (activeAttempt.assessment?.questions) {
        setAttemptQuestions(activeAttempt.assessment.questions);
      }

      // Load answers from server or localStorage
      const savedAnswers: Record<string, number | string> = {};

      if (activeAttempt.answers && activeAttempt.answers.length > 0) {
        activeAttempt.answers.forEach((answer) => {
          if (answer.question?.id) {
            savedAnswers[answer.question.id] = answer.answer;
          }
        });
      } else {
        // Try to recover from localStorage if server has no answers
        const storageKey = `assessment_answers_${activeAttempt.id}`;
        const storedAnswers = localStorage.getItem(storageKey);
        if (storedAnswers) {
          try {
            const parsedAnswers = JSON.parse(storedAnswers);
            Object.assign(savedAnswers, parsedAnswers);
            
            if (!hasShownRecoveryToastRef.current) {
              toast.success('Respuestas recuperadas del almacenamiento local', {
                duration: 2000,
              });
              hasShownRecoveryToastRef.current = true;
            }
          } catch (e) {
            console.error('Error parsing stored answers:', e);
          }
        }
      }

      if (Object.keys(savedAnswers).length > 0) {
        setAnswers(savedAnswers);
      }

      // Calculate remaining time from server
      if (
        activeAttempt.assessment?.durationMinutes &&
        activeAttempt.startedAt
      ) {
        const startedAt = new Date(activeAttempt.startedAt).getTime();
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - startedAt) / 1000);
        const totalSeconds = activeAttempt.assessment.durationMinutes * 60;
        const remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds);

        setTimeLeft(remainingSeconds);

        if (remainingSeconds === 0) {
          hasAutoSubmittedRef.current = true;
          handleSubmit(true);
        }
      }
    } else if (
      isContinuing &&
      !isCheckingAttempt &&
      !activeAttempt &&
      !hasStarted
    ) {
      // User clicked "Continue" but no active attempt exists, start a new one automatically
      handleStartAttempt();
    }
  }, [activeAttempt, hasStarted, isContinuing, isCheckingAttempt, handleStartAttempt, handleSubmit]);

  // Save answers to localStorage immediately when they change (backup)
  useEffect(() => {
    if (attemptId && hasStarted && Object.keys(answers).length > 0) {
      const storageKey = `assessment_answers_${attemptId}`;
      localStorage.setItem(storageKey, JSON.stringify(answers));
    }
  }, [answers, attemptId, hasStarted]);

  // Debounced auto-save to backend when answers change
  useEffect(() => {
    if (
      hasStarted &&
      attemptId &&
      Object.keys(answers).length > 0 &&
      !hasAutoSubmittedRef.current
    ) {
      const debouncedSave = setTimeout(() => {
        const answersArray = Object.entries(answers).map(
          ([questionId, answer]) => ({
            questionId,
            answer,
          }),
        );
        saveAnswersMutation.mutate({
          attemptId,
          answers: answersArray,
        });
      }, 3000); // Save 3 seconds after the last answer change

      return () => clearTimeout(debouncedSave);
    }
  }, [answers, attemptId, hasStarted, saveAnswersMutation]);

  useEffect(() => {
    if (hasAutoSubmittedRef.current) return;

    if (timeLeft !== null && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev !== null && prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev !== null ? prev - 1 : null;
        });
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      hasAutoSubmittedRef.current = true;
      handleSubmit(true);
    }
  }, [timeLeft, handleSubmit]);

  useEffect(() => {
    if (
      hasStarted &&
      attemptId &&
      Object.keys(answers).length > 0 &&
      !hasAutoSubmittedRef.current
    ) {
      const autoSave = setInterval(() => {
        const answersArray = Object.entries(answers).map(
          ([questionId, answer]) => ({
            questionId,
            answer,
          }),
        );
        saveAnswersMutation.mutate({
          attemptId,
          answers: answersArray,
        });
      }, 30000);
      return () => clearInterval(autoSave);
    }
  }, [hasStarted, attemptId, answers, saveAnswersMutation]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading || isCheckingAttempt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50 to-slate-50 pt-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-slate-700 font-medium">
            {isCheckingAttempt
              ? 'Verificando intentos activos...'
              : 'Cargando evaluación...'}
          </p>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50 to-slate-50 p-6 pt-16">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Evaluación No Encontrada
            </h2>
            <p className="text-slate-600 mb-4">
              No pudimos cargar la evaluación. Por favor, intenta de nuevo.
            </p>
            <Button
              onClick={() => navigate(`/courses/${courseId}/assessments`)}
            >
              Volver a Evaluaciones
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-50 flex items-center justify-center p-4 sm:p-6 pt-20 sm:pt-24">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <CardTitle className="text-2xl">{assessment.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-6">
              {assessment.description && (
                <p className="text-slate-600">{assessment.description}</p>
              )}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold text-purple-900 mb-3">
                  Información de la Evaluación:
                </h3>
                <ul className="space-y-2 text-sm text-purple-800">
                  <li>
                    • <strong>Preguntas:</strong> {assessment.questionsCount}
                  </li>
                  {assessment.durationMinutes && (
                    <li>
                      • <strong>Duración:</strong> {assessment.durationMinutes}{' '}
                      minutos
                    </li>
                  )}
                  <li>
                    • <strong>Nota para aprobar:</strong>{' '}
                    {assessment.passingScore}%
                  </li>
                  {assessment.maxAttempts && (
                    <li>
                      • <strong>Intentos permitidos:</strong>{' '}
                      {assessment.maxAttempts}
                    </li>
                  )}
                </ul>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h3 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Importante:
                </h3>
                <ul className="space-y-1 text-sm text-amber-800">
                  <li>• Una vez iniciada, la evaluación debe completarse</li>
                  <li>
                    • Tus respuestas se guardan automáticamente cada 30 segundos
                  </li>
                  {assessment.durationMinutes && (
                    <li>
                      • El tiempo se agotará automáticamente después de{' '}
                      {assessment.durationMinutes} minutos
                    </li>
                  )}
                  <li>• Revisa todas tus respuestas antes de enviar</li>
                </ul>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={() => navigate(`/courses/${courseId}/assessments`)}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button
                onClick={handleStartAttempt}
                disabled={startAttemptMutation.isPending}
                className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {startAttemptMutation.isPending
                  ? 'Iniciando...'
                  : 'Iniciar Evaluación'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = attemptQuestions.length || assessment.questionsCount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-50 pt-16">
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 py-4 max-w-7xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="w-full sm:w-auto">
              <h1 className="text-lg sm:text-xl font-bold text-slate-800 truncate">
                {assessment.title}
              </h1>
              <p className="text-sm text-slate-600">
                {answeredCount} de {totalQuestions} respondidas
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
              {timeLeft !== null && (
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-mono text-base sm:text-lg font-bold flex-1 justify-center ${
                    timeLeft < 300
                      ? 'bg-red-100 text-red-700'
                      : 'bg-purple-100 text-purple-700'
                  }`}
                >
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                  {formatTime(timeLeft)}
                </div>
              )}
              <Button
                onClick={() => handleSubmit(false)} // Envío manual (no forzado)
                disabled={
                  submitAttemptMutation.isPending || hasAutoSubmittedRef.current
                }
                size="sm"
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 flex-1 sm:flex-initial"
              >
                <Send className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Enviar</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-7xl">
        <div className="space-y-6">
          {attemptQuestions.map((question, index) => {
            if (!question.id) return null;

            return (
              <Card key={question.id} className="overflow-hidden">
                <CardHeader className="bg-purple-50 border-b border-purple-100">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base font-semibold text-slate-800">
                        {question.text}
                      </CardTitle>
                      <p className="text-sm text-slate-600 mt-1">
                        {question.points} punto
                        {question.points !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  {question.type === 'multiple_choice' ? (
                    <div className="space-y-3">
                      {question.options?.map((option, index) => (
                        <label
                          key={option.id}
                          className="flex items-center gap-3 p-3 sm:p-4 rounded-lg border-2 border-slate-200 hover:border-purple-300 hover:bg-purple-50 cursor-pointer transition-all"
                        >
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={index}
                            checked={answers[question.id!] === index}
                            onChange={(e) =>
                              handleAnswerChange(
                                question.id!,
                                parseInt(e.target.value, 10),
                              )
                            }
                            disabled={hasAutoSubmittedRef.current}
                            className="w-5 h-5 text-purple-600 focus:ring-purple-500"
                          />
                          <span className="text-slate-700">{option.text}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <textarea
                      value={(answers[question.id!] as string) || ''}
                      onChange={(e) =>
                        handleAnswerChange(question.id!, e.target.value)
                      }
                      disabled={hasAutoSubmittedRef.current}
                      placeholder="Escribe tu respuesta aquí..."
                      className="w-full min-h-[150px] p-4 border-2 border-slate-200 rounded-lg focus:border-purple-400 focus:ring-2 focus:ring-purple-200 resize-none"
                    />
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
        <div className="mt-8 flex justify-center">
          <Button
            onClick={() => handleSubmit(false)}
            disabled={
              submitAttemptMutation.isPending || hasAutoSubmittedRef.current
            }
            size="lg"
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 px-8"
          >
            <Send className="w-5 h-5 mr-2" />
            {submitAttemptMutation.isPending
              ? 'Enviando...'
              : 'Enviar Evaluación'}
          </Button>
        </div>
      </div>
    </div>
  );
}
