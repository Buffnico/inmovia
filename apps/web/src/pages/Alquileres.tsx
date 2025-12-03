import React, { useState, useEffect } from "react";
import { useAuth } from "../store/auth";
import "./Alquileres.css";

// --- Interfaces ---

interface RentalContract {
    id: string;
    officeId?: string;
    propertyId?: string;
    locadorId?: string;
    locatarioId?: string;
    title: string;
    baseAmount: number;
    currency?: string;
    indexType?: string;
    startDate: string;
    endDate: string;
    status: string;
    notes?: string;
    createdAt?: string;
    // Mock fields for UI
    managementMode?: 'SOLO_CONTRATO' | 'SEGUIMIENTO';
    address?: string;
    locadorName?: string;
    locatarioName?: string;
}

interface RentalPayment {
    id: string;
    contractId: string;
    month: number;
    year: number;
    dueDate: string;
    paidDate?: string;
    amount: number;
    status: string;
    notes?: string;
}

type Tab = 'RESUMEN' | 'CONTRATOS' | 'PAGOS' | 'CALCULADORA' | 'CONFIGURACION';

const Alquileres: React.FC = () => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";
    const { user } = useAuth();

    // Role-based permission
    const canManageRentals = user && ["OWNER", "ADMIN", "MARTILLERO", "RECEPCIONISTA"].includes(user.role);

    // Data States
    const [contracts, setContracts] = useState<RentalContract[]>([]);
    const [paymentsByContract, setPaymentsByContract] = useState<Record<string, RentalPayment[]>>({});
    const [upcomingDue, setUpcomingDue] = useState<RentalPayment[]>([]);

    // UI States
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>('RESUMEN');
    const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
    const [selectedPaymentContractId, setSelectedPaymentContractId] = useState<string | null>(null);

    // Calculator State
    const [calcAmount, setCalcAmount] = useState(100000);
    const [calcIndex, setCalcIndex] = useState('ICL');
    const [calcStartDate, setCalcStartDate] = useState('');
    const [calcEndDate, setCalcEndDate] = useState('');
    const [calcResult, setCalcResult] = useState<number | null>(null);

    // Fetch Data
    const fetchData = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };

        try {
            // 1. Fetch Contracts
            const resContracts = await fetch(`${API_BASE_URL}/alquileres/contratos`, { headers });
            const dataContracts = await resContracts.json();

            if (dataContracts.ok) {
                // Enrich with mock data for demo
                const enrichedContracts = dataContracts.data.map((c: any) => ({
                    ...c,
                    managementMode: Math.random() > 0.3 ? 'SEGUIMIENTO' : 'SOLO_CONTRATO',
                    address: `Calle Falsa ${Math.floor(Math.random() * 1000)}`,
                    locadorName: "Juan Propietario",
                    locatarioName: "Maria Inquilina"
                }));
                setContracts(enrichedContracts);

                if (enrichedContracts.length > 0) {
                    setSelectedContractId(enrichedContracts[0].id);
                    setSelectedPaymentContractId(enrichedContracts[0].id);
                }

                // 2. Fetch Payments
                const paymentsMap: Record<string, RentalPayment[]> = {};
                for (const c of dataContracts.data) {
                    const resPayments = await fetch(`${API_BASE_URL}/alquileres/contratos/${c.id}/pagos`, { headers });
                    const dataPayments = await resPayments.json();
                    if (dataPayments.ok) {
                        paymentsMap[c.id] = dataPayments.data;
                    }
                }
                setPaymentsByContract(paymentsMap);
            }

            // 3. Fetch Upcoming Due
            const resDue = await fetch(`${API_BASE_URL}/alquileres/vencimientos`, { headers });
            const dataDue = await resDue.json();
            if (dataDue.ok) {
                setUpcomingDue(dataDue.data);
            }

        } catch (err) {
            console.error("Error fetching alquileres:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // --- Tab Renderers ---

    const renderResumen = () => {
        const activeContractsCount = contracts.filter(c => c.status === 'ACTIVO').length;
        const totalPaymentsMonth = Object.values(paymentsByContract)
            .flat()
            .filter(p => p.status === 'PAGADO' && new Date(p.paidDate || '').getMonth() === new Date().getMonth())
            .reduce((acc, curr) => acc + curr.amount, 0);

        const latePaymentsCount = Object.values(paymentsByContract)
            .flat()
            .filter(p => p.status === 'ATRASADO' || (p.status === 'PENDIENTE' && new Date(p.dueDate) < new Date()))
            .length;

        return (
            <div className="animate-fade-in">
                {/* KPI Cards */}
                <div className="kpi-grid">
                    <div className="kpi-card">
                        <span className="kpi-label">Contratos Activos</span>
                        <span className="kpi-value">{activeContractsCount}</span>
                        <span className="kpi-trend positive">En gestión</span>
                    </div>
                    <div className="kpi-card">
                        <span className="kpi-label">Próximos a Vencer (60d)</span>
                        <span className="kpi-value">{upcomingDue.length}</span>
                        <span className="kpi-trend neutral">Requieren atención</span>
                    </div>
                    <div className="kpi-card">
                        <span className="kpi-label">Cobros del Mes</span>
                        <span className="kpi-value">${totalPaymentsMonth.toLocaleString()}</span>
                        <span className="kpi-trend positive">Registrados</span>
                    </div>
                    <div className="kpi-card">
                        <span className="kpi-label">Pagos Atrasados</span>
                        <span className="kpi-value" style={{ color: latePaymentsCount > 0 ? '#dc2626' : '#16a34a' }}>
                            {latePaymentsCount}
                        </span>
                        <span className="kpi-trend negative">Acción requerida</span>
                    </div>
                </div>

                <div className="row g-4">
                    {/* Cobros del Mes Table */}
                    <div className="col-md-8">
                        <div className="card h-100 border-0 shadow-sm">
                            <div className="card-header bg-white py-3">
                                <h5 className="mb-0 fw-bold text-dark">Cobros Recientes</h5>
                            </div>
                            <div className="table-responsive">
                                <table className="premium-table">
                                    <thead>
                                        <tr>
                                            <th>Propiedad</th>
                                            <th>Inquilino</th>
                                            <th>Monto</th>
                                            <th>Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {contracts.slice(0, 5).map(c => (
                                            <tr key={c.id}>
                                                <td>{c.title}</td>
                                                <td>{c.locatarioName}</td>
                                                <td>${c.baseAmount.toLocaleString()}</td>
                                                <td><span className="status-badge paid">PAGADO</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Próximos Vencimientos */}
                    <div className="col-md-4">
                        <div className="card h-100 border-0 shadow-sm">
                            <div className="card-header bg-white py-3">
                                <h5 className="mb-0 fw-bold text-dark">Próximos Vencimientos</h5>
                            </div>
                            <div className="card-body">
                                <div className="alert alert-info small mb-3">
                                    Este panel usa los contratos y pagos cargados en Inmovia.
                                </div>
                                <ul className="list-group list-group-flush">
                                    {upcomingDue.length > 0 ? upcomingDue.map(due => (
                                        <li key={due.id} className="list-group-item px-0 d-flex justify-content-between align-items-center">
                                            <div>
                                                <div className="fw-bold text-dark">Contrato #{due.contractId.slice(0, 4)}</div>
                                                <small className="text-muted">Vence: {new Date(due.dueDate).toLocaleDateString()}</small>
                                            </div>
                                            <span className="text-danger fw-bold">${due.amount.toLocaleString()}</span>
                                        </li>
                                    )) : (
                                        <div className="text-center text-muted py-4">No hay vencimientos próximos</div>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderContratos = () => {
        const selectedContract = contracts.find(c => c.id === selectedContractId);

        return (
            <div className="contracts-layout">
                {/* List */}
                <div className="contracts-list">
                    <div className="p-3 border-bottom bg-white sticky-top">
                        <input type="text" className="form-control form-control-sm" placeholder="Buscar contrato..." />
                    </div>
                    {contracts.map(c => (
                        <div
                            key={c.id}
                            className={`contract-item ${selectedContractId === c.id ? 'active' : ''}`}
                            onClick={() => setSelectedContractId(c.id)}
                        >
                            <div className="d-flex justify-content-between mb-1">
                                <span className="fw-bold text-dark text-truncate" style={{ maxWidth: '70%' }}>{c.title}</span>
                                <span className={`status-badge ${c.status === 'ACTIVO' ? 'active' : 'pending'}`}>{c.status}</span>
                            </div>
                            <div className="small text-muted mb-1">{c.locatarioName}</div>
                            <div className="small text-dark fw-bold">${c.baseAmount.toLocaleString()}</div>
                        </div>
                    ))}
                </div>

                {/* Detail */}
                <div className="contract-detail-panel">
                    {selectedContract ? (
                        <>
                            <div className="d-flex justify-content-between align-items-start mb-4">
                                <div>
                                    <h3 className="mb-1 fw-bold text-dark">{selectedContract.title}</h3>
                                    <p className="text-muted mb-0">📍 {selectedContract.address}</p>
                                </div>
                                <button className="btn btn-outline-primary btn-sm">Editar Contrato</button>
                            </div>

                            <div className="row mb-4">
                                <div className="col-md-6">
                                    <div className="p-3 bg-light rounded-3">
                                        <label className="small text-muted fw-bold text-uppercase">Locador</label>
                                        <div className="fw-bold text-dark">{selectedContract.locadorName}</div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="p-3 bg-light rounded-3">
                                        <label className="small text-muted fw-bold text-uppercase">Locatario</label>
                                        <div className="fw-bold text-dark">{selectedContract.locatarioName}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="management-mode-selector">
                                <h6 className="fw-bold mb-3">Modo de Gestión</h6>
                                <div className={`mode-option ${selectedContract.managementMode === 'SOLO_CONTRATO' ? 'selected' : ''}`}>
                                    <input
                                        type="radio"
                                        checked={selectedContract.managementMode === 'SOLO_CONTRATO'}
                                        readOnly
                                        className="mode-radio"
                                    />
                                    <div>
                                        <div className="fw-bold text-dark">Solo Contrato</div>
                                        <div className="small text-muted">Se registra el contrato y se archiva, pero no se controla el pago mes a mes.</div>
                                    </div>
                                </div>
                                <div className={`mode-option mt-2 ${selectedContract.managementMode === 'SEGUIMIENTO' ? 'selected' : ''}`}>
                                    <input
                                        type="radio"
                                        checked={selectedContract.managementMode === 'SEGUIMIENTO'}
                                        readOnly
                                        className="mode-radio"
                                    />
                                    <div>
                                        <div className="fw-bold text-dark">Seguimiento de Pagos</div>
                                        <div className="small text-muted">Inmovia genera los meses, recordatorios y recibos para cobrar en oficina.</div>
                                    </div>
                                </div>
                            </div>

                            {selectedContract.managementMode === 'SEGUIMIENTO' && (
                                <div className="alert alert-success d-flex align-items-center gap-2">
                                    <span>✅</span>
                                    <small>Este contrato tiene seguimiento de pagos activo. Ver sección 'Pagos & Recibos'.</small>
                                </div>
                            )}

                            <div className="mt-4 p-4 border border-dashed rounded-3 text-center bg-light">
                                <div className="mb-2 text-muted" style={{ fontSize: '2rem' }}>📄</div>
                                <h6 className="fw-bold text-dark">Contrato Firmado</h6>
                                <p className="small text-muted mb-3">Aquí se guarda el contrato digitalizado.</p>
                                <button className="btn btn-sm btn-outline-secondary">Subir PDF</button>
                            </div>
                        </>
                    ) : (
                        <div className="text-center text-muted py-5">Selecciona un contrato para ver el detalle</div>
                    )}
                </div>
            </div>
        );
    };

    const renderPagos = () => {
        const payments = selectedPaymentContractId ? (paymentsByContract[selectedPaymentContractId] || []) : [];
        const contract = contracts.find(c => c.id === selectedPaymentContractId);

        return (
            <div>
                <div className="d-flex gap-3 mb-4 align-items-center">
                    <select
                        className="form-select w-auto"
                        value={selectedPaymentContractId || ''}
                        onChange={(e) => setSelectedPaymentContractId(e.target.value)}
                    >
                        {contracts.map(c => (
                            <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                    </select>
                    {contract && <span className="badge bg-light text-dark border">{contract.status}</span>}
                </div>

                <div className="row">
                    <div className="col-md-8">
                        <h5 className="mb-3 fw-bold text-dark">Meses del Contrato</h5>
                        <div className="payments-grid">
                            {payments.length > 0 ? payments.map(p => {
                                const isPaid = p.status === 'PAGADO';
                                const isLate = p.status === 'ATRASADO' || (p.status === 'PENDIENTE' && new Date(p.dueDate) < new Date());
                                const statusClass = isPaid ? 'paid' : (isLate ? 'late' : 'pending');

                                return (
                                    <div key={p.id} className={`payment-chip ${statusClass}`}>
                                        <span className="payment-month">{new Date(0, p.month - 1).toLocaleString('es-AR', { month: 'long' })}</span>
                                        <span className="small fw-bold">${p.amount.toLocaleString()}</span>
                                        <span className="payment-status-text">{p.status}</span>
                                    </div>
                                );
                            }) : (
                                <div className="text-muted col-12">No hay pagos generados para este contrato.</div>
                            )}
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card border-0 shadow-sm bg-light">
                            <div className="card-body">
                                <h6 className="fw-bold text-dark mb-3">Gestión de Recibos</h6>
                                <div className="text-center py-4">
                                    <div className="mb-3" style={{ fontSize: '3rem' }}>🧾</div>
                                    <p className="text-muted small mb-4">Selecciona un mes pagado para ver o generar el recibo correspondiente.</p>
                                    <button className="btn btn-primary w-100 mb-2" disabled>Generar Recibo (Demo)</button>
                                    <button className="btn btn-outline-secondary w-100" disabled>Descargar PDF</button>
                                </div>
                                <hr />
                                <div className="form-check form-switch">
                                    <input className="form-check-input" type="checkbox" id="reminders" defaultChecked />
                                    <label className="form-check-label small" htmlFor="reminders">Activar recordatorios automáticos</label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderCalculadora = () => {
        const handleCalculate = () => {
            // Mock calculation logic
            const factor = calcIndex === 'IPC' ? 1.5 : (calcIndex === 'ICL' ? 1.4 : 1.8);
            setCalcResult(calcAmount * factor);
        };

        return (
            <div className="calculator-layout">
                <div className="calculator-form">
                    <h4 className="fw-bold text-dark mb-4">Calculadora de Actualización</h4>

                    <div className="mb-3">
                        <label className="form-label">Monto Original</label>
                        <div className="input-group">
                            <span className="input-group-text">$</span>
                            <input
                                type="number"
                                className="form-control"
                                value={calcAmount}
                                onChange={e => setCalcAmount(Number(e.target.value))}
                            />
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Índice de Ajuste</label>
                        <select
                            className="form-select"
                            value={calcIndex}
                            onChange={e => setCalcIndex(e.target.value)}
                        >
                            <option value="ICL">ICL (Banco Central)</option>
                            <option value="IPC">IPC (Indec)</option>
                            <option value="UVA">UVA</option>
                        </select>
                    </div>

                    <div className="row mb-4">
                        <div className="col-6">
                            <label className="form-label">Desde</label>
                            <input type="date" className="form-control" value={calcStartDate} onChange={e => setCalcStartDate(e.target.value)} />
                        </div>
                        <div className="col-6">
                            <label className="form-label">Hasta</label>
                            <input type="date" className="form-control" value={calcEndDate} onChange={e => setCalcEndDate(e.target.value)} />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="form-label small text-muted">Fuente de Datos</label>
                        <div className="input-group">
                            <span className="input-group-text bg-light">🔒</span>
                            <input type="text" className="form-control bg-light" value="ArgenStats (Inmovia Server)" readOnly />
                        </div>
                        <div className="form-text">Solo backend – no se consulta directo desde el navegador</div>
                    </div>

                    <button className="btn btn-primary w-100 py-2" onClick={handleCalculate}>
                        Calcular Actualización
                    </button>
                </div>

                <div className="calculator-result">
                    <h5 className="text-white-50 text-uppercase letter-spacing-1">Nuevo Monto Estimado</h5>
                    {calcResult ? (
                        <>
                            <div className="result-amount">${calcResult.toLocaleString()}</div>
                            <div className="badge bg-success mb-4">+ {(calcResult / calcAmount * 100 - 100).toFixed(1)}%</div>

                            <table className="table table-dark table-sm w-75 text-center" style={{ fontSize: '0.85rem' }}>
                                <thead>
                                    <tr>
                                        <th>Mes</th>
                                        <th>Índice</th>
                                        <th>Factor</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Inicio</td>
                                        <td>100.0</td>
                                        <td>1.00</td>
                                    </tr>
                                    <tr>
                                        <td>Final</td>
                                        <td>{(100 * (calcResult / calcAmount)).toFixed(1)}</td>
                                        <td>{(calcResult / calcAmount).toFixed(2)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </>
                    ) : (
                        <div className="text-white-50 my-5">Completa el formulario para ver el resultado</div>
                    )}
                    <p className="small text-white-50 mt-auto">
                        * En esta demo los valores son simulados. En producción la API de Inmovia consultará ArgenStats.
                    </p>
                </div>
            </div>
        );
    };

    const renderConfiguracion = () => (
        <div className="container" style={{ maxWidth: '800px' }}>
            <div className="config-block">
                <h5 className="fw-bold text-dark mb-3">Modo de Gestión de Alquileres</h5>
                <p className="text-muted mb-4">
                    Define cómo Inmovia maneja tus contratos por defecto. Puedes cambiar esto individualmente en cada contrato.
                </p>
                <div className="d-flex gap-3">
                    <div className="p-3 border rounded bg-light flex-1">
                        <div className="fw-bold">Solo Contrato</div>
                        <small className="text-muted">Gestión documental básica.</small>
                    </div>
                    <div className="p-3 border rounded bg-white border-primary flex-1">
                        <div className="fw-bold text-primary">Seguimiento de Pagos</div>
                        <small className="text-muted">Gestión financiera completa.</small>
                    </div>
                </div>
            </div>

            <div className="config-block">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold text-dark m-0">Integración con Índices</h5>
                    <span className="demo-badge">Modo Demo</span>
                </div>
                <p className="text-muted">
                    En producción, el backend de Inmovia consultará ArgenStats y guardará IPC, ICL, UVA, etc. en caché local, para que la calculadora y los ajustes funcionen sin sobrecargar la API externa.
                </p>
            </div>

            <div className="config-block">
                <h5 className="fw-bold text-dark mb-3">Atajos desde Propiedades</h5>
                <div className="alert alert-secondary d-flex gap-3 align-items-center">
                    <span style={{ fontSize: '1.5rem' }}>🏠</span>
                    <div>
                        <strong>Automatización:</strong> Cuando una propiedad de tipo Alquiler pasa a Reservada, aparecerá un atajo en Propiedades para crear automáticamente el contrato en esta sección.
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="alquileres-page">
            <header className="alquileres-header">
                <h1 className="alquileres-title">Gestión de Alquileres</h1>
                <p className="alquileres-subtitle">Administración de contratos, cobros y actualizaciones.</p>
            </header>

            <div className="alquileres-main-card">
                {/* Tabs Navigation */}
                <div className="alquileres-tabs">
                    <div className={`alquileres-tab ${activeTab === 'RESUMEN' ? 'active' : ''}`} onClick={() => setActiveTab('RESUMEN')}>Resumen</div>
                    <div className={`alquileres-tab ${activeTab === 'CONTRATOS' ? 'active' : ''}`} onClick={() => setActiveTab('CONTRATOS')}>Contratos</div>
                    <div className={`alquileres-tab ${activeTab === 'PAGOS' ? 'active' : ''}`} onClick={() => setActiveTab('PAGOS')}>Pagos & Recibos</div>
                    <div className={`alquileres-tab ${activeTab === 'CALCULADORA' ? 'active' : ''}`} onClick={() => setActiveTab('CALCULADORA')}>Calculadora</div>
                    <div className={`alquileres-tab ${activeTab === 'CONFIGURACION' ? 'active' : ''}`} onClick={() => setActiveTab('CONFIGURACION')}>Configuración</div>
                </div>

                {/* Tab Content */}
                <div className="alquileres-content">
                    {loading ? (
                        <div className="text-center py-5 text-muted">Cargando módulo de alquileres...</div>
                    ) : (
                        <>
                            {activeTab === 'RESUMEN' && renderResumen()}
                            {activeTab === 'CONTRATOS' && renderContratos()}
                            {activeTab === 'PAGOS' && renderPagos()}
                            {activeTab === 'CALCULADORA' && renderCalculadora()}
                            {activeTab === 'CONFIGURACION' && renderConfiguracion()}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Alquileres;
