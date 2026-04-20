// components/cart/TrimegistoBalance.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { getCurrentUser } from "@/lib/auth/authUtils";
import { apiPost, fetchUserProfile } from "@/lib/auth/apiClient";

import { formatPrice } from "@/lib/utils";
import { FaWallet, FaSync, FaTimesCircle, FaPlus, FaMinus, FaCheck } from "react-icons/fa";
import logger from "@/lib/logger";
import Button from "../ui/Button";

interface BalanceData {
    saldo_disponible: number;
    saldo_comprometido?: number;
    saldo_total?: number;
    message?: string;
    status?: boolean;
}

// Increment step for +/- buttons (in soles)
const STEP = 10;

interface TrimegistoBalanceProps {
    /** Total of the cart, used to cap the applied balance */
    cartTotal: number;
    /** Called whenever the user applies balance to the cart */
    onBalanceChange?: (applied: number, cuotas: number) => void;
    /** Called with the updated totals from the PUT response to refresh the order summary */
    onTotalsUpdate?: (totals: {
        subtotal: number;
        discount?: number;
        promoDiscount?: number;
        shipping: number;
        trismegistoBalance?: number;
        total: number;
    }) => void;
    /** Called after balance is successfully applied or removed — use to trigger a full cart sync */
    onAfterApply?: () => void;
    /** Amount already applied from a previous session/sync */
    initialBalanceAmount?: number;
    /** Installments already applied from a previous session/sync */
    initialBalanceInstallments?: number;
    /** Called whenever the "must apply before checkout" state changes */
    onPendingChange?: (isPending: boolean) => void;
    /** Increment this counter to force-reset the applied balance (e.g. when shipping changes) */
    resetTrigger?: number;
}

export default function TrimegistoBalance({
    cartTotal,
    onBalanceChange,
    onTotalsUpdate,
    onAfterApply,
    initialBalanceAmount = 0,
    initialBalanceInstallments = 1,
    onPendingChange,
    resetTrigger = 0,
}: TrimegistoBalanceProps) {
    const [balance, setBalance] = useState<BalanceData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isApplying, setIsApplying] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [applyError, setApplyError] = useState<string | null>(null);
    const [applied, setApplied] = useState(false);

    // Amount the user will apply from balance (0 = not using balance)
    const [appliedAmount, setAppliedAmount] = useState(initialBalanceAmount);
    const [cuotas, setCuotas] = useState(initialBalanceInstallments);
    const [availableCuotas, setAvailableCuotas] = useState<number[]>([1]);
    const [useBalanceToggle, setUseBalanceToggle] = useState(initialBalanceAmount > 0);

    useEffect(() => {
        if (initialBalanceAmount > 0) {
            setApplied(true);
            setAppliedAmount(initialBalanceAmount);
            setCuotas(initialBalanceInstallments);
            setUseBalanceToggle(true);
        }
    }, [initialBalanceAmount, initialBalanceInstallments]);

    // Auto-reset balance when resetTrigger changes (e.g. shipping changed)
    const [prevResetTrigger, setPrevResetTrigger] = useState(resetTrigger);
    useEffect(() => {
        if (resetTrigger !== prevResetTrigger) {
            setPrevResetTrigger(resetTrigger);
            if (applied && appliedAmount > 0) {
                // Saldo ya aplicado en backend — removerlo via API
                applyAmountToApi(0, 1).then(() => {
                    setAppliedAmount(0);
                    setCuotas(1);
                    setApplied(false);
                    setUseBalanceToggle(false);
                    notify(0, 1);
                });
            } else if (appliedAmount > 0) {
                // Monto ingresado pero no aplicado aún — solo resetear estado local
                setAppliedAmount(0);
                setCuotas(1);
                setApplied(false);
                setUseBalanceToggle(false);
                notify(0, 1);
            }
        }
    }, [resetTrigger]);

    // Notify parent whenever "pending apply" state changes:
    // pending = toggle is ON, amount > 0, but not yet applied via the button
    useEffect(() => {
        const isPending = useBalanceToggle && appliedAmount > 0 && !applied;
        onPendingChange?.(isPending);
    }, [useBalanceToggle, appliedAmount, applied, onPendingChange]);

    const user = typeof window !== "undefined" ? getCurrentUser() : null;

    // ── Step 1: Fetch available balance from /so-tp/consultar-saldo ──────
    const fetchBalance = useCallback(async () => {
        if (!user?.documentNumber) return;
        setIsLoading(true);
        setError(null);
        try {
            const [balanceResponse, profile] = await Promise.all([
                apiPost(
                    "/so-tp/consultar-saldo",
                    { numero_documento: user.documentNumber, opcion: "consultar_saldo" },
                    { skipAuth: true }
                ),
                fetchUserProfile(),
            ]);
            const data = await balanceResponse.json();
            if (balanceResponse.ok || data.status !== false) {
                setBalance(data);
            } else {
                setError(data.message || "No se pudo obtener el saldo.");
            }
            const maxInstallments = profile?.installments ?? 1;
            setAvailableCuotas(Array.from({ length: maxInstallments }, (_, i) => i + 1));
        } catch (err) {
            logger.error("Error al consultar saldo Trimegisto:", err);
            setError("Error al conectar con el servidor.");
        } finally {
            setIsLoading(false);
        }
    }, [user?.documentNumber, user?.documentType]);

    useEffect(() => {
        fetchBalance();
    }, [fetchBalance]);

    // Max amount the user can apply: min(balance, cartTotal)
    const maxApplicable = Math.min(
        balance?.saldo_disponible ?? 0,
        cartTotal
    );

    const notify = (amount: number, q: number) => {
        onBalanceChange?.(amount, q);
    };

    const handleIncrease = () => {
        const next = Math.min(appliedAmount + STEP, maxApplicable);
        setAppliedAmount(next);
        notify(next, cuotas);
        setApplied(false);
    };

    const handleDecrease = () => {
        const next = Math.max(appliedAmount - STEP, 0);
        setAppliedAmount(next);
        notify(next, cuotas);
        setApplied(false);
    };

    const handleSetMax = () => {
        setAppliedAmount(maxApplicable);
        notify(maxApplicable, cuotas);
        setApplied(false);
    };

    const handleCuotasChange = (q: number) => {
        setCuotas(q);
        notify(appliedAmount, q);
        setApplied(false);
    };

    // ── Step 2: Apply balance to cart via /cart/trismegisto-balance ───────
    const applyAmountToApi = async (amount: number, q: number) => {
        setIsApplying(true);
        setApplyError(null);
        try {
            // Use accessToken or liwilu_token as bearer
            const token =
                typeof window !== "undefined"
                    ? (localStorage.getItem("accessToken"))
                    : null;

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/cart/trismegisto-balance`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                    body: JSON.stringify({
                        balanceAmount: amount,
                        installments: q,
                    }),
                }
            );
            const data = await response.json();
            if (response.ok && data.success) {
                const confirmed = data.data;
                const confirmedAmount = confirmed.balanceAmount ?? amount;
                const confirmedCuotas = confirmed.balanceInstallments ?? q;

                setApplied(confirmedAmount > 0);
                setAppliedAmount(confirmedAmount);
                setCuotas(confirmedCuotas);
                notify(confirmedAmount, confirmedCuotas);
                onTotalsUpdate?.(confirmed.totals);
                onAfterApply?.();
            } else {
                setApplyError(data.message || "No se pudo aplicar el saldo.");
            }
        } catch (err) {
            logger.error("Error al aplicar saldo Trimegisto al carrito:", err);
            setApplyError("Error al conectar con el servidor.");
        } finally {
            setIsApplying(false);
        }
    };

    const handleApply = async () => {
        if (appliedAmount <= 0) return;
        await applyAmountToApi(appliedAmount, cuotas);
    };

    const handleToggle = async () => {
        const nextState = !useBalanceToggle;
        setUseBalanceToggle(nextState);
        if (!nextState && appliedAmount > 0) {
            // Auto remove if toggled off
            await applyAmountToApi(0, 1);
        }
    };

    return (
        <div className="bg-white rounded-sm shadow-lg p-6 animate-fade-in border-l-4 border-primary">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <FaWallet className="text-primary" size={18} />
                    <h3 className="text-base font-semibold text-gray-800">Saldo Trimegisto</h3>
                </div>
                <button
                    onClick={fetchBalance}
                    disabled={isLoading}
                    title="Actualizar saldo"
                    className="text-gray-400 hover:text-primary transition disabled:opacity-50"
                >
                    <FaSync size={14} className={isLoading ? "animate-spin" : ""} />
                </button>
            </div>

            {/* Loading */}
            {isLoading && (
                <div className="flex items-center gap-2 text-gray-500 text-sm py-2">
                    <FaSync size={12} className="animate-spin" />
                    Consultando saldo...
                </div>
            )}

            {/* Error */}
            {!isLoading && error && (
                <div className="flex items-center gap-2 text-red-500 text-sm py-2">
                    <FaTimesCircle size={14} />
                    {error}
                </div>
            )}

            {/* Balance content */}
            {!isLoading && !error && balance && (
                <div className="space-y-4">
                    {/* Switch Toggle */}
                    <div className="flex items-center justify-between mt-2 mb-2">
                        <label className="text-sm font-medium text-gray-700 cursor-pointer select-none" onClick={handleToggle}>
                            Usar saldo Trimegisto
                        </label>
                        <button
                            type="button"
                            role="switch"
                            aria-checked={useBalanceToggle}
                            onClick={handleToggle}
                            className={`${useBalanceToggle ? 'bg-primary' : 'bg-gray-200'
                                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50`}
                            disabled={isApplying}
                        >
                            <span
                                className={`${useBalanceToggle ? 'translate-x-6' : 'translate-x-1'
                                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                            />
                        </button>
                    </div>

                    {useBalanceToggle && (
                        <div className="animate-fade-in border-t border-gray-100 pt-4">
                            {/* Saldo disponible */}
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm text-gray-600">Saldo disponible</span>
                                <span className="text-lg font-bold text-primary">
                                    {formatPrice(String(balance.saldo_disponible ?? 0))}
                                </span>
                            </div>

                            {balance.saldo_comprometido !== undefined && (
                                <div className="flex justify-between items-center text-xs text-gray-400 mb-4">
                                    <span>Comprometido</span>
                                    <span>{formatPrice(String(balance.saldo_comprometido))}</span>
                                </div>
                            )}

                            <hr className="mb-4" />

                            {/* Amount to apply */}
                            <p className="text-sm font-medium text-gray-700 mb-2">
                                Saldo a usar en esta compra
                            </p>
                            <div className="flex items-center gap-3 mb-1">
                                <button
                                    onClick={handleDecrease}
                                    disabled={appliedAmount <= 0}
                                    className="min-w-8 w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-primary hover:text-primary transition disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <FaMinus size={11} />
                                </button>

                                <div className="flex-1 flex items-center border border-gray-200 rounded focus-within:ring-2 focus-within:ring-primary/30">
                                    <span className="pl-2 text-lg font-bold text-primary select-none">S/</span>
                                    <input
                                        type="number"
                                        min={0}
                                        max={maxApplicable}
                                        step="any"
                                        value={appliedAmount}
                                        onChange={(e) => {
                                            let val = parseFloat(e.target.value);
                                            if (isNaN(val)) val = 0;
                                            val = Math.max(0, Math.min(val, maxApplicable));
                                            val = Math.round(val * 100) / 100;
                                            setAppliedAmount(val);
                                            notify(val, cuotas);
                                            setApplied(false);
                                        }}
                                        className="w-full text-center text-lg font-bold text-primary bg-transparent px-2 py-1 focus:outline-none"
                                    />
                                </div>

                                <button
                                    onClick={handleIncrease}
                                    disabled={appliedAmount >= maxApplicable}
                                    className="min-w-8 w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-primary hover:text-primary transition disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <FaPlus size={11} />
                                </button>
                            </div>

                            <button
                                onClick={handleSetMax}
                                disabled={appliedAmount >= maxApplicable}
                                className="w-full text-xs text-primary hover:underline text-right mb-4 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Usar máximo ({formatPrice(String(maxApplicable))})
                            </button>

                            {/* Saldo restante en cuenta */}
                            {balance && (
                                <div className="flex justify-between text-md text-gray-400 mb-4">
                                    <span>Saldo restante en cuenta</span>
                                    <span>{formatPrice(String(Math.max((balance.saldo_disponible ?? 0) - appliedAmount, 0)))}</span>
                                </div>
                            )}

                            {/* Cuotas selector */}
                            <div className="mb-4">
                                <p className="text-md font-medium text-gray-700 mb-4">Número de cuotas</p>
                                <div className="flex gap-2">
                                    {availableCuotas.map((q) => (
                                        <button
                                            key={q}
                                            onClick={() => handleCuotasChange(q)}
                                            className={`flex-1 py-1.5 rounded-full text-sm border transition ${cuotas === q
                                                ? "bg-primary text-white border-primary font-semibold"
                                                : "bg-white text-gray-600 border-gray-300 hover:border-primary hover:text-primary"
                                                }`}
                                        >
                                            {`${q} cuotas`}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            

                            {/* Apply button */}
                            <Button
                                onClick={handleApply}
                                disabled={appliedAmount <= 0 || isApplying}
                                className={`w-full disabled:opacity-40 disabled:cursor-not-allowed transition-all ${
                                    !applied && appliedAmount > 0 && !isApplying
                                        ? "animate-pulse ring-primary ring-offset-2"
                                        : ""
                                }`}
                            >
                                {isApplying ? (
                                    <FaSync size={13} className="animate-spin" />
                                ) : applied ? (
                                    <><FaCheck size={13} /> Saldo aplicado</>
                                ) : (
                                    "Aplicar saldo"
                                )}
                            </Button>

                            {/* Aviso pendiente de aplicar */}
                            {!applied && appliedAmount > 0 && !isApplying && (
                                <p className="text-xs text-primary text-center mt-2 animate-fade-in">
                                    Haz click en <strong>Aplicar saldo</strong> para confirmar los cambios
                                </p>
                            )}

                            {/* Apply error */}
                            {applyError && (
                                <p className="text-xs text-red-500 mt-2 text-center">{applyError}</p>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
