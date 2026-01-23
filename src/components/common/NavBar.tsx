import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  BookOpen,
  LogIn,
  UserPlus,
  GraduationCap,
  Bell,
  Menu,
  X,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/DropdownMenu/DropdownMenu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/Avatar/Avatar.tsx';
import RoleBadge from '../ui/RoleBadge/RoleBadge.tsx';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button/Button';
import { AdminControls } from './navBar/AdminControls.tsx';
import { ProfessorControls } from './navBar/ProfessorControls.tsx';
import { toast } from 'react-hot-toast';
import { useMyAppeals } from '../../hooks/useAppeals';

const MobileNavLink = ({ to, onClick, children }: { to: string; onClick: () => void; children: React.ReactNode }) => (
    <Link to={to} onClick={onClick} className="flex items-center w-full p-3 text-base font-medium text-slate-700 rounded-lg hover:bg-slate-100">
        {children}
    </Link>
);

export function NavBar() {
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: appeals } = useMyAppeals();

  const activeLinkClasses = 'bg-gradient-to-r from-blue-500 to-green-500 text-white';
  const inactiveLinkClasses = 'text-slate-700 hover:bg-blue-50 hover:text-blue-600';

  const handleLogout = () => {
    try {
      logout();
      setIsMobileMenuOpen(false);
      setTimeout(() => navigate('/login'), 100);
    } catch (error) {
      console.error('Error durante el logout:', error);
      localStorage.clear();
      navigate('/login');
    }
  };

  const handleApplyClick = () => {
    if (!isAuthenticated) {
      toast('Debes iniciar sesión para poder aplicar.', {
        icon: '🔒',
      });
      navigate('/login');
    } else {
      if (appeals && appeals.length > 0) {
        navigate('/professor/applications');
      } else {
        navigate('/professor/apply');
      }
    }
    setIsMobileMenuOpen(false);
  }

  const handleLinkClick = (path: string) => {
    setIsMobileMenuOpen(false);
    if (location.pathname === path) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-blue-100 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        <Link 
          to="/" 
          onClick={() => handleLinkClick('/')} 
          className="flex items-center space-x-2"
          rel="home"
          aria-label="Ir a la página de inicio de UpSkill"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-green-400 rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" aria-hidden="true" />
          </div>
          <span className="text-xl font-poppins font-bold text-slate-800">UpSkill</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-2 md:space-x-4" aria-label="Menú principal">
          <Link
            to="/courses"
            className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center transition-colors ${
              location.pathname === '/courses' ? activeLinkClasses : inactiveLinkClasses
            }`}
          >
            <BookOpen className="w-4 h-4" aria-hidden="true" /> <span className="xl:inline ml-2">Cursos</span>
          </Link>
          
          {isLoading ? (
             <div className="flex items-center space-x-2" aria-hidden="true">
               <div className="h-8 w-20 bg-slate-200 rounded-lg animate-pulse"></div>
               <div className="h-8 w-24 bg-slate-200 rounded-lg animate-pulse"></div>
             </div>
          ) : isAuthenticated ? (
            <>
              {(user?.role === 'student' || user?.role === 'professor') && (
                <Link
                  to="/my-learning"
                  className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center transition-colors ${
                    location.pathname === '/my-learning' ? activeLinkClasses : inactiveLinkClasses
                  }`}
                >
                  <GraduationCap className="w-4 h-4" aria-hidden="true" />
                  <span className="xl:inline ml-2">Mis Aprendizajes</span>
                </Link>
              )}
              {user?.role === 'student' && (
                <Button variant="outline" size="sm" className="border-green-200 text-green-700 hover:bg-green-50" onClick={handleApplyClick}>
                  <GraduationCap className="w-4 h-4 mr-2" aria-hidden="true" />
                  <span>Quiero ser profesor</span>
                </Button>
              )}

              <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg">
                {user?.role === 'admin' && <AdminControls handleLinkClick={handleLinkClick} activeLinkClasses={activeLinkClasses} inactiveLinkClasses={inactiveLinkClasses} location={location} />}
                {user?.role === 'professor' && <ProfessorControls handleLinkClick={handleLinkClick} activeLinkClasses={activeLinkClasses} inactiveLinkClasses={inactiveLinkClasses} location={location} />}
              </div>

              <div className="flex items-center ml-4">
                <Button variant="ghost" size="sm" className="relative p-2" aria-label="Ver notificaciones">
                  <Bell className="w-5 h-5" aria-hidden="true" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 ml-2" aria-label="Menú de usuario">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user?.profile_picture} alt={user?.name} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-400 to-green-400 text-white font-bold">
                          {user?.name.charAt(0).toUpperCase()}{user?.surname.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <div className="p-2">
                      <p className="text-sm font-medium">{user?.name} {user?.surname}</p>
                      <p className="text-xs text-slate-500 mb-2">{user?.mail}</p>
                      {user && <RoleBadge role={user.role} />}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/profile')}><UserIcon className="mr-2 h-4 w-4" aria-hidden="true" /><span>Mi Perfil</span></DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600"><LogOut className="mr-2 h-4 w-4" aria-hidden="true" /><span>Cerrar sesión</span></DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" className="border-green-200 text-green-700 hover:bg-green-50" onClick={handleApplyClick}>
                <GraduationCap className="w-4 h-4 mr-2" aria-hidden="true" />
                <span>Quiero ser profesor</span>
              </Button>
              <Link to="/login" onClick={() => handleLinkClick('/login')} className="flex items-center text-slate-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg font-medium text-sm">
                <LogIn className="w-4 h-4 mr-2" aria-hidden="true" /> Login
              </Link>
              <Link to="/register" onClick={() => handleLinkClick('/register')} className="flex items-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm">
                <UserPlus className="w-4 h-4 mr-2" aria-hidden="true" /> Register
              </Link>
            </>
          )}
        </nav>

        <div className="md:hidden flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="p-2"
            aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
          </Button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <nav className="md:hidden fixed left-0 right-0 top-16 bg-white border-t border-blue-100 w-screen max-h-[calc(100vh-4rem)] overflow-y-auto overflow-x-hidden shadow-lg animate-fadeIn" aria-label="Menú móvil">
          <div className="px-4 pt-4 pb-6 space-y-2 w-full box-border">
            {isLoading ? ( <div className="text-center p-4">Cargando...</div> ) : isAuthenticated ? (
            <>
              <MobileNavLink to="/courses" onClick={() => setIsMobileMenuOpen(false)}>
                  <BookOpen className="w-5 h-5 mr-3 text-slate-500" aria-hidden="true" /> Cursos
              </MobileNavLink>
              
              {(user?.role === 'student' || user?.role === 'professor') && (
                <MobileNavLink to="/my-learning" onClick={() => setIsMobileMenuOpen(false)}>
                    <GraduationCap className="w-5 h-5 mr-3 text-slate-500" aria-hidden="true" /> Mis Aprendizajes
                </MobileNavLink>
              )}
              
              {user?.role === 'professor' && (
                  <div className="pt-2">
                     <p className="px-3 text-xs font-semibold text-slate-400 uppercase">Panel de Profesor</p>
                     <MobileNavLink to="/professor/dashboard/courses" onClick={() => setIsMobileMenuOpen(false)}>Mis Cursos</MobileNavLink>
                     <MobileNavLink to="/professor/dashboard/assessments" onClick={() => setIsMobileMenuOpen(false)}>Evaluaciones</MobileNavLink>
                     <MobileNavLink to="/professor/dashboard/analytics" onClick={() => setIsMobileMenuOpen(false)}>Analíticas</MobileNavLink>
                  </div>
              )}
              
              {user?.role === 'admin' && (
                 <div className="pt-2">
                     <p className="px-3 text-xs font-semibold text-slate-400 uppercase">Panel de Admin</p>
                     <MobileNavLink to="/admin/dashboard" onClick={() => setIsMobileMenuOpen(false)}>Dashboard</MobileNavLink>
                     <MobileNavLink to="/admin/analytics" onClick={() => setIsMobileMenuOpen(false)}>Analíticas</MobileNavLink>
                     <MobileNavLink to="/admin/courseTypes" onClick={() => setIsMobileMenuOpen(false)}>Tipos de Cursos</MobileNavLink>
                     <MobileNavLink to="/admin/appeals" onClick={() => setIsMobileMenuOpen(false)}>Solicitudes</MobileNavLink>
                 </div>
              )}
              
              <div className="pt-4 border-t mt-4 space-y-2">
                  <MobileNavLink to="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                      <UserIcon className="w-5 h-5 mr-3 text-slate-500" aria-hidden="true" /> Mi Perfil
                  </MobileNavLink>
                  {user?.role === 'student' && (
                    <Button variant="outline" size="md" fullWidth className="border-green-300 text-green-700 hover:bg-green-50" onClick={handleApplyClick}>
                        <GraduationCap className="w-4 h-4 mr-2" aria-hidden="true" />
                        Quiero ser profesor
                    </Button>
                  )}
                  <Button variant="outline" size="md" fullWidth className="text-red-600 border-red-300 hover:bg-red-50" onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" aria-hidden="true" />
                    Cerrar Sesión
                  </Button>
              </div>
            </>
          ) : (
            <>
              <MobileNavLink to="/courses" onClick={() => setIsMobileMenuOpen(false)}>
                  <BookOpen className="w-5 h-5 mr-3 text-slate-500" aria-hidden="true" /> Cursos
              </MobileNavLink>
              <div className="pt-4 border-t mt-4 space-y-3">
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="block">
                    <Button variant="outline" size="md" fullWidth>
                        <LogIn className="w-4 h-4 mr-2" aria-hidden="true" /> Iniciar Sesión
                    </Button>
                </Link>
                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="block">
                    <Button size="md" fullWidth>
                        <UserPlus className="w-4 h-4 mr-2" aria-hidden="true" /> Registrarse
                    </Button>
                </Link>
                 <Button variant="outline" size="md" fullWidth className="border-green-300 text-green-700 hover:bg-green-50" onClick={handleApplyClick}>
                    <GraduationCap className="w-4 h-4 mr-2" aria-hidden="true" />
                    Quiero ser profesor
                </Button>
              </div>
            </>
          )}
          </div>
        </nav>
      )}
    </header>
  );
}