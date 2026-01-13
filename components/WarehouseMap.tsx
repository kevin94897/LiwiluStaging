import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { WarehouseMapItem } from '@/lib/cart';
import { useEffect } from 'react';

// Fix for default marker icon in Leaflet + Webpack/Next.js
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

// Custom Green Icon for Liwilu
const GreenIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface WarehouseMapProps {
    warehouses: WarehouseMapItem[];
    center?: [number, number];
    zoom?: number;
}

// Helper to update map view when warehouses change
function ChangeView({ warehouses, center }: { warehouses: WarehouseMapItem[], center?: [number, number] }) {
    const map = useMap();

    useEffect(() => {
        if (center) {
            map.setView(center, map.getZoom());
        } else if (warehouses.length > 0) {
            const bounds = L.latLngBounds(warehouses.map(w => [w.latitud, w.longitud]));
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [warehouses, center, map]);

    return null;
}

export default function WarehouseMap({ warehouses, center, zoom = 14 }: WarehouseMapProps) {
    const defaultCenter: [number, number] = center || (warehouses.length > 0
        ? [warehouses[0].latitud, warehouses[0].longitud]
        : [-12.046374, -77.042793]); // Lima center fallback

    return (
        <MapContainer
            center={defaultCenter}
            zoom={zoom}
            style={{ height: '100%', width: '100%' }}
            className="rounded-sm overflow-hidden"
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
            <ChangeView warehouses={warehouses} center={center} />
            {warehouses.map((warehouse) => (
                <Marker
                    key={warehouse.idAlmacen}
                    position={[warehouse.latitud, warehouse.longitud]}
                    icon={GreenIcon}
                >
                    <Popup>
                        <div className="p-1 min-w-[150px]">
                            <h3 className="font-semibold text-sm text-primary">{warehouse.desAlmacen}</h3>
                            <p className="text-xs text-gray-500 mt-1">Sede: {warehouse.idAlmacen}</p>
                            <p className="text-[10px] text-gray-400">Ubigeo: {warehouse.codUbigeoAlm}</p>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
