import Head from 'next/head';
import { useState } from 'react';
import Layout from '@/components/Layout';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaFileAlt, FaCheckCircle } from 'react-icons/fa';
import Link from 'next/link';
import { z } from 'zod';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';

const reclamacionesSchema = z.object({
    tipoDocumento: z.string().min(1, "Selecciona el tipo de documento"),
    numeroDocumento: z.string().min(8, "Mínimo 8 caracteres").max(20, "Máximo 20 caracteres"),
    nombres: z.string().min(2, "Ingresa tus nombres"),
    apellidos: z.string().min(2, "Ingresa tus apellidos"),
    telefono: z.string().min(9, "Mínimo 9 dígitos").regex(/^[\d+\s-]+$/, "Número inválido"),
    email: z.string().email("Correo inválido"),
    direccion: z.string().min(10, "Dirección muy corta"),
    departamento: z.string().min(2, "Ingresa el departamento"),
    provincia: z.string().min(2, "Ingresa la provincia"),
    distrito: z.string().min(2, "Ingresa el distrito"),
    tipoReclamo: z.enum(['reclamo', 'queja']),
    tipoProducto: z.enum(['producto', 'servicio']),
    descripcionProducto: z.string().min(10, "Descripción muy corta"),
    montoReclamado: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Monto inválido"
    }),
    detalleReclamo: z.string().min(20, "El detalle debe tener al menos 20 caracteres"),
    pedidoDetalle: z.string().optional()
});

type ReclamacionesFormValues = z.infer<typeof reclamacionesSchema>;

export default function LibroReclamaciones() {
    const [enviado, setEnviado] = useState(false);
    const [enviando, setEnviando] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<keyof ReclamacionesFormValues, string>>>({});

    const [formData, setFormData] = useState<ReclamacionesFormValues>({
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
        // Limpiar error al escribir
        if (errors[name as keyof ReclamacionesFormValues]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSubmit = async () => {
        setEnviando(true);
        setErrors({});

        // Validación Zod
        const result = reclamacionesSchema.safeParse(formData);
        if (!result.success) {
            const formattedErrors = result.error.flatten().fieldErrors;
            const newErrors: Partial<Record<keyof ReclamacionesFormValues, string>> = {};

            for (const key in formattedErrors) {
                const errorArray = formattedErrors[key as keyof typeof formattedErrors];
                if (errorArray?.length) {
                    newErrors[key as keyof ReclamacionesFormValues] = errorArray[0];
                }
            }
            setErrors(newErrors);
            setEnviando(false);
            // Scroll al primer error
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        try {
            const payload = {
                fecha: new Date().toISOString().split('T')[0], // "YYYY-MM-DD"
                nombres: formData.nombres,
                apellidos: formData.apellidos,
                domicilio: `${formData.direccion}, ${formData.distrito}, ${formData.provincia}, ${formData.departamento}`,
                documentoIdentidad: formData.numeroDocumento,
                telefono: formData.telefono,
                correoElectronico: formData.email,
                esProducto: formData.tipoProducto === 'producto',
                esServicio: formData.tipoProducto === 'servicio',
                montoReclamado: Number(formData.montoReclamado),
                descripcionProductoServicio: formData.descripcionProducto,
                esReclamo: formData.tipoReclamo === 'reclamo',
                esQueja: formData.tipoReclamo === 'queja',
                detalleReclamoQueja: formData.detalleReclamo,
                detallePedido: formData.pedidoDetalle || "N/A",
                prefiereRespuestaDireccion: false,
                prefiereRespuestaCorreo: true
            };

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/general/libro-reclamaciones`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Error al enviar el reclamo');
            }

            setEnviado(true);

            // Resetear después de mostrar el mensaje de éxito
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

        } catch (error) {
            console.error('Error enviando reclamo:', error);
            alert('Hubo un error al enviar tu reclamo. Por favor intenta nuevamente.');
        } finally {
            setEnviando(false);
        }
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
                        <div className="bg-green-50 border border-green-200 rounded-sm p-4 mb-6">
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
                                <div className="w-32 h-32 bg-gray-100 rounded-sm flex items-center justify-center">
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
                                    <Select
                                        label="Tipo de Documento *"
                                        name="tipoDocumento"
                                        value={formData.tipoDocumento}
                                        onChange={handleInputChange}
                                        error={errors.tipoDocumento}
                                    >
                                        <option value="DNI">DNI</option>
                                        <option value="CE">Carné de Extranjería</option>
                                        <option value="Pasaporte">Pasaporte</option>
                                    </Select>
                                </div>

                                <div>
                                    <Input
                                        label="Número de Documento *"
                                        type="text"
                                        name="numeroDocumento"
                                        value={formData.numeroDocumento}
                                        onChange={handleInputChange}
                                        placeholder="12345678"
                                        error={errors.numeroDocumento}
                                    />
                                </div>

                                <div>
                                    <Input
                                        label="Nombres *"
                                        type="text"
                                        name="nombres"
                                        value={formData.nombres}
                                        onChange={handleInputChange}
                                        placeholder="Juan Carlos"
                                        error={errors.nombres}
                                    />
                                </div>

                                <div>
                                    <Input
                                        label="Apellidos *"
                                        type="text"
                                        name="apellidos"
                                        value={formData.apellidos}
                                        onChange={handleInputChange}
                                        placeholder="Pérez García"
                                        error={errors.apellidos}
                                    />
                                </div>

                                <div>
                                    <Input
                                        label="Teléfono *"
                                        type="tel"
                                        name="telefono"
                                        value={formData.telefono}
                                        onChange={handleInputChange}
                                        placeholder="999 888 777"
                                        error={errors.telefono}
                                    />
                                </div>

                                <div>
                                    <Input
                                        label="Email *"
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="correo@ejemplo.com"
                                        error={errors.email}
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <Input
                                        label="Dirección *"
                                        type="text"
                                        name="direccion"
                                        value={formData.direccion}
                                        onChange={handleInputChange}
                                        placeholder="Av. Los Pinos 123, Urb. Las Flores"
                                        error={errors.direccion}
                                    />
                                </div>

                                <div>
                                    <Input
                                        label="Departamento *"
                                        type="text"
                                        name="departamento"
                                        value={formData.departamento}
                                        onChange={handleInputChange}
                                        placeholder="Lima"
                                        error={errors.departamento}
                                    />
                                </div>

                                <div>
                                    <Input
                                        label="Provincia *"
                                        type="text"
                                        name="provincia"
                                        value={formData.provincia}
                                        onChange={handleInputChange}
                                        placeholder="Lima"
                                        error={errors.provincia}
                                    />
                                </div>

                                <div>
                                    <Input
                                        label="Distrito *"
                                        type="text"
                                        name="distrito"
                                        value={formData.distrito}
                                        onChange={handleInputChange}
                                        placeholder="Miraflores"
                                        error={errors.distrito}
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
                                        <Select
                                            label="Tipo *"
                                            name="tipoProducto"
                                            value={formData.tipoProducto}
                                            onChange={handleInputChange}
                                            error={errors.tipoProducto}
                                        >
                                            <option value="producto">Producto</option>
                                            <option value="servicio">Servicio</option>
                                        </Select>
                                    </div>

                                    <div>
                                        <Input
                                            label="Monto Reclamado (S/) *"
                                            type="number"
                                            name="montoReclamado"
                                            value={formData.montoReclamado}
                                            onChange={handleInputChange}
                                            step="0.01"
                                            placeholder="0.00"
                                            error={errors.montoReclamado}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Textarea
                                        label="Descripción del Producto/Servicio *"
                                        name="descripcionProducto"
                                        value={formData.descripcionProducto}
                                        onChange={handleInputChange}
                                        rows={3}
                                        placeholder="Describe el producto o servicio contratado"
                                        error={errors.descripcionProducto}
                                    />
                                </div>

                                <div>
                                    <Input
                                        label="Número de Pedido (opcional)"
                                        type="text"
                                        name="pedidoDetalle"
                                        value={formData.pedidoDetalle}
                                        onChange={handleInputChange}
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
                                        <label className="flex items-center p-4 border-2 border-gray-200 rounded-sm cursor-pointer hover:border-green-500 transition">
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
                                        <label className="flex items-center p-4 border-2 border-gray-200 rounded-sm cursor-pointer hover:border-green-500 transition">
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
                                    <Textarea
                                        label="Detalle del Reclamo/Queja *"
                                        name="detalleReclamo"
                                        value={formData.detalleReclamo}
                                        onChange={handleInputChange}
                                        rows={6}
                                        placeholder="Describe detalladamente tu reclamo o queja. Incluye fechas, situaciones y cualquier información relevante."
                                        error={errors.detalleReclamo}
                                    />
                                    <p className="text-xs text-gray-500 mt-2">
                                        Mínimo 50 caracteres. Sea lo más específico posible.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Información Legal */}
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-sm">
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
                            <Button onClick={handleSubmit} disabled={enviando}>
                                {enviando ? 'Enviando...' : 'Enviar Reclamo'}
                            </Button>
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