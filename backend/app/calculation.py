from typing import Dict, Any

COUNTRIES = {
    "US": {"name": "United States", "gridMultiplier": 1.15, "avgAnnualKg": 14800},
    "IN": {"name": "India", "gridMultiplier": 1.05, "avgAnnualKg": 1900},
    "GB": {"name": "United Kingdom", "gridMultiplier": 0.75, "avgAnnualKg": 5500},
    "DE": {"name": "Germany", "gridMultiplier": 0.85, "avgAnnualKg": 8200},
    "JP": {"name": "Japan", "gridMultiplier": 0.90, "avgAnnualKg": 8500},
    "CN": {"name": "China", "gridMultiplier": 1.10, "avgAnnualKg": 7600},
    "BR": {"name": "Brazil", "gridMultiplier": 0.55, "avgAnnualKg": 2400},
    "CA": {"name": "Canada", "gridMultiplier": 0.95, "avgAnnualKg": 14200},
    "AU": {"name": "Australia", "gridMultiplier": 1.25, "avgAnnualKg": 15100},
}

SUB_SECTORS_FACTORS = {
    # Transportation (weekly * 52)
    "electric_rickshaw": {"factor": 0.03, "freq": 52, "sector": "transportation"},
    "car_gasoline": {"factor": 0.12, "freq": 52, "sector": "transportation"},
    "two_wheeler": {"factor": 0.08, "freq": 52, "sector": "transportation"},
    "public_transit": {"factor": 0.05, "freq": 52, "sector": "transportation"},
    "air_travel": {"factor": 0.20, "freq": 52, "sector": "transportation"},
    # Energy (monthly * 12)
    "solar": {"factor": 0.05, "freq": 12, "sector": "energy"},
    "wind": {"factor": 0.05, "freq": 12, "sector": "energy"},
    "coal": {"factor": 1.00, "freq": 12, "sector": "energy"},
    "natural_gas": {"factor": 0.50, "freq": 12, "sector": "energy"},
    "hydroelectric": {"factor": 0.05, "freq": 12, "sector": "energy"},
    # Industry (weekly * 52)
    "manufacturing": {"factor": 2.50, "freq": 52, "sector": "industry"},
    "construction": {"factor": 3.00, "freq": 52, "sector": "industry"},
    "mining": {"factor": 4.00, "freq": 52, "sector": "industry"},
    "textile": {"factor": 2.00, "freq": 52, "sector": "industry"},
    "food_processing": {"factor": 2.00, "freq": 52, "sector": "industry"},
    # Agriculture (annual * 100)
    "crop_farming": {"factor": 1.50, "freq": 100, "sector": "agriculture"},
    "livestock": {"factor": 5.00, "freq": 100, "sector": "agriculture"},
    "aquaculture": {"factor": 2.50, "freq": 100, "sector": "agriculture"},
    "forestry": {"factor": 0.50, "freq": 100, "sector": "agriculture"},
}

def calculate_footprint(country_code: str, inputs: Dict[str, float]) -> Dict[str, Any]:
    country = COUNTRIES.get(country_code.upper(), COUNTRIES["US"])
    
    transport_annual = 0.0
    energy_annual = 0.0
    industry_annual = 0.0
    agriculture_annual = 0.0

    for sub_id, val in inputs.items():
        if sub_id not in SUB_SECTORS_FACTORS:
            continue
        cleaned_val = max(0.0, float(val))
        meta = SUB_SECTORS_FACTORS[sub_id]
        contribution = cleaned_val * meta["freq"] * meta["factor"]

        if meta["sector"] == "transportation":
            transport_annual += contribution
        elif meta["sector"] == "energy":
            energy_annual += contribution
        elif meta["sector"] == "industry":
            industry_annual += contribution
        elif meta["sector"] == "agriculture":
            agriculture_annual += contribution

    total_annual_kg = max(0.0, round(transport_annual + energy_annual + industry_annual + agriculture_annual, 2))
    total_metric_tons = round(total_annual_kg / 1000.0, 2)
    national_avg_tons = round(country["avgAnnualKg"] / 1000.0, 2)
    global_avg_tons = 4.8

    potential_reduction_tons = round(total_metric_tons * 0.25, 2)
    potential_credits = max(10.0, round(potential_reduction_tons * 12.0, 1))

    if total_metric_tons < national_avg_tons * 0.6:
        rating = "A+"
    elif total_metric_tons < national_avg_tons * 0.85:
        rating = "A"
    elif total_metric_tons < national_avg_tons * 1.1:
        rating = "B"
    elif total_metric_tons < national_avg_tons * 1.4:
        rating = "C"
    else:
        rating = "D"

    return {
        "transport_annual_kg": round(transport_annual, 2),
        "energy_annual_kg": round(energy_annual, 2),
        "industry_annual_kg": round(industry_annual, 2),
        "agriculture_annual_kg": round(agriculture_annual, 2),
        "total_annual_kg": total_annual_kg,
        "total_metric_tons": total_metric_tons,
        "national_avg_tons": national_avg_tons,
        "global_avg_tons": global_avg_tons,
        "potential_reduction_tons": potential_reduction_tons,
        "potential_credits": potential_credits,
        "rating": rating,
    }
