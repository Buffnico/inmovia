import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import RedesInstagramPosts from "./RedesInstagramPosts";
import RedesInstagramComments from "./RedesInstagramComments";
import RedesInstagramMensajes from "./RedesInstagramMensajes";
import RedesInstagramPortadas from "./RedesInstagramPortadas";
import RedesInstagramConfig from "./RedesInstagramConfig";
import { getMyInstagramAccounts, InstagramAccount } from "../services/instagramService";
import "./RedesInstagram.css";

type Tab = 'posts' | 'comments' | 'messages' | 'covers' | 'config';

class RedesErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Redes Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-5 text-center">
          <h3 className="text-danger mb-3">⚠️ Error cargando Redes</h3>
          <p className="text-muted">Ocurrió un problema al mostrar este módulo.</p>
          <div className="alert alert-danger d-inline-block text-start" style={{ maxWidth: '600px' }}>
            <small style={{ fontFamily: 'monospace' }}>
              {this.state.error?.message || "Error desconocido"}
            </small>
          </div>
          <div className="mt-4">
            <button className="btn btn-outline-secondary" onClick={() => window.location.reload()}>
              Recargar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function Redes() {
  const [activeTab, setActiveTab] = useState<Tab>('posts');
  const [accounts, setAccounts] = useState<InstagramAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Fetch accounts on mount
  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      console.log("Redes: Loading accounts...");
      const data = await getMyInstagramAccounts();
      // Ensure data is an array
      const safeData = Array.isArray(data) ? data : [];
      setAccounts(safeData);

      if (safeData.length > 0 && !selectedAccountId) {
        setSelectedAccountId(safeData[0].id);
      }
    } catch (e) {
      console.error("Redes: Error loading accounts", e);
      setAccounts([]); // Fallback to empty array
    } finally {
      setLoading(false);
    }
  };

  const currentAccount = accounts.find(a => a.id === selectedAccountId) || accounts[0];

  const renderContent = () => {
    if (loading) return <div className="p-5 text-center text-muted">Cargando...</div>;

    if (activeTab === 'config') {
      return <RedesInstagramConfig accounts={accounts} onUpdate={loadAccounts} />;
    }

    if (!currentAccount) {
      return (
        <div className="d-flex flex-column align-items-center justify-content-center h-100 p-5 text-center">
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📱</div>
          <h3>No hay cuenta conectada</h3>
          <p className="text-muted mb-4" style={{ maxWidth: '400px' }}>
            Conecta tu cuenta de Instagram en la sección de Configuración para comenzar.
          </p>
          <button className="btn btn-primary" onClick={() => setActiveTab('config')}>
            Ir a Configuración
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case 'posts': return <RedesInstagramPosts account={currentAccount} />;
      case 'comments': return <RedesInstagramComments account={currentAccount} />;
      case 'messages': return <RedesInstagramMensajes account={currentAccount} />;
      case 'covers': return <RedesInstagramPortadas account={currentAccount} />;
      default: return null;
    }
  };

  return (
    <RedesErrorBoundary>
      <div className="redes-instagram-shell">
        <div className="redes-layout-card">
          {/* Left Mini-Sidebar */}
          <div className="redes-sidebar">
            <div className="redes-sidebar-header">
              <h2 className="redes-sidebar-title">
                <span>📸</span> Instagram
              </h2>
              {currentAccount && (
                <div className="small text-muted mt-1 text-truncate">
                  @{currentAccount.igUsername}
                </div>
              )}
            </div>

            <div className="redes-sidebar-nav">
              <button
                className={`redes-nav-item ${activeTab === 'posts' ? 'active' : ''}`}
                onClick={() => setActiveTab('posts')}
              >
                <span className="redes-nav-icon">🖼</span> Publicaciones
              </button>
              <button
                className={`redes-nav-item ${activeTab === 'comments' ? 'active' : ''}`}
                onClick={() => setActiveTab('comments')}
              >
                <span className="redes-nav-icon">💬</span> Comentarios
              </button>
              <button
                className={`redes-nav-item ${activeTab === 'messages' ? 'active' : ''}`}
                onClick={() => setActiveTab('messages')}
              >
                <span className="redes-nav-icon">✉️</span> Mensajes (DM)
              </button>
              <button
                className={`redes-nav-item ${activeTab === 'covers' ? 'active' : ''}`}
                onClick={() => setActiveTab('covers')}
              >
                <span className="redes-nav-icon">🎨</span> Portadas
              </button>

              <div className="my-2 border-top"></div>

              <button
                className={`redes-nav-item ${activeTab === 'config' ? 'active' : ''}`}
                onClick={() => setActiveTab('config')}
              >
                <span className="redes-nav-icon">⚙️</span> Configuración
              </button>
            </div>
          </div>

          {/* Right Main Content */}
          <div className="redes-main-content">
            {renderContent()}
          </div>
        </div>
      </div>
    </RedesErrorBoundary>
  );
}
