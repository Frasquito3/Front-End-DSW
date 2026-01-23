import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { valibotResolver } from '@hookform/resolvers/valibot';
import * as v from 'valibot';
import { User, Mail, Lock } from 'lucide-react';
import { useRegister } from '../../hooks/useAuthMutations';
import Button from '../../components/ui/Button/Button';
import Input from '../../components/ui/Input/Input';
import AuthCard from '../../components/layouts/AuthCard';
import { isAxiosError } from 'axios';
import { SEO } from '../../components/common/SEO.tsx';

const RegisterObjectSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1, 'El nombre es requerido.')),
  surname: v.pipe(v.string(), v.minLength(1, 'El apellido es requerido.')),
  mail: v.pipe(v.string(), v.email('Debe ser un email válido.')),
  password: v.pipe(
    v.string(),
    v.minLength(8, 'La contraseña debe tener al menos 8 caracteres.')
  ),
  confirmPassword: v.pipe(
    v.string(),
    v.minLength(1, 'Debes confirmar la contraseña.')
  ),
});

const RegisterSchema = v.pipe(
  RegisterObjectSchema,
  v.forward(
    v.partialCheck(
      [['password'], ['confirmPassword']],
      (input) => input.password === input.confirmPassword,
      'Las contraseñas no coinciden.'
    ),
    ['confirmPassword']
  )
);

type RegisterFormData = v.InferInput<typeof RegisterSchema>;

const RegisterPage = () => {
  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: valibotResolver(RegisterSchema),
    mode: 'onBlur',
  });

  const { mutate: registerUser, isPending, error } = useRegister();

  const onSubmit = (data: RegisterFormData) => {
    const payload = {
      name: data.name,
      surname: data.surname,
      mail: data.mail,
      password_plaintext: data.password,
    };
    registerUser(payload);
  };

  return (
    <>
      <SEO 
        title="Crear Cuenta"
        description="Únete a UpSkill y comienza a aprender sin límites. Regístrate como estudiante o profesor."
      />
      <AuthCard
        title="Crea tu Cuenta"
        description="Completa el formulario para unirte a nosotros"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
            <Input
              id="name"
              label="Nombre"
              type="text"
              placeholder="Darth"
              icon={<User className="h-5 w-5" />}
              autoComplete="given-name"
              {...formRegister('name')}
              error={errors.name?.message}
            />
            <Input
              id="surname"
              label="Apellido"
              type="text"
              placeholder="Vader"
              icon={<User className="h-5 w-5" />}
              autoComplete="family-name"
              {...formRegister('surname')}
              error={errors.surname?.message}
            />
          </div>

          <Input
            id="mail"
            label="Correo Electrónico"
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
            placeholder="••••••••••"
            icon={<Lock className="h-5 w-5" />}
            autoComplete="new-password"
            {...formRegister('password')}
            error={errors.password?.message}
          />

          <Input
            id="confirmPassword"
            label="Confirmar Contraseña"
            type="password"
            placeholder="••••••••••"
            icon={<Lock className="h-5 w-5" />}
            autoComplete="new-password"
            {...formRegister('confirmPassword')}
            error={errors.confirmPassword?.message}
          />

          {error && (
            <p className="text-sm text-red-500 text-center">
              {isAxiosError(error)
                ? error.response?.data?.errors || 'Credenciales incorrectas.'
                : 'Ocurrió un error inesperado.'}
            </p>
          )}

          <div className="pt-2">
            <Button
              type="submit"
              isLoading={isPending}
              variant="primary"
              size="lg"
              fullWidth
            >
              Registrarse
            </Button>
          </div>

          <div className="text-center text-sm text-slate-600">
            ¿Ya tienes una cuenta?{' '}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:underline"
            >
              Inicia sesión
            </Link>
          </div>
        </form>
      </AuthCard>
    </>
  );
};

export default RegisterPage;
