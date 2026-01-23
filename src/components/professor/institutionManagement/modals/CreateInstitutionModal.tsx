import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { valibotResolver } from '@hookform/resolvers/valibot';
import * as v from 'valibot';
import Modal from '../../../ui/Modal/Modal';
import Button from '../../../ui/Button/Button';
import Input from '../../../ui/Input/Input';
import Textarea from '../../../ui/TextArea/TextArea';
import { AlertCircle, Building2, Plus, X } from 'lucide-react';
import { useCreateInstitution } from '../../../../hooks/useInstitutionMutations';
import type { Institution } from '../../../../types/entities';
import { isAxiosError } from 'axios';

const CreateInstitutionSchema = v.object({
  name: v.pipe(
    v.string('El nombre es requerido.'),
    v.minLength(3, 'El nombre debe tener al menos 3 caracteres.'),
    v.maxLength(200, 'El nombre no puede exceder 200 caracteres.'),
    v.trim()
  ),
  description: v.pipe(
    v.string('La descripción es requerida.'),
    v.minLength(10, 'La descripción debe tener al menos 10 caracteres.'),
    v.maxLength(1000, 'La descripción no puede exceder 1000 caracteres.'),
    v.trim()
  ),
});

type CreateInstitutionFormData = v.InferInput<typeof CreateInstitutionSchema>;

interface CreateInstitutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  institutions: Institution[];
}

export default function CreateInstitutionModal({
  isOpen,
  onClose,
  institutions,
}: CreateInstitutionModalProps) {
  const { mutate: createInstitution, isPending, error: creationError } = useCreateInstitution();
  const [aliases, setAliases] = useState<string[]>([]);
  const [currentAlias, setCurrentAlias] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<CreateInstitutionFormData>({
    resolver: valibotResolver(CreateInstitutionSchema),
  });

  const formName = watch('name');

  const normalizeString = (str: string): string => {
    return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
  };

  const duplicateWarning = useMemo(() => {
    if (!Array.isArray(institutions) || !formName || formName.trim().length < 3) {
      return null;
    }
    const normalized = normalizeString(formName);
    const duplicate = institutions.find((inst) => {
      const instNormalized = normalizeString(inst.name);
      const aliasesNormalized = inst.aliases?.map(normalizeString) || [];
      return instNormalized === normalized || aliasesNormalized.includes(normalized);
    });
    if (duplicate) {
      return { type: 'error' as const, message: `Ya existe una institución similar: "${duplicate.name}"` };
    }
    const similar = institutions.find((inst) => {
      const instNormalized = normalizeString(inst.name);
      return instNormalized.includes(normalized) || normalized.includes(instNormalized);
    });
    if (similar) {
      return { type: 'warning' as const, message: `Encontramos una institución similar: "${similar.name}". ¿Estás seguro de que no es la misma?` };
    }
    return null;
  }, [formName, institutions]);

  const handleAddAlias = () => {
    const trimmed = currentAlias.trim();
    if (trimmed && !aliases.includes(trimmed) && aliases.length < 10) {
      setAliases([...aliases, trimmed]);
      setCurrentAlias('');
    }
  };

  const handleRemoveAlias = (index: number) => {
    setAliases(aliases.filter((_, i) => i !== index));
  };

  const onSubmit = (data: CreateInstitutionFormData) => {
    if (duplicateWarning?.type === 'error') {
      alert('No puedes crear una institución con un nombre que ya existe.');
      return;
    }
    if (duplicateWarning?.type === 'warning' && !confirm(`${duplicateWarning.message}\n\n¿Deseas continuar de todos modos?`)) {
      return;
    }
    createInstitution(
      { name: data.name, description: data.description, aliases: aliases.length > 0 ? aliases : undefined },
      {
        onSuccess: () => {
          reset();
          setAliases([]);
          setCurrentAlias('');
          onClose();
        },
      }
    );
  };

  const handleClose = () => {
    reset();
    setAliases([]);
    setCurrentAlias('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Crear Nueva Institución">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Importante: Validación de nombres</p>
              <p>Verifica que la institución no exista antes de crearla. El sistema normalizará el nombre para evitar duplicados (ej: "UTN" = "utn" = "U.T.N").</p>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-slate-700">Nombre de la Institución <span className="text-red-500">*</span></label>
          <div className="relative">
            <Building2 className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input id="name" {...register('name')} className="pl-10" placeholder="Ej: Universidad Tecnológica Nacional" disabled={isPending} />
          </div>
          {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          {duplicateWarning && (
            <div className={`flex items-start gap-2 p-3 mt-2 rounded-lg ${duplicateWarning.type === 'error' ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'}`}>
              <AlertCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${duplicateWarning.type === 'error' ? 'text-red-600' : 'text-yellow-600'}`} />
              <p className={`text-sm ${duplicateWarning.type === 'error' ? 'text-red-700' : 'text-yellow-700'}`}>{duplicateWarning.message}</p>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <Textarea id="description" label="Descripción *" {...register('description')} placeholder="Describe brevemente la institución..." rows={4} disabled={isPending} error={errors.description?.message} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Alias / Nombres Alternativos (Opcional)</label>
          <p className="text-xs text-slate-500 mb-2">Agrega nombres o siglas alternativas (ej: "UTN", "Tecnológica Nacional")</p>
          <div className="flex gap-2">
            <Input value={currentAlias} onChange={(e) => setCurrentAlias(e.target.value)} placeholder="Agregar alias..." onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAlias())} disabled={isPending || aliases.length >= 10} />
            <Button type="button" onClick={handleAddAlias} disabled={!currentAlias.trim() || aliases.length >= 10 || isPending} variant="outline" aria-label="Agregar alias"><Plus className="w-4 h-4" /></Button>
          </div>
          {aliases.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {aliases.map((alias, index) => (
                <div key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm border border-blue-200">
                  <span>{alias}</span>
                  <button type="button" onClick={() => handleRemoveAlias(index)} className="hover:bg-blue-100 rounded-full p-0.5" disabled={isPending} aria-label="Eliminar alias"><X className="w-3 h-3" /></button>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-slate-500">{aliases.length}/10 alias agregados</p>
        </div>
        {creationError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700">
              {isAxiosError(creationError) 
                ? (creationError.response?.data as { errors: string })?.errors 
                : 'Ocurrió un error inesperado al crear la institución.'}
            </p>
          </div>
        )}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>Cancelar</Button>
          <Button type="submit" isLoading={isPending} disabled={!!duplicateWarning && duplicateWarning.type === 'error'} className="bg-purple-500 hover:bg-purple-600">
            <Plus className="w-4 h-4 mr-2" />
            Crear Institución
          </Button>
        </div>
      </form>
    </Modal>
  );
}