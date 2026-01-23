import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useProfessorCourses } from '../../hooks/useCourses';
import {
  useAssessmentsForProfessor,
  useDeleteAssessment,
} from '../../hooks/useAssessments';
import Button from '../../components/ui/Button/Button';
import { Card } from '../../components/ui/Card/Card';
import Select from '../../components/ui/Select/Select';
import {
  Clock,
  FileText,
  Users,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  BookOpen,
  BarChart3,
} from 'lucide-react';
import type { Assessment } from '../../types/entities';

export default function ProfessorAssessmentsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const courseIdFromUrl = searchParams.get('courseId');
  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    courseIdFromUrl || 'all'
  );

  const { data: courses, isLoading: isLoadingCourses } = useProfessorCourses();
  const { data: assessments, isLoading: isLoadingAssessments } =
    useAssessmentsForProfessor(
      selectedCourseId === 'all' ? undefined : selectedCourseId
    );

  const deleteAssessmentMutation = useDeleteAssessment();

  const handleDeleteAssessment = async (assessmentId: string) => {
    if (
      window.confirm('¿Estás seguro de que deseas eliminar esta evaluación?')
    ) {
      try {
        await deleteAssessmentMutation.mutateAsync(assessmentId);
      } catch (error) {
        console.error('Error deleting assessment:', error);
        alert('Error al eliminar la evaluación');
      }
    }
  };

  if (isLoadingCourses) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando cursos...</p>
        </div>
      </div>
    );
  }

  const selectedCourse = courses?.find((c) => c.id === selectedCourseId);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Evaluaciones</h1>
          <p className="text-gray-600 mt-1">
            Gestiona las evaluaciones formales de tus cursos
          </p>
        </div>
        <div className="flex gap-2">
          {selectedCourseId !== 'all' && selectedCourse && (
            <Button
              variant="outline"
              onClick={() =>
                navigate(
                  `/professor/dashboard/courses/${selectedCourseId}/edit`
                )
              }
              className="flex items-center gap-2"
            >
              <BookOpen className="w-5 h-5" />
              Ir al Curso
            </Button>
          )}
          <Button
            onClick={() => navigate('/professor/dashboard/assessments/new')}
            className="flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nueva Evaluación
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <Select
          label="Filtrar por curso"
          value={selectedCourseId}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setSelectedCourseId(e.target.value)
          }
          className="max-w-xs"
        >
          <option value="all">Todos los cursos</option>
          {courses?.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name}
            </option>
          ))}
        </Select>
      </div>

      {isLoadingAssessments ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando evaluaciones...</p>
          </div>
        </div>
      ) : assessments && assessments.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {assessments.map((assessment) => (
            <AssessmentCard
              key={assessment.id}
              assessment={assessment}
              onEdit={() =>
                navigate(
                  `/professor/dashboard/assessments/${assessment.id}/edit`
                )
              }
              onDelete={() => handleDeleteAssessment(assessment.id)}
              onViewAttempts={() =>
                navigate(
                  `/professor/dashboard/assessments/${assessment.id}/attempts`
                )
              }
            />
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No hay evaluaciones
          </h3>
          <p className="text-gray-500 mb-6">
            {selectedCourseId === 'all'
              ? 'Aún no has creado ninguna evaluación.'
              : 'No hay evaluaciones para este curso.'}
          </p>
          <Button
            onClick={() => navigate('/professor/dashboard/assessments/new')}
          >
            Crear Primera Evaluación
          </Button>
        </Card>
      )}
    </div>
  );
}

interface AssessmentCardProps {
  assessment: Assessment;
  onEdit: () => void;
  onDelete: () => void;
  onViewAttempts: () => void;
}

function AssessmentCard({
  assessment,
  onEdit,
  onDelete,
  onViewAttempts,
}: AssessmentCardProps) {
  const now = new Date();
  const availableFrom = assessment.availableFrom
    ? new Date(assessment.availableFrom)
    : null;
  const availableUntil = assessment.availableUntil
    ? new Date(assessment.availableUntil)
    : null;

  const isAvailable =
    assessment.isActive &&
    (!availableFrom || availableFrom <= now) &&
    (!availableUntil || availableUntil >= now);

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow flex flex-col">
      <div className="flex-grow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              {assessment.title}
            </h3>
            <p className="text-sm text-gray-600">{assessment.course.name}</p>
          </div>
          <div className="flex items-center gap-1">
            {isAvailable ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
          </div>
        </div>
        {assessment.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {assessment.description}
          </p>
        )}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Preguntas</p>
              <p className="font-semibold">{assessment.questions.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Duración</p>
              <p className="font-semibold">
                {assessment.durationMinutes
                  ? `${assessment.durationMinutes} min`
                  : 'Ilimitado'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Intentos</p>
              <p className="font-semibold">
                {assessment.maxAttempts ?? 'Ilimitados'}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t mt-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={onViewAttempts}
          className="flex-1 flex items-center justify-center gap-2"
          aria-label="Ver intentos de la evaluación"
        >
          <BarChart3 className="w-4 h-4" />
          Ver Intentos
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-2"
            aria-label="Editar evaluación"
          >
            <Edit className="w-4 h-4" />
            <span className="sm:hidden">Editar</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="flex-1 flex items-center justify-center gap-2 text-red-600 hover:text-red-700 hover:border-red-300"
            aria-label="Eliminar evaluación"
          >
            <Trash2 className="w-4 h-4" />
            <span className="sm:hidden">Borrar</span>
          </Button>
        </div>
      </div>
    </Card>
  );
}
