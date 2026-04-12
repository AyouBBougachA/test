import { useState, useEffect } from 'react';
import { equipmentApi } from '@/api/equipmentApi';
import { Modal, Button } from '@/components/ui';
import { Loader2, FileText, UploadCloud, Trash2, Download } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipmentId: number;
}

export default function DocumentModal({ isOpen, onClose, equipmentId }: DocumentModalProps) {
  const { user } = useAuthStore();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const data = await equipmentApi.getDocuments(equipmentId);
      setDocuments(data);
    } catch (err) {
      console.error('Failed to fetch documents', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchDocuments();
  }, [isOpen, equipmentId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      await equipmentApi.uploadDocument(equipmentId, file);
      fetchDocuments();
    } catch (err: any) {
      alert(`Error uploading document: ${err.response?.data?.message || 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (documentId: number, fileName: string) => {
    try {
      const blob = await equipmentApi.downloadDocument(documentId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed', err);
      alert('Failed to download file');
    }
  };

  const formatFileSize = (size?: number) => {
    if (size === undefined || size === null || isNaN(size)) return '0 KB';
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Equipment Documents" className="max-w-2xl">
      <div className="space-y-4">
        {(user?.roleName === 'ADMIN' || user?.roleName === 'MANAGER') && (
          <div className="flex items-center justify-between p-4 bg-muted/30 border border-dashed border-border rounded-xl">
            <div className="text-sm text-muted-foreground mr-4">
              <strong>Upload New Document</strong> (PDF, PNG, JPG)
            </div>
            <div>
              <input
                type="file"
                id="doc-upload"
                className="hidden"
                onChange={handleFileUpload}
                accept=".pdf,.png,.jpg,.jpeg"
              />
              <label 
                htmlFor="doc-upload" 
                className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                style={{ pointerEvents: uploading ? 'none' : 'auto', opacity: uploading ? 0.7 : 1 }}
              >
                {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UploadCloud className="w-4 h-4 mr-2" />}
                {uploading ? 'Uploading...' : 'Browse File'}
              </label>
            </div>
          </div>
        )}

        <div className="border border-border/50 rounded-xl overflow-hidden bg-card">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 border-b border-border/50 text-xs text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-3">Filename</th>
                <th className="px-4 py-3">Size</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                    <Loader2 className="w-5 h-5 mx-auto animate-spin opacity-50" />
                  </td>
                </tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                    <FileText className="w-6 h-6 mx-auto opacity-30 mb-2" />
                    No documents attached
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3 font-medium flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary opacity-70" />
                        {doc.documentName || doc.fileName || 'Untitled Document'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatFileSize(doc.fileSize)}</td>
                    <td className="px-4 py-3 text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-slate-500 hover:text-primary"
                          onClick={() => handleDownload(doc.id, doc.documentName || 'document')}
                        >
                            <Download className="w-4 h-4" />
                        </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
}
