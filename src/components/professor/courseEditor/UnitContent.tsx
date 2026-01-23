import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../ui/Card/Card';
import Button from '../../ui/Button/Button';
import {
  BookOpen,
  Plus,
  Upload,
  FileText,
  Trash2,
  Eye,
  Edit2,
} from 'lucide-react';
import DocumentViewer from '../../ui/DocumentViewer/DocumentViewer';
import UnitEditor from '../../landing/UnitEditor';
import type { Block } from '@blocknote/core';
import type {
  UnitEditorData,
  Question,
  Material,
} from '../../../types/entities';
import { cn } from '../../../lib/utils';

interface UnitContentProps {
  selectedUnit: UnitEditorData | null;
  questions: Question[];
  materials: Material[];
  editable: boolean;
  onUnitDetailChange: (newBlocks: Block[]) => void;
  onCreateQuestion: () => void;
  onEditQuestion: (question: Question) => void;
  onDeleteQuestion: (questionId: string) => void;
  onUploadMaterial: () => void;
  onDeleteMaterial: (materialId: string | number) => void;
  onCreateUnit: () => void;
}

export default function UnitContent({
  selectedUnit,
  questions,
  materials,
  editable,
  onUnitDetailChange,
  onCreateQuestion,
  onEditQuestion,
  onDeleteQuestion,
  onUploadMaterial,
  onDeleteMaterial,
  onCreateUnit,
}: UnitContentProps) {
  const [previewMaterial, setPreviewMaterial] = useState<Material | null>(null);

  if (!selectedUnit) {
    return (
      <div className="text-center p-12 bg-slate-50 border rounded-lg h-full flex flex-col justify-center items-center">
        <BookOpen className="w-12 h-12 text-slate-400 mb-4" />
        <h3 className="text-slate-800 font-semibold text-xl">
          No hay unidades
        </h3>
        <p className="text-slate-600 mt-2">
          Crea tu primera unidad para empezar a añadir contenido.
        </p>
        <Button size="md" className="mt-4" onClick={onCreateUnit}>
          <Plus className="w-4 h-4 mr-2" />
          Crear Unidad
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card 
        className={cn(
          "relative z-20", 
          editable && 'ring-2 ring-blue-200 ring-offset-2'
        )}
      >
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span>{selectedUnit.name}</span>
            </div>
            {editable && (
              <div className="flex items-center space-x-2 text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                <Edit2 className="w-3 h-3" />
                <span>Modo Edición</span>
              </div>
            )}
          </CardTitle>
          <CardDescription>Unidad {selectedUnit.unitNumber}</CardDescription>
        </CardHeader>
        <CardContent>
          <UnitEditor
            editable={editable}
            initialContent={selectedUnit.detail}
            onChange={onUnitDetailChange}
          />

          {editable && (
            <div className="space-y-4">
              <div className="flex items-center justify-end pt-4 gap-2">
                <Button size="md" variant="outline" onClick={onCreateQuestion}>
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Pregunta
                </Button>
                <Button size="md" variant="outline" onClick={onUploadMaterial}>
                  <Upload className="w-4 h-4 mr-2" />
                  Subir Material
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6 relative z-0">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Preguntas de la Unidad</CardTitle>
          </CardHeader>
          <CardContent>
            {questions.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">
                No hay preguntas.
              </p>
            ) : (
              <div className="space-y-3">
                {questions.map((question, index) => (
                  <div
                    key={question.id || `question-${index}`}
                    className="p-3 border rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 line-clamp-2">
                          {question.questionText}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Tipo: {question.questionType}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {question.payload.options.length} opciones
                        </p>
                      </div>
                      <div className="flex items-center space-x-1 flex-shrink-0">
                        {editable ? (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600"
                              onClick={() => onEditQuestion(question)}
                              title="Editar pregunta"
                              aria-label="Editar pregunta"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-slate-500 hover:text-red-600"
                              onClick={() =>
                                question.id && onDeleteQuestion(question.id)
                              }
                              title="Eliminar pregunta"
                              aria-label="Eliminar pregunta"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600"
                            onClick={() => onEditQuestion(question)}
                            title="Ver pregunta"
                            aria-label="Ver detalles de pregunta"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Material de la Unidad</CardTitle>
          </CardHeader>
          <CardContent>
            {materials.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">
                No hay materiales subidos.
              </p>
            ) : (
              <div className="space-y-2">
                {materials.map((material, index) => (
                  <div
                    key={`${material.title}-${index}`}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border"
                  >
                    <div className="flex items-center space-x-2 min-w-0">
                      <FileText className="w-4 h-4 text-slate-500 flex-shrink-0" />
                      <span className="text-sm text-slate-700 truncate">
                        {material.title}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-slate-500 hover:text-blue-600"
                        onClick={() => setPreviewMaterial(material)}
                        title="Vista previa"
                        aria-label="Vista previa del material"
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-slate-500 hover:text-red-600"
                        onClick={() => onDeleteMaterial(index)}
                        title="Eliminar"
                        aria-label="Eliminar material"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {previewMaterial && (
        <DocumentViewer
          url={previewMaterial.url}
          onClose={() => setPreviewMaterial(null)}
        />
      )}
    </div>
  );
}