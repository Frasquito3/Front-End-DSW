import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button/Button';
import Badge from '../../components/ui/Badge/Badge.tsx';
import { Edit, Plus, Star } from 'lucide-react';
import { useProfessorCourses } from '../../hooks/useCourses.ts';
import CoursePreviewCard from '../../components/ui/CoursePreviewCard/CoursePreviewCard.tsx';

const ProfessorCoursesPage = () => {
  const { data: courses, isLoading, error } = useProfessorCourses();
  const navigate = useNavigate();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
      case 'publicado':
        return { className: 'bg-green-100 text-green-700 border-green-200', text: 'Publicado' };
      case 'draft':
      case 'borrador':
      case 'en-desarrollo':
        return { className: 'bg-yellow-100 text-yellow-700 border-yellow-200', text: 'Borrador' };
      case 'archived':
      case 'archivado':
        return { className: 'bg-gray-100 text-gray-700 border-gray-200', text: 'Archivado' };
      default:
        return { className: 'bg-blue-100 text-blue-700 border-blue-200', text: status };
    }
  };

  const handleNavigateToCreate = () => {
    navigate('new');
  };

  const handleNavigateToEdit = (courseId: string) => {
    navigate(`/professor/dashboard/courses/${courseId}/edit`);
  };

  if (isLoading) {
    return (
      <div className="text-center p-8">
        <p className="text-slate-600">Cargando tus cursos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-red-800 font-semibold">Ocurrió un error</h3>
        <p className="text-red-600">{error.message}</p>
      </div>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <div className="text-center p-12 bg-slate-50 border rounded-lg">
        <h3 className="text-slate-800 font-semibold text-xl">
          Aún no tienes cursos
        </h3>
        <p className="text-slate-600 mt-2 mb-4">
          ¡Es un buen momento para empezar a crear!
        </p>
        <Button size="md" className="bg-green-500 hover:bg-green-600 text-white" onClick={handleNavigateToCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Crear tu Primer Curso
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Mis Cursos ({courses.length})</h2>
          </div>
          <div className="flex gap-3">
            <Button size="md" className="bg-green-500 hover:bg-green-600 text-white" onClick={handleNavigateToCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Crear Curso
            </Button>
          </div>
        </div>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div key={course.id} className="relative">
            <div className="absolute top-5 right-5 z-10 flex flex-col gap-2 items-end">
              <Badge className={getStatusBadge(course.status).className}>
                {getStatusBadge(course.status).text}
              </Badge>
              {course.rating && (
                <Badge className="bg-white/90 text-slate-700 border-0">
                  <Star className="w-3 h-3 mr-1 fill-current text-yellow-500" />
                  {course.rating.toFixed(1)}
                </Badge>
              )}
            </div>
            <div className="absolute bottom-5 right-5 z-10">
              <Button
                variant="outline"
                size="sm"
                className="h-9 w-9 p-0 bg-white hover:bg-slate-50"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigateToEdit(course.id);
                }}
                aria-label="Editar curso"
              >
                <Edit className="w-4 h-4" />
              </Button>
            </div>

            <CoursePreviewCard 
              course={course} 
              hideButton={true}
              hideInstructor={true}
              onViewMore={() => handleNavigateToEdit(course.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfessorCoursesPage;