import json
import random
from datetime import date, timedelta

random.seed(42)

# ---------------------------------------------------------------------------
# 1. Usuarios de la región Xicotepec / Necaxa / Huauchinango (Sierra Norte de Puebla)
# ---------------------------------------------------------------------------

LOCATIONS = [
    "Xicotepec de Juárez, Puebla",
    "Necaxa, Puebla",
    "Huauchinango, Puebla",
]

FIRST_NAMES_M = [
    "Carlos", "Miguel", "José Luis", "Alejandro", "Fernando", "Ricardo", "Jorge",
    "Iván", "Raúl", "Emmanuel", "Adrián", "Sergio", "Marco Antonio", "Diego",
    "Gustavo", "Ángel", "Rodrigo", "Julio César", "Erick", "Omar",
]
FIRST_NAMES_F = [
    "María Fernanda", "Guadalupe", "Itzel", "Ximena", "Alejandra", "Daniela",
    "Karla", "Yolanda", "Perla", "Andrea", "Fátima", "Brenda", "Lizbeth",
    "Cecilia", "Araceli", "Nayeli", "Rosa Isela", "Verónica", "Paola", "Estefanía",
]
LAST_NAMES = [
    "Hernández", "García", "Martínez", "López", "Rodríguez", "Pérez", "Sánchez",
    "Ramírez", "Cruz", "Flores", "Torres", "Vázquez", "Reyes", "Gómez", "Morales",
    "Jiménez", "Romero", "Ortega", "Domínguez", "Contreras", "Aguilar", "Bautista",
    "Zacarías", "Xolo", "Meza",
]

BIO_TEMPLATES_AVENTURA = [
    "Me encanta el senderismo y explorar cascadas cerca de la Sierra.",
    "Busco siempre la próxima aventura: rappel, tirolesa, lo que sea con adrenalina.",
    "Fanático del buceo y los deportes extremos cuando salgo de viaje.",
    "Si hay una montaña que escalar o un río que cruzar, ahí voy a estar.",
]
BIO_TEMPLATES_CULTURA = [
    "Me fascina visitar museos, zonas arqueológicas e historia local.",
    "Disfruto mucho conocer la gastronomía y las tradiciones de cada pueblo.",
    "Amante del arte, la arquitectura colonial y los mercados artesanales.",
    "Prefiero un buen recorrido cultural antes que cualquier otra cosa.",
]
BIO_TEMPLATES_FAMILIAR = [
    "Viajo casi siempre con mi familia, buscando lugares tranquilos y seguros.",
    "Me gusta planear vacaciones familiares con actividades para todos.",
    "Disfruto el descanso en playa con mis hijos más que la aventura extrema.",
]
BIO_TEMPLATES_MIXTO = [
    "Un poco de todo: cultura por el día, buena comida por la noche.",
    "Me gusta combinar naturaleza con algo de vida nocturna.",
    "Viajero curioso, cada destino lo disfruto diferente.",
]

def make_email(full_name, idx):
    base = full_name.lower()
    base = (base.replace("á","a").replace("é","e").replace("í","i")
                .replace("ó","o").replace("ú","u").replace(" ", "."))
    domains = ["gmail.com", "hotmail.com", "outlook.com"]
    return f"{base}{idx}@{random.choice(domains)}"

def generate_user(temp_id):
    is_female = random.random() > 0.5
    first = random.choice(FIRST_NAMES_F if is_female else FIRST_NAMES_M)
    last1 = random.choice(LAST_NAMES)
    last2 = random.choice(LAST_NAMES)
    full_name = f"{first} {last1} {last2}"

    age = random.randint(18, 70)
    location = random.choice(LOCATIONS)

    # Correlaciones realistas (tendencias, no reglas rígidas)
    if age <= 28:
        interes_aventura = random.random() < 0.70
        interes_cultura = random.random() < 0.45
        viaja_solo = random.random() < 0.55
        avg_budget = round(random.uniform(1500, 5000), 2)
        bio_pool = BIO_TEMPLATES_AVENTURA if interes_aventura else BIO_TEMPLATES_MIXTO
    elif age >= 45:
        interes_aventura = random.random() < 0.20
        interes_cultura = random.random() < 0.65
        viaja_solo = random.random() < 0.20
        avg_budget = round(random.uniform(6000, 18000), 2)
        bio_pool = BIO_TEMPLATES_FAMILIAR if random.random() < 0.6 else BIO_TEMPLATES_CULTURA
    else:
        interes_aventura = random.random() < 0.45
        interes_cultura = random.random() < 0.55
        viaja_solo = random.random() < 0.35
        avg_budget = round(random.uniform(4000, 12000), 2)
        bio_pool = BIO_TEMPLATES_MIXTO

    bio = random.choice(bio_pool)
    phone = "+52" + "".join(str(random.randint(0, 9)) for _ in range(10))
    role = "administrador" if temp_id <= 3 else "usuario"  # 3 de 60 admins (~5%)
    company_name = None
    if role == "administrador":
        company_name = random.choice([
            "Hoteles Sierra Norte", "Tours Xicotepec", "Cabañas Necaxa Adventure",
        ])

    return {
        "tempId": temp_id,
        "fullName": full_name,
        "email": make_email(full_name, temp_id),
        "role": role,
        "companyName": company_name,
        "phone": phone,
        "location": location,
        "bio": bio,
        "travelPreferences": {
            "avgBudget": avg_budget,
            "age": age,
            "interesAventura": interes_aventura,
            "interesCultura": interes_cultura,
            "viajaSolo": viaja_solo,
        },
    }

users = [generate_user(i) for i in range(1, 61)]

# ---------------------------------------------------------------------------
# 2. Itinerarios — destinos turísticos reales de México (a donde viajan,
#    no de donde son)
# ---------------------------------------------------------------------------

DESTINATIONS = {
    "Cancún": {"cost_tier": "alto", "activities": [
        "Snorkel en arrecife", "Tour a Isla Mujeres", "Visita a Xcaret",
        "Zona hotelera y playa", "Cenote Dos Ojos",
    ]},
    "Tulum": {"cost_tier": "alto", "activities": [
        "Zona arqueológica de Tulum", "Snorkel en cenote", "Playa Paraíso",
        "Reserva de Sian Ka'an",
    ]},
    "Los Cabos": {"cost_tier": "alto", "activities": [
        "El Arco en lancha", "Buceo en Cabo Pulmo", "Playa El Médano",
    ]},
    "Ciudad de México": {"cost_tier": "medio", "activities": [
        "Museo Nacional de Antropología", "Centro Histórico y Zócalo",
        "Xochimilco en trajinera", "Teotihuacán", "Barrio de Coyoacán",
    ]},
    "Oaxaca": {"cost_tier": "medio", "activities": [
        "Mercado de Benito Juárez", "Monte Albán", "Hierve el Agua",
        "Mezcalería tradicional",
    ]},
    "Guadalajara": {"cost_tier": "medio", "activities": [
        "Centro Histórico y Catedral", "Tlaquepaque artesanal", "Tequila (pueblo mágico)",
    ]},
    "Puerto Vallarta": {"cost_tier": "medio-alto", "activities": [
        "Malecón y zona romántica", "Islas Marietas", "Playa Mismaloya",
    ]},
    "Mérida": {"cost_tier": "medio", "activities": [
        "Paseo de Montejo", "Cenotes de Cuzamá", "Uxmal",
    ]},
    "San Miguel de Allende": {"cost_tier": "medio", "activities": [
        "Parroquia de San Miguel", "Mercado de artesanías", "Mirador El Chorro",
    ]},
    "Guanajuato": {"cost_tier": "medio", "activities": [
        "Callejón del Beso", "Museo de las Momias", "Funicular al Pípila",
    ]},
    "Veracruz": {"cost_tier": "bajo-medio", "activities": [
        "Malecón y zona portuaria", "Acuario de Veracruz", "Isla de Sacrificios",
    ]},
    "Monterrey": {"cost_tier": "medio", "activities": [
        "Parque Fundidora", "Cerro de la Silla", "Cola de Caballo",
    ]},
    "Puebla (Centro)": {"cost_tier": "bajo", "activities": [
        "Centro Histórico y Zócalo", "Talavera en Barrio de los Artistas",
        "Cholula y Gran Pirámide",
    ]},
    "Xalapa": {"cost_tier": "bajo", "activities": [
        "Museo de Antropología de Xalapa", "Parque Los Berros", "Cascada de Texolo",
    ]},
    "Chiapas (San Cristóbal)": {"cost_tier": "medio", "activities": [
        "Cañón del Sumidero", "Centro histórico de San Cristóbal", "San Juan Chamula",
    ]},
    "Papantla": {"cost_tier": "bajo", "activities": [
        "El Tajín", "Voladores de Papantla", "Centro histórico",
    ]},
}

COST_MULTIPLIER = {"bajo": 550, "bajo-medio": 650, "medio": 800, "medio-alto": 1000, "alto": 1300}

STATUSES_WEIGHTED = (
    ["finalizado"] * 40 + ["confirmado"] * 30 + ["borrador"] * 15 +
    ["en_curso"] * 8 + ["cancelado"] * 7
)

TITLE_TEMPLATES = [
    "Escapada de fin de semana a {dest}",
    "Vacaciones familiares en {dest}",
    "Aventura por {dest}",
    "Viaje cultural a {dest}",
    "Descanso y playa en {dest}",
    "Roadtrip a {dest}",
    "Fin de año en {dest}",
]

def random_date_range():
    start = date(2025, 7, 1) + timedelta(days=random.randint(0, 520))
    duration = random.randint(1, 15)
    end = start + timedelta(days=duration - 1)
    return start, end, duration

def generate_itinerary(temp_id, owner):
    dest_name = random.choice(list(DESTINATIONS.keys()))
    dest_info = DESTINATIONS[dest_name]
    start, end, duration = random_date_range()

    num_activities = random.randint(0, min(8, len(dest_info["activities"]) + 2))
    chosen_activities = random.sample(
        dest_info["activities"], k=min(num_activities, len(dest_info["activities"]))
    )
    itinerary_details = [
        {"actividad": act, "dia": random.randint(1, duration)}
        for act in chosen_activities
    ]

    base_daily_cost = COST_MULTIPLIER[dest_info["cost_tier"]]
    budget_noise = random.uniform(0.85, 1.2)
    # Se ancla también al avgBudget del dueño, para que sea coherente con su perfil
    owner_budget_factor = owner["travelPreferences"]["avgBudget"] / 6000
    estimated_budget = round(
        duration * base_daily_cost * budget_noise * (0.6 + 0.4 * owner_budget_factor)
        + len(itinerary_details) * 250,
        2,
    )

    title = random.choice(TITLE_TEMPLATES).format(dest=dest_name)

    return {
        "tempId": temp_id,
        "userTempId": owner["tempId"],
        "title": title,
        "destination": dest_name,
        "startDate": start.isoformat(),
        "endDate": end.isoformat(),
        "estimatedBudget": estimated_budget,
        "itineraryDetails": itinerary_details,
        "status": random.choice(STATUSES_WEIGHTED),
    }

# Reparto no uniforme de itinerarios por usuario (algunos con 1, otros con 3-4)
itineraries = []
temp_id = 1
regular_users = [u for u in users if u["role"] == "usuario"]
for user in regular_users:
    n_itin = random.choices([0, 1, 2, 3, 4], weights=[5, 35, 30, 20, 10])[0]
    for _ in range(n_itin):
        itineraries.append(generate_itinerary(temp_id, user))
        temp_id += 1

# Ajuste para acercarnos a 150 itinerarios si el reparto aleatorio se quedó corto/largo
while len(itineraries) < 150:
    owner = random.choice(regular_users)
    itineraries.append(generate_itinerary(temp_id, owner))
    temp_id += 1
itineraries = itineraries[:150]

with open("/home/claude/seed-data/users.json", "w", encoding="utf-8") as f:
    json.dump(users, f, ensure_ascii=False, indent=2)

with open("/home/claude/seed-data/itineraries.json", "w", encoding="utf-8") as f:
    json.dump(itineraries, f, ensure_ascii=False, indent=2)

print(f"Usuarios generados: {len(users)}")
print(f"Itinerarios generados: {len(itineraries)}")
print("\nEjemplo de usuario:")
print(json.dumps(users[0], ensure_ascii=False, indent=2))
print("\nEjemplo de itinerario:")
print(json.dumps(itineraries[0], ensure_ascii=False, indent=2))

# Verificaciones rápidas de calidad
locations_count = {}
for u in users:
    locations_count[u["location"]] = locations_count.get(u["location"], 0) + 1
print("\nDistribución por ubicación de origen:", locations_count)

budgets = [i["estimatedBudget"] for i in itineraries]
print(f"Presupuesto min/max/prom: {min(budgets):.2f} / {max(budgets):.2f} / {sum(budgets)/len(budgets):.2f}")
