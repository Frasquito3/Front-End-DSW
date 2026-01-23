import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { valibotResolver } from '@hookform/resolvers/valibot';
import * as v from 'valibot';
import {
  Card,
  CardDescription,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/Card/Card';
import Button from '../../components/ui/Button/Button';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/Dialog/Dialog';
import Input from '../../components/ui/Input/Input';
import Textarea from '../../components/ui/TextArea/TextArea';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import type { CourseType } from '../../types/entities';
import {
  useCourseTypes,
  useCreateCourseType,
  useUpdateCourseType,
  useDeleteCourseType,
} from '../../hooks/useCourseTypes';
import { useDebounce } from '../../hooks/useDebounce';

const CourseTypeSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1, 'El nombre es requerido.')),
  description: v.pipe(
    v.string(),
    v.minLength(1, 'La descripción es requerida.')
  ),
});

type CourseTypeFormData = v.InferInput<typeof CourseTypeSchema>;
const TYPES_PER_PAGE = 5;

export default function CourseTypesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTypeId, setCurrentTypeId] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<CourseTypeFormData>({
    resolver: valibotResolver(CourseTypeSchema),
  });

  const filters = useMemo(
    () => ({
      q: debouncedSearchTerm || undefined,
      sortBy: 'name',
      sortOrder,
      limit: TYPES_PER_PAGE,
      offset: (currentPage - 1) * TYPES_PER_PAGE,
    }),
    [debouncedSearchTerm, sortOrder, currentPage]
  );

  const { data, isLoading, error } = useCourseTypes(filters);
  const createMutation = useCreateCourseType();
  const updateMutation = useUpdateCourseType();
  const deleteMutation = useDeleteCourseType();

  const courseTypes = data?.courseTypes || [];
  const totalTypes = data?.total || 0;
  const totalPages = Math.ceil(totalTypes / TYPES_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, sortOrder]);

  const openModalForCreate = () => {
    setCurrentTypeId(null);
    reset({ name: '', description: '' });
    setIsModalOpen(true);
  };

  const openModalForEdit = (type: CourseType) => {
    setCurrentTypeId(type.id);
    setValue('name', type.name);
    setValue('description', type.description);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (
      window.confirm('¿Estás seguro? Esta acción eliminará el tipo de curso.')
    ) {
      deleteMutation.mutate(id);
    }
  };

  const onFormSubmit = (data: CourseTypeFormData) => {
    const payload = { name: data.name, description: data.description };

    if (currentTypeId) {
      updateMutation.mutate(
        { id: currentTypeId, data: payload },
        {
          onSuccess: () => setIsModalOpen(false),
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => setIsModalOpen(false),
      });
    }
  };

  if (isLoading && courseTypes.length === 0)
    return <p>Cargando tipos de curso...</p>;
  if (error)
    return (
      <p className="text-center p-8 text-red-600">
        Error al cargar los datos: {error.message}
      </p>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-slate-50/100 px-4">
      <div className="container mx-auto max-w-7xl space-y-6 pt-24 pb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              Gestión de Tipos de Curso
            </h1>
            <p className="text-slate-600">
              Crea y administra las categorías de los cursos.
            </p>
          </div>
          <Button size="md" onClick={openModalForCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Crear Nuevo Tipo
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Tipos de Curso Existentes ({totalTypes})</CardTitle>
                <CardDescription>
                  Lista de todas las categorías disponibles
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm border rounded-lg bg-white/80 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
                <select
                  value={sortOrder}
                  onChange={(e) =>
                    setSortOrder(e.target.value as 'ASC' | 'DESC')
                  }
                  className="px-3 py-2 text-sm border rounded-lg bg-white/80 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="ASC">Ordenar A-Z</option>
                  <option value="DESC">Ordenar Z-A</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {courseTypes.map((type) => (
                <div
                  key={type.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg border hover:bg-slate-50/50"
                >
                  <div className="flex-1 mb-3 sm:mb-0">
                    <h3 className="font-semibold text-slate-800">
                      {type.name}
                    </h3>
                    <p className="text-sm text-slate-600">{type.description}</p>
                  </div>
                  <div className="flex items-center space-x-2 self-end sm:self-center">
                    <Button
                      variant="outline"
                      size="md"
                      onClick={() => openModalForEdit(type)}
                      aria-label={`Editar tipo de curso ${type.name}`}
                    >
                      <Edit className="w-4 h-4 mr-1" aria-hidden="true" /> Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="md"
                      onClick={() => handleDelete(type.id)}
                      disabled={deleteMutation.isPending}
                      aria-label={`Eliminar tipo de curso ${type.name}`}
                    >
                      <Trash2 className="w-4 h-4 mr-1" aria-hidden="true" /> Eliminar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            {courseTypes.length === 0 && !isLoading && (
              <p className="text-center text-slate-500 py-8">
                No se encontraron tipos de curso con los filtros aplicados.
              </p>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1 || isLoading}
                >
                  Anterior
                </Button>
                <span className="text-sm text-slate-600">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(p + 1, totalPages))
                  }
                  disabled={currentPage === totalPages || isLoading}
                >
                  Siguiente
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogHeader>
            <DialogTitle>
              {currentTypeId ? 'Editar' : 'Crear'} Tipo de Curso
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSubmit(onFormSubmit)}
            className="space-y-4 pt-4"
          >
            <Input
              id="name"
              label="Nombre del Tipo de Curso"
              {...register('name')}
              error={errors.name?.message}
            />
            <Textarea
              id="description"
              label="Descripción"
              {...register('description')}
              error={errors.description?.message}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setIsModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="md"
                isLoading={createMutation.isPending || updateMutation.isPending}
              >
                Guardar
              </Button>
            </div>
          </form>
        </Dialog>
      </div>
    </div>
  );
}
