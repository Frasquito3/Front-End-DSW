import { useState } from 'react';
import { useAllCourseQuestions, useCreateGeneralQuestion } from '../../../hooks/useQuestions';
import Button from '../../ui/Button/Button';
import { Card } from '../../ui/Card/Card';
import QuestionForm from '../../common/QuestionForm';
import { HelpCircle, Plus, X, ChevronDown, ChevronUp, Check } from 'lucide-react';
import type { Question } from '../../../types/entities';
import { toast } from 'react-hot-toast';

interface GeneralQuestionsManagerProps {
  courseId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function GeneralQuestionsManager({
  courseId,
  isOpen,
  onClose,
}: GeneralQuestionsManagerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);
  const createGeneralQuestionMutation = useCreateGeneralQuestion();

  const { data: allQuestions, isLoading } = useAllCourseQuestions(courseId);
  const generalQuestions = allQuestions?.filter((q) => q.unitNumber === null || q.unitNumber === undefined) || [];

  const handleSave = async (question: Question) => {
    try {
      await createGeneralQuestionMutation.mutateAsync({
        courseId,
        data: {
          questionText: question.questionText,
          questionType: question.questionType,
          payload: question.payload,
        },
      });
      toast.success('Pregunta general creada exitosamente');
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating general question:', error);
      toast.error('Error al crear la pregunta');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-blue-600" />
              Preguntas Generales del Curso
            </h2>
            <p className="text-gray-600 mt-1">
              Estas preguntas no están asociadas a ninguna unidad específica
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Cerrar gestor de preguntas"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {!showCreateForm && (
            <Button
              onClick={() => setShowCreateForm(true)}
              className="mb-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Crear Pregunta General
            </Button>
          )}

          {showCreateForm && (
            <div className="mb-6 p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
              <h3 className="text-lg font-semibold mb-4">Nueva Pregunta General</h3>
              <QuestionForm
                showUnitSelector={false}
                unitNumber={null}
                onSave={handleSave}
                onCancel={() => setShowCreateForm(false)}
                saveButtonText="Crear Pregunta" 
                isLoading={false}
              />
            </div>
          )}

          {isLoading && (
            <p className="text-center text-gray-500">Cargando preguntas...</p>
          )}

          {!isLoading && generalQuestions.length === 0 && !showCreateForm && (
            <div className="text-center py-12">
              <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                No hay preguntas generales creadas aún
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Estas preguntas se pueden usar en evaluaciones
              </p>
            </div>
          )}

          {!isLoading && generalQuestions.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold mb-4">
                Preguntas Existentes ({generalQuestions.length})
              </h3>
              {generalQuestions.map((question) => {
                const isExpanded = expandedQuestionId === question.id;
                return (
                  <div
                    key={question.id}
                    className="border border-gray-200 rounded-lg hover:border-blue-300 transition-all"
                  >
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
                              Pregunta General
                            </span>
                            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                              {question.questionType}
                            </span>
                          </div>
                          <p className="text-gray-900 font-medium">
                            {question.questionText}
                          </p>
                        </div>
                        <button
                          onClick={() => setExpandedQuestionId(isExpanded ? null : question.id!)}
                          className="flex-shrink-0 p-1 hover:bg-gray-200 rounded"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {isExpanded && question.questionType === 'MultipleChoiceOption' && (
                      <div className="px-4 pb-4 border-t pt-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Opciones de respuesta:
                        </p>
                        <div className="space-y-2">
                          {question.payload.options.map((option: string, idx: number) => {
                            const isCorrect = question.payload.correctAnswer === idx;
                            return (
                              <div
                                key={idx}
                                className={`p-2 rounded text-sm ${
                                  isCorrect
                                    ? 'bg-green-100 border border-green-300'
                                    : 'bg-gray-50 border border-gray-200'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-600">
                                    {String.fromCharCode(65 + idx)})
                                  </span>
                                  <span>{option}</span>
                                  {isCorrect && (
                                    <Check className="w-4 h-4 text-green-600 ml-auto" />
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-6 border-t bg-gray-50">
          <Button onClick={onClose} variant="outline" className="w-full">
            Cerrar
          </Button>
        </div>
      </Card>
    </div>
  );
}