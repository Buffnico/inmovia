import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// --- Mocks & Types ---

interface PropertyMock {
  id: string;
  title: string;
  address: string;
  price: string;
  images: string[]; // Array de imágenes
  features: string;
}

const MOCK_PROPERTIES: PropertyMock[] = [
  {
    id: "p1",
    title: "Departamento en Palermo Soho",
    address: "Gurruchaga 1234, CABA",
    price: "USD 180.000",
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1484154218962-a1c002085d2f?auto=format&fit=crop&w=800&q=80"
    ],
    features: "3 Ambientes • 85m² • Balcón",
  },
  {
    id: "p2",
    title: "Casa Moderna en Nordelta",
    address: "Barrio Los Castores, Tigre",
    price: "USD 450.000",
    images: [
      "https://images.unsplash.com/photo-1600596542815-22b8c36ec800?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80"
    ],
    features: "5 Ambientes • 220m² • Jardín",
  },
  {
    id: "p3",
    title: "PH Reciclado en Colegiales",
    address: "Zapiola 800, CABA",
    price: "USD 120.000",
    images: [
      "https://images.unsplash.com/photo-1556912173-3db996349126?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80"
    ],
    features: "2 Ambientes • 50m² • Terraza",
  },
];

const HASHTAG_SETS = {
  Venta: "#Inmobiliaria #Venta #Propiedades #RealEstate #TuHogar #Oportunidad #BienesRaices",
  Alquiler: "#Alquiler #Departamento #AlquilerTemporario #Vivienda #Inmuebles #Alquileres",
  Lujo: "#LuxuryRealEstate #PropiedadesDeLujo #Exclusivo #Premium #Lifestyle #DreamHome",
};

type ContentType = "feed" | "story";
type SealType = "none" | "vendido" | "reservado" | "nuevo" | "oportunidad";
type StoryTemplate = "minimal" | "elegant" | "bold";

// --- Componente Principal ---

export default function Redes() {
  // Estado
  const [selectedPropId, setSelectedPropId] = useState<string>(MOCK_PROPERTIES[0].id);
  const [contentType, setContentType] = useState<ContentType>("feed");
  const [activeSeal, setActiveSeal] = useState<SealType>("none");
  const [storyTemplate, setStoryTemplate] = useState<StoryTemplate>("minimal");

  // Selección de imágenes
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  // Copywriting
  const [generatedCopy, setGeneratedCopy] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copyTone, setCopyTone] = useState<"emotivo" | "tecnico" | "urgencia">("emotivo");

  // Computed
  const selectedProp = MOCK_PROPERTIES.find(p => p.id === selectedPropId) || MOCK_PROPERTIES[0];

  // Resetear selección al cambiar propiedad
  useEffect(() => {
    setSelectedImages([selectedProp.images[0]]);
  }, [selectedPropId]);

  // Handlers
  const handleImageSelect = (imgUrl: string) => {
    if (contentType === "story") {
      // Solo una imagen para story
      setSelectedImages([imgUrl]);
    } else {
      // Múltiples para feed
      if (selectedImages.includes(imgUrl)) {
        if (selectedImages.length > 1) {
          setSelectedImages(prev => prev.filter(i => i !== imgUrl));
        }
      } else {
        if (selectedImages.length < 10) {
          setSelectedImages(prev => [...prev, imgUrl]);
        }
      }
    }
  };

  const handleGenerateCopy = () => {
    setIsGenerating(true);
    setGeneratedCopy("");

    setTimeout(() => {
      let text = "";
      if (copyTone === "emotivo") {
        text = `✨ ¡Descubrí tu próximo hogar en ${selectedProp.address}! \n\nImaginá despertar cada mañana en este hermoso ${selectedProp.title.toLowerCase()}. Con ${selectedProp.features}, es el espacio ideal para crear nuevos recuerdos. \n\n📍 Ubicación privilegiada.\n💎 Precio: ${selectedProp.price}.\n\n¿Te gustaría visitarlo? Escribinos por DM para coordinar una visita. 👇`;
      } else if (copyTone === "tecnico") {
        text = `🏢 OPORTUNIDAD DE INVERSIÓN - ${selectedProp.title.toUpperCase()} \n\n📍 Ubicación: ${selectedProp.address}\n💰 Valor: ${selectedProp.price}\n📐 Características: ${selectedProp.features}\n\nPropiedad destacada por su excelente distribución y luminosidad. Ideal para vivienda o renta. \n\nConsultanos para más información técnica y planos.`;
      } else {
        text = `🔥 ¡NUEVO INGRESO! No te pierdas esta oportunidad en ${selectedProp.address}. \n\n${selectedProp.title} a un precio increíble: ${selectedProp.price}. \n\n⚡ ${selectedProp.features}. \n\n¡Se va rápido! Comentá "INFO" y te mandamos la ficha completa ya mismo. 🏃‍♂️💨`;
      }
      setGeneratedCopy(text);
      setIsGenerating(false);
    }, 1000);
  };

  const handleCopyHashtags = (setKey: keyof typeof HASHTAG_SETS) => {
    const tags = HASHTAG_SETS[setKey];
    setGeneratedCopy(prev => prev + "\n\n" + tags);
  };

  return (
    <div className="page-inner redes-page">
      <style>{`
        /* Estilos Locales Redes (Inmovia Style) */
        .redes-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          height: calc(100vh - 140px);
          min-height: 700px;
        }
        
        @media (max-width: 1024px) {
          .redes-layout {
            grid-template-columns: 1fr;
            height: auto;
          }
        }

        /* Panel Izquierdo (Controles) */
        .redes-controls {
          background: #ffffff;
          border-radius: 1.5rem;
          padding: 1.5rem;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.05);
          border: 1px solid rgba(226, 232, 240, 0.8);
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .control-section-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--inmovia-text-main);
          margin-bottom: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .control-row {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        /* Selector de Imágenes */
        .image-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.5rem;
        }
        .image-option {
          position: relative;
          aspect-ratio: 1;
          border-radius: 0.75rem;
          overflow: hidden;
          cursor: pointer;
          border: 2px solid transparent;
          transition: all 0.2s;
        }
        .image-option img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .image-option.selected {
          border-color: var(--inmovia-primary);
          box-shadow: 0 0 0 2px var(--inmovia-primary-soft);
        }
        .image-option-badge {
          position: absolute;
          top: 4px;
          right: 4px;
          background: var(--inmovia-primary);
          color: white;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          font-size: 0.7rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }

        /* Inputs y Selects */
        .redes-select {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 999px;
          border: 1px solid rgba(203, 213, 225, 0.8);
          background: #f8fafc;
          font-size: 0.9rem;
          outline: none;
          transition: all 0.2s;
        }
        .redes-select:focus {
          border-color: var(--inmovia-primary);
          box-shadow: 0 0 0 3px var(--inmovia-primary-soft);
          background: #fff;
        }

        /* Botones Toggle (Chips) */
        .toggle-chip {
          padding: 0.5rem 1rem;
          border-radius: 999px;
          border: 1px solid rgba(203, 213, 225, 0.8);
          background: #fff;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
          color: var(--inmovia-text-muted);
        }
        .toggle-chip:hover {
          background: #f1f5f9;
        }
        .toggle-chip.active {
          background: #3b82f6 !important; /* var(--primary) forced */
          color: #ffffff !important;
          border-color: #3b82f6 !important;
          box-shadow: 0 4px 10px rgba(59, 130, 246, 0.4);
          font-weight: 600;
        }

        /* Botón Generar */
        .btn-generate {
          width: 100%;
          padding: 0.8rem;
          border-radius: 999px;
          background: linear-gradient(135deg, var(--inmovia-primary) 0%, var(--inmovia-primary-strong) 100%);
          color: white;
          border: none;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        .btn-generate:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        }
        .btn-generate:disabled {
          opacity: 0.7;
          cursor: wait;
        }

        /* Area de Copy */
        .copy-area {
          width: 100%;
          min-height: 120px;
          padding: 1rem;
          border-radius: 1rem;
          border: 1px solid rgba(203, 213, 225, 0.8);
          background: #f8fafc;
          font-family: inherit;
          font-size: 0.9rem;
          resize: vertical;
          outline: none;
          transition: all 0.2s;
        }
        .copy-area:focus {
          background: #fff;
          border-color: var(--inmovia-primary);
        }

        /* Panel Derecho (Preview) */
        .redes-preview-pane {
          background: #f1f5f9;
          border-radius: 1.5rem;
          border: 1px solid rgba(226, 232, 240, 0.8);
          position: relative;
          overflow: hidden; /* El contenedor principal no scrollea, solo el inner */
          display: flex;
          flex-direction: column;
        }

        .preview-scroll-container {
          width: 100%;
          height: 100%;
          overflow-y: auto;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* --- INSTAGRAM FEED PREVIEW --- */
        .insta-card {
          width: 380px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          margin: auto; /* Centrado vertical si hay espacio */
          flex-shrink: 0;
          margin-bottom: 6rem; /* Espacio para el botón flotante */
        }
        .insta-header {
          padding: 10px 14px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .insta-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888);
          padding: 2px;
        }
        .insta-avatar-inner {
          width: 100%;
          height: 100%;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: bold;
          color: #333;
        }
        .insta-username {
          font-weight: 600;
          font-size: 14px;
          color: #262626;
        }
        .insta-image-container {
          width: 100%;
          aspect-ratio: 1; /* Cuadrado */
          position: relative;
          background: #fafafa;
        }
        .insta-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .insta-carousel-dots {
          position: absolute;
          bottom: 10px;
          left: 0;
          width: 100%;
          display: flex;
          justify-content: center;
          gap: 4px;
        }
        .insta-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(255,255,255,0.5);
        }
        .insta-dot.active {
          background: white;
        }
        .insta-actions {
          padding: 10px 14px;
          display: flex;
          gap: 16px;
        }
        .insta-icon {
          font-size: 24px;
          cursor: pointer;
        }
        .insta-caption-area {
          padding: 0 14px 14px;
          font-size: 14px;
          color: #262626;
          line-height: 1.4;
        }
        .insta-caption-username {
          font-weight: 600;
          margin-right: 6px;
        }

        /* --- STORY PREVIEW & TEMPLATES --- */
        .story-container {
          width: 320px;
          height: 568px; /* 9:16 */
          background: #000;
          border-radius: 12px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0,0,0,0.2);
          margin: auto; /* Centrado vertical */
          flex-shrink: 0;
          margin-bottom: 6rem;
        }
        .story-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        /* Template: Minimal */
        .tpl-minimal .story-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          padding: 2rem;
          background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
          color: white;
        }
        .tpl-minimal .story-price { font-size: 2rem; font-weight: 300; }
        .tpl-minimal .story-title { font-size: 1rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-top: 0.5rem; }
        
        /* Template: Elegant */
        .tpl-elegant .story-overlay {
          position: absolute;
          top: 2rem;
          left: 2rem;
          right: 2rem;
          bottom: 2rem;
          border: 1px solid rgba(255,255,255,0.6);
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 2rem;
          background: rgba(0,0,0,0.2);
        }
        .tpl-elegant .story-price { font-size: 2.5rem; font-family: serif; color: white; text-align: center; }
        .tpl-elegant .story-title { font-size: 1rem; color: white; text-align: center; font-family: serif; font-style: italic; margin-top: 0.5rem; }

        /* Template: Bold */
        .tpl-bold .story-overlay {
          position: absolute;
          bottom: 10%;
          left: 0;
          background: #000;
          color: white;
          padding: 1rem 2rem;
          width: 90%;
        }
        .tpl-bold .story-price { font-size: 2.2rem; font-weight: 900; color: #fbbf24; }
        .tpl-bold .story-title { font-size: 1.2rem; font-weight: 700; text-transform: uppercase; }

        /* Overlays / Sellos */
        .seal-overlay {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-15deg);
          border: 4px solid white;
          padding: 0.5rem 1.5rem;
          font-size: 1.5rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
          backdrop-filter: blur(4px);
          z-index: 10;
        }
        .seal-vendido { background: #ef4444; color: white; }
        .seal-reservado { background: #f59e0b; color: white; }
        .seal-nuevo { background: #3b82f6; color: white; transform: translate(-50%, -50%) rotate(0deg); top: 15%; }
        .seal-oportunidad { background: #10b981; color: white; transform: translate(-50%, -50%) rotate(0deg); bottom: 15%; top: auto; }

        /* Animación de carga */
        .generating-loader {
          display: inline-block;
          width: 1rem;
          height: 1rem;
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s ease-in-out infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

      `}</style>

      <div className="page-header">
        <div>
          <h1 className="page-title">Inmovia Social Studio</h1>
          <p className="page-subtitle">
            Creá contenido visual impactante y textos persuasivos para tus redes en segundos.
          </p>
        </div>
        <div className="page-actions">
          <Link to="/dashboard" className="btn btn-secondary">
            Volver al Dashboard
          </Link>
        </div>
      </div>

      <div className="redes-layout">
        {/* COLUMNA IZQUIERDA: CONTROLES */}
        <aside className="redes-controls">

          {/* 1. Propiedad */}
          <section>
            <div className="control-section-title">
              <span>🏠</span> Propiedad
            </div>
            <select
              className="redes-select"
              value={selectedPropId}
              onChange={(e) => setSelectedPropId(e.target.value)}
              style={{ marginBottom: '1rem' }}
            >
              {MOCK_PROPERTIES.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>

            <label className="filter-label" style={{ marginBottom: '0.5rem', display: 'block', fontSize: '0.85rem' }}>
              {contentType === 'feed' ? 'Seleccioná las fotos para el carrusel:' : 'Seleccioná la foto principal:'}
            </label>
            <div className="image-grid">
              {selectedProp.images.map((img, idx) => (
                <div
                  key={idx}
                  className={`image-option ${selectedImages.includes(img) ? 'selected' : ''}`}
                  onClick={() => handleImageSelect(img)}
                >
                  <img src={img} alt={`Foto ${idx + 1}`} />
                  {selectedImages.includes(img) && contentType === 'feed' && (
                    <div className="image-option-badge">
                      {selectedImages.indexOf(img) + 1}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* 2. Configuración Visual */}
          <section>
            <div className="control-section-title">
              <span>🎨</span> Diseño
            </div>
            <div className="control-row" style={{ marginBottom: '1rem' }}>
              <button
                className={`toggle-chip ${contentType === 'feed' ? 'active' : ''}`}
                onClick={() => setContentType('feed')}
              >
                Post (Feed)
              </button>
              <button
                className={`toggle-chip ${contentType === 'story' ? 'active' : ''}`}
                onClick={() => setContentType('story')}
              >
                Historia (Story)
              </button>
            </div>

            {/* Selector de Template (Solo Story) */}
            {contentType === 'story' && (
              <div style={{ marginBottom: '1rem' }}>
                <label className="filter-label" style={{ marginBottom: '0.5rem', display: 'block', fontSize: '0.85rem' }}>Estilo de Historia:</label>
                <div className="control-row">
                  <button className={`toggle-chip ${storyTemplate === 'minimal' ? 'active' : ''}`} onClick={() => setStoryTemplate('minimal')}>Minimal</button>
                  <button className={`toggle-chip ${storyTemplate === 'elegant' ? 'active' : ''}`} onClick={() => setStoryTemplate('elegant')}>Elegant</button>
                  <button className={`toggle-chip ${storyTemplate === 'bold' ? 'active' : ''}`} onClick={() => setStoryTemplate('bold')}>Bold</button>
                </div>
              </div>
            )}

            <label className="filter-label" style={{ marginBottom: '0.5rem', display: 'block', fontSize: '0.85rem' }}>Sellos / Overlays:</label>
            <div className="control-row">
              <button className={`toggle-chip ${activeSeal === 'none' ? 'active' : ''}`} onClick={() => setActiveSeal('none')}>Ninguno</button>
              <button className={`toggle-chip ${activeSeal === 'vendido' ? 'active' : ''}`} onClick={() => setActiveSeal('vendido')}>Vendido</button>
              <button className={`toggle-chip ${activeSeal === 'reservado' ? 'active' : ''}`} onClick={() => setActiveSeal('reservado')}>Reservado</button>
              <button className={`toggle-chip ${activeSeal === 'nuevo' ? 'active' : ''}`} onClick={() => setActiveSeal('nuevo')}>Nuevo</button>
              <button className={`toggle-chip ${activeSeal === 'oportunidad' ? 'active' : ''}`} onClick={() => setActiveSeal('oportunidad')}>Oportunidad</button>
            </div>
          </section>

          {/* 3. Copywriting (Ivo-t) */}
          <section>
            <div className="control-section-title">
              <span>🤖</span> Asistente de Texto (Ivo-t)
            </div>
            <div className="control-row" style={{ marginBottom: '0.75rem' }}>
              <button className={`toggle-chip ${copyTone === 'emotivo' ? 'active' : ''}`} onClick={() => setCopyTone('emotivo')}>Emotivo</button>
              <button className={`toggle-chip ${copyTone === 'tecnico' ? 'active' : ''}`} onClick={() => setCopyTone('tecnico')}>Técnico</button>
              <button className={`toggle-chip ${copyTone === 'urgencia' ? 'active' : ''}`} onClick={() => setCopyTone('urgencia')}>Urgencia</button>
            </div>

            <button
              className="btn-generate"
              onClick={handleGenerateCopy}
              disabled={isGenerating}
            >
              {isGenerating ? <span className="generating-loader" /> : '✨ Generar Copy con IA'}
            </button>

            <div style={{ marginTop: '1rem' }}>
              <textarea
                className="copy-area"
                placeholder="El texto generado aparecerá aquí..."
                value={generatedCopy}
                onChange={(e) => setGeneratedCopy(e.target.value)}
              />
            </div>
          </section>

          {/* 4. Hashtags */}
          <section>
            <div className="control-section-title">
              <span>🏷️</span> Hashtags Rápidos
            </div>
            <div className="control-row">
              {Object.keys(HASHTAG_SETS).map((key) => (
                <button
                  key={key}
                  className="toggle-chip"
                  onClick={() => handleCopyHashtags(key as keyof typeof HASHTAG_SETS)}
                >
                  + {key}
                </button>
              ))}
            </div>
          </section>

        </aside>

        {/* COLUMNA DERECHA: PREVIEW */}
        <main className="redes-preview-pane">
          <div className="preview-scroll-container">

            {/* MODO FEED: INSTAGRAM CARD */}
            {contentType === 'feed' && (
              <div className="insta-card">
                <div className="insta-header">
                  <div className="insta-avatar">
                    <div className="insta-avatar-inner">IO</div>
                  </div>
                  <div className="insta-username">inmovia.office</div>
                  <div style={{ marginLeft: 'auto' }}>...</div>
                </div>

                <div className="insta-image-container">
                  <img
                    src={selectedImages[0] || selectedProp.images[0]}
                    alt="Feed Preview"
                    className="insta-image"
                  />

                  {/* Sellos en Feed */}
                  {activeSeal !== 'none' && (
                    <div className={`seal-overlay seal-${activeSeal}`}>
                      {activeSeal}
                    </div>
                  )}

                  {/* Dots si hay múltiples imágenes */}
                  {selectedImages.length > 1 && (
                    <div className="insta-carousel-dots">
                      {selectedImages.map((_, idx) => (
                        <div key={idx} className={`insta-dot ${idx === 0 ? 'active' : ''}`} />
                      ))}
                    </div>
                  )}
                </div>

                <div className="insta-actions">
                  <span className="insta-icon">❤️</span>
                  <span className="insta-icon">💬</span>
                  <span className="insta-icon">🚀</span>
                </div>

                <div className="insta-caption-area">
                  <p>
                    <span className="insta-caption-username">inmovia.office</span>
                    {generatedCopy ? (
                      <span style={{ whiteSpace: 'pre-wrap' }}>{generatedCopy}</span>
                    ) : (
                      <span style={{ color: '#999', fontStyle: 'italic' }}>
                        (La descripción generada aparecerá aquí...)
                      </span>
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* MODO STORY: TEMPLATES */}
            {contentType === 'story' && (
              <div className={`story-container tpl-${storyTemplate}`}>
                <img
                  src={selectedImages[0] || selectedProp.images[0]}
                  alt="Story Preview"
                  className="story-image"
                />

                {/* Sellos en Story */}
                {activeSeal !== 'none' && (
                  <div className={`seal-overlay seal-${activeSeal}`}>
                    {activeSeal}
                  </div>
                )}

                {/* Template Overlay */}
                <div className="story-overlay">
                  <div className="story-price">{selectedProp.price}</div>
                  <div className="story-title">{selectedProp.title}</div>
                </div>
              </div>
            )}

          </div>

          {/* Botón flotante de descarga (Simulado) */}
          <div style={{ position: 'absolute', bottom: '2rem', right: '2rem', zIndex: 20 }}>
            <button className="btn btn-primary" onClick={() => alert("¡Imagen lista para publicar! (Simulación)")}>
              🚀 Publicar en Instagram
            </button>
          </div>
        </main>

      </div>
    </div>
  );
}
