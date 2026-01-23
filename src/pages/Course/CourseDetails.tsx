import { BookOpen, Globe, Play, Smartphone, Users } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useCourseById } from '../../hooks/useCourses.ts';
import Badge from '../../components/ui/Badge/Badge.tsx';
import Button from '../../components/ui/Button/Button.tsx';
import {
  useEnrollInCourse,
  useExistingEnrollment,
} from '../../hooks/useEnrollment.ts';
import { useAuth } from '../../hooks/useAuth.ts';
import { useCreatePreference } from '../../hooks/usePayment.ts';
import { formatCurrency } from '../../lib/currency';
import { AxiosError } from 'axios';
import { toast } from 'react-hot-toast';
import { Professor } from '../../models/Professor';
import { SEO } from '../../components/common/SEO';

function CourseDetails() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const { data: course, isLoading, isError, error } = useCourseById(courseId);

  const { data: existingEnrollment, isLoading: isLoadingEnrollmentCheck } =
    useExistingEnrollment(user?.studentProfile?.id, courseId);

  const { enroll, isPending: isEnrolling } = useEnrollInCourse();
  const { mutate: createPreference, isPending: isCreatingPreference } =
    useCreatePreference();

  const professor = course?.professor ? new Professor(course.professor) : null;

  const handleEnroll = () => {
    if (!isAuthenticated || !user) {
      toast.error('Debes iniciar sesión para inscribirte.');
      navigate('/login');
      return;
    }
    if (!course) return;

    if (course.isFree) {
      enroll(
        {
          studentId: user.id,
          courseId: course.id,
        },
        {
          onSuccess: () => {
            toast.success('¡Inscripción completada!');
            navigate(`/courses/learn/${course.id}`);
          },
          onError: (err) => {
            if (err instanceof AxiosError && err.response?.data) {
              toast.error(
                typeof err.response.data === 'string'
                  ? err.response.data
                  : 'Error al inscribirse'
              );
            } else {
              toast.error('Ocurrió un error al intentar inscribirte.');
            }
          },
        }
      );
    } else {
      createPreference(course.id);
    }
  };

  const renderEnrollmentButton = () => {
    const isProcessing = isEnrolling || isCreatingPreference;

    if (isLoadingEnrollmentCheck) {
      return (
        <Button className="w-full h-12 text-lg font-semibold" disabled>
          Verificando...
        </Button>
      );
    }

    if (existingEnrollment) {
      return (
        <Button
          className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-lg font-semibold"
          onClick={() => navigate(`/courses/learn/${course?.id}`)}
        >
          Ir al Curso
        </Button>
      );
    }

    if (!isAuthenticated) {
      return (
        <Button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-lg font-semibold"
          onClick={() => navigate('/login')}
        >
          Inscribirse ahora
        </Button>
      );
    }

    if (
      user?.role === 'professor' &&
      user.professorProfile?.id === course?.professor.id
    ) {
      return (
        <Button className="w-full h-12 text-lg font-semibold" disabled>
          Este es tu curso
        </Button>
      );
    }

    return (
      <Button
        className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-lg font-semibold"
        onClick={handleEnroll}
        isLoading={isProcessing}
        disabled={isProcessing}
      >
        {isProcessing
          ? 'Procesando...'
          : course?.isFree
          ? 'Inscribirse ahora'
          : 'Comprar ahora'}
      </Button>
    );
  };

  if (isLoading) {
    return (
      <div className="text-center py-20">Cargando detalles del curso...</div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-20 text-red-600">
        Error al cargar el curso: {error.message}
      </div>
    );
  }

  if (!course) {
    return <div className="text-center py-20">Curso no encontrado.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4">
      <SEO 
        title={course.name}
        description={course.description || `Curso completo de ${course.name} en UpSkill.`}
        ogImage={course.imageUrl || '/img/og-default.png'}
        ogType="article"
        keywords={`curso ${course.name}, aprender ${course.name}, curso online, certificación`}
        schema={{
          "@context": "https://schema.org",
          "@type": "Course",
          "name": course.name,
          "description": course.description,
          "provider": {
            "@type": "Organization",
            "name": "UpSkill",
            "sameAs": "https://up-skill.app"
          },
          "image": course.imageUrl,
          "offers": {
            "@type": "Offer",
            "category": course.isFree ? "Free" : "Paid",
            "price": course.priceInCents ? course.priceInCents / 100 : 0,
            "priceCurrency": "ARS"
          }
        }}
      />
      <div className="container mx-auto max-w-7xl pt-24 pb-8">
        <div className="flex items-center space-x-2 text-sm text-slate-600 mb-6">
          <Link to="/courses" className="hover:text-blue-600">
            Cursos
          </Link>
          <span>/</span>
          {course.courseType?.id ? (
            <Link
              to={`/courses?courseTypeId=${course.courseType.id || ''}`}
              className="hover:text-blue-600"
            >
              {course.courseType.name}
            </Link>
          ) : (
            <span>{course.courseType?.name || 'Sin categoría'}</span>
          )}
          <span>/</span>
          <span className="text-slate-800">{course.name}</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <Badge className="bg-blue-500 text-white mb-3">
                {course.courseType?.name}
              </Badge>
              <h1 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-4 text-balance">
                {course.name}
              </h1>
              <p className="text-lg text-slate-600 mb-6 text-pretty">
                {course.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mb-6">
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>
                    {course.studentsCount ?? course.students?.length ?? 0}{' '}
                    estudiantes
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <BookOpen className="w-4 h-4" />
                  <span>
                    {course.unitsCount ?? course.units?.length ?? 0}{' '}
                    {(course.unitsCount ?? course.units?.length ?? 0) === 1
                      ? 'lección'
                      : 'lecciones'}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-white/80 backdrop-blur-sm rounded-lg border border-slate-200">
                <img
                  src={
                    professor?.profilePicture ||
                    '/img/noImage.jpg'
                  }
                  alt={professor?.fullName}
                  className="w-14 h-14 rounded-full object-cover"
                />
                <div className="flex-1">
                  <p className="text-sm text-slate-600">Creado por</p>
                  <Link
                    to={`/courses?professorId=${course.professor.id || ''}`}
                    className="font-semibold text-slate-800 hover:text-blue-600 transition-colors"
                  >
                    {professor?.fullName}
                  </Link>
                </div>

                {(course.institution?.name ||
                  course.professor?.institution?.name) && (
                  <>
                    <div className="h-10 w-px bg-slate-300" />
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                        <Globe className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Institución</p>
                        {course.institution?.id ||
                        course.institution?.institutionId ||
                        course.professor?.institution?.id ? (
                          <Link
                            to={`/courses?institutionId=${
                              course.institution?.id ||
                              course.institution?.institutionId ||
                              course.professor?.institution?.id
                            }`}
                            className="font-semibold text-slate-800 hover:text-blue-600 transition-colors"
                          >
                            {course.institution?.name ||
                              course.professor?.institution?.name}
                          </Link>
                        ) : (
                          <span className="font-semibold text-slate-800">
                            {course.institution?.name ||
                              course.professor?.institution?.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-slate-200 p-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">
                Contenido del curso
              </h2>
              <div className="space-y-3">
                {course.units?.map((seccion, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Play className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">
                          {seccion.name}
                        </p>
                        {seccion.description ? (
                          <p className="text-sm text-slate-600">
                            {seccion.description}
                          </p>
                        ) : null}
                        <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                          {(seccion.materialsCount ?? 0) > 0 && (
                            <span className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                              {seccion.materialsCount} Material
                              {seccion.materialsCount !== 1 ? 'es' : ''}
                            </span>
                          )}
                          {(seccion.questionsCount ?? 0) > 0 && (
                            <span className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                              {seccion.questionsCount} Pregunta
                              {seccion.questionsCount !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-slate-200 shadow-lg overflow-hidden sticky top-24">
              <div className="relative">
                <img
                  src={course.imageUrl || '/img/noImage.jpg'}
                  alt={course.name}
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <div className="mb-6">
                    <div className="flex items-baseline space-x-2 mb-2">
                      <span className="text-4xl font-bold text-slate-800">
                        {course.isFree
                          ? 'GRATIS'
                          : course.priceInCents
                          ? formatCurrency(course.priceInCents)
                          : 'Precio no disponible'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3 mb-6">{renderEnrollmentButton()}</div>
                <div className="border-t border-slate-200 pt-6">
                  <h3 className="font-semibold text-slate-800 mb-4">
                    Este curso incluye:
                  </h3>
                  <div className="space-y-3 text-sm text-slate-700">
                    <div className="flex items-center space-x-3">
                      <BookOpen className="w-5 h-5 text-slate-500" />
                      <span>{course.units?.length || 0} lecciones</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Smartphone className="w-5 h-5 text-slate-500" />
                      <span>Acceso en móvil y TV</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Globe className="w-5 h-5 text-slate-500" />
                      <span>Acceso de por vida</span>
                    </div>
                  </div>
                </div>
                <div className="border-t border-slate-200 pt-6 mt-6 space-y-2 text-sm text-slate-600">
                  <div className="flex justify-between">
                    <span>Idioma:</span>
                    <span className="font-medium text-slate-800">Español</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseDetails;
