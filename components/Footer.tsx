import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-teal-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-2xl font-bold mb-4">Liwilu</h3>
          <p className="text-sm">Donde la calidad y el precio se unen para ti.</p>
        </div>
        <div>
          <h4 className="font-bold mb-3">Tienda</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/productos">Productos</Link></li>
            <li><Link href="/ofertas">Ofertas</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-3">Ayuda</h4>
          <ul className="space-y-2 text-sm">
            <li>Política de devolución</li>
            <li>Términos y condiciones</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-3">Contacto</h4>
          <p className="text-sm">Call center: (01) 7010100</p>
          <p className="text-sm">Email: contacto@liwilu.com</p>
        </div>
      </div>
    </footer>
  );
}
