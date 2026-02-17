import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMyAppeals } from '../../hooks/useAppeals';
import { Card } from '../../components/ui/Card/Card';
import StatusBadge from '../../components/ui/StatusBadge/StatusBadge';
import Button from '../../components/ui/Button/Button';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/Dialog/Dialog';
import DocumentViewer from '../../components/ui/DocumentViewer/DocumentViewer';
import {
  Calendar,
  Eye,
  GraduationCap,
  ExternalLink,
  Info,
  Plus,
} from 'lucide-react';
import type { Appeal } from '../../types/entities';

export default function ProfessorAppealStatusPage() {
  const { data: appeals, isLoading } = useMyAppeals();
  const [selectedAppeal, setSelectedAppeal] = useState<Appeal | null>(null);
  const [documentUrlToShow, setDocumentUrlToShow] = useState<string | null>(
    null,
  );
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando estado de solicitudes...</p>
        </div>
      </div>
    );
  }

  const sortedAppeals =
    appeals?.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    ) || [];

  const hasPendingAppeal = appeals?.some(
    (appeal) => appeal.state === 'pending',
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-12 px-4">
      <div className="container mx-auto max-w-7xl space-y-6 mt-8">
        {hasPendingAppeal && (
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3 items-start">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Solicitud en curso detectada</p>
              <p>
                Ya tienes una solicitud pendiente de revisión. Cuando sea
                procesada, recibirás una notificación.
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-slate-800">Mis Solicitudes</h1>

          {!hasPendingAppeal && (
            <Button
              onClick={() => navigate('/professor/apply')}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva Solicitud
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {sortedAppeals.map((appeal) => (
            <Card
              key={appeal.id}
              className="overflow-hidden hover:shadow-md transition-shadow border border-slate-200 bg-white"
            >
              <div className="p-5 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <StatusBadge status={appeal.state} />
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(appeal.date).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                      Especialización
                    </p>
                    <h4 className="font-semibold text-slate-800 text-lg leading-tight truncate">
                      {appeal.expertise}
                    </h4>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedAppeal(appeal)}
                  className="w-full sm:w-auto mt-2 sm:mt-0 flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Ver Detalles
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Dialog
        open={!!selectedAppeal}
        onOpenChange={() => setSelectedAppeal(null)}
      >
        {selectedAppeal && (
          <>
            <DialogHeader>
              <div className="flex items-center justify-center mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center shadow-sm">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <DialogTitle>Detalle de Solicitud</DialogTitle>
              <p className="text-xs text-slate-500 text-center mt-1">
                Enviada el {new Date(selectedAppeal.date).toLocaleDateString()}
              </p>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="flex justify-center">
                <StatusBadge status={selectedAppeal.state} />
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-4 text-sm">
                <div>
                  <h5 className="text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wide">
                    Área de Especialización
                  </h5>
                  <p className="text-slate-900 font-medium break-words">
                    {selectedAppeal.expertise}
                  </p>
                </div>

                <div>
                  <h5 className="text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wide">
                    Experiencia y Motivación
                  </h5>
                  <div className="text-slate-700 whitespace-pre-wrap leading-relaxed bg-white p-3 rounded border border-slate-200 break-words max-h-32 overflow-y-auto shadow-inner">
                    {selectedAppeal.experienceMotivation}
                  </div>
                </div>

                {selectedAppeal.documentUrl && (
                  <div className="pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setDocumentUrlToShow(selectedAppeal.documentUrl!)
                      }
                      className="w-full flex items-center justify-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50 h-8 text-xs"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Ver Documento Adjunto
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button
                onClick={() => setSelectedAppeal(null)}
                size="sm"
                className="w-full sm:w-auto"
              >
                Cerrar
              </Button>
            </div>
          </>
        )}
      </Dialog>

      {documentUrlToShow && (
        <DocumentViewer
          url={documentUrlToShow}
          onClose={() => setDocumentUrlToShow(null)}
        />
      )}
    </div>
  );
}
