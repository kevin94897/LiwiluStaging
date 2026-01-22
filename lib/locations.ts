export const PERU_LOCATIONS: Record<string, Record<string, string[]>> = {
    "Lima": {
        "Lima": [
            "Ate", "Barranco", "Breña", "Carabayllo", "Cercado de Lima", "Chorrillos",
            "Comas", "El Agustino", "Independencia", "Jesús María", "La Molina",
            "La Victoria", "Lince", "Los Olivos", "Lurigancho", "Lurín",
            "Magdalena del Mar", "Miraflores", "Pachacamac", "Pucusana",
            "Pueblo Libre", "Puente Piedra", "Punta Hermosa", "Punta Negra",
            "Rímac", "San Bartolo", "San Borja", "San Isidro", "San Juan de Lurigancho",
            "San Juan de Miraflores", "San Luis", "San Martín de Porres", "San Miguel",
            "Santa Anita", "Santa María del Mar", "Santa Rosa", "Santiago de Surco",
            "Surquillo", "Villa El Salvador", "Villa María del Triunfo"
        ],
        "Barranca": ["Barranca", "Paramonga", "Pativilca", "Supe", "Supe Puerto"],
        "Cajatambo": ["Cajatambo", "Copa", "Gorgor", "Huancapón", "Manás"],
        "Cañete": ["San Vicente de Cañete", "Asia", "Calango", "Cerro Azul", "Chilca", "Coayllo", "Imperial", "Lunahuaná", "Mala", "Nuevo Imperial", "Pacarán", "Quilmaná", "San Antonio", "San Luis", "Santa Cruz de Flores", "Zúñiga"],
        "Huaral": ["Huaral", "Atavillos Alto", "Atavillos Bajo", "Aucallama", "Chancay", "Ihuarí", "Lampían", "Pacaraos", "San Miguel de Acos", "Santa Cruz de Andamarca", "Sumbilca", "Veintisiete de Noviembre"],
        "Huarochirí": ["Matucana", "Antioquía", "Callahuanca", "Carampoma", "Chicla", "Cuenca", "Huachupampa", "Huanza", "Huarochirí", "Lahuaytambo", "Langa", "Laraos", "Mariatana", "Ricardo Palma", "San Andrés de Tupicocha", "San Antonio", "San Bartolomé", "San Damián", "San Juan de Iris", "San Juan de Tantaranche", "San Lorenzo de Quinti", "San Mateo", "San Mateo de Otao", "San Pedro de Casta", "San Pedro de Huancayre", "Sangallaya", "Santa Cruz de Cocachacra", "Santa Eulalia", "Santiago de Anchucaya", "Santiago de Tuna", "Santo Domingo de los Olleros", "Surco"],
        "Huaura": ["Huacho", "Ámbar", "Caleta de Carquín", "Checras", "Hualmay", "Huaura", "Leoncio Prado", "Paccho", "Santa Leonor", "Santa María", "Sayán", "Végueta"],
        "Oyón": ["Oyón", "Andajes", "Caujul", "Cochamarca", "Naván", "Pachangara"],
        "Yauyos": ["Yauyos", "Alis", "Ayauca", "Ayaví", "Azángaro", "Cacra", "Carania", "Catahuasi", "Chocos", "Cochas", "Colonia", "Hongos", "Huampará", "Huancaya", "Huangáscar", "Huantán", "Huañec", "Laraos", "Lincha", "Madean", "Miraflores", "Omas", "Putinza", "Quinches", "Quinocay", "San Joaquín", "San Pedro de Pilas", "Tanta", "Tauripampa", "Tomas", "Tupe", "Viñac", "Vitis"]
    },
    "Arequipa": {
        "Arequipa": ["Arequipa", "Alto Selva Alegre", "Cayma", "Cerro Colorado", "Characato", "Chiguata", "Jacobo Hunter", "La Joya", "Mariano Melgar", "Miraflores", "Mollebaya", "Paucarpata", "Pocsi", "Polobaya", "Quequeña", "Sabandia", "Sachaca", "San Juan de Siguas", "San Juan de Tarucani", "Santa Isabel de Siguas", "Santa Rita de Siguas", "Socabaya", "Tiabaya", "Uchumayo", "Vitor", "Yanahuara", "Yarabamba", "Yura"],
        "Camana": ["Camaná", "José María Quimper", "Mariano Nicolás Valcárcel", "Mariscal Cáceres", "Nicolás de Piérola", "Ocoña", "Quilca", "Samuel Pastor"],
        "Caravelí": ["Caravelí", "Acarí", "Atico", "Atiquipa", "Bella Unión", "Cahuacho", "Chala", "Chaparra", "Huanuhuanu", "Jaqui", "Lomas", "Quicacha", "Yauca"]
    },
    "Cusco": {
        "Cusco": ["Cusco", "Ccorca", "Poroy", "San Jerónimo", "San Sebastián", "Santiago", "Saylla", "Wanchaq"],
        "Acomayo": ["Acomayo", "Acopia", "Acos", "Mosoc Llacta", "Pomacanchi", "Rondocan", "Sangarará"],
        "Anta": ["Anta", "Ancahuasi", "Cachimayo", "Chinchaypujio", "Huarocondo", "Limatambo", "Mollepata", "Pucyura", "Zurite"],
        "Calca": ["Calca", "Coya", "Lamay", "Lares", "Pisac", "San Salvador", "Taray", "Yanatile"],
        "Urubamba": ["Urubamba", "Chinchero", "Huayllabamba", "Machupicchu", "Maras", "Ollantaytambo", "Yucay"]
    },
    "Callao": {
        "Callao": ["Callao", "Bellavista", "Carmen de la Legua Reynoso", "La Perla", "La Punta", "Mi Perú", "Ventanilla"]
    },
    "La Libertad": {
        "Trujillo": ["Trujillo", "El Porvenir", "Florencia de Mora", "Huanchaco", "La Esperanza", "Laredo", "Moche", "Poroto", "Salaverry", "Simbal", "Victor Larco Herrera"],
        "Ascope": ["Ascope", "Casa Grande", "Chocope", "Magdalena de Cao", "Paiján", "Rázuri", "Santiago de Cao", "Sausacocha"]
    },
    // Se pueden agregar más departamentos según sea necesario
};

export const DEPARTAMENTOS = Object.keys(PERU_LOCATIONS).sort();
