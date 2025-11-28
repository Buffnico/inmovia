import React, { useState, useEffect } from "react";
import { useAuth } from "../store/auth";

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

// --- Component ---

const Alquileres: React.FC = () => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";
    const { user } = useAuth();
    const [filterProperty, setFilterProperty] = useState("");

    // Role-based permission
    const canManageRentals = user && ["OWNER", "ADMIN", "MARTILLERO", "RECEPCIONISTA"].includes(user.role);

    // Data States
    const [contracts, setContracts] = useState<RentalContract[]>([]);
    const [paymentsByContract, setPaymentsByContract] = useState<Record<string, RentalPayment[]>>({});
    const [upcomingDue, setUpcomingDue] = useState<RentalPayment[]>([]);

    // UI States
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch Data
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };

        try {
            // 1. Fetch Contracts
            const resContracts = await fetch(`${API_BASE_URL}/alquileres/contratos`, { headers });
            const dataContracts = await resContracts.json();

            if (dataContracts.ok) {
                setContracts(dataContracts.data);

                // 2. Fetch Payments for each contract (simple approach for MVP)
                const paymentsMap: Record<string, RentalPayment[]> = {};
                for (const c of dataContracts.data) {
                    const resPayments = await fetch(`${API_BASE_URL}/alquileres/contratos/${c.id}/pagos`, { headers });
                    const dataPayments = await resPayments.json();
                    if (dataPayments.ok) {
                        paymentsMap[c.id] = dataPayments.data;
                    }
                }
                setPaymentsByContract(paymentsMap);
            } else {
                throw new Error(dataContracts.message || "Error al cargar contratos");
            }

            // 3. Fetch Upcoming Due (Stub)
            const resDue = await fetch(`${API_BASE_URL}/alquileres/vencimientos`, { headers });
            const dataDue = await resDue.json();
            if (dataDue.ok) {
                setUpcomingDue(dataDue.data);
            }

        } catch (err: any) {
            console.error("Error fetching alquileres:", err);
            setError(err.message || "Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Modal State
    const [isNewContractOpen, setIsNewContractOpen] = useState(false);

    // Helper to get month name
    const getMonthName = (monthNum: number) => {
        const date = new Date();
        date.setMonth(monthNum - 1);
        return date.toLocaleString('es-AR', { month: 'short' });
    };

    // Handle Payment Click
    const handlePaymentClick = async (payment: RentalPayment) => {
        if (!canManageRentals) return;

        if (payment.status === "PAGADO") {
            // Optional: Show tooltip or do nothing
            return;
        }

        if (payment.status === "PENDIENTE") {
            if (!window.confirm(`¿Marcar el mes de ${getMonthName(payment.month)} como PAGADO?`)) {
                return;
            }

            const token = localStorage.getItem('token');
            try {
                const res = await fetch(`${API_BASE_URL}/alquileres/pagos/${payment.id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ status: 'PAGADO' })
                });

                const data = await res.json();
                if (data.ok) {
                    // Update local state to reflect change immediately or refetch
                    // Refetching is safer to ensure consistency
                    fetchData();
                } else {
                    alert("Error al actualizar pago: " + data.message);
                }
            } catch (err) {
                console.error(err);
                alert("Error de red al actualizar pago");
            }
        }
    };

    return (
        <div className="page">
            {/* Header */}
            <header className="page-header">
                <div>
                    <h1 className="page-title">Alquileres</h1>
                    <p className="text-muted" style={{ fontSize: "0.9rem", marginTop: "4px" }}>
                        Gestión de contratos, cobros mensuales y calculadora de índices.
                    </p>
                </div>
                <div className="page-actions" style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <select
                        className="form-select"
                        value={filterProperty}
                        onChange={(e) => setFilterProperty(e.target.value)}
                        style={{ maxWidth: "200px" }}
                    >
                        <option value="">Todas las propiedades</option>
                        {/* TODO: Populate from properties API */}
                    </select>
                    <select className="form-select" style={{ maxWidth: "200px" }}>
                        <option value="">Todos los locadores</option>
                    </select>
                    <select className="form-select" style={{ maxWidth: "200px" }}>
                        <option value="activos">Contratos Activos</option>
                        <option value="todos">Todos</option>
                    </select>
                </div>
            </header>

            {/* Content Grid */}
            <div className="row" style={{ display: "flex", flexWrap: "wrap", gap: "24px", marginTop: "24px" }}>

                {/* Left Column (Contracts & Payments) */}
                <div style={{ flex: "2 1 600px", display: "flex", flexDirection: "column", gap: "24px" }}>

                    {/* Card: Contratos */}
                    <div className="card">
                        <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <h3 className="card-title">Contratos de Alquiler</h3>
                            <button className="btn btn-primary btn-sm" onClick={() => setIsNewContractOpen(true)}>
                                + Nuevo contrato
                            </button>
                        </div>
                        <div className="card-body" style={{ overflowX: "auto" }}>
                            {loading ? (
                                <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>Cargando contratos...</div>
                            ) : error ? (
                                <div style={{ padding: "20px", textAlign: "center", color: "red" }}>{error}</div>
                            ) : contracts.length === 0 ? (
                                <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>No hay contratos registrados.</div>
                            ) : (
                                <table className="table" style={{ width: "100%", borderCollapse: "collapse" }}>
                                    <thead>
                                        <tr style={{ textAlign: "left", borderBottom: "1px solid #eee" }}>
                                            <th style={{ padding: "12px" }}>Contrato / Propiedad</th>
                                            <th style={{ padding: "12px" }}>Monto Base</th>
                                            <th style={{ padding: "12px" }}>Vigencia</th>
                                            <th style={{ padding: "12px" }}>Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {contracts.map((c) => (
                                            <tr key={c.id} style={{ borderBottom: "1px solid #f9f9f9" }}>
                                                <td style={{ padding: "12px" }}>
                                                    <strong>{c.title}</strong>
                                                    {/* Placeholder for locador/locatario names until we link contacts */}
                                                    <div style={{ fontSize: "0.85rem", color: "#666" }}>ID: {c.id}</div>
                                                </td>
                                                <td style={{ padding: "12px" }}>${c.baseAmount.toLocaleString()}</td>
                                                <td style={{ padding: "12px", fontSize: "0.85rem" }}>
                                                    {c.startDate} <br /> a {c.endDate}
                                                </td>
                                                <td style={{ padding: "12px" }}>
                                                    <span
                                                        style={{
                                                            padding: "4px 8px",
                                                            borderRadius: "4px",
                                                            fontSize: "0.75rem",
                                                            backgroundColor: c.status === "ACTIVO" ? "#e6f4ea" : "#f1f3f4",
                                                            color: c.status === "ACTIVO" ? "#1e8e3e" : "#5f6368",
                                                            fontWeight: "bold",
                                                        }}
                                                    >
                                                        {c.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                    {/* Card: Cobros Mensuales */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Cobros mensuales</h3>
                        </div>
                        <div className="card-body">
                            {loading ? (
                                <div style={{ padding: "10px" }}>Cargando pagos...</div>
                            ) : contracts.filter(c => c.status === "ACTIVO").length === 0 ? (
                                <div style={{ padding: "10px", color: "#666" }}>No hay contratos activos.</div>
                            ) : (
                                contracts.filter(c => c.status === "ACTIVO").map(contract => {
                                    const payments = paymentsByContract[contract.id] || [];
                                    return (
                                        <div key={contract.id} style={{ marginBottom: "16px", paddingBottom: "16px", borderBottom: "1px solid #eee" }}>
                                            <div style={{ fontWeight: "bold", marginBottom: "8px" }}>{contract.title}</div>
                                            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                                {payments.length === 0 ? (
                                                    <span style={{ fontSize: "0.85rem", color: "#999" }}>Sin pagos registrados</span>
                                                ) : (
                                                    payments.map(p => {
                                                        const isPaid = p.status === "PAGADO";
                                                        const isPending = p.status === "PENDIENTE";
                                                        // Simple logic for "VENCIDO": if pending and due date passed (assuming due date exists)
                                                        // For now, let's trust the status or just check date if needed.
                                                        // User asked for "VENCIDO" style if status is VENCIDO.
                                                        const isOverdue = p.status === "VENCIDO";

                                                        let bgColor = "white";
                                                        let borderColor = "#ccc";
                                                        let textColor = "#666";

                                                        if (isPaid) {
                                                            bgColor = "#e6f4ea";
                                                            borderColor = "#1e8e3e";
                                                            textColor = "#1e8e3e";
                                                        } else if (isOverdue) {
                                                            bgColor = "#fce8e6";
                                                            borderColor = "#d93025";
                                                            textColor = "#d93025";
                                                        } else {
                                                            // Pending
                                                            bgColor = "#f1f3f4";
                                                            borderColor = "#dadce0";
                                                            textColor = "#3c4043";
                                                        }

                                                        const isClickable = canManageRentals && isPending;

                                                        return (
                                                            <div
                                                                key={p.id}
                                                                onClick={() => handlePaymentClick(p)}
                                                                style={{
                                                                    border: `1px solid ${borderColor}`,
                                                                    backgroundColor: bgColor,
                                                                    color: textColor,
                                                                    padding: "4px 12px",
                                                                    borderRadius: "16px",
                                                                    fontSize: "0.8rem",
                                                                    cursor: isClickable ? "pointer" : "default",
                                                                    userSelect: "none",
                                                                    transition: "all 0.2s",
                                                                    opacity: isClickable ? 1 : (isPaid ? 1 : 0.8)
                                                                }}
                                                                title={`Vence: ${p.dueDate} - Estado: ${p.status}`}
                                                            >
                                                                {getMonthName(p.month)} {p.year} {isPaid ? "✓" : ""}
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                </div>

                {/* Right Column (Calculator & Upcoming) */}
                <div style={{ flex: "1 1 300px", display: "flex", flexDirection: "column", gap: "24px" }}>

                    {/* Card: Calculadora */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Calculadora de índices (Beta)</h3>
                        </div>
                        <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            <div>
                                <label className="form-label" style={{ fontSize: "0.85rem" }}>Monto actual</label>
                                <input type="number" className="form-control" placeholder="Ej: 100000" />
                            </div>
                            <div>
                                <label className="form-label" style={{ fontSize: "0.85rem" }}>Índice</label>
                                <select className="form-select">
                                    <option>ICL (Banco Central)</option>
                                    <option>IPC (Indec)</option>
                                    <option>Casa Propia</option>
                                </select>
                            </div>
                            <div>
                                <label className="form-label" style={{ fontSize: "0.85rem" }}>Período</label>
                                <div style={{ display: "flex", gap: "8px" }}>
                                    <input type="date" className="form-control" />
                                    <input type="date" className="form-control" />
                                </div>
                            </div>
                            <button className="btn btn-primary" style={{ marginTop: "8px" }} onClick={() => alert("Función en desarrollo")}>
                                Calcular ajuste
                            </button>
                        </div>
                    </div>

                    {/* Card: Próximos vencimientos */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Próximos vencimientos</h3>
                        </div>
                        <div className="card-body">
                            {upcomingDue.length === 0 ? (
                                <div style={{ color: "#666", fontSize: "0.9rem" }}>No hay vencimientos pendientes.</div>
                            ) : (
                                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                                    {upcomingDue.map(due => (
                                        <li key={due.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "0.9rem" }}>
                                            <span>
                                                <div style={{ fontWeight: "bold" }}>{new Date(due.dueDate).toLocaleDateString()}</div>
                                                <div style={{ fontSize: "0.8rem", color: "#666" }}>Contrato ID: {due.contractId}</div>
                                            </span>
                                            <span style={{ color: "#d93025", fontWeight: "bold" }}>${due.amount.toLocaleString()}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                </div>
            </div>

            {/* New Contract Modal */}
            {isNewContractOpen && (
                <NewContractModal
                    onClose={() => setIsNewContractOpen(false)}
                    onSuccess={() => {
                        setIsNewContractOpen(false);
                        fetchData();
                    }}
                    apiBaseUrl={API_BASE_URL}
                />
            )}
        </div>
    );
};

// --- Internal Modal Component ---

interface NewContractModalProps {
    onClose: () => void;
    onSuccess: () => void;
    apiBaseUrl: string;
}

const NewContractModal: React.FC<NewContractModalProps> = ({ onClose, onSuccess, apiBaseUrl }) => {
    const [formData, setFormData] = useState({
        title: "",
        baseAmount: "",
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        status: "ACTIVO",
        indexType: "SIN_INDICE",
        notes: ""
    });
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.title || !formData.baseAmount || !formData.startDate || !formData.endDate) {
            setError("Por favor completá los campos obligatorios.");
            return;
        }

        if (parseFloat(formData.baseAmount) <= 0) {
            setError("El monto debe ser mayor a 0.");
            return;
        }

        setIsSaving(true);
        const token = localStorage.getItem('token');

        try {
            const res = await fetch(`${apiBaseUrl}/alquileres/contratos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    baseAmount: parseFloat(formData.baseAmount)
                })
            });

            const data = await res.json();
            if (data.ok) {
                onSuccess();
            } else {
                setError(data.message || "Error al guardar el contrato.");
            }
        } catch (err) {
            console.error(err);
            setError("Error de red al guardar.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="modal-backdrop" style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050
        }}>
            <div className="modal-dialog" style={{ maxWidth: '500px', width: '100%', margin: '1rem' }}>
                <div className="modal-content" style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    <div className="modal-header" style={{ padding: '1rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h5 className="modal-title" style={{ margin: 0, fontSize: '1.25rem' }}>Nuevo Contrato de Alquiler</h5>
                        <button type="button" className="btn-close" onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body" style={{ padding: '1rem' }}>
                            {error && <div className="alert alert-danger" style={{ color: '#721c24', backgroundColor: '#f8d7da', padding: '0.75rem', borderRadius: '0.25rem', marginBottom: '1rem' }}>{error}</div>}

                            <div className="mb-3" style={{ marginBottom: '1rem' }}>
                                <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Título del contrato *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Ej: Depto Lomas - 3 amb"
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ced4da' }}
                                    autoFocus
                                />
                            </div>

                            <div className="mb-3" style={{ marginBottom: '1rem' }}>
                                <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Monto base mensual *</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    name="baseAmount"
                                    value={formData.baseAmount}
                                    onChange={handleChange}
                                    placeholder="250000"
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ced4da' }}
                                />
                            </div>

                            <div className="row" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Inicio *</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleChange}
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ced4da' }}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Fin *</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleChange}
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ced4da' }}
                                    />
                                </div>
                            </div>

                            <div className="row" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Estado</label>
                                    <select
                                        className="form-select"
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ced4da' }}
                                    >
                                        <option value="ACTIVO">ACTIVO</option>
                                        <option value="FINALIZADO">FINALIZADO</option>
                                        <option value="SUSPENDIDO">SUSPENDIDO</option>
                                    </select>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Índice</label>
                                    <select
                                        className="form-select"
                                        name="indexType"
                                        value={formData.indexType}
                                        onChange={handleChange}
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ced4da' }}
                                    >
                                        <option value="SIN_INDICE">Sin Índice</option>
                                        <option value="IPC">IPC</option>
                                        <option value="ICL">ICL</option>
                                        <option value="OTRO">Otro</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Notas</label>
                                <textarea
                                    className="form-control"
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    rows={2}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ced4da' }}
                                />
                            </div>
                        </div>
                        <div className="modal-footer" style={{ padding: '1rem', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSaving}>Cancelar</button>
                            <button type="submit" className="btn btn-primary" disabled={isSaving}>
                                {isSaving ? 'Guardando...' : 'Guardar Contrato'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Alquileres;
