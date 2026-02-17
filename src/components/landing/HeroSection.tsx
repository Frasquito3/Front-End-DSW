import { Link } from 'react-router-dom';
import { Search, Users } from 'lucide-react';
import { lazy, Suspense } from 'react';
import { useStudentCount } from '../../hooks/useStudent.ts'

const RobotModel = lazy(() => import('./RobotModel.tsx'))

export default function HeroSection() {

  const { data: studentCount, isLoading } = useStudentCount()
  const isCypress = typeof window !== 'undefined' && (window as any).Cypress

  return (
    <section className="pb-8 px-4 pt-28 md:pt-32">
      <div className="container mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6 text-center lg:text-left">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-poppins font-bold text-slate-800 leading-tight">
                Cursos Online - Aprende sin{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-green-500">
                  límites
                </span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Descubre miles de cursos online con certificaciones oficiales.
                Aprende a tu ritmo y transforma tu futuro.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                to="/courses"
                className="inline-flex items-center justify-center text-base bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
              >
                <Search className="w-5 h-5 mr-2" />
                Explorar Cursos
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-y-3 sm:gap-x-6 text-sm text-slate-600 pt-4">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-blue-500" />
                {isLoading ? (
                  <span className="w-24 h-4 bg-slate-200 rounded animate-pulse"></span>
                ) : (
                  <span>{studentCount?.toLocaleString('es-ES')} estudiantes</span>
                )}
              </div>
            </div>
          </div>

          {!isCypress && (
            <Suspense fallback={<div className="relative w-full h-[280px] sm:h-[350px] lg:h-[500px]" />}>
              <RobotModel />
            </Suspense>
          )}
          {isCypress && <div className="relative w-full h-[280px] sm:h-[350px] lg:h-[500px]" />}
        </div>
      </div>
    </section>
  );
}
