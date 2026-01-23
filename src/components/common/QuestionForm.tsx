import { useState } from 'react';
import Button from '../ui/Button/Button';
import { Card } from '../ui/Card/Card';
import Input from '../ui/Input/Input';
import TextArea from '../ui/TextArea/TextArea';
import { Plus, Trash2, Check } from 'lucide-react';
import type { Question } from '../../types/entities';

interface QuestionFormProps {
  initialQuestion?: Partial<Question>;
  unitNumber?: number | null;
  showUnitSelector?: boolean;
  availableUnits?: Array<{ unitNumber: number; name: string }>;
  onSave: (question: Question) => void | Promise<void>;
  onCancel: () => void;
  readonly?: boolean;
  saveButtonText?: string;
  isLoading: boolean;
}

export default function QuestionForm({
  initialQuestion,
  unitNumber,
  showUnitSelector = false,
  availableUnits = [],
  onSave,
  onCancel,
  readonly = false,
  saveButtonText = 'Guardar Pregunta',
}: QuestionFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<{
    questionText: string;
    unitNumber: number | null;
    options: string[];
    correctAnswer: number;
  }>({
    questionText: initialQuestion?.questionText || '',
    unitNumber: initialQuestion?.unitNumber ?? unitNumber ?? null,
    options: initialQuestion?.payload?.options || ['', '', '', ''],
    correctAnswer:
      typeof initialQuestion?.payload?.correctAnswer === 'number'
        ? initialQuestion.payload.correctAnswer
        : 0,
  });

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const addOption = () => {
    setFormData({ ...formData, options: [...formData.options, ''] });
  };

  const removeOption = (index: number) => {
    if (formData.options.length <= 2) return;
    const newOptions = formData.options.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      options: newOptions,
      correctAnswer:
        formData.correctAnswer >= index && formData.correctAnswer > 0
          ? formData.correctAnswer - 1
          : formData.correctAnswer,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.questionText.trim()) {
      alert('Por favor ingresa el texto de la pregunta');
      return;
    }

    if (formData.options.some((opt) => !opt.trim())) {
      alert('Todas las opciones deben tener texto');
      return;
    }

    setIsSaving(!isSaving);
    try {
      const questionData: Question = {
        id: initialQuestion?.id,
        questionText: formData.questionText,
        questionType: 'MultipleChoiceOption',
        unitNumber: formData.unitNumber || undefined,
        payload: {
          options: formData.options,
          correctAnswer: formData.correctAnswer,
        },
      };

      await onSave(questionData);
    } catch (error) {
      console.error('Error saving question:', error);
      alert('Error al guardar la pregunta');
    } finally {
      setIsSaving(!isSaving);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 to-white border-2 border-blue-100">
      <form onSubmit={handleSubmit} className="space-y-5">
        {showUnitSelector && availableUnits.length > 0 && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Unidad Asociada
            </label>
            <select
              value={formData.unitNumber ?? ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  unitNumber: e.target.value ? parseInt(e.target.value) : null,
                })
              }
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              disabled={readonly}
            >
              <option value="">Sin unidad asignada</option>
              {availableUnits.map((unit) => (
                <option key={unit.unitNumber} value={unit.unitNumber}>
                  Unidad {unit.unitNumber}: {unit.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Puedes asignar la pregunta a una unidad específica o dejarla sin
              unidad
            </p>
          </div>
        )}

        <div>
          <TextArea
            label="Pregunta"
            value={formData.questionText}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setFormData({ ...formData, questionText: e.target.value })
            }
            placeholder="Escribe tu pregunta aquí..."
            rows={3}
            required
            disabled={readonly}
            className="text-base"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Opciones de Respuesta
            <span className="text-xs font-normal text-gray-500 ml-2">
              (Selecciona la correcta)
            </span>
          </label>
          <div className="space-y-3">
            {formData.options.map((option, index) => {
              const isCorrect = formData.correctAnswer === index;
              return (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                    isCorrect
                      ? 'bg-green-50 border-green-300'
                      : 'bg-white border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="correctAnswer"
                      checked={isCorrect}
                      onChange={() =>
                        !readonly &&
                        setFormData({ ...formData, correctAnswer: index })
                      }
                      disabled={readonly}
                      className="w-5 h-5 text-green-600 focus:ring-green-500"
                    />
                  </div>

                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      isCorrect
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {String.fromCharCode(65 + index)}
                  </div>

                  <Input
                    value={option}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleOptionChange(index, e.target.value)
                    }
                    placeholder={`Opción ${String.fromCharCode(65 + index)}`}
                    required
                    disabled={readonly}
                    className="flex-1"
                  />

                  {isCorrect && (
                    <div className="flex-shrink-0 text-green-600">
                      <Check className="w-5 h-5" />
                    </div>
                  )}

                  {!readonly && formData.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar opción"
                      aria-label="Eliminar opción de respuesta"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {!readonly && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addOption}
              className="mt-3 flex items-center gap-2 border-dashed border-2"
            >
              <Plus className="w-4 h-4" />
              Agregar Opción
            </Button>
          )}
        </div>

        {!readonly && (
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving} className="flex-1">
              {isSaving ? 'Guardando...' : saveButtonText}
            </Button>
          </div>
        )}
      </form>
    </Card>
  );
}
