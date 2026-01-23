import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useExistingEnrollment } from '../../hooks/useEnrollment';
import { useAuth } from '../../hooks/useAuth';
import { CheckCircle, Loader } from 'lucide-react';
import Button from '../../components/ui/Button/Button.tsx';
import { AxiosError } from 'axios';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const courseId = searchParams.get('course_id');

  const { data: enrollment, isSuccess } = useExistingEnrollment(
    user?.studentProfile?.id,
    courseId ?? undefined,
    {
      refetchInterval: 2000,
      retry: (failureCount, error: AxiosError) => {
        if (error.response?.status === 404 && failureCount < 10) {
          return true;
        }
        return false;
      },
    }
  );

  const [message, setMessage] = useState(
    'Verificando tu inscripción, por favor espera...'
  );

  useEffect(() => {
    if (isSuccess && enrollment) {
      setMessage('¡Inscripción confirmada! Serás redirigido en 3 segundos...');

      const timer = setTimeout(() => {
        if (courseId) {
          navigate(`/courses/learn/${courseId}`);
        } else {
          navigate('/courses');
        }
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isSuccess, enrollment, courseId, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4 pt-24">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        {!isSuccess && (
          <>
            <Loader className="w-16 h-16 mx-auto mb-4 text-blue-600 animate-spin" />
            <h1 className="text-2xl font-bold text-slate-800 mb-2">
              Finalizando Proceso...
            </h1>
            <p className="text-slate-600 mb-6">{message}</p>
          </>
        )}

        {isSuccess && (
          <>
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
            <h1 className="text-2xl font-bold text-slate-800 mb-2">
              ¡Compra exitosa!
            </h1>
            <p className="text-slate-600 mb-6">{message}</p>
            <div className="space-y-3">
              {courseId && (
                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => navigate(`/courses/learn/${courseId}`)}
                >
                  Ir al curso ahora
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
