import { useForm } from 'react-hook-form';
import { valibotResolver } from '@hookform/resolvers/valibot';
import * as v from 'valibot';
import { Link } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { useLogin } from '../../hooks/useAuthMutations.ts';
import Button from '../../components/ui/Button/Button';
import Input from '../../components/ui/Input/Input';
import AuthCard from '../../components/layouts/AuthCard';
import { isAxiosError } from 'axios';
import { SEO } from '../../components/common/SEO.tsx';

const LoginSchema = v.object({
  mail: v.pipe(v.string(), v.email('Debe ser un email válido.')),
  password: v.pipe(v.string(), v.minLength(1, 'La contraseña es requerida.')),
  rememberMe: v.boolean(),
});

type LoginFormData = v.InferInput<typeof LoginSchema>;

const LoginPage = () => {
  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: valibotResolver(LoginSchema),
  });

  const { mutate: login, isPending, error } = useLogin();

  const onSubmit = (data: LoginFormData) => {
    const payload = {
      mail: data.mail,
      password_plaintext: data.password,
      rememberMe: data.rememberMe,
    };
    login(payload);
  };

  return (
    <>
      <SEO 
        title="Iniciar Sesión"
        description="Accede a tu cuenta de UpSkill para continuar tu aprendizaje."
      />
      <AuthCard
        title="Iniciar Sesión"
        description="Accede a tu cuenta para continuar aprendiendo"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            id="mail"
            label="Correo electrónico"
            type="email"
            placeholder="tu@email.com"
            icon={<Mail className="h-5 w-5" />}
            autoComplete="email"
            {...formRegister('mail')}
            error={errors.mail?.message}
          />
          <Input
            id="password"
            label="Contraseña"
            type="password"
            placeholder="Tu contraseña"
            icon={<Lock className="h-5 w-5" />}
            autoComplete="current-password"
            {...formRegister('password')}
            error={errors.password?.message}
          />
          <div className="flex items-center justify-between text-sm pt-1">
            <div className="flex items-center gap-2">
              <input
                id="remember"
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500"
                {...formRegister('rememberMe')}
              />
              <label htmlFor="remember" className="text-slate-600 cursor-pointer">
                Recordarme
              </label>
            </div>
            <Link
              to="/forgot-password"
              className="font-medium text-blue-500 hover:underline text-right"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          {error && (
            <p className="text-sm text-red-500 text-center">
              {isAxiosError(error)
                ? error.response?.data?.errors || 'Credenciales incorrectas.'
                : 'Ocurrió un error inesperado.'}
            </p>
          )}

          <div className="pt-6">
            <Button
              type="submit"
              isLoading={isPending}
              variant="primary"
              size="lg"
              fullWidth
            >
              Iniciar Sesión
            </Button>
          </div>

          <div className="text-center text-sm text-slate-500 pt-6">
            ¿No tienes una cuenta?{' '}
            <Link
              to="/register"
              className="font-semibold text-blue-500 hover:underline"
            >
              Regístrate aquí
            </Link>
          </div>
        </form>
      </AuthCard>
    </>
  );
};

export default LoginPage;
