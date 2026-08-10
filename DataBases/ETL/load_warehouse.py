"""
TraveXperience - Load al Data Warehouse (esquema en estrella reducido)
========================================================================
Entrada:  usuarios_raw.json, itinerarios_raw.json, actividad_raw.json
Salida:   /warehouse_load/*.json  (un archivo por tabla, listos para INSERT)

Uso:
    python load_warehouse.py --input ./Raw --output ./warehouse_load
"""

import json
import argparse
from pathlib import Path
from datetime import datetime


def cargar_json(path: Path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def guardar_json(data, path: Path):
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def date_key(fecha_str: str) -> int:
    """Convierte 'YYYY-MM-DD...' a formato YYYYMMDD (int) para dim_date."""
    fecha = datetime.fromisoformat(fecha_str.replace("Z", "+00:00"))
    return int(fecha.strftime("%Y%m%d"))


def date_row(fecha_str: str) -> dict:
    fecha = datetime.fromisoformat(fecha_str.replace("Z", "+00:00"))
    dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
    meses = ["", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio",
             "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
    return {
        "date_key": int(fecha.strftime("%Y%m%d")),
        "full_date": fecha.strftime("%Y-%m-%d"),
        "day": fecha.day,
        "month": fecha.month,
        "month_name": meses[fecha.month],
        "quarter": (fecha.month - 1) // 3 + 1,
        "year": fecha.year,
        "weekday_name": dias[fecha.weekday()],
        "is_weekend": fecha.weekday() >= 5,
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", default="./Raw")
    parser.add_argument("--output", default="./warehouse_load")
    args = parser.parse_args()

    input_dir = Path(args.input)
    output_dir = Path(args.output)

    usuarios = cargar_json(input_dir / "usuarios_processed.json")
    itinerarios = cargar_json(input_dir / "itinerarios_processed.json")
    actividad = cargar_json(input_dir / "actividad_raw.json")

    # Salvaguarda: por si llegara algún registro con fecha nula pese a Processed
    n_antes = len(itinerarios)
    itinerarios = [it for it in itinerarios if it.get("startDate")]
    if n_antes != len(itinerarios):
        print(f"[aviso] {n_antes - len(itinerarios)} itinerarios con startDate nulo omitidos")

    # ------------------------------------------------------------
    # dim_user
    # ------------------------------------------------------------
    dim_user = []
    user_key_map = {}
    for i, u in enumerate(usuarios, start=1):
        user_key_map[u["id"]] = i
        dim_user.append({
            "user_key": i,
            "user_id": u["id"],
            "full_name": u["fullName"],
            "role": u["role"],
            "location": u.get("location"),
            "is_active": True,
        })

    # ------------------------------------------------------------
    # dim_destination
    # ------------------------------------------------------------
    destinos = sorted({it["destination"] for it in itinerarios})
    dim_destination = [{"destination_key": i, "destination_name": d} for i, d in enumerate(destinos, start=1)]
    destination_key_map = {d["destination_name"]: d["destination_key"] for d in dim_destination}

    # ------------------------------------------------------------
    # dim_status
    # ------------------------------------------------------------
    estados = sorted({it["status"] for it in itinerarios})
    dim_status = [{"status_key": i, "status_value": s} for i, s in enumerate(estados, start=1)]
    status_key_map = {s["status_value"]: s["status_key"] for s in dim_status}

    # ------------------------------------------------------------
    # dim_event_type
    # ------------------------------------------------------------
    eventos = sorted({a["eventType"] for a in actividad})
    dim_event_type = [{"event_type_key": i, "event_type": e} for i, e in enumerate(eventos, start=1)]
    event_type_key_map = {e["event_type"]: e["event_type_key"] for e in dim_event_type}

    # ------------------------------------------------------------
    # dim_source
    # ------------------------------------------------------------
    fuentes = sorted({a["source"] for a in actividad})
    dim_source = [{"source_key": i, "source_name": s} for i, s in enumerate(fuentes, start=1)]
    source_key_map = {s["source_name"]: s["source_key"] for s in dim_source}

    # ------------------------------------------------------------
    # dim_date  (unión de fechas de itinerarios + actividad)
    # ------------------------------------------------------------
    fechas_vistas = {}
    for it in itinerarios:
        fechas_vistas[date_key(it["startDate"])] = it["startDate"]
    for a in actividad:
        fechas_vistas[date_key(a["createdAt"])] = a["createdAt"]
    dim_date = [date_row(v) for v in fechas_vistas.values()]
    dim_date.sort(key=lambda d: d["date_key"])

    # ------------------------------------------------------------
    # fact_itineraries
    # ------------------------------------------------------------
    fact_itineraries = []
    itinerarios_omitidos = 0
    for i, it in enumerate(itinerarios, start=1):
        if it["userId"] not in user_key_map:
            itinerarios_omitidos += 1
            continue
        fact_itineraries.append({
            "itinerary_key": i,
            "itinerary_id": it["id"],
            "user_key": user_key_map[it["userId"]],
            "destination_key": destination_key_map[it["destination"]],
            "date_key": date_key(it["startDate"]),
            "status_key": status_key_map[it["status"]],
            "duration_days": it.get("durationDays"),
            "num_activities": it.get("numActivities"),
            "estimated_budget": it.get("estimatedBudget"),
        })

    # ------------------------------------------------------------
    # fact_activity
    # ------------------------------------------------------------
    fact_activity = []
    actividad_omitida = 0
    for i, a in enumerate(actividad, start=1):
        if a["userId"] not in user_key_map:
            actividad_omitida += 1
            continue
        fact_activity.append({
            "activity_key": i,
            "user_key": user_key_map[a["userId"]],
            "date_key": date_key(a["createdAt"]),
            "event_type_key": event_type_key_map[a["eventType"]],
            "source_key": source_key_map[a["source"]],
            "event_count": 1,
        })

    # ------------------------------------------------------------
    # Guardar todo
    # ------------------------------------------------------------
    tablas = {
        "dim_date": dim_date,
        "dim_user": dim_user,
        "dim_destination": dim_destination,
        "dim_status": dim_status,
        "dim_event_type": dim_event_type,
        "dim_source": dim_source,
        "fact_itineraries": fact_itineraries,
        "fact_activity": fact_activity,
    }
    for nombre, data in tablas.items():
        guardar_json(data, output_dir / f"{nombre}.json")

    print("=" * 55)
    print("Carga del Data Warehouse completada")
    print("=" * 55)
    for nombre, data in tablas.items():
        print(f"{nombre:<20} {len(data):>5} filas")
    if itinerarios_omitidos:
        print(f"\n[aviso] {itinerarios_omitidos} itinerarios omitidos (userId sin match)")
    if actividad_omitida:
        print(f"[aviso] {actividad_omitida} eventos de actividad omitidos (userId sin match)")
    print(f"\nArchivos guardados en: {output_dir.resolve()}")


if __name__ == "__main__":
    main()
