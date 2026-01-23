import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CardList from '../../components/ui/CardList/CardList.tsx';
import CoursePreviewCard from '../../components/ui/CoursePreviewCard/CoursePreviewCard.tsx';
import type { SearchCoursesParams } from '../../types/shared.ts';
import { useSearchCourses } from '../../hooks/useCourses.ts';
import { useCourseTypes } from '../../hooks/useCourseTypes.ts';
import { useInstitutions } from '../../hooks/useInstitutionMutations.ts';
import Input from '../../components/ui/Input/Input.tsx';
import Select from '../../components/ui/Select/Select.tsx';
import Switch from '../../components/ui/Swtich/Switch.tsx';
import Label from '../../components/ui/Label/Label.tsx';
import Button from '../../components/ui/Button/Button.tsx';
import { Search, LayoutGrid, List } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce.ts';
import { useProfessors } from '../../hooks/useProfessor.ts';
import { SEO } from '../../components/common/SEO.tsx';

const CourseListPage = () => {
  const navigate = useNavigate();

  const [isGridView, setIsGridView] = useState(true);

  // Get search params from URL (if needed in future)
  const [searchParams, setSearchParams] = useSearchParams();

  const filters: SearchCoursesParams = {
    q: searchParams.get('q') || '',
    courseTypeId: searchParams.get('courseTypeId') || '',
    institutionId: searchParams.get('institutionId') || '',
    professorId: searchParams.get('professorId') || '',
    isFree: searchParams.has('isFree')
      ? searchParams.get('isFree') === 'true'
      : undefined,
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: (searchParams.get('sortOrder') as 'ASC' | 'DESC') || 'DESC',
    limit: Number(searchParams.get('limit')) || 9,
    status: 'publicado',
  };

  const [searchTerm, setSearchTerm] = useState(filters.q || '');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useSearchCourses({
    ...filters,
    q: debouncedSearchTerm,
    status: 'publicado',
  });

  const { data: courseTypesData, isLoading: isLoadingTypes } = useCourseTypes(
    {}
  );
  const courseTypes = courseTypesData?.courseTypes || [];

  const { data: profeesorsData, isLoading: isLoadingProfessor } =
    useProfessors();
  const professors = profeesorsData || [];
  const { data: institutions, isLoading: isLoadingInstitutions } =
    useInstitutions();

  const courses = data?.pages.flatMap((page) => page.courses) || [];
  const totalCourses = data?.pages[0]?.total || 0;

  //Thi function handles changes in filters and updates the URL search params accordingly
  const handleFilterChange = (
    key: keyof SearchCoursesParams,
    value: string | boolean | undefined | number
  ) => {
    setSearchParams(
      (prevParams) => {
        // Delete the param if the value is undefined, null or empty string
        if (value === undefined || value === null || value === '') {
          prevParams.delete(key);
        } else {
          prevParams.set(key, String(value));
        }
        return prevParams;
      },
      { replace: true }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4">
      <SEO 
        title="Explora Nuestros Cursos Online"
        description="Navega por nuestro catálogo de cursos en programación, diseño, marketing y más. Filtra por categoría, precio o profesor y comienza a aprender hoy."
        keywords="catálogo de cursos, cursos programación, cursos diseño, aprender online, buscar cursos"
      />
      <div className="container mx-auto max-w-7xl pt-24 pb-8">
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-2">
            Explorar Cursos
          </h1>
          <p className="text-lg text-slate-600">
            Encuentra el curso perfecto para ti entre {totalCourses} opciones.
          </p>
        </div>

        <div className="flex justify-end mb-4">
          <div className="hidden md:inline-flex bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-1">
            <Button
              variant={!isGridView ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setIsGridView(false)}
              className="rounded-lg"
              aria-label="Vista de lista"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={isGridView ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setIsGridView(true)}
              className="rounded-lg"
              aria-label="Vista de grilla"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mb-8 p-4 bg-white/80 backdrop-blur-sm rounded-lg shadow-md space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              id="search-q"
              label="Buscar"
              icon={<Search size={16} />}
              placeholder="Nombre, instructor, institución..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select
              id="course-type-filter"
              label="Categoría"
              value={filters.courseTypeId || ''}
              onChange={(e) =>
                handleFilterChange('courseTypeId', e.target.value)
              }
              disabled={isLoadingTypes}
            >
              <option value="">Todas las categorías</option>
              {courseTypes?.map((ct) => (
                <option key={ct.id} value={ct.id}>
                  {ct.name}
                </option>
              ))}
            </Select>
            <Select
              id="institution-filter"
              label="Institución"
              value={filters.institutionId || ''}
              onChange={(e) =>
                handleFilterChange('institutionId', e.target.value)
              }
              disabled={isLoadingInstitutions}
            >
              <option value="">Todas las instituciones</option>
              {institutions?.map((inst) => (
                <option
                  key={inst.institutionId || inst.id}
                  value={inst.institutionId || inst.id}
                >
                  {inst.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <Select
              id="sort-by-filter"
              label="Ordenar por"
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-');

                setSearchParams(
                  (prev) => {
                    prev.set('sortBy', sortBy);
                    prev.set('sortOrder', sortOrder);
                    return prev;
                  },
                  { replace: true }
                );
              }}
            >
              <option value="createdAt-DESC">Más nuevos</option>
              <option value="name-ASC">Nombre (A-Z)</option>
              <option value="priceInCents-ASC">Precio (Menor a mayor)</option>
              <option value="priceInCents-DESC">Precio (Mayor a menor)</option>
            </Select>

            <Select
              id="proffesor-filter"
              label="Profesores"
              value={filters.professorId || ''}
              onChange={(e) =>
                handleFilterChange('professorId', e.target.value)
              }
              disabled={isLoadingProfessor}
            >
              <option value="">Todos los profesores</option>
              {professors.map((professor) => (
                <option key={professor.id} value={professor.id}>
                  {professor.fullName}
                </option>
              ))}
            </Select>

            <div className="flex items-center h-full pb-2">
              <div className="flex items-center gap-3">
                <Switch
                  id="is-free-filter"
                  checked={filters.isFree === true}
                  onChange={(e) =>
                    handleFilterChange(
                      'isFree',
                      e.target.checked ? true : undefined
                    )
                  }
                />
                <Label htmlFor="is-free-filter">Solo cursos gratuitos</Label>
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <p className="text-center text-slate-600 py-10">Cargando cursos...</p>
        ) : isError ? (
          <p className="text-center text-red-600 py-10">
            Error: {error?.message}
          </p>
        ) : (
          <>
            <div
              className={
                isGridView
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              }
            >
              {courses.length > 0 ? (
                courses.map((course) =>
                  isGridView ? (
                    <CoursePreviewCard
                      key={course.id}
                      course={course}
                      onViewMore={() => navigate(`/courses/${course.id}`)}
                    />
                  ) : (
                    <CardList
                      key={course.id}
                      course={course}
                      onViewMore={() => navigate(`/courses/${course.id}`)}
                    />
                  )
                )
              ) : (
                <div className="col-span-full text-center text-slate-600 text-lg py-10">
                  <p>No se encontraron cursos con los filtros aplicados.</p>
                </div>
              )}
            </div>

            <div className="mt-8 text-center">
              {hasNextPage && (
                <Button
                  onClick={() => fetchNextPage()}
                  isLoading={isFetchingNextPage}
                  disabled={!hasNextPage || isFetchingNextPage}
                  variant="outline"
                  size="lg"
                >
                  {isFetchingNextPage ? 'Cargando más...' : 'Cargar más cursos'}
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CourseListPage;
