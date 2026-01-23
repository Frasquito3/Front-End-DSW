import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card/Card';
import Button from '../../ui/Button/Button';
import { Plus, Settings, GripVertical, Edit, Trash2 } from 'lucide-react';
import type { UnitEditorData } from '../../../types/entities';

interface CourseSidebarProps {
  units: UnitEditorData[];
  selectedUnitId: number | null;
  onUnitSelect: (unitNumber: number) => void;
  onCreateUnit: () => void;
  onEditUnit: (unit: UnitEditorData) => void;
  onDeleteUnit: (unitNumber: number) => void;
  onOpenConfig: () => void;
  onDragStart: (e: React.DragEvent, unit: UnitEditorData) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetUnit: UnitEditorData) => void;
  onUnitReorder?: (draggedUnitNumber: number, targetUnitNumber: number) => void;
}

export default function CourseSidebar({
  units,
  selectedUnitId,
  onUnitSelect,
  onCreateUnit,
  onEditUnit,
  onDeleteUnit,
  onOpenConfig,
  onDragStart,
  onDragOver,
  onDrop,
  onUnitReorder,
}: CourseSidebarProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Contenido del Curso</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-slate-800">Unidades</h3>
          <Button size="sm" variant="ghost" onClick={onCreateUnit} aria-label="Crear nueva unidad">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-2">
          {units.map((unit) => (
            <div
              key={unit.unitNumber}
              draggable
              onDragStart={(e) => onDragStart(e, unit)}
              onDragOver={onDragOver}
              onDrop={(e) => {
                onDrop(e, unit);
                // Si hay función de reordenamiento disponible, se puede usar aquí
                if (onUnitReorder) {
                  // La lógica de reordenamiento se maneja en el componente padre
                }
              }}
              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedUnitId === unit.unitNumber
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}
              onClick={() => onUnitSelect(unit.unitNumber)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <GripVertical className="w-4 h-4 text-slate-400 cursor-grab flex-shrink-0" />
                  <div className="flex-1 truncate">
                    <h4 className="font-medium text-sm text-slate-800 truncate">
                      {unit.name}
                    </h4>
                  </div>
                </div>
                <div className="flex items-center flex-shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteUnit(unit.unitNumber);
                    }}
                    className="h-6 w-6 p-0 text-slate-500 hover:bg-red-100 hover:text-red-600"
                    aria-label="Eliminar unidad"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditUnit(unit);
                    }}
                    className="h-6 w-6 p-1 text-slate-500 hover:bg-blue-100 hover:text-blue-600"
                    aria-label="Editar unidad"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <hr className="my-4" />

        <Button
          variant="outline"
          className="w-full bg-transparent"
          size="sm"
          onClick={onOpenConfig}
        >
          <Settings className="w-4 h-4 mr-2" />
          Configuración del curso
        </Button>
      </CardContent>
    </Card>
  );
}
