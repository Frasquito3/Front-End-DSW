import { FileText, Download, ExternalLink, Eye } from 'lucide-react';
import type { Material } from '../../types/entities';
import Button from '../ui/Button/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card/Card';
import { useState } from 'react';
import DocumentViewer from '../ui/DocumentViewer/DocumentViewer';

interface MaterialsListProps {
  materials: Material[];
}

/**
 * Componente para mostrar la lista de materiales de una unidad.
 * Permite visualizar y descargar materiales.
 */
export default function MaterialsList({ materials }: MaterialsListProps) {
  const [previewMaterial, setPreviewMaterial] = useState<Material | null>(null);

  if (materials.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <FileText className="w-5 h-5 mr-2 text-slate-600" />
            Materiales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 text-sm">
            No hay materiales disponibles para esta unidad.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getFileExtension = (url: string) => {
    const extension = url.split('.').pop()?.toLowerCase();
    return extension || '';
  };

  const getFileIcon = () => {
    // Aquí podrías agregar más íconos específicos por tipo
    return <FileText className="w-5 h-5 text-blue-600" />;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <FileText className="w-5 h-5 mr-2 text-blue-600" />
            Materiales ({materials.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {materials.map((material, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {getFileIcon()}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 truncate">
                      {material.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {getFileExtension(material.url).toUpperCase()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPreviewMaterial(material)}
                    title="Vista previa"
                    aria-label="Vista previa del material"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(material.url, '_blank', 'noopener,noreferrer')}
                    title="Abrir en nueva pestaña"
                    aria-label="Abrir material en nueva pestaña"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = material.url;
                      link.download = material.title;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    title="Descargar"
                    aria-label="Descargar material"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal de preview */}
      {previewMaterial && (
        <DocumentViewer
          url={previewMaterial.url}
          onClose={() => setPreviewMaterial(null)}
        />
      )}
    </>
  );
}
