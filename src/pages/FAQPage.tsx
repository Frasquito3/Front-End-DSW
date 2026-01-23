import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card/Card';
import { SEO } from '../components/common/SEO';

const faqs = [
  {
    question: '¿Cómo me registro en la plataforma?',
    answer:
      'Puedes registrarte haciendo clic en el botón "Registrarse" en la esquina superior derecha. Completa el formulario con tus datos y elige si deseas registrarte como estudiante o profesor.',
  },
  {
    question: '¿Los cursos son gratuitos?',
    answer:
      'Ofrecemos tanto cursos gratuitos como de pago. Puedes filtrar por tipo de curso en nuestra página de cursos disponibles.',
  },
  {
    question: '¿Cómo me inscribo en un curso?',
    answer:
      'Una vez que encuentres un curso de tu interés, haz clic en él para ver los detalles. Si es gratuito, puedes inscribirte directamente. Si es de pago, deberás completar el proceso de pago.',
  },
  {
    question: '¿Cómo me convierto en profesor?',
    answer:
      'Debes registrarte como usuario y luego enviar una solicitud para convertirte en profesor desde tu perfil. Nuestro equipo revisará tu solicitud.',
  },
  {
    question: '¿Puedo retomar un curso donde lo dejé?',
    answer:
      'Sí, tu progreso se guarda automáticamente. Puedes retomar cualquier curso desde donde lo dejaste.',
  },
  {
    question: '¿Qué métodos de pago aceptan?',
    answer:
      'Aceptamos pagos con tarjetas de crédito y débito a través de nuestra plataforma segura de pagos.',
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-50 px-4">
      <SEO 
        title="Preguntas Frecuentes - Ayuda y Soporte"
        description="Encuentra respuestas a las preguntas más frecuentes sobre registro, cursos, inscripciones, métodos de pago y cómo convertirte en profesor en UpSkill."
        keywords="preguntas frecuentes, faq, ayuda, soporte, cursos online, inscripción, métodos de pago"
        schema={faqSchema}
      />
      <div className="container mx-auto max-w-7xl pt-24 pb-12">
        <h1 className="text-4xl font-bold text-slate-800 mb-4 text-center">
          Preguntas Frecuentes
        </h1>
        <p className="text-slate-600 text-center mb-8">
          Encuentra respuestas a las preguntas más comunes sobre nuestra
          plataforma
        </p>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-0">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <span className="font-semibold text-slate-800 pr-4">
                    {faq.question}
                  </span>
                  {openIndex === index ? (
                    <ChevronUp className="w-5 h-5 text-purple-600 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  )}
                </button>
                {openIndex === index && (
                  <div className="px-6 pb-4 text-slate-600">{faq.answer}</div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-slate-600 mb-4">
            ¿No encontraste lo que buscabas?
          </p>
          <a
            href="/contact"
            className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Contáctanos
          </a>
        </div>
      </div>
    </div>
  );
}
