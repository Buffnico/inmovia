import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/HomeLanding.css";

// Cargar imágenes del carrusel automáticamente
const betaCarouselImages = Object.values(
    import.meta.glob("../assets/beta-carousel/*.{png,jpg,jpeg,webp}", {
        eager: true,
        as: "url",
    })
) as string[];

const HomeLanding: React.FC = () => {
    const [showBetaModal, setShowBetaModal] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const handleBetaClick = () => {
        setShowBetaModal(true);
    };

    const handleCloseBetaModal = () => {
        setShowBetaModal(false);
    };

    // Efecto para el carrusel automático
    useEffect(() => {
        if (!showBetaModal || betaCarouselImages.length <= 1) return;

        const intervalId = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % betaCarouselImages.length);
        }, 4000);

        return () => clearInterval(intervalId);
    }, [showBetaModal]);

    return (
        <div className="home-landing">
            {/* Header / Navbar */}
            {/* Header / Navbar */}
            <header className="home-header hl-nav">
                <div className="home-header-inner hl-nav-inner">
                    <div className="home-logo">
                        <img
                            src="/assets/ivot-logo.png"
                            alt="Ivo-t, asistente inteligente"
                            className="home-logo-icon"
                        />
                        <span className="home-logo-text">Inmovia Office</span>
                    </div>

                    <nav className="home-nav hl-nav-menu">
                        <div className="home-nav-item">
                            <a href="#plataforma" className="home-nav-link">Plataforma</a>
                            <div className="home-nav-dropdown">
                                <span>Dashboard y métricas</span>
                                <span>Agenda & Calendario</span>
                                <span>Documentos & firmas</span>
                                <span>Chat interno & Ivo-t</span>
                            </div>
                        </div>

                        <div className="home-nav-item">
                            <a href="#casos-uso" className="home-nav-link">Casos de uso</a>
                            <div className="home-nav-dropdown">
                                <span>Oficinas inmobiliarias</span>
                                <span>Administración y back office</span>
                                <span>Martilleros y brokers</span>
                                <span>Recepción y atención al cliente</span>
                            </div>
                        </div>

                        <div className="home-nav-item">
                            <a href="#aprendizaje" className="home-nav-link">Aprendizaje</a>
                            <div className="home-nav-dropdown">
                                <span>Inmovia Edu</span>
                                <span>Onboarding de agentes</span>
                                <span>Guías y playbooks</span>
                            </div>
                        </div>

                        <div className="home-nav-item">
                            <a href="#planes" className="home-nav-link">Planes</a>
                            <div className="home-nav-dropdown">
                                <span>Oficina única</span>
                                <span>Multi-oficina</span>
                                <span>Beta cerrada</span>
                            </div>
                        </div>

                        <div className="home-nav-item">
                            <a href="#integraciones" className="home-nav-link">Empresa</a>
                            <div className="home-nav-dropdown">
                                <span>Quiénes somos</span>
                                <span>Roadmap</span>
                                <span>Integraciones</span>
                            </div>
                        </div>
                    </nav>

                    <div className="home-header-actions hl-nav-right">
                        <Link to="/login" className="home-link-login hl-nav-link">
                            Iniciar sesión
                        </Link>
                        <button
                            type="button"
                            className="home-btn-primary hl-nav-cta"
                            onClick={handleBetaClick}
                        >
                            Probar gratis
                        </button>
                    </div>
                </div>
            </header>

            {/* HERO SECTION */}
            <section className="home-hero">
                <div className="home-hero-inner">
                    <div className="home-hero-text">
                        <h1 className="home-hero-title">
                            <span className="text-highlight">Desbloqueá tu oficina digital</span>
                            <br />
                            <span className="text-main">Ivo-t, tu asistente inteligente para inmobiliarias</span>
                        </h1>
                        <p className="home-hero-description">
                            Ivo-t te ayuda a responder consultas, organizar tareas y mejorar la
                            productividad de tu oficina inmobiliaria con IA simple y amigable.
                        </p>
                        <div className="home-hero-ctas">
                            <button
                                type="button"
                                className="home-btn-primary btn-lg"
                                onClick={handleBetaClick}
                            >
                                Probar gratis
                            </button>
                            <button
                                type="button"
                                className="link-secondary"
                                onClick={handleBetaClick}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}
                            >
                                Agendar demo <span className="icon-arrow">▶</span>
                            </button>
                        </div>
                    </div>

                    <div className="home-hero-media">
                        <div className="home-hero-card">
                            <video
                                className="home-hero-video"
                                src="/media/ivot-hero-veo3.mp4"
                                autoPlay
                                muted
                                loop
                                playsInline
                            />
                        </div>
                        <p className="home-hero-caption">
                            👋 Hola, soy Ivo-t, tu asistente inteligente en Inmovia Office. Estoy acá para ayudarte a organizar tu oficina inmobiliaria.
                        </p>
                    </div>
                </div>
            </section>

            {/* SECCIÓN: ¿Qué es Inmovia + Ivo-t? */}
            <section className="home-section section-intro">
                <div className="home-section-inner">
                    <div className="section-header text-center">
                        <h2 className="section-title">Diseñado para oficinas inmobiliarias reales</h2>
                        <p className="section-subtitle">
                            Inmovia es la plataforma integral que centraliza tu operación, y Ivo-t es el cerebro
                            que la potencia. Juntos, eliminan el caos administrativo para que te enfoques en cerrar tratos.
                        </p>
                    </div>
                </div>
            </section>

            {/* SECCIÓN: Integraciones */}
            <section
                id="integraciones"
                className="home-section home-section-integrations"
            >
                <div className="home-section-inner">
                    <h3>Integraciones que potencian tu oficina</h3>
                    <p className="home-section-subtitle">
                        Inmovia se conecta con las herramientas que ya usás y con las que vamos a sumar para tu oficina inmobiliaria.
                    </p>

                    <div className="home-integrations-grid">
                        {/* Disponibles hoy */}
                        <div className="home-integration-card">
                            <span className="home-integration-badge home-integration-badge-now">Disponible</span>
                            <h4>Google Calendar</h4>
                            <p>Sincronización de agenda, recordatorios y eventos clave de la oficina.</p>
                        </div>

                        <div className="home-integration-card">
                            <span className="home-integration-badge home-integration-badge-now">Disponible</span>
                            <h4>Ivo-t (OpenAI)</h4>
                            <p>Asistente inteligente integrado para agentes, administración y capacitación.</p>
                        </div>

                        {/* En desarrollo / Muy pronto */}
                        <div className="home-integration-card">
                            <span className="home-integration-badge home-integration-badge-soon">En desarrollo</span>
                            <h4>Google Contacts</h4>
                            <p>Sincronización de contactos de la oficina con tu CRM Inmovia.</p>
                        </div>

                        <div className="home-integration-card">
                            <span className="home-integration-badge home-integration-badge-soon">Muy pronto</span>
                            <h4>Instagram (Meta)</h4>
                            <p>Publicación de propiedades y gestión de mensajes desde Inmovia.</p>
                        </div>

                        <div className="home-integration-card">
                            <span className="home-integration-badge home-integration-badge-soon">Muy pronto</span>
                            <h4>WhatsApp Business</h4>
                            <p>Bot oficial de la oficina para respuestas rápidas (sin reemplazar al agente).</p>
                        </div>

                        <div className="home-integration-card">
                            <span className="home-integration-badge home-integration-badge-soon">Muy pronto</span>
                            <h4>Contractia</h4>
                            <p>Firma digital de reservas y contratos directamente desde Documentos.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECCIÓN: Beneficios */}
            <section className="home-section section-benefits">
                <div className="home-section-inner">
                    <h2 className="section-title text-center mb-5">Lo que Ivo-t puede hacer por tu oficina</h2>
                    <div className="benefits-grid">
                        {/* Card 1 */}
                        <div className="benefit-card">
                            <div className="benefit-icon">🤖</div>
                            <h3 className="benefit-title">Atención inteligente</h3>
                            <p className="benefit-desc">
                                Responde preguntas frecuentes de clientes y agentes, 24/7, sin descanso.
                            </p>
                        </div>
                        {/* Card 2 */}
                        <div className="benefit-card">
                            <div className="benefit-icon">📅</div>
                            <h3 className="benefit-title">Organización diaria</h3>
                            <p className="benefit-desc">
                                Ayuda con agenda, recordatorios y tareas repetitivas para que nada se te pase.
                            </p>
                        </div>
                        {/* Card 3 */}
                        <div className="benefit-card">
                            <div className="benefit-icon">📊</div>
                            <h3 className="benefit-title">Visión de la oficina</h3>
                            <p className="benefit-desc">
                                Genera insights a partir de las interacciones y datos clave de tu negocio.
                            </p>
                        </div>
                        {/* Card 4 */}
                        <div className="benefit-card">
                            <div className="benefit-icon">⚡</div>
                            <h3 className="benefit-title">Integrado con Inmovia</h3>
                            <p className="benefit-desc">
                                Funciona dentro de la misma plataforma que usás para propiedades y contactos.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECCIÓN: Cómo funciona (Pasos) */}
            <section id="how-it-works" className="home-section section-steps">
                <div className="home-section-inner">
                    <h2 className="section-title text-center mb-5">Cómo empezar con Ivo-t</h2>
                    <div className="steps-grid">
                        <div className="step-item">
                            <div className="step-number">1</div>
                            <h3 className="step-title">Creás tu oficina</h3>
                            <p className="step-desc">Registrate en Inmovia y configurá tu perfil en minutos.</p>
                        </div>
                        <div className="step-item">
                            <div className="step-number">2</div>
                            <h3 className="step-title">Activás Ivo-t</h3>
                            <p className="step-desc">Habilitá el asistente para tu equipo con un solo clic.</p>
                        </div>
                        <div className="step-item">
                            <div className="step-number">3</div>
                            <h3 className="step-title">Empezás a usarlo</h3>
                            <p className="step-desc">Delegá tareas y disfrutá de tu nuevo asistente virtual.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA FINAL */}
            <section className="home-cta-band">
                <div className="home-section-inner text-center">
                    <h2 className="cta-title">¿Listo para probar Ivo-t en tu oficina inmobiliaria?</h2>
                    <button
                        type="button"
                        className="btn btn-primary btn-lg mt-3"
                        onClick={handleBetaClick}
                    >
                        Agendar una demo
                    </button>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="home-footer">
                <div className="home-section-inner footer-content">
                    <p className="copyright">© 2025 Inmovia. Todos los derechos reservados.</p>
                    <div className="footer-links">
                        <a href="#">Términos</a>
                        <span className="separator">|</span>
                        <a href="#">Privacidad</a>
                    </div>
                </div>
            </footer>

            {/* Modal de Beta */}
            {showBetaModal && (
                <div className="home-beta-modal-backdrop" onClick={handleCloseBetaModal}>
                    <div className="home-beta-modal" onClick={(e) => e.stopPropagation()}>
                        <button
                            type="button"
                            className="home-beta-modal-close"
                            onClick={handleCloseBetaModal}
                        >
                            ×
                        </button>
                        <div className="home-beta-modal-content">
                            <div className="beta-modal-carousel">
                                {betaCarouselImages.length > 0 ? (
                                    <>
                                        <img
                                            src={betaCarouselImages[currentImageIndex]}
                                            alt={`Ivo-t trabajando ${currentImageIndex + 1}`}
                                            className="home-beta-modal-image"
                                        />
                                        {betaCarouselImages.length > 1 && (
                                            <div className="beta-modal-dots">
                                                {betaCarouselImages.map((_, index) => (
                                                    <button
                                                        key={index}
                                                        type="button"
                                                        className={
                                                            "beta-dot" +
                                                            (index === currentImageIndex ? " is-active" : "")
                                                        }
                                                        onClick={() => setCurrentImageIndex(index)}
                                                        aria-label={`Ver imagen ${index + 1}`}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <img
                                        src="/assets/ivot-working-beta.png"
                                        alt="Ivo-t trabajando para lanzar la beta de Inmovia Office"
                                        className="home-beta-modal-image"
                                    />
                                )}
                            </div>
                            <h3>Estamos trabajando en la beta 🚀</h3>
                            <p>
                                Ivo-t está trabajando a full para que puedas probar Inmovia Office muy pronto.
                                Estamos afinando la beta cerrada para oficinas inmobiliarias. Mientras tanto,
                                esta página te muestra todo lo que la plataforma va a hacer por tu equipo.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomeLanding;
