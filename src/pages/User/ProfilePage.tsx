import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { valibotResolver } from '@hookform/resolvers/valibot';
import * as v from 'valibot';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/Card/Card';
import Button from '../../components/ui/Button/Button';
import ProfileField from '../../components/ui/ProfileField/ProfileField';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../components/ui/Tabs/Tabs';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '../../components/ui/Avatar/Avatar';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Save,
  Edit3,
  Shield,
  Key,
  Camera,
  GraduationCap,
  FileClock,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useUpdateProfile } from '../../hooks/useUserMutations';
import { isAxiosError } from 'axios';
import RoleBadge from '../../components/ui/RoleBadge/RoleBadge';
import ProfessorProfileTab from './ProfessorProfileTab';
import StudentAppealsHistory from '../../components/student/StudentAppealsHistory';
import { SEO } from '../../components/common/SEO.tsx';

const ProfileSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1, 'El nombre es requerido.')),
  surname: v.pipe(v.string(), v.minLength(1, 'El apellido es requerido.')),
  mail: v.pipe(v.string(), v.email('Debe ser un email válido.')),
  phone: v.optional(v.string()),
  location: v.optional(v.string()),
  birthdate: v.optional(
    v.pipe(v.string(), v.isoDate('La fecha debe tener un formato YYYY-MM-DD.'))
  ),
});

type ProfileFormData = v.InferInput<typeof ProfileSchema>;

export default function ProfilePage() {
  const { user, isLoading: isUserLoading } = useAuth();
  const {
    mutate: updateProfile,
    isPending: isUpdating,
    error: updateError,
  } = useUpdateProfile();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ProfileFormData>({
    resolver: valibotResolver(ProfileSchema),
  });

  const formData = watch();

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        surname: user.surname,
        mail: user.mail,
        phone: user.phone || '',
        location: user.location || '',
        birthdate: user.birthdate
          ? new Date(user.birthdate).toISOString().split('T')[0]
          : '',
      });
      setImagePreview(user.profile_picture || null);
    }
  }, [user, reset]);

  const handleAvatarClick = () => {
    if (isEditing) fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: ProfileFormData) => {
    const payloadData = Object.fromEntries(
      Object.entries(data).filter(
        ([, value]) => value !== '' && value !== undefined
      )
    );

    updateProfile(
      { data: payloadData, profilePicture: imageFile },
      {
        onSuccess: () => {
          setIsEditing(false);
          setImageFile(null);
        },
      }
    );
  };

  const handlePasswordChange = () => {
    navigate('/forgot-password');
  };

  if (isUserLoading) return <p>Cargando perfil...</p>;
  if (!user) return <p>No se pudo cargar la información del usuario.</p>;

  const isProfessor = user.role === 'professor';
  const isAdmin = user.role === 'admin';

  const getGridColsClass = () => {
    if (isProfessor) return 'grid-cols-4';
    if (isAdmin) return 'grid-cols-2';
    return 'grid-cols-3';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4">
      <SEO title="Mi Perfil" description="Gestiona tu información personal en UpSkill." />
      <div className="container mx-auto max-w-7xl pt-24 pb-8">
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-2">
            Mi Perfil
          </h1>
          <p className="text-lg text-slate-600">
            Gestiona tu información personal y configuración de cuenta
          </p>
        </div>

        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList
            className={`grid w-full ${getGridColsClass()} bg-white/80 backdrop-blur-sm h-auto p-1 gap-1`}
          >
            <TabsTrigger value="personal">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline-block sm:ml-2">Personal</span>
            </TabsTrigger>

            {isProfessor && (
              <TabsTrigger value="instructor">
                <GraduationCap className="w-4 h-4" />
                <span className="hidden sm:inline-block sm:ml-2">
                  Instructor
                </span>
              </TabsTrigger>
            )}

            {!isAdmin && (
              <TabsTrigger value="appeals">
                <FileClock className="w-4 h-4" />
                <span className="hidden sm:inline-block sm:ml-2">
                  Solicitudes
                </span>
              </TabsTrigger>
            )}

            <TabsTrigger value="security">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline-block sm:ml-2">Seguridad</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5">
                    <CardTitle className="flex items-center space-x-2">
                      <User className="w-5 h-5 text-blue-600" />
                      <span>Información Personal</span>
                    </CardTitle>
                    <CardDescription>
                      Actualiza tu información personal y datos de contacto
                    </CardDescription>
                  </div>
                  {!isEditing && (
                    <Button onClick={() => setIsEditing(true)}>
                      <Edit3 className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="flex items-center space-x-4 sm:space-x-6">
                    <div className="relative flex-shrink-0">
                      <Avatar
                        className={`h-20 w-20 sm:h-24 sm:w-24 ${
                          isEditing ? 'cursor-pointer' : ''
                        }`}
                        onClick={handleAvatarClick}
                      >
                        <AvatarImage
                          src={imagePreview || undefined}
                          alt={user.name}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-blue-400 to-green-400 text-white text-3xl font-bold">
                          {user.name.charAt(0)}
                          {user.surname.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {isEditing && (
                        <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-white pointer-events-none">
                          <Camera className="w-4 h-4" />
                        </div>
                      )}
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-semibold text-slate-800 truncate">
                        {user.name} {user.surname}
                      </h3>
                      <p className="text-slate-600 mb-2 truncate">
                        {user.mail}
                      </p>
                      <RoleBadge role={user.role} />
                    </div>
                  </div>

                  <div className="pt-6 border-t">
                    <div className="grid md:grid-cols-2 gap-6">
                      <ProfileField
                        id="name"
                        label="Nombre"
                        isEditing={isEditing}
                        icon={<User className="h-4 w-4" />}
                        {...register('name')}
                        error={errors.name?.message}
                        value={formData.name}
                      />
                      <ProfileField
                        id="surname"
                        label="Apellido"
                        isEditing={isEditing}
                        icon={<User className="h-4 w-4" />}
                        {...register('surname')}
                        error={errors.surname?.message}
                        value={formData.surname}
                      />
                      <ProfileField
                        id="mail"
                        label="Correo Electrónico"
                        type="email"
                        isEditing={isEditing}
                        icon={<Mail className="h-4 w-4" />}
                        {...register('mail')}
                        error={errors.mail?.message}
                        value={formData.mail}
                      />
                      <ProfileField
                        id="phone"
                        label="Teléfono"
                        isEditing={isEditing}
                        icon={<Phone className="h-4 w-4" />}
                        {...register('phone')}
                        error={errors.phone?.message}
                        value={formData.phone}
                      />
                      <ProfileField
                        id="location"
                        label="Ubicación"
                        isEditing={isEditing}
                        icon={<MapPin className="h-4 w-4" />}
                        {...register('location')}
                        error={errors.location?.message}
                        value={formData.location}
                      />
                      <ProfileField
                        id="birthdate"
                        label="Fecha de Nacimiento"
                        type="date"
                        isEditing={isEditing}
                        icon={<Calendar className="h-4 w-4" />}
                        {...register('birthdate')}
                        error={errors.birthdate?.message}
                        value={formData.birthdate}
                      />
                    </div>
                  </div>
                  {updateError && (
                    <p className="text-sm text-red-500 text-center">
                      {isAxiosError(updateError)
                        ? updateError.response?.data?.errors?.mail ||
                          'No se pudo actualizar el perfil.'
                        : 'Ocurrió un error inesperado.'}
                    </p>
                  )}
                  {isEditing && (
                    <div className="flex justify-end space-x-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false);
                          reset();
                          setImagePreview(user.profile_picture || null);
                          setImageFile(null);
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        isLoading={isUpdating}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Guardar Cambios
                      </Button>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          {isProfessor && (
            <TabsContent value="instructor">
              <ProfessorProfileTab />
            </TabsContent>
          )}

          {!isAdmin && (
            <TabsContent value="appeals">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileClock className="w-5 h-5 text-blue-600" />
                    <span>Historial de Solicitudes</span>
                  </CardTitle>
                  <CardDescription>
                    Tus aplicaciones para convertirte en profesor y su estado
                    actual.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <StudentAppealsHistory />
                </CardContent>
              </Card>
            </TabsContent>
          )}

          <TabsContent value="security">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 mb-1">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <span>Seguridad de la Cuenta</span>
                </CardTitle>
                <CardDescription>
                  Gestiona la seguridad de tu cuenta y contraseña
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Key className="w-5 h-5 text-slate-600" />
                    <div>
                      <p className="font-medium text-slate-800">Contraseña</p>
                      <p className="text-sm text-slate-600">
                        Haz click para ir a la página de recuperación.
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="border-blue-200 text-blue-600 hover:bg-blue-50 bg-transparent"
                    onClick={handlePasswordChange}
                  >
                    Cambiar Contraseña
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
