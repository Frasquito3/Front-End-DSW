import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Calendar,
  Target,
  TrendingUp,
} from 'lucide-react';
import Button from '../../components/ui/Button/Button';
import Badge from '../../components/ui/Badge/Badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/Card/Card';
import { useAssessmentsByCourse } from '../../hooks/useAssessments';
import { useAuth } from '../../hooks/useAuth';
import { useExistingEnrollment } from '../../hooks/useEnrollment';
import type { AssessmentSummary } from '../../types/entities';

export default function CourseAssessmentsPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const studentId = user?.studentProfile?.id;

  const {
    data: assessments,
    isLoading,
    isError,
    error,
  } = useAssessmentsByCourse(courseId);

  const { data: enrollment } = useExistingEnrollment(studentId, courseId);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-slate-700 font-medium">Cargando evaluaciones...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 p-6">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Error al Cargar
            </h2>
            <p className="text-slate-600 mb-4">
              No pudimos cargar las evaluaciones. Por favor, intenta de nuevo.
            </p>
            <p className="text-sm text-red-600">
              {error?.message || 'Error desconocido'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 pt-16">
      <div className="bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 py-6 max-w-7xl">
          <div className="flex items-center justify-between">
            <div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/courses/learn/${courseId}`)}
                className="mb-3"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al Curso
              </Button>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 flex items-center">
                <FileText className="w-6 h-6 sm:w-8 sm:h-8 mr-3 text-purple-600" />
                Evaluaciones del Curso
              </h1>
              <p className="text-slate-600 mt-1">
                Completa las evaluaciones para demostrar tu conocimiento
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-7xl">
        {assessments && assessments.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {assessments.map((assessment) => (
              <AssessmentCard
                key={assessment.id}
                assessment={assessment}
                onStart={() => {
                  if (enrollment) {
                    navigate(
                      `/courses/${courseId}/assessments/${assessment.id}/take`,
                      { 
                        state: { 
                          enrollmentId: enrollment.id,
                          isContinuing: assessment.hasActiveAttempt 
                        } 
                      }
                    );
                  }
                }}
                onViewAttempts={() => {
                  navigate(
                    `/courses/${courseId}/assessments/${assessment.id}/attempts`
                  );
                }}
              />
            ))}
          </div>
        ) : (
          <Card className="max-w-3xl mx-auto">
            <CardContent className="text-center py-16">
              <AlertCircle className="w-20 h-20 text-slate-300 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-slate-800 mb-3">
                Sin Evaluaciones
              </h3>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                Este curso no tiene evaluaciones disponibles en este momento.
              </p>
              <Button
                onClick={() => navigate(`/courses/learn/${courseId}`)}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                Volver al Curso
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

interface AssessmentCardProps {
  assessment: AssessmentSummary;
  onStart: () => void;
  onViewAttempts: () => void;
}

function AssessmentCard({
  assessment,
  onStart,
  onViewAttempts,
}: AssessmentCardProps) {
  const getStatusColor = () => {
    switch (assessment.status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'available':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'expired':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'no_attempts_left':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusText = () => {
    switch (assessment.status) {
      case 'completed':
        return 'Completada';
      case 'available':
        return 'Disponible';
      case 'expired':
        return 'Expirada';
      case 'no_attempts_left':
        return 'Sin intentos';
      default:
        return 'Desconocido';
    }
  };

  const getStatusIcon = () => {
    switch (assessment.status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'available':
        return <Clock className="w-4 h-4" />;
      case 'expired':
        return <XCircle className="w-4 h-4" />;
      case 'no_attempts_left':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const canTakeAssessment =
    assessment.status === 'available' ||
    (assessment.attemptsRemaining && assessment.attemptsRemaining > 0);

  return (
    <Card className="hover:shadow-xl transition-all duration-300 overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <CardTitle className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              {assessment.title}
            </CardTitle>
            {assessment.description && (
              <p className="text-sm text-slate-600 line-clamp-2">
                {assessment.description}
              </p>
            )}
          </div>
          <Badge
            className={`${getStatusColor()} border flex items-center gap-1`}
          >
            {getStatusIcon()}
            {getStatusText()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <Target className="w-4 h-4 text-purple-600" />
            <span>
              {assessment.questionsCount} pregunta
              {assessment.questionsCount !== 1 ? 's' : ''}
            </span>
          </div>
          {assessment.duration && (
            <div className="flex items-center gap-2 text-slate-600">
              <Clock className="w-4 h-4 text-purple-600" />
              <span>{assessment.duration} min</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-slate-600">
            <TrendingUp className="w-4 h-4 text-purple-600" />
            <span>Aprobar: {assessment.passingScore}%</span>
          </div>
          {assessment.availableUntil && (
            <div className="flex items-center gap-2 text-slate-600">
              <Calendar className="w-4 h-4 text-purple-600" />
              <span>Hasta {formatDate(assessment.availableUntil)}</span>
            </div>
          )}
        </div>

        <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Intentos</span>
            <span className="text-sm text-slate-600">
              {assessment.attemptsCount}{' '}
              {assessment.maxAttempts ? `/ ${assessment.maxAttempts}` : ''}
            </span>
          </div>

          {assessment.bestScore !== undefined &&
            assessment.bestScore !== null && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">
                  Mejor calificación
                </span>
                <span
                  className={`text-sm font-bold ${
                    assessment.bestScore >= assessment.passingScore
                      ? 'text-green-700'
                      : 'text-amber-700'
                  }`}
                >
                  {assessment.bestScore}%
                </span>
              </div>
            )}

          {assessment.attemptsRemaining !== undefined &&
            assessment.attemptsRemaining !== null && (
              <p className="text-xs text-slate-500 mt-2">
                {assessment.attemptsRemaining} intento
                {assessment.attemptsRemaining !== 1 ? 's' : ''} restante
                {assessment.attemptsRemaining !== 1 ? 's' : ''}
              </p>
            )}
        </div>

        <div className="flex gap-2">
          {canTakeAssessment ? (
            <>
              <Button
                onClick={onStart}
                className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                size="sm"
              >
                {assessment.hasActiveAttempt
                  ? 'Continuar Intento'
                  : assessment.attemptsCount > 0
                  ? 'Reintentar'
                  : 'Iniciar Evaluación'}
              </Button>
              {assessment.attemptsCount > 0 && (
                <Button
                  onClick={onViewAttempts}
                  variant="outline"
                  size="sm"
                  className="border-purple-300 text-purple-700 hover:bg-purple-50"
                >
                  Ver Intentos
                </Button>
              )}
            </>
          ) : (
            <Button
              onClick={onViewAttempts}
              variant="outline"
              size="sm"
              className="flex-1 border-slate-300"
              disabled={assessment.attemptsCount === 0}
            >
              {assessment.attemptsCount > 0 ? 'Ver Intentos' : 'No Disponible'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
