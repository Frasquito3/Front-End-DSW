import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  useExistingEnrollment,
  useCompleteUnit,
  useUncompleteUnit,
} from '../../hooks/useEnrollment';
import { useState, useEffect, useMemo } from 'react';
import UnitSidebar from '../../components/student/UnitSidebar';
import UnitContentViewer from '../../components/student/UnitContentViewer';
import MaterialsList from '../../components/student/MaterialsList';
import QuestionsList from '../../components/student/QuestionsList';
import Button from '../../components/ui/Button/Button';
import ErrorBoundary from '../../components/ui/ErrorBoundary/ErrorBoundary';
import { CheckCircle2, BookOpen, ArrowLeft, AlertCircle } from 'lucide-react';
import type { Unit } from '../../types/entities';
import toast from 'react-hot-toast';
import { Professor } from '../../models/Professor';

export default function CourseLearn() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    data: enrollment,
    isLoading: isLoadingEnrollment,
    isError: isErrorEnrollment,
    error: enrollmentError,
  } = useExistingEnrollment(user?.studentProfile?.id, courseId);

  const { completeUnit, isPending: isCompletingUnit } = useCompleteUnit();
  const { uncompleteUnit, isPending: isUncompletingUnit } = useUncompleteUnit();

  const [currentUnit, setCurrentUnit] = useState<Unit | null>(null);

  const course = enrollment?.course;
  const courseUnits = useMemo(() => course?.units || [], [course]);
  const courseProgress = enrollment?.progress ?? 0;
  const completedUnits = enrollment?.completedUnits || [];

  useEffect(() => {
    if (isErrorEnrollment && enrollmentError?.response?.status === 404) {
      navigate(`/courses/${courseId}`);
    }

    if (courseUnits.length > 0 && !currentUnit) {
      setCurrentUnit(courseUnits[0]);
    }
  }, [
    isErrorEnrollment,
    enrollmentError,
    courseUnits,
    currentUnit,
    courseId,
    navigate,
  ]);

  const handleSelectUnit = (unitNumber: number) => {
    const unit = courseUnits.find((u) => u.unitNumber === unitNumber);
    if (unit) {
      setCurrentUnit(unit);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleToggleCompleteUnit = () => {
    if (!currentUnit || !enrollment) return;
    const isCompleted = completedUnits.includes(currentUnit.unitNumber);
    if (isCompleted) {
      uncompleteUnit({
        enrollmentId: enrollment.id,
        unitNumber: currentUnit.unitNumber,
      });
    } else {
      toast.success('Unidad completada con éxito!');
      completeUnit({
        enrollmentId: enrollment.id,
        unitNumber: currentUnit.unitNumber,
      });
    }
  };

  if (isLoadingEnrollment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando tu curso...</p>
        </div>
      </div>
    );
  }

  if (!enrollment || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="text-center max-w-md bg-white p-8 rounded-lg shadow-md">
          <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            No tienes acceso a este curso
          </h2>
          <p className="text-slate-600 mb-6">
            Debes inscribirte primero para acceder al contenido del curso.
          </p>
          <Button onClick={() => navigate(`/courses/${courseId}`)}>
            Ver Detalles del Curso
          </Button>
        </div>
      </div>
    );
  }

  const isCurrentUnitCompleted = currentUnit
    ? completedUnits.includes(currentUnit.unitNumber)
    : false;

  const profInstance = new Professor(course?.professor);
  const instructorName = profInstance.fullName;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 pt-16">
      <div className="bg-white/95 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 py-3 md:py-4 max-w-7xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/my-learning')}
                className="hover:bg-slate-100 transition-colors flex-shrink-0"
              >
                <ArrowLeft className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Mis Aprendizajes</span>
              </Button>
              <div className="sm:border-l sm:border-slate-300 sm:pl-4 flex-1 min-w-0">
                <h1 className="text-base sm:text-lg md:text-xl font-bold text-slate-800 flex items-center truncate">
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600 flex-shrink-0" />
                  <span className="truncate">{course.name}</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5 hidden sm:block">
                  Instructor: {instructorName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/courses/${courseId}/assessments`)}
                className="border-purple-200 text-purple-700 hover:bg-purple-50 flex items-center gap-1 sm:gap-2 flex-1 sm:flex-initial justify-center"
              >
                <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm">Evaluaciones</span>
              </Button>
              <div className="text-right bg-blue-50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-blue-200 flex-shrink-0">
                <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
                  Progreso
                </p>
                <p className="text-lg sm:text-2xl font-bold text-blue-600">
                  {courseProgress}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {course.status === 'en-desarrollo' && (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 my-4 sm:p-5">
          <div className="container mx-auto px-3 sm:px-4 md:px-6 max-w-7xl">
            <div className="flex items-start gap-3 sm:gap-4">
              <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm sm:text-base font-semibold text-amber-900 mb-1">
                  Curso en Desarrollo
                </h3>
                <p className="text-xs sm:text-sm text-amber-800">
                  Este curso fue marcado como en desarrollo por el profesor, ten
                  en cuenta que la información es susceptible a cambios.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row lg:h-[calc(100vh-88px)]">
        <div className="hidden lg:block lg:w-80 flex-shrink-0 bg-white border-r border-slate-200 shadow-sm lg:overflow-y-auto">
          <UnitSidebar
            units={courseUnits}
            completedUnits={completedUnits}
            currentUnitNumber={currentUnit?.unitNumber || null}
            onSelectUnit={handleSelectUnit}
            progress={courseProgress}
          />
        </div>

        <div className="flex-1 overflow-y-auto bg-gradient-to-br from-white via-slate-50 to-blue-50">
          {currentUnit ? (
            <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto">
              <div className="lg:hidden mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Seleccionar Unidad
                </label>
                <select
                  value={currentUnit.unitNumber}
                  onChange={(e) => handleSelectUnit(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {courseUnits.map((unit) => (
                    <option key={unit.unitNumber} value={unit.unitNumber}>
                      Unidad {unit.unitNumber}: {unit.name}
                      {completedUnits.includes(unit.unitNumber) ? ' ✓' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4 sm:mb-6 bg-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-200 shadow-sm">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800 mb-2">
                  {currentUnit.name}
                </h2>
              </div>

              <div className="mb-4 sm:mb-6 bg-white/90 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 sm:p-6">
                  <ErrorBoundary>
                    <UnitContentViewer content={currentUnit.detail || ''} />
                  </ErrorBoundary>
                </div>
              </div>

              {currentUnit.materials && currentUnit.materials.length > 0 && (
                <div className="mb-6">
                  <MaterialsList materials={currentUnit.materials} />
                </div>
              )}
              {currentUnit.questions && currentUnit.questions.length > 0 && (
                <div className="mb-4 sm:mb-6">
                  <QuestionsList
                    courseId={course.id}
                    questionIds={currentUnit.questions}
                  />
                </div>
              )}

              <div className="mt-4 sm:mt-6">
                <div
                  className={`rounded-xl p-4 sm:p-6 shadow-sm border-2 ${
                    isCurrentUnitCompleted
                      ? 'bg-green-50 border-green-300'
                      : 'bg-white/80 border-blue-200'
                  }`}
                >
                  <Button
                    onClick={handleToggleCompleteUnit}
                    disabled={isCompletingUnit || isUncompletingUnit}
                    className={`w-full py-4 sm:py-6 text-base sm:text-lg shadow-md transition-all duration-200 ${
                      isCurrentUnitCompleted
                        ? 'bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700'
                        : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                    }`}
                    size="lg"
                  >
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    <span className="text-sm sm:text-base">
                      {isCurrentUnitCompleted
                        ? 'Marcar como No Completada'
                        : 'Marcar como Completada'}
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center min-h-[50vh] p-4 sm:p-8">
              <div className="text-center max-w-md bg-white/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-slate-200 shadow-sm">
                <BookOpen className="w-16 h-16 sm:w-20 sm:h-20 text-blue-300 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-2">
                  Comienza tu Aprendizaje
                </h3>
                <p className="text-sm sm:text-base text-slate-600">
                  {courseUnits.length > 0
                    ? 'Selecciona una unidad del menú para comenzar a ver el contenido.'
                    : 'Este curso aún no tiene unidades disponibles.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
