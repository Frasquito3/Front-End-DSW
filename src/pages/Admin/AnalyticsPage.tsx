import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../../components/ui/Card/Card';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Users, DollarSign, BookOpen, TrendingUp, Award } from 'lucide-react';
import { useAdminAnalytics } from '../../hooks/useAdmin';
import { formatCurrency } from '../../lib/currency';

export default function AnalyticsPage() {
  const { data: analytics, isLoading, isError } = useAdminAnalytics(6);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando analíticas...</p>
        </div>
      </div>
    );
  }

  if (isError || !analytics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-800 font-semibold">
            Error al cargar las analíticas
          </p>
          <p className="text-red-600 text-sm mt-2">
            Por favor, intenta recargar la página
          </p>
        </div>
      </div>
    );
  }

  // Preparar datos para gráficos
  const userGrowthData = analytics.userGrowth.map((item) => ({
    month: new Date(item.month + '-01').toLocaleDateString('es-AR', {
      month: 'short',
    }),
    Estudiantes: item.newStudents,
    Profesores: item.newProfessors,
  }));

  const revenueData = analytics.revenueHistory.map((item) => ({
    month: new Date(item.month + '-01').toLocaleDateString('es-AR', {
      month: 'short',
    }),
    'Ingresos Totales': item.totalEarningsInCents / 100,
    'Ingresos Plataforma (3%)': item.platformEarningsInCents / 100,
    'Ingresos Profesores (97%)': item.professorsEarningsInCents / 100,
  }));

  const courseStatusData = [
    {
      name: 'Publicados',
      value: analytics.courseStats.byStatus.publicado,
      color: '#10b981',
    },
    {
      name: 'En Desarrollo',
      value: analytics.courseStats.byStatus['en-desarrollo'],
      color: '#f59e0b',
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-slate-50/100 px-4">
      <div className="container mx-auto max-w-7xl space-y-6 pt-24 pb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Estadísticas y Métricas
          </h1>
          <p className="text-slate-600">
            Panel de análisis y rendimiento de la plataforma.
          </p>
        </div>

        {/* Métricas Principales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Estudiantes Activos
              </CardTitle>
              <Users className="w-5 h-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">
                {analytics.totalStudents.toLocaleString('es-AR')}
              </div>
              <p
                className={`text-xs mt-1 ${
                  analytics.growth.studentsGrowthPercentage >= 0
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {analytics.growth.studentsGrowthPercentage >= 0 ? '+' : ''}
                {analytics.growth.studentsGrowthPercentage.toFixed(1)}% este mes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Profesores Activos
              </CardTitle>
              <Award className="w-5 h-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">
                {analytics.totalProfessors.toLocaleString('es-AR')}
              </div>
              <p
                className={`text-xs mt-1 ${
                  analytics.growth.professorsGrowthPercentage >= 0
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {analytics.growth.professorsGrowthPercentage >= 0 ? '+' : ''}
                {analytics.growth.professorsGrowthPercentage.toFixed(1)}% este
                mes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Cursos Totales
              </CardTitle>
              <BookOpen className="w-5 h-5 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">
                {analytics.totalCourses.toLocaleString('es-AR')}
              </div>
              <p className="text-xs text-slate-600 mt-1">
                {analytics.courseStats.byStatus.publicado} publicados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Ingresos Plataforma
              </CardTitle>
              <DollarSign className="w-5 h-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">
                {formatCurrency(analytics.platformEarningsInCents)}
              </div>
              <p
                className={`text-xs mt-1 ${
                  analytics.growth.revenueGrowthPercentage >= 0
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {analytics.growth.revenueGrowthPercentage >= 0 ? '+' : ''}
                {analytics.growth.revenueGrowthPercentage.toFixed(1)}% este mes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-500" />
                Crecimiento de Usuarios
              </CardTitle>
              <CardDescription>
                Nuevos usuarios por mes (últimos 6 meses)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Estudiantes" fill="#3b82f6" />
                  <Bar dataKey="Profesores" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-green-500" />
                Ingresos Mensuales
              </CardTitle>
              <CardDescription>
                Evolución de ingresos (últimos 6 meses)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) =>
                      `$${Number(value).toLocaleString('es-AR', {
                        minimumFractionDigits: 2,
                      })}`
                    }
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="Ingresos Plataforma (3%)"
                    stroke="#10b981"
                    strokeWidth={3}
                  />
                  <Line
                    type="monotone"
                    dataKey="Ingresos Totales"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Estado de Cursos y Top Rankings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Distribución de Cursos por Estado</CardTitle>
              <CardDescription>
                Estado actual de todos los cursos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={courseStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) =>
                      `${entry.name}: ${(entry.percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {courseStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Cursos Gratuitos:</span>
                  <span className="font-medium">
                    {analytics.courseStats.freeCourses}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Cursos de Pago:</span>
                  <span className="font-medium">
                    {analytics.courseStats.paidCourses}
                  </span>
                </div>
                {analytics.courseStats.averagePriceInCents && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Precio Promedio:</span>
                    <span className="font-medium">
                      {formatCurrency(
                        analytics.courseStats.averagePriceInCents
                      )}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top 5 Cursos Más Vendidos</CardTitle>
              <CardDescription>Cursos con más ventas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topCourses.map((course, index) => (
                  <div
                    key={course.courseId}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-sm">
                          #{index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">
                          {course.courseName}
                        </p>
                        <p className="text-sm text-slate-600">
                          Por {course.professorName}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-800">
                        {course.salesCount} ventas
                      </p>
                      <p className="text-sm text-green-600">
                        {formatCurrency(course.totalEarningsInCents)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Profesores */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
              Top 5 Profesores Más Exitosos
            </CardTitle>
            <CardDescription>Profesores con mayores ingresos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 text-sm font-medium text-slate-600">
                      Posición
                    </th>
                    <th className="text-left p-3 text-sm font-medium text-slate-600">
                      Profesor
                    </th>
                    <th className="text-center p-3 text-sm font-medium text-slate-600">
                      Cursos
                    </th>
                    <th className="text-center p-3 text-sm font-medium text-slate-600">
                      Estudiantes
                    </th>
                    <th className="text-right p-3 text-sm font-medium text-slate-600">
                      Ganancias (97%)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.topProfessors.map((professor, index) => (
                    <tr
                      key={professor.professorId}
                      className="border-b hover:bg-slate-50"
                    >
                      <td className="p-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-bold text-sm">
                            #{index + 1}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 font-medium text-slate-800">
                        {professor.professorName}
                      </td>
                      <td className="p-3 text-center text-slate-600">
                        {professor.coursesCount}
                      </td>
                      <td className="p-3 text-center text-slate-600">
                        {professor.totalStudents.toLocaleString('es-AR')}
                      </td>
                      <td className="p-3 text-right font-bold text-green-600">
                        {formatCurrency(professor.totalEarningsInCents)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Actividad Reciente */}
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>
              Resumen de actividad reciente en la plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {analytics.recentActivity.newStudentsToday}
                </p>
                <p className="text-sm text-slate-600 mt-1">Estudiantes hoy</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {analytics.recentActivity.newProfessorsToday}
                </p>
                <p className="text-sm text-slate-600 mt-1">Profesores hoy</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">
                  {analytics.recentActivity.salesToday}
                </p>
                <p className="text-sm text-slate-600 mt-1">Ventas hoy</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">
                  {analytics.recentActivity.newCoursesThisWeek}
                </p>
                <p className="text-sm text-slate-600 mt-1">
                  Cursos esta semana
                </p>
              </div>
              <div className="text-center p-4 bg-pink-50 rounded-lg">
                <p className="text-2xl font-bold text-pink-600">
                  {analytics.recentActivity.newEnrollmentsToday}
                </p>
                <p className="text-sm text-slate-600 mt-1">Inscripciones hoy</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
