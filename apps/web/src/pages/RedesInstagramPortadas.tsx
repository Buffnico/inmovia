import React, { useState, useEffect } from 'react';
import { InstagramAccount, getMockProperties, IgProperty } from '../services/instagramService';

interface Props {
    account: InstagramAccount;
}

type StoryTemplate = 'minimal' | 'elegant' | 'impact';

export default function RedesInstagramPortadas({ account }: Props) {
    const [properties, setProperties] = useState<IgProperty[]>([]);
    const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");

    // Editor State
    const [template, setTemplate] = useState<StoryTemplate>('minimal');
    const [showPrice, setShowPrice] = useState(true);
    const [showTitle, setShowTitle] = useState(true);
    const [showLocation, setShowLocation] = useState(true);
    const [extraText, setExtraText] = useState("");

    // Load mock properties
    useEffect(() => {
        const data = getMockProperties();
        setProperties(data);
        if (data.length > 0) {
            setSelectedPropertyId(data[0].id);
        }
    }, []);

    const selectedProperty = properties.find(p => p.id === selectedPropertyId);

    const handleDownload = () => {
        // Mock download logic
        alert("Generando imagen de Story... (Simulado)\nEn producción esto usaría html2canvas o similar.");
    };

    if (!selectedProperty) return <div className="p-5 text-center">Cargando editor...</div>;

    return (
        <div className="covers-layout">
            {/* --- Left Column: Editor --- */}
            <div className="posts-creator">
                <div className="redes-panel-header mb-4 p-0 border-0">
                    <div>
                        <h2 className="redes-panel-title">Generador de Stories</h2>
                        <div className="redes-panel-subtitle">Crea portadas atractivas para tus historias</div>
                    </div>
                </div>

                {/* Property Selector */}
                <div className="form-group">
                    <label className="form-label">Propiedad</label>
                    <select
                        className="form-select"
                        value={selectedPropertyId}
                        onChange={(e) => setSelectedPropertyId(e.target.value)}
                    >
                        {properties.map(p => (
                            <option key={p.id} value={p.id}>{p.title}</option>
                        ))}
                    </select>
                </div>

                {/* Template Selector */}
                <div className="form-group">
                    <label className="form-label">Diseño / Plantilla</label>
                    <div className="segmented-control">
                        <button
                            className={template === 'minimal' ? 'active' : ''}
                            onClick={() => setTemplate('minimal')}
                        >
                            Minimalista
                        </button>
                        <button
                            className={template === 'elegant' ? 'active' : ''}
                            onClick={() => setTemplate('elegant')}
                        >
                            Elegante
                        </button>
                        <button
                            className={template === 'impact' ? 'active' : ''}
                            onClick={() => setTemplate('impact')}
                        >
                            Impacto
                        </button>
                    </div>
                </div>

                {/* Customization */}
                <div className="form-group">
                    <label className="form-label">Personalización</label>
                    <div className="checkbox-group flex-column gap-2">
                        <label className="checkbox-label">
                            <input type="checkbox" checked={showPrice} onChange={e => setShowPrice(e.target.checked)} />
                            Mostrar precio
                        </label>
                        <label className="checkbox-label">
                            <input type="checkbox" checked={showTitle} onChange={e => setShowTitle(e.target.checked)} />
                            Mostrar título
                        </label>
                        <label className="checkbox-label">
                            <input type="checkbox" checked={showLocation} onChange={e => setShowLocation(e.target.checked)} />
                            Mostrar ubicación
                        </label>
                    </div>
                </div>

                {/* Extra Text */}
                <div className="form-group">
                    <label className="form-label">Texto adicional</label>
                    <input
                        type="text"
                        className="form-control"
                        value={extraText}
                        onChange={(e) => setExtraText(e.target.value)}
                        placeholder="Ej: Visita Virtual Disponible"
                    />
                </div>

                {/* Actions */}
                <div className="d-flex flex-column gap-2 mt-auto pt-4">
                    <button className="btn btn-primary w-100" onClick={handleDownload}>
                        ⬇ Descargar portada
                    </button>
                    <button className="btn btn-outline-secondary btn-sm w-100" onClick={() => console.log("Saved as favorite template")}>
                        Guardar como plantilla favorita
                    </button>
                </div>
            </div>

            {/* --- Right Column: Preview --- */}
            <div className="story-preview-container">
                {/* Main Phone Preview */}
                <div className={`story-frame template-${template}`}>
                    <img
                        src={selectedProperty.imageUrl}
                        alt="Background"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />

                    <div className="story-overlay-clean">
                        <div className="story-info-block">
                            {extraText && <div className="story-extra-tag">{extraText}</div>}

                            {showTitle && <h2 className="story-main-title">{selectedProperty.title}</h2>}

                            {showLocation && <div className="story-location-tag">
                                📍 {selectedProperty.location}
                            </div>}

                            {showPrice && <div className="story-price-tag">
                                {selectedProperty.price}
                            </div>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
