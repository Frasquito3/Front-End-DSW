import { useAuth } from '../../hooks/useAuth';
import { useStudentEnrollments } from '../../hooks/useEnrollment';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, Award, TrendingUp, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card/Card';
import Button from '../../components/ui/Button/Button';
import Badge from '../../components/ui/Badge/Badge';
import StatusBadge from '../../components/ui/StatusBadge/StatusBadge';
import { SEO } from '../../components/common/SEO.tsx';

/**
 * MyLearningPage Component
 *
 * Displays the user's enrolled courses with their progress and status.
 * Supports both students and professors as learners.
 */
export default function MyLearningPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  /**
   * Get the student ID for fetching enrollments.
   * For students: uses studentProfile.id or user.id
   * For professors: uses user.id (backend creates studentProfile on enrollment)
   */
  const getStudentId = () => {
    if (user?.studentProfile?.id) {
      return user.studentProfile.id;
    }
    if (user?.professorProfile?.id || user?.role === 'professor') {
      return user.id;
    }
    if (user?.role === 'student') {
      return user.id;
    }
    return undefined;
  };

  const studentId = getStudentId();

  const {
    data: enrollments,
    isLoading,
    isError,
    error,
  } = useStudentEnrollments(studentId);

  // Check if user doesn't have a valid ID
  if (!studentId && !isLoading && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 p-4 md:p-6 overflow-x-hidden">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              No se pudo cargar tu perfil
            </h2>
            <p className="text-slate-600 mb-4">
              Ocurrió un error al cargar tu información. Por favor, intenta
              iniciar sesión nuevamente.
            </p>
            <div className="flex gap-3 justify-center mt-4 flex-wrap">
              <Button variant="outline" onClick={() => navigate('/')}>
                Volver al Inicio
              </Button>
              <Button onClick={() => window.location.reload()}>
                Recargar Página
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 overflow-x-hidden">
        <div className="text-center px-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-700 font-medium">Cargando tus cursos...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 p-4 md:p-6 overflow-x-hidden">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Error al Cargar
            </h2>
            <p className="text-slate-600 mb-4">
              No pudimos cargar tus cursos. Por favor, intenta de nuevo.
            </p>
            <p className="text-sm text-red-600 break-words px-4">
              {error?.message || 'Error desconocido'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeEnrollments =
    enrollments?.filter((e) => e.state === 'enrolled') || [];
  const completedEnrollments =
    enrollments?.filter((e) => e.state === 'completed') || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 pt-16">
      <SEO title="Mis Aprendizajes" description="Accede a tus cursos inscritos y continúa tu progreso." />
      <div className="bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm w-full">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="w-full sm:w-auto">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 flex items-center mb-2">
                <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3 text-blue-600 flex-shrink-0" />
                <span className="break-words">Mis Aprendizajes</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-600">
                Gestiona y continúa con tus cursos
              </p>
            </div>
            <div className="w-full sm:w-auto">
              <div className="flex items-center gap-4 sm:gap-6 justify-start sm:justify-end">
                <div className="text-center">
                  <p className="text-2xl sm:text-3xl font-bold text-blue-600">
                    {enrollments?.length || 0}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 whitespace-nowrap">
                    Total Cursos
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl sm:text-3xl font-bold text-green-600">
                    {completedEnrollments.length}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 whitespace-nowrap">
                    Completados
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl w-full box-border">
        {activeEnrollments.length > 0 && (
          <div className="mb-8 sm:mb-12 w-full">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4 sm:mb-6 flex items-center flex-wrap gap-2">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
              <span>Cursos en Progreso</span>
              <Badge className="bg-blue-100 text-blue-700">
                {activeEnrollments.length}
              </Badge>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full">
              {activeEnrollments.map((enrollment) => (
                <EnrollmentCard
                  key={enrollment.id}
                  enrollment={enrollment}
                  onContinue={() =>
                    navigate(`/courses/learn/${enrollment.course.id}`)
                  }
                  onViewAssessments={() =>
                    navigate(`/courses/${enrollment.course.id}/assessments`)
                  }
                />
              ))}
            </div>
          </div>
        )}

        {completedEnrollments.length > 0 && (
          <div className="w-full">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4 sm:mb-6 flex items-center flex-wrap gap-2">
              <Award className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0" />
              <span>Cursos Completados</span>
              <Badge className="bg-green-100 text-green-700">
                {completedEnrollments.length}
              </Badge>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full">
              {completedEnrollments.map((enrollment) => (
                <EnrollmentCard
                  key={enrollment.id}
                  enrollment={enrollment}
                  onContinue={() =>
                    navigate(`/courses/learn/${enrollment.course.id}`)
                  }
                  onViewAssessments={() =>
                    navigate(`/courses/${enrollment.course.id}/assessments`)
                  }
                />
              ))}
            </div>
          </div>
        )}

        {enrollments?.length === 0 && (
          <Card className="max-w-2xl mt-8 sm:mt-12 mx-4">
            <CardContent className="text-center py-12 sm:py-16 px-4">
              <BookOpen className="w-16 h-16 sm:w-20 sm:h-20 text-slate-300 mx-auto mb-4 sm:mb-6" />
              <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-3">
                Aún no estás inscrito en ningún curso
              </h3>
              <p className="text-sm sm:text-base text-slate-600 mb-4 sm:mb-6 max-w-md mx-auto px-4">
                Explora nuestro catálogo de cursos y comienza tu viaje de
                aprendizaje hoy mismo.
              </p>
              <Button
                onClick={() => navigate('/courses')}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                Explorar Cursos
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

/**
 * EnrollmentCard Component
 *
 * Displays a single course enrollment with progress, status, and actions.
 */
interface EnrollmentCardProps {
  enrollment: import('../../types/entities').Enrollment;
  onContinue: () => void;
  onViewAssessments: () => void;
}

function EnrollmentCard({
  enrollment,
  onContinue,
  onViewAssessments,
}: EnrollmentCardProps) {
  const progress = enrollment.progress ?? 0;
  const isCompleted = enrollment.state === 'completed';

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden w-full">
      <div className="relative h-40 sm:h-48 overflow-hidden bg-gradient-to-br from-blue-100 to-slate-100">
        {enrollment.course.imageUrl ? (
          <img
            src={enrollment.course.imageUrl}
            alt={enrollment.course.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-slate-400" />
          </div>
        )}
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3 shadow-lg">
          <StatusBadge status={isCompleted ? 'completed' : 'in-progress'} />
        </div>
      </div>

      <CardContent className="p-4 sm:p-6">
        <Badge className="mb-2 sm:mb-3 bg-blue-100 text-blue-700 text-xs">
          {enrollment.course.courseType?.name || 'Curso'}
        </Badge>

        <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors break-words">
          {enrollment.course.name}
        </h3>

        <p className="text-xs sm:text-sm text-slate-600 mb-3 sm:mb-4 break-words">
          {enrollment.course.professor?.user?.name}{' '}
          {enrollment.course.professor?.user?.surname}
        </p>

        <div className="mb-3 sm:mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs sm:text-sm font-medium text-slate-700">
              Progreso
            </span>
            <span className="text-xs sm:text-sm font-bold text-blue-600">
              {progress}%
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 sm:h-2.5 overflow-hidden">
            <div
              className={`h-2 sm:h-2.5 rounded-full transition-all duration-500 ${
                isCompleted
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {isCompleted && enrollment.grade && (
          <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium text-green-800">
                Calificación
              </span>
              <span className="text-base sm:text-lg font-bold text-green-700">
                {enrollment.grade}/100
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={onContinue}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-sm"
            size="sm"
          >
            {isCompleted ? 'Revisar' : 'Continuar'}
          </Button>
          <Button
            onClick={onViewAssessments}
            variant="outline"
            size="sm"
            className="border-blue-300 text-blue-700 hover:bg-blue-50 text-sm whitespace-nowrap"
          >
            <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            Evaluaciones
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
