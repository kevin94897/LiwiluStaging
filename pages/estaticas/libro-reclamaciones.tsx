// pages/libro-reclamaciones.tsx
'use client';

import { useState } from 'react';
import Layout from '@/components/Layout';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaFileAlt, FaCheckCircle } from 'react-icons/fa';
import Link from 'next/link';

export default function LibroReclamaciones() {
    const [enviado, setEnviado] = useState(false);
    const [enviando, setEnviando] = useState(false);
    const [formData, setFormData] = useState({
        tipoDocumento: 'DNI',
        numeroDocumento: '',
        nombres: '',
        apellidos: '',
        telefono: '',
        email: '',
        direccion: '',
        departamento: '',
        provincia: '',
        distrito: '',
        tipoReclamo: 'reclamo',
        tipoProducto: 'producto',
        descripcionProducto: '',
        montoReclamado: '',
        detalleReclamo: '',
        pedidoDetalle: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async () => {
        setEnviando(true);

        // Simular envío
        await new Promise(resolve => setTimeout(resolve, 2000));

        setEnviado(true);
        setEnviando(false);

        // Resetear después de 5 segundos
        setTimeout(() => {
            setEnviado(false);
            setFormData({
                tipoDocumento: 'DNI',
                numeroDocumento: '',
                nombres: '',
                apellidos: '',
                telefono: '',
                email: '',
                direccion: '',
                departamento: '',
                provincia: '',
                distrito: '',
                tipoReclamo: 'reclamo',
                tipoProducto: 'producto',
                descripcionProducto: '',
                montoReclamado: '',
                detalleReclamo: '',
                pedidoDetalle: ''
            });
        }, 5000);
    };

    if (enviado) {
        return (
            <Layout title="Libro de Reclamaciones - Liwilu" description="Gracias por tu reclamo" background={true}>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
                    <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center animate-fade-in">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FaCheckCircle className="text-4xl text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            ¡Reclamo enviado exitosamente!
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Hemos recibido tu reclamo/queja. Nos pondremos en contacto contigo en un plazo máximo de 15 días hábiles.
                        </p>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                            <p className="text-sm text-green-800">
                                <strong>Número de seguimiento:</strong> LR-{Math.floor(Math.random() * 1000000)}
                            </p>
                        </div>
                        <Link
                            href="/"
                            className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-3 rounded-full transition-all duration-300"
                        >
                            Volver al inicio
                        </Link>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="Libro de Reclamaciones - Liwilu" description="Libro de Reclamaciones Online" background={true}>
            <div className="min-h-screen bg-gray-50 py-12 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Header con logo oficial */}
                    <div className="bg-white rounded-3xl shadow-lg p-8 mb-8 z-10 relative">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
                            <div className="flex-1">
                                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                                    Libro de Reclamaciones
                                </h1>
                                <p className="text-gray-600">
                                    Conforme a lo establecido en el Código de Protección y Defensa del Consumidor
                                </p>
                            </div>
                            <div className="flex-shrink-0">
                                <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <span className="text-4xl font-bold text-green-600">LIWILU</span>
                                </div>
                            </div>
                        </div>

                        <div className="border-t pt-6 space-y-2 text-sm text-gray-700">
                            <p><strong>Razón Social:</strong> LIWILU E.I.R.L.</p>
                            <p><strong>RUC:</strong> 20123456789</p>
                            <p><strong>Dirección:</strong> Av. Principal 123, Lima, Perú</p>
                        </div>
                    </div>

                    {/* Formulario */}
                    <div className="bg-white rounded-3xl shadow-lg p-8 space-y-8">
                        {/* Datos del Consumidor */}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b-2 border-green-500">
                                1. Datos del Consumidor Reclamante
                            </h2>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Tipo de Documento *
                                    </label>
                                    <select
                                        name="tipoDocumento"
                                        value={formData.tipoDocumento}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition"
                                    >
                                        <option value="DNI">DNI</option>
                                        <option value="CE">Carné de Extranjería</option>
                                        <option value="Pasaporte">Pasaporte</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Número de Documento *
                                    </label>
                                    <input
                                        type="text"
                                        name="numeroDocumento"
                                        value={formData.numeroDocumento}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition"
                                        placeholder="12345678"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        <FaUser className="inline mr-2" />
                                        Nombres *
                                    </label>
                                    <input
                                        type="text"
                                        name="nombres"
                                        value={formData.nombres}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition"
                                        placeholder="Juan Carlos"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        <FaUser className="inline mr-2" />
                                        Apellidos *
                                    </label>
                                    <input
                                        type="text"
                                        name="apellidos"
                                        value={formData.apellidos}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition"
                                        placeholder="Pérez García"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        <FaPhone className="inline mr-2" />
                                        Teléfono *
                                    </label>
                                    <input
                                        type="tel"
                                        name="telefono"
                                        value={formData.telefono}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition"
                                        placeholder="999 888 777"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        <FaEnvelope className="inline mr-2" />
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition"
                                        placeholder="correo@ejemplo.com"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        <FaMapMarkerAlt className="inline mr-2" />
                                        Dirección *
                                    </label>
                                    <input
                                        type="text"
                                        name="direccion"
                                        value={formData.direccion}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition"
                                        placeholder="Av. Los Pinos 123, Urb. Las Flores"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Departamento *
                                    </label>
                                    <input
                                        type="text"
                                        name="departamento"
                                        value={formData.departamento}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition"
                                        placeholder="Lima"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Provincia *
                                    </label>
                                    <input
                                        type="text"
                                        name="provincia"
                                        value={formData.provincia}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition"
                                        placeholder="Lima"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Distrito *
                                    </label>
                                    <input
                                        type="text"
                                        name="distrito"
                                        value={formData.distrito}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition"
                                        placeholder="Miraflores"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Identificación del Bien Contratado */}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b-2 border-green-500">
                                2. Identificación del Bien Contratado
                            </h2>

                            <div className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Tipo *
                                        </label>
                                        <select
                                            name="tipoProducto"
                                            value={formData.tipoProducto}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition"
                                        >
                                            <option value="producto">Producto</option>
                                            <option value="servicio">Servicio</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Monto Reclamado (S/) *
                                        </label>
                                        <input
                                            type="number"
                                            name="montoReclamado"
                                            value={formData.montoReclamado}
                                            onChange={handleInputChange}
                                            step="0.01"
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Descripción del Producto/Servicio *
                                    </label>
                                    <textarea
                                        name="descripcionProducto"
                                        value={formData.descripcionProducto}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition resize-none"
                                        placeholder="Describe el producto o servicio contratado"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Número de Pedido (opcional)
                                    </label>
                                    <input
                                        type="text"
                                        name="pedidoDetalle"
                                        value={formData.pedidoDetalle}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition"
                                        placeholder="#2153603"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Detalle del Reclamo */}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b-2 border-green-500">
                                3. Detalle de la Reclamación o Queja
                            </h2>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Tipo *
                                    </label>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-green-500 transition">
                                            <input
                                                type="radio"
                                                name="tipoReclamo"
                                                value="reclamo"
                                                checked={formData.tipoReclamo === 'reclamo'}
                                                onChange={handleInputChange}
                                                className="mr-3 w-5 h-5 text-green-600"
                                            />
                                            <div>
                                                <p className="font-semibold text-gray-900">Reclamo</p>
                                                <p className="text-xs text-gray-600">Disconformidad con el producto o servicio</p>
                                            </div>
                                        </label>
                                        <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-green-500 transition">
                                            <input
                                                type="radio"
                                                name="tipoReclamo"
                                                value="queja"
                                                checked={formData.tipoReclamo === 'queja'}
                                                onChange={handleInputChange}
                                                className="mr-3 w-5 h-5 text-green-600"
                                            />
                                            <div>
                                                <p className="font-semibold text-gray-900">Queja</p>
                                                <p className="text-xs text-gray-600">Disconformidad con la atención al cliente</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        <FaFileAlt className="inline mr-2" />
                                        Detalle del Reclamo/Queja *
                                    </label>
                                    <textarea
                                        name="detalleReclamo"
                                        value={formData.detalleReclamo}
                                        onChange={handleInputChange}
                                        rows={6}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition resize-none"
                                        placeholder="Describe detalladamente tu reclamo o queja. Incluye fechas, situaciones y cualquier información relevante."
                                    />
                                    <p className="text-xs text-gray-500 mt-2">
                                        Mínimo 50 caracteres. Sea lo más específico posible.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Información Legal */}
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
                            <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                Información Importante
                            </h3>
                            <ul className="text-sm text-gray-700 space-y-2">
                                <li>• La empresa responderá tu reclamo en un plazo máximo de 15 días hábiles.</li>
                                <li>• Recibirás un número de seguimiento para consultar el estado de tu reclamo.</li>
                                <li>• Todos los campos marcados con (*) son obligatorios.</li>
                                <li>• Tu información será tratada conforme a nuestra Política de Privacidad.</li>
                            </ul>
                        </div>

                        {/* Botón de envío */}
                        <div className="flex justify-center pt-6">
                            <button
                                onClick={handleSubmit}
                                disabled={enviando}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold px-12 py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                            >
                                {enviando ? 'Enviando...' : 'Enviar Reclamo'}
                            </button>
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="mt-8 text-center text-sm text-gray-600">
                        <p>
                            Para más información, puedes contactarnos al <strong>(01) 234-5678</strong> o al correo{' '}
                            <strong>reclamos@liwilu.com</strong>
                        </p>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out;
                }
            `}</style>
        </Layout>
    );
}