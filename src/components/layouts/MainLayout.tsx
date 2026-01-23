import { Outlet } from 'react-router-dom';
import { NavBar } from '../common/NavBar';
import { Footer } from '../common/Footer.tsx';
import { Helmet } from 'react-helmet-async';

const MainLayout = () => {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "Up-Skill",
    "url": "https://up-skill.app",
    "logo": "https://up-skill.app/favicon.svg",
    "description": "Plataforma de cursos online para aprender nuevas habilidades con profesores expertos",
    "sameAs": [
      "https://www.linkedin.com/company/upskill",
      "https://twitter.com/upskill"
    ]
  };

  return (
    <div className="flex flex-col min-h-screen">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-blue-600 text-white px-4 py-2 rounded-md">
        Saltar al contenido principal
      </a>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(organizationSchema)}
        </script>
      </Helmet>
      <NavBar />
      <main id="main-content" className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
