import React, { useState, useEffect } from 'react';
import { InstagramAccount, getMockProperties, IgProperty } from '../services/instagramService';

interface Props {
    account: InstagramAccount;
}

type PostTemplate = 'classic' | 'carousel' | 'reel';

export default function RedesInstagramPosts({ account }: Props) {
    const [properties, setProperties] = useState<IgProperty[]>([]);
    const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");

    // Editor State
    const [template, setTemplate] = useState<PostTemplate>('classic');
    const [showPrice, setShowPrice] = useState(true);
    const [showLocation, setShowLocation] = useState(true);
    const [showFeatures, setShowFeatures] = useState(true);
    const [extraTag, setExtraTag] = useState("Nuevo Ingreso");
    const [caption, setCaption] = useState("");

    // Load mock properties
    useEffect(() => {
        const data = getMockProperties();
        setProperties(data);
        if (data.length > 0) {
            setSelectedPropertyId(data[0].id);
            generateInitialCaption(data[0]);
        }
    }, []);

    const selectedProperty = properties.find(p => p.id === selectedPropertyId);

    const generateInitialCaption = (prop: IgProperty) => {
        setCaption(`¡Mirá esta increíble propiedad en ${prop.location}! 🏡✨\n\n${prop.title}\nPrecio: ${prop.price}\n\nCaracterísticas: ${prop.features}\n\nConsultanos por mensaje directo para más info! 👇`);
    };

    const handleSuggestCaption = () => {
        if (!selectedProperty) return;
        const emojis = ["🔥", "💎", "🚀", "🔑", "🏠"];
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

        const suggestions = [
            `¡OPORTUNIDAD ÚNICA! ${randomEmoji}\n\n${selectedProperty.title} en ${selectedProperty.location}.\nIdeal para quienes buscan confort y estilo.\n\n📍 ${selectedProperty.location}\n💰 ${selectedProperty.price}\n\n¡Escribinos ya!`,
            `¿Buscas tu próximo hogar? Lo encontraste. 😍\n\nPresentamos este hermoso inmueble: ${selectedProperty.title}.\nCuenta con ${selectedProperty.features}.\n\nNo dejes pasar esta chance. ${selectedProperty.price}.`,
            `✨ NUEVO INGRESO ✨\n\n${selectedProperty.title} - ${selectedProperty.location}\n\nUna propiedad que lo tiene todo: diseño, ubicación y precio.\n\n📲 Contactanos para coordinar una visita.`
        ];

        const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
        setCaption(randomSuggestion);
    };

    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(caption).then(() => {
            alert("¡Texto copiado al portapapeles!");
        }).catch(err => {
            console.error('Error al copiar: ', err);
        });
    };

    const handleSaveDraft = () => {
        console.log("Guardando borrador...", {
            account: account.igUsername,
            property: selectedProperty?.title,
            caption,
            template
        });
        alert("Borrador guardado en Inmovia (Simulado)");
    };

    if (!selectedProperty) return <div className="p-5 text-center">Cargando editor...</div>;

    return (
        <div className="posts-layout">
            {/* --- Left Column: Editor --- */}
            <div className="posts-creator">
                <div className="redes-panel-header mb-4 p-0 border-0">
                    <div>
                        <h2 className="redes-panel-title">Creador de publicaciones</h2>
                        <div className="redes-panel-subtitle">Publicando como @{account.igUsername}</div>
                    </div>
                </div>

                {/* Property Selector */}
                <div className="form-group">
                    <label className="form-label">Propiedad</label>
                    <select
                        className="form-select"
                        value={selectedPropertyId}
                        onChange={(e) => {
                            setSelectedPropertyId(e.target.value);
                            const prop = properties.find(p => p.id === e.target.value);
                            if (prop) generateInitialCaption(prop);
                        }}
                    >
                        {properties.map(p => (
                            <option key={p.id} value={p.id}>{p.title}</option>
                        ))}
                    </select>
                    <div className="form-helper">Usamos los datos de esta propiedad para el post.</div>
                </div>

                {/* Template Selector */}
                <div className="form-group">
                    <label className="form-label">Tipo de post</label>
                    <div className="segmented-control">
                        <button
                            className={template === 'classic' ? 'active' : ''}
                            onClick={() => setTemplate('classic')}
                        >
                            Clásico
                        </button>
                        <button
                            className={template === 'carousel' ? 'active' : ''}
                            onClick={() => setTemplate('carousel')}
                        >
                            Carrusel
                        </button>
                        <button
                            className={template === 'reel' ? 'active' : ''}
                            onClick={() => setTemplate('reel')}
                        >
                            Reel
                        </button>
                    </div>
                </div>

                {/* Options */}
                <div className="form-group">
                    <label className="form-label">Datos visibles</label>
                    <div className="checkbox-group">
                        <label className="checkbox-label">
                            <input type="checkbox" checked={showPrice} onChange={e => setShowPrice(e.target.checked)} />
                            Precio
                        </label>
                        <label className="checkbox-label">
                            <input type="checkbox" checked={showLocation} onChange={e => setShowLocation(e.target.checked)} />
                            Ubicación
                        </label>
                        <label className="checkbox-label">
                            <input type="checkbox" checked={showFeatures} onChange={e => setShowFeatures(e.target.checked)} />
                            Características
                        </label>
                    </div>
                </div>

                {/* Extra Tag */}
                <div className="form-group">
                    <label className="form-label">Etiqueta destacada</label>
                    <input
                        type="text"
                        className="form-control"
                        value={extraTag}
                        onChange={(e) => setExtraTag(e.target.value)}
                        placeholder="Ej: Nuevo Ingreso"
                    />
                </div>

                {/* Caption Editor */}
                <div className="form-group">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <label className="form-label mb-0">Descripción</label>
                        <button
                            className="btn btn-sm btn-link text-decoration-none p-0 d-flex align-items-center gap-1"
                            style={{ fontSize: '0.85rem', color: 'var(--inmovia-blue-light)' }}
                            onClick={handleSuggestCaption}
                        >
                            <span>✨</span> Sugerir con Ivo-t
                        </button>
                    </div>
                    <textarea
                        className="form-textarea"
                        style={{ minHeight: '180px', resize: 'none' }}
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                    ></textarea>
                    <div className="text-end mt-1 text-muted small">
                        {caption.length} / 2200
                    </div>
                </div>

                {/* Actions */}
                <div className="d-flex gap-3 mt-auto pt-4">
                    <button className="btn btn-outline-secondary flex-grow-1" onClick={handleCopyToClipboard}>
                        Copiar texto
                    </button>
                    <button className="btn btn-primary flex-grow-1" onClick={handleSaveDraft}>
                        Guardar borrador
                    </button>
                </div>
            </div>

            {/* --- Right Column: Preview --- */}
            <div className="phone-frame-container">
                <div className="phone-frame">
                    {/* Header */}
                    <div className="phone-header">
                        <div className="phone-avatar" style={{ background: '#ddd' }}></div>
                        <div className="phone-username">{account.igUsername}</div>
                        <div className="text-muted">•••</div>
                    </div>

                    {/* Content */}
                    <div className="phone-content">
                        {/* Image Area */}
                        <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', background: '#eee' }}>
                            <img src={selectedProperty.imageUrl} alt="Property" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

                            {/* Overlays */}
                            {(showPrice || extraTag) && (
                                <div style={{
                                    position: 'absolute', bottom: 0, left: 0, width: '100%', padding: '1rem',
                                    background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end'
                                }}>
                                    <div>
                                        {extraTag && (
                                            <span style={{ background: '#3b82f6', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, display: 'inline-block', marginBottom: '4px' }}>
                                                {extraTag}
                                            </span>
                                        )}
                                        {showPrice && (
                                            <div style={{ color: 'white', fontWeight: 700, textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                                                {selectedProperty.price}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Type Indicators */}
                            {template === 'carousel' && (
                                <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem' }}>
                                    1/3
                                </div>
                            )}
                            {template === 'reel' && (
                                <div style={{ position: 'absolute', top: '10px', right: '10px', color: 'white', fontSize: '1.2rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}>
                                    🎥
                                </div>
                            )}
                        </div>

                        {/* Actions Bar */}
                        <div className="phone-actions">
                            <span>❤️</span>
                            <span>💬</span>
                            <span>✈️</span>
                            <span style={{ marginLeft: 'auto' }}>🔖</span>
                        </div>

                        {/* Likes */}
                        <div className="phone-likes">
                            Le gusta a usuario_demo y 45 personas más
                        </div>

                        {/* Caption */}
                        <div className="phone-caption">
                            <strong>{account.igUsername}</strong>{' '}
                            {caption.split('\n').map((line, i) => (
                                <React.Fragment key={i}>
                                    {line}
                                    {i < caption.split('\n').length - 1 && <br />}
                                </React.Fragment>
                            ))}
                            <div style={{ marginTop: '0.5rem', color: '#64748b', fontSize: '0.85rem' }}>
                                {showLocation && <div>📍 {selectedProperty.location}</div>}
                                {showFeatures && <div>🏠 {selectedProperty.features}</div>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
