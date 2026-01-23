import { Link } from 'react-router-dom';
import { BookOpen, Mail, Facebook, X, Instagram, Youtube } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-800 text-white" itemScope itemType="http://schema.org/Organization">
      <meta itemProp="name" content="UpSkill" />
      <meta itemProp="url" content="https://up-skill.app" />
      <meta itemProp="logo" content="https://up-skill.app/favicon.svg" />
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4 text-center md:text-left">
            <Link
              to="/"
              className="flex items-center space-x-2 justify-center md:justify-start"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-green-400 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-poppins font-bold">UpSkill</span>
            </Link>
            <p className="text-slate-300 text-sm leading-relaxed">
              La plataforma líder en educación online. Aprende nuevas
              habilidades y avanza en tu carrera.
            </p>
          </div>

          <div className="space-y-4 text-center md:text-left">
            <h3 className="font-semibold text-lg">Enlaces</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/courses"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Explorar Cursos
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Sobre Nosotros
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Preguntas Frecuentes
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4 text-center md:text-left">
            <h3 className="font-semibold text-lg">Contacto</h3>
            <div className="space-y-3 text-sm flex flex-col items-center md:items-start">
              <a
                href="mailto:contacto.upskill@gmail.com"
                className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors"
                itemProp="email"
              >
                <Mail className="w-4 h-4" aria-hidden="true" />
                <span>contacto.upskill@gmail.com</span>
              </a>
            </div>
          </div>

          <div className="space-y-4 text-center md:text-left">
            <h3 className="font-semibold text-lg">Síguenos</h3>
            <div className="flex space-x-3 justify-center md:justify-start">
              <a
                href="https://web.facebook.com/profile.php?id=61585158078001"
                target="_blank"
                rel="noopener noreferrer nofollow"
                aria-label="Visítanos en Facebook"
                className="w-9 h-9 bg-slate-700 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://x.com/USkillteam57089"
                target="_blank"
                rel="noopener noreferrer nofollow"
                aria-label=" Visítanos en X"
                className="w-9 h-9 bg-slate-700 rounded-lg flex items-center justify-center hover:bg-black transition-colors"
              >
                <X className="w-5 h-5" />
              </a>
              <a
                href="https://www.instagram.com/upskill.ok/"
                target="_blank"
                rel="noopener noreferrer nofollow"
                aria-label="Visítanos en Instagram"
                className="w-9 h-9 bg-slate-700 rounded-lg flex items-center justify-center hover:bg-pink-600 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://www.youtube.com/channel/UCE4d4pz64jJRghnEEdqiDYA"
                target="_blank"
                rel="noopener noreferrer nofollow"
                aria-label="Visítanos en YouTube"
                className="w-9 h-9 bg-slate-700 rounded-lg flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-700 mt-8 pt-8 text-center">
          <p className="text-slate-400 text-sm">
            &copy; {new Date().getFullYear()} UpSkill. Todos los derechos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
