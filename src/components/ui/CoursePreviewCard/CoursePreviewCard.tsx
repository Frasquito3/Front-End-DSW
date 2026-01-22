import * as React from 'react';
import { Users, BookOpen } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../Card/Card';
import Badge from '../Badge/Badge';
import Button from '../Button/Button';
import type { Course, CourseType } from '../../../types/entities';
import { cn } from '../../../lib/utils';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../../lib/currency';

interface BasePreviewCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hideButton?: boolean;
  hideInstructor?: boolean;
  onViewMore?: () => void;
}

interface CourseObjectProps extends BasePreviewCardProps {
  course: Course;
  name?: never;
  description?: never;
  imageUrl?: never;
  isFree?: never;
  price?: never;
  courseType?: never;
}

interface IndividualPropsPreview extends BasePreviewCardProps {
  course?: never;
  name: string;
  description: string;
  imageUrl: string;
  isFree: boolean;
  price: number;
  courseType?: Pick<CourseType, 'id' | 'name'>;
}

type CoursePreviewCardProps = CourseObjectProps | IndividualPropsPreview;

const CoursePreviewCard = React.forwardRef<
  HTMLDivElement,
  CoursePreviewCardProps
>(
  (
    {
      course,
      name,
      description,
      imageUrl,
      isFree,
      price,
      courseType,
      hideButton = false,
      hideInstructor = false,
      onViewMore,
      className,
      ...props
    },
    ref
  ) => {
    const displayName = course?.name ?? name;
    const displayDescription = course?.description ?? description;
    const displayImage = course?.imageUrl ?? imageUrl;
    const displayIsFree = course?.isFree ?? isFree;

    const displayPriceInCents =
      course?.priceInCents ??
      (price !== undefined ? Math.round(price * 100) : 0);
    
    const displayCourseType = course?.courseType ?? courseType;
    
    const displayAmountStudents = course?.studentsCount ?? course?.students?.length ?? 0;
    
    const displayAmountUnits = course?.unitsCount ?? course?.units?.length ?? 0;

    const instructorName = course?.professor 
      ? `${course.professor.name} ${course.professor.surname}`
      : 'Instructor no disponible';

    // SEO: Generar descripción completa para atributos semánticos
    const metaDescription = `${displayName}. Instructor: ${instructorName}. ${displayAmountStudents} estudiantes, ${displayAmountUnits} unidades. ${displayIsFree ? 'Curso gratis' : `Precio: ${formatCurrency(displayPriceInCents)}`}`;

    return (
      <Link to={course ? `/courses/${course.id}` : '#'} className="block" title={metaDescription}>
        <Card
          ref={ref}
          className={cn(
            'group transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm hover:shadow-lg cursor-pointer h-full flex flex-col m-2',
            className
          )}
          itemScope
          itemType="https://schema.org/Course"
          {...props}
        >
          <div className="relative overflow-hidden rounded-t-lg">
            <img
              src={displayImage || '/img/noImage.jpg'}
              alt={`Curso: ${displayName || 'sin nombre especificado'}. Categoría: ${displayCourseType?.name || 'sin categoría'}. Instructor: ${instructorName}`}
              title={`${displayName} - Aprende con ${instructorName} en la categoría ${displayCourseType?.name || 'sin especificar'}`}
              loading="lazy"
              decoding="async"
              fetchPriority="low"
              width="400"
              height="192"
              itemProp="image"
              className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="flex flex-col flex-grow">
            <CardHeader className="pb-2">
              <div className="flex items-center flex-wrap gap-2 mb-2">
                <Badge 
                  className="bg-blue-500 text-white border-blue-600"
                  itemProp="courseType"
                >
                  {displayCourseType?.name || 'Sin Categoría'}
                </Badge>
              </div>
              <CardTitle 
                className="text-lg font-semibold text-slate-800 line-clamp-2 group-hover:text-blue-600 transition-colors h-14"
                itemProp="name"
              >
                {displayName || 'Nombre del curso'}
              </CardTitle>
              <CardDescription 
                className="text-sm text-slate-600 min-h-[40px] line-clamp-2"
                itemProp="description"
              >
                {displayDescription ||
                  'La descripción del curso aparecerá aquí...'}
              </CardDescription>
              {course && !hideInstructor && (
                <div className="text-sm text-slate-500 mt-1 space-y-0.5">
                  <p>Por <span itemProp="instructor" itemScope itemType="https://schema.org/Person"><span itemProp="name">{instructorName}</span></span></p>
                  <p className="text-xs text-slate-400">
                    {course.professor?.institution?.name || '\u00A0'}
                  </p>
                </div>
              )}
            </CardHeader>
            <CardContent className="pt-2 mt-auto">
              <div className="space-y-3">
                {course && (
                  <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
                    <div className="flex items-center space-x-1" aria-label="Cantidad de estudiantes">
                      <Users className="w-3 h-3" aria-hidden="true" />
                      <span itemProp="numberOfStudents">
                        {displayAmountStudents}{' '}
                        {(displayAmountStudents ?? 0) === 1
                          ? 'Estudiante'
                          : 'Estudiantes'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1" aria-label="Cantidad de unidades">
                      <BookOpen className="w-3 h-3" aria-hidden="true" />
                      <span itemProp="numberOfUnits">
                        {displayAmountUnits}{' '}
                        {(displayAmountUnits ?? 0) === 1
                          ? 'Unidad'
                          : 'Unidades'}
                      </span>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="text-lg font-bold text-slate-800">
                    {displayIsFree ? (
                      <span className="text-green-600" itemProp="price" content="0">Gratis</span>
                    ) : (
                      <span itemProp="price" content={displayPriceInCents.toString()}>{formatCurrency(displayPriceInCents)}</span>
                    )}
                  </div>
                  {!hideButton && (
                    <Button 
                      variant="primary" 
                      size="sm"
                      aria-label={`Ver más detalles de ${displayName}`}
                      onClick={(e) => {
                        if (onViewMore) {
                          e.preventDefault(); 
                          onViewMore();
                        }
                      }}
                    >
                      Ver más
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      </Link>
    );
  }
);

CoursePreviewCard.displayName = 'CoursePreviewCard';

export default CoursePreviewCard;
