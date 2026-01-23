import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/Card/Card';
import { SEO } from '../components/common/SEO';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-50 px-4">
      <SEO 
      title="Sobre Nosotros - Nuestra Misión y Visión"
      description="Conoce nuestra misión de democratizar el acceso a la educación de calidad. Conectamos estudiantes con profesores expertos en diversas áreas del conocimiento."
      keywords="sobre nosotros, plataforma educativa, misión, visión, educación online, about us, info"
      schema={{
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "UpSkill",
        "url": "https://up-skill.app",
        "logo": "https://up-skill.app/favicon.svg",
        "description": "Plataforma educativa líder en cursos online.",
        "sameAs": [
          "https://www.facebook.com/profile.php?id=61585158078001",
          "https://x.com/USkillteam57089",
          "https://www.instagram.com/upskill.ok/"
        ]
      }}
    />
      <div className="container mx-auto max-w-7xl pt-24 pb-12">
        <header>
          <h1 className="text-4xl font-bold text-slate-800 mb-8 text-center">
            Acerca de Nosotros
          </h1>
        </header>

        <article>
          <Card className="mb-6">
          <CardHeader>
            <CardTitle>Nuestra Misión</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700">
              Somos una plataforma educativa dedicada a democratizar el acceso a
              la educación de calidad. Nuestro objetivo es conectar a
              estudiantes con profesores expertos en diversas áreas del
              conocimiento.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Nuestra Visión</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700">
              Aspiramos a ser la plataforma de aprendizaje en línea líder, donde
              cada persona pueda desarrollar sus habilidades y alcanzar su
              máximo potencial a través de cursos accesibles y de alta calidad.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>¿Qué ofrecemos?</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-slate-700">
              <li>Cursos en diversas áreas del conocimiento</li>
              <li>Profesores calificados y expertos en sus campos</li>
              <li>Evaluaciones y seguimiento de progreso</li>
              <li>Comunidad de aprendizaje activa</li>
            </ul>
          </CardContent>
        </Card>
        </article>
      </div>
    </div>
  );
}
