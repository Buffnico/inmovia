import React, { useEffect, useState } from "react";

type DocumentPreviewModalProps = {
    isOpen: boolean;
    onClose: () => void;
    /** URL relativa al backend, por ejemplo: "/api/documents/123/preview" */
    previewUrl: string;
    /** Nombre del archivo, usado para detectar extensión y para la descarga */
    fileName?: string;
};

const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
    isOpen,
    onClose,
    previewUrl,
    fileName = "documento",
}) => {
    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    const [mimeType, setMimeType] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen || !previewUrl) return;

        let cancelled = false;
        let currentBlobUrl: string | null = null;
        const controller = new AbortController();

        const load = async () => {
            try {
                setIsLoading(true);
                setError(null);
                setBlobUrl(null);
                setMimeType(null);

                const token = localStorage.getItem("token") || "";

                const res = await fetch(previewUrl, {
                    method: "GET",
                    headers: token
                        ? {
                            Authorization: `Bearer ${token}`,
                        }
                        : {},
                    signal: controller.signal,
                });

                if (!res.ok) {
                    if (res.status === 404) {
                        throw new Error("Archivo no encontrado.");
                    }
                    if (res.status === 401 || res.status === 403) {
                        throw new Error(
                            "No tenés permisos o la sesión expiró. Volvé a iniciar sesión."
                        );
                    }
                    // Intentar leer mensaje del backend
                    let msg = "Error al cargar la vista previa.";
                    try {
                        const data = await res.json();
                        if (data?.message) msg = data.message;
                    } catch {
                        // ignorar
                    }
                    throw new Error(msg);
                }

                const ct = res.headers.get("Content-Type") || "";
                const blob = await res.blob();
                if (cancelled) return;

                currentBlobUrl = URL.createObjectURL(blob);
                setBlobUrl(currentBlobUrl);
                setMimeType(ct || null);
            } catch (err: any) {
                if (cancelled) return;
                setError(err?.message || "Error al cargar la vista previa.");
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        };

        load();

        return () => {
            cancelled = true;
            controller.abort();
            if (currentBlobUrl) {
                URL.revokeObjectURL(currentBlobUrl);
            }
        };
    }, [isOpen, previewUrl]);

    if (!isOpen) return null;

    const lowerName = fileName.toLowerCase();

    // Prioritize mimeType for PDF detection because backend might send PDF even if extension is .docx
    const isPdf = mimeType?.includes("pdf");

    const isImage =
        (mimeType && mimeType.startsWith("image/")) ||
        /\.(png|jpe?g|gif|webp)$/i.test(lowerName);

    // Only consider it DOCX if it's NOT a PDF (meaning conversion failed or backend sent docx)
    const isDocx = !isPdf && (
        mimeType?.includes(
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) || lowerName.endsWith(".docx")
    );

    const handleDownload = () => {
        if (!blobUrl) return;
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div className="modal-backdrop">
            <div className="modal">
                <div className="modal-header">
                    <h2>Vista previa</h2>
                    <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={onClose}
                    >
                        ✕
                    </button>
                </div>

                <div className="modal-body" style={{ minHeight: "60vh" }}>
                    {isLoading && <p>Cargando vista previa...</p>}

                    {!isLoading && error && (
                        <div className="alert alert-error">
                            <p>{error}</p>
                        </div>
                    )}

                    {!isLoading && !error && blobUrl && (
                        <>
                            {isPdf && (
                                <object
                                    data={blobUrl}
                                    type="application/pdf"
                                    style={{
                                        width: "100%",
                                        height: "70vh",
                                        border: "none",
                                    }}
                                >
                                    <p>
                                        No se pudo mostrar el PDF.{" "}
                                        <button
                                            className="btn"
                                            type="button"
                                            onClick={handleDownload}
                                        >
                                            Descargar PDF
                                        </button>
                                    </p>
                                </object>
                            )}

                            {isImage && (
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        maxHeight: "70vh",
                                    }}
                                >
                                    <img
                                        src={blobUrl}
                                        alt={fileName}
                                        style={{
                                            maxWidth: "100%",
                                            maxHeight: "70vh",
                                            objectFit: "contain",
                                        }}
                                    />
                                </div>
                            )}

                            {isDocx && (
                                <div>
                                    <p>
                                        Este documento es un archivo de Word (.docx). No
                                        se puede mostrar una vista previa, pero podés
                                        descargarlo.
                                    </p>
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={handleDownload}
                                    >
                                        Descargar documento
                                    </button>
                                </div>
                            )}

                            {!isPdf && !isImage && !isDocx && (
                                <div>
                                    <p>
                                        No hay vista previa disponible para este tipo de
                                        archivo, pero podés descargarlo.
                                    </p>
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={handleDownload}
                                    >
                                        Descargar archivo
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="modal-footer">
                    <button
                        type="button"
                        className="btn"
                        onClick={onClose}
                    >
                        Cerrar
                    </button>
                </div>
            </div>
            <style>{`
                .modal-backdrop {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.5);
                    display: flex; align-items: center; justify-content: center;
                    z-index: 1000;
                }
                .modal {
                    background: white; padding: 1.5rem; border-radius: 8px;
                    width: 90%; max-width: 900px;
                    max-height: 90vh; overflow-y: auto;
                    display: flex; flex-direction: column;
                }
                .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
                .modal-footer { margin-top: 1rem; display: flex; justify-content: flex-end; }
                .btn-ghost { background: none; border: none; font-size: 1.5rem; cursor: pointer; }
                .alert-error { color: #721c24; background-color: #f8d7da; border-color: #f5c6cb; padding: 1rem; border-radius: 4px; }
            `}</style>
        </div>
    );
};

export default DocumentPreviewModal;
