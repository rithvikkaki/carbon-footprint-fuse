import json
from sqlalchemy.orm import Session
from backend.app.models import (
    User,
    SustainableProduct,
    Reward,
    CompanyPartner,
    MarketListing,
    CreditBatch,
    CreditVerificationLog,
    UserReductionTarget,
    CorporateFacility,
    CorporateEmissionRecord,
)
from backend.app.security import get_password_hash

INITIAL_PRODUCTS = [
    {
        "id": "prod-watch-1",
        "name": "Solios Solar-Powered Recycled Steel Watch",
        "category": "Watches",
        "price_usd": 290.0,
        "price_eth": 0.091,
        "price_cct": 24.0,
        "seller": "Solios Horology (Certified B-Corp)",
        "description": "High-precision solar timepiece with invisible cells that charge under natural or artificial light. Never requires battery replacement.",
        "sustainability_claims": json.dumps([
            "Eliminates disposable watch battery waste completely",
            "Case crafted from 100% recycled 316L stainless steel",
            "Certified solvent-free vegan eco-leather strap",
            "1 tree planted per watch via OneTreePlanted"
        ]),
        "materials": "Recycled 316L Stainless Steel, Solar Quartz, Vegan Apple Leather",
        "stock": 14,
        "rating": 4.9,
        "image_url": "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80",
        "certifications": json.dumps(["B-Corp Certified", "RoHS Compliant", "1% for the Planet"]),
    },
    {
        "id": "prod-watch-2",
        "name": "Awake .01 Ocean Waste Chronometer",
        "category": "Watches",
        "price_usd": 320.0,
        "price_eth": 0.100,
        "price_cct": 28.0,
        "seller": "Awake Concept Studio",
        "description": "Engineered with OceanBound plastic polymer cases collected from Southeast Asian coastlines and rivers. Solar movement with unlimited lifespan.",
        "sustainability_claims": json.dumps([
            "Over 40 plastic bottles diverted from oceans per watch",
            "Solar movement powered by daylight or ambient light",
            "FSC-certified zero-waste kraft paper gift packaging"
        ]),
        "materials": "Recycled Ocean Polymer, Solar Cell Dial, Bio-TPU Strap",
        "stock": 9,
        "rating": 4.8,
        "image_url": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
        "certifications": json.dumps(["OceanBound Certified", "Zero Waste Packaging"]),
    },
    {
        "id": "prod-watch-3",
        "name": "Nordgreen Pioneer Scandinavian Chronograph",
        "category": "Watches",
        "price_usd": 270.0,
        "price_eth": 0.084,
        "price_cct": 22.0,
        "seller": "Nordgreen Copenhagen",
        "description": "Red Dot Design award winner with certified carbon-neutral Danish production. Modular interchangeable vegan straps and sapphire crystal.",
        "sustainability_claims": json.dumps([
            "Carbon-neutral corporate operations since 2020",
            "Giving Back Programme: 200 liters clean water funded per sale",
            "Zero single-use plastics throughout supply logistics"
        ]),
        "materials": "Surgically Recycled Stainless Steel, Domed Sapphire Crystal",
        "stock": 12,
        "rating": 4.7,
        "image_url": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80",
        "certifications": json.dumps(["B-Corp Certified", "Climate Neutral Certified"]),
    },
    {
        "id": "prod-watch-4",
        "name": "Original Grain Reclaimed Whiskey Barrel Wood Watch",
        "category": "Watches",
        "price_usd": 310.0,
        "price_eth": 0.097,
        "price_cct": 26.0,
        "seller": "Original Grain Artisans",
        "description": "Individually handcrafted timepiece featuring upcycled American white oak reclaimed from Kentucky bourbon distillery barrels.",
        "sustainability_claims": json.dumps([
            "100% reclaimed authentic bourbon oak stave wood",
            "FSC certified sustainable harvesting offsets",
            "1 tree planted in East Africa for every watch crafted"
        ]),
        "materials": "Reclaimed White Oak, Matte Black 316L Stainless Steel",
        "stock": 6,
        "rating": 4.9,
        "image_url": "https://images.unsplash.com/photo-1533139502658-0198f920d8e8?auto=format&fit=crop&w=800&q=80",
        "certifications": json.dumps(["FSC Certified Wood", "Trees for the Future Partner"]),
    },
    {
        "id": "prod-lifestyle-1",
        "name": "Klean Kanteen Climate Lock Vacuum Insulated Flask",
        "category": "Lifestyle",
        "price_usd": 38.0,
        "price_eth": 0.012,
        "price_cct": 4.0,
        "seller": "Klean Kanteen Certified",
        "description": "Constructed from 90% post-consumer recycled 18/8 stainless steel, eliminating lifetime single-use bottle consumption.",
        "sustainability_claims": json.dumps([
            "90% post-consumer recycled steel construction",
            "Climate Neutral Certified manufacturing",
            "Eliminates ~1,400 single-use bottles per user annually"
        ]),
        "materials": "90% Post-Consumer Recycled 18/8 Stainless Steel",
        "stock": 45,
        "rating": 4.8,
        "image_url": "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80",
        "certifications": json.dumps(["B-Corp Certified", "1% for the Planet"]),
    },
    {
        "id": "prod-lifestyle-2",
        "name": "EcoVibe Circular Home Zero-Waste Starter Kit",
        "category": "Lifestyle",
        "price_usd": 54.0,
        "price_eth": 0.017,
        "price_cct": 5.5,
        "seller": "EcoVibe Zero Waste",
        "description": "Comprehensive kitchen and home kit featuring organic bamboo fiber brushes, organic cotton produce bags, and solid shampoo bars.",
        "sustainability_claims": json.dumps([
            "100% compostable and biodegradable materials",
            "Zero virgin plastic components or synthetic dyes",
            "Zero-waste carbon neutral delivery"
        ]),
        "materials": "Moso Bamboo, GOTS Organic Cotton, Natural Sisal Fiber",
        "stock": 30,
        "rating": 4.7,
        "image_url": "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80",
        "certifications": json.dumps(["GOTS Certified", "Plastic Free Trustmark"]),
    },
]

INITIAL_REWARDS = [
    {
        "id": "rew-1",
        "title": "Patagonia Worn Wear $50 Gear Repair Voucher",
        "category": "Lifestyle",
        "cost_cct": 15.0,
        "provider": "Patagonia Outdoor Gear",
        "description": "Redeem for official garments maintenance, hardware replacement, and seam repair to extend equipment lifespan.",
    },
    {
        "id": "rew-2",
        "title": "Lime Urban E-Bike 30-Day Commute Pass",
        "category": "Mobility",
        "cost_cct": 20.0,
        "provider": "Lime Micro-Mobility Network",
        "description": "Unlimited unlocks and 30 minutes daily zero-emission e-bike and scooter commuting across 120 global cities.",
    },
    {
        "id": "rew-3",
        "title": "OneTreePlanted 25 Native Saplings Certificate",
        "category": "Restoration",
        "cost_cct": 10.0,
        "provider": "OneTreePlanted Global Forest Project",
        "description": "Funds planting of 25 indigenous trees in critically deforested ecosystems with GPS coordinate tracking.",
    },
    {
        "id": "rew-4",
        "title": "Eurail Global Train Travel 25% Discount Code",
        "category": "Travel",
        "cost_cct": 35.0,
        "provider": "Eurail Group Community",
        "description": "25% discount voucher on continuous cross-border European rail passes, substituting short-haul flights.",
    },
    {
        "id": "rew-5",
        "title": "Lush Fresh Handmade Cosmetics $30 Eco-Pack",
        "category": "Lifestyle",
        "cost_cct": 12.0,
        "provider": "Lush Cosmetics",
        "description": "Package-free solid shampoo, body bars, and ethical fair-trade botanicals with zero landfill footprint.",
    },
    {
        "id": "rew-6",
        "title": "Tier Mobility 100 Free Ride Minutes Bundle",
        "category": "Mobility",
        "cost_cct": 8.0,
        "provider": "Tier Climate Mobility",
        "description": "Zero-emission electric scooter credits valid across municipal bike corridors in 80 cities worldwide.",
    },
    {
        "id": "rew-7",
        "title": "The Ocean Cleanup Marine Interceptor Adoption",
        "category": "Restoration",
        "cost_cct": 25.0,
        "provider": "The Ocean Cleanup Foundation",
        "description": "Funds extraction and mechanical processing of 50 kg river plastic waste before ocean entry.",
    },
    {
        "id": "rew-8",
        "title": "Sleeper Train Cross-Country Berthing Pass",
        "category": "Travel",
        "cost_cct": 40.0,
        "provider": "Nightjet / European Sleeper",
        "description": "Direct sleeper cabin discount voucher connecting European capitals with 90% lower CO₂ than flying.",
    },
]

INITIAL_PARTNERS = [
    {
        "id": "comp-1",
        "name": "GreenTech Innovations Inc.",
        "industry": "Renewable Energy & Grid Storage",
        "tier": "Direct Corporate Partner",
        "location": "Berlin, Germany",
        "emissions_reduced": "18,500 tCO₂e / year",
        "description": "Utility-scale bifacial solar and vanadium flow battery microgrid developer providing clean power.",
        "website": "https://greentechinnovations.example.org",
        "connected": True,
    },
    {
        "id": "comp-2",
        "name": "EcoTransport Logistics GmbH",
        "industry": "Freight & Green Logistics",
        "tier": "Tier 1 Supplier",
        "location": "Rotterdam, Netherlands",
        "emissions_reduced": "12,200 tCO₂e / year",
        "description": "Operating zero-emission hydrogen-electric heavy goods vehicles and electric canal barges across Europe.",
        "website": "https://ecotransportlogistics.example.org",
        "connected": True,
    },
    {
        "id": "comp-3",
        "name": "Sustainable Retail Co.",
        "industry": "Circular Consumer Goods",
        "tier": "Tier 2 Supplier",
        "location": "Stockholm, Sweden",
        "emissions_reduced": "6,800 tCO₂e / year",
        "description": "Circular supply-chain consortium enforcing zero-plastic packaging guidelines across 400 supplier nodes.",
        "website": "https://sustainableretail.example.org",
        "connected": False,
    },
    {
        "id": "comp-4",
        "name": "Green Buildings & Infrastructure Inc.",
        "industry": "Low-Carbon Architecture & Concrete",
        "tier": "Tier 1 Supplier",
        "location": "Toronto, Canada",
        "emissions_reduced": "24,000 tCO₂e / year",
        "description": "Pioneering carbon-cured bio-concrete and mass timber construction reducing embodied building emissions.",
        "website": "https://greenbuildings.example.org",
        "connected": False,
    },
    {
        "id": "comp-5",
        "name": "EcoHealth Solutions International",
        "industry": "Medical Supply Sustainability",
        "tier": "Tier 2 Supplier",
        "location": "Zurich, Switzerland",
        "emissions_reduced": "4,100 tCO₂e / year",
        "description": "Hospital medical device reconditioning and biopolymer cold-chain packaging reducing medical waste.",
        "website": "https://ecohealth.example.org",
        "connected": False,
    },
    {
        "id": "comp-6",
        "name": "Sustainable Farming Collective",
        "industry": "Regenerative Agriculture",
        "tier": "Tier 1 Supplier",
        "location": "Nairobi, Kenya",
        "emissions_reduced": "15,800 tCO₂e / year",
        "description": "Smallholder farmer agroforestry network applying biochar soil enhancement to maximize soil carbon.",
        "website": "https://farmingcollective.example.org",
        "connected": True,
    },
]

def seed_database(db: Session):
    # Seed Demo User
    demo_user = db.query(User).filter(User.email == "demo@ecofuse.org").first()
    if not demo_user:
        demo_user = User(
            id="usr_demo_1001",
            email="demo@ecofuse.org",
            name="Rithvik Kaki",
            hashed_password=get_password_hash("password123"),
            organization="Carbon Footprint Fuse Lab",
            country="United States",
            wallet_address="0x71C8A6517a4c4B2bB8251e604F18df7B08B57497",
            role="user",
            credit_balance=420.0,
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)

    # Seed Admin User
    admin_user = db.query(User).filter(User.role == "admin").first()
    if not admin_user:
        admin_user = User(
            id="usr_admin_1001",
            email="admin@ecofuse.org",
            name="Accredited Verifier Admin",
            hashed_password=get_password_hash("adminpass123"),
            organization="EcoFuse Standards & Verification Authority",
            country="United States",
            role="admin",
            credit_balance=1000.0,
        )
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)

    # Seed Sustainable Products
    if db.query(SustainableProduct).count() == 0:
        for p in INITIAL_PRODUCTS:
            prod = SustainableProduct(**p)
            db.add(prod)
        db.commit()

    # Seed Rewards
    if db.query(Reward).count() == 0:
        for r in INITIAL_REWARDS:
            rew = Reward(**r)
            db.add(rew)
        db.commit()

    # Seed Partners
    if db.query(CompanyPartner).count() == 0:
        for cp in INITIAL_PARTNERS:
            partner = CompanyPartner(**cp)
            db.add(partner)
        db.commit()

    # Seed Traceable Credit Batches
    if demo_user:
        sample_batches = [
            {
                "id": "batch-vcs-101",
                "batch_number": "CCT-2024-VCS-AMAZON-01",
                "owner_id": demo_user.id,
                "creator_id": demo_user.id,
                "project_name": "Amazon Rainforest Afforestation Block #44",
                "project_type": "Reforestation & Biodiversity Protection",
                "project_location": "Pará, Brazil",
                "methodology": "VM0007 / VCS REDD+ Methodology",
                "registry_name": "Verra VCS (Simulated Prototype Registry)",
                "registry_id": "VCS-9824",
                "vintage_year": 2024,
                "initial_quantity": 500.0,
                "available_quantity": 350.0,
                "unit": "tCO2e",
                "verification_org": "TÜV SÜD South America Audits",
                "verification_status": "verified",
                "evidence_doc_name": "Amazon_Block44_Verification_Report_2024.pdf",
                "evidence_doc_url": "https://ecofuse.org/evidence/VCS-9824-audit-2024.pdf",
                "evidence_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                "is_retired": False,
            },
            {
                "id": "batch-gs-102",
                "batch_number": "CCT-2024-GS-WIND-02",
                "owner_id": demo_user.id,
                "creator_id": demo_user.id,
                "project_name": "Nordic Offshore Wind Park Generation",
                "project_type": "Renewable Wind Energy",
                "project_location": "North Sea, Denmark",
                "methodology": "ACM0002 Grid-Connected Renewable Generation",
                "registry_name": "Gold Standard for the Global Goals (Simulated)",
                "registry_id": "GS-4109",
                "vintage_year": 2024,
                "initial_quantity": 300.0,
                "available_quantity": 220.0,
                "unit": "tCO2e",
                "verification_org": "DNV GL Clean Energy Verification",
                "verification_status": "verified",
                "evidence_doc_name": "Nordic_Offshore_Wind_Issuance_Declaration.pdf",
                "evidence_doc_url": "https://ecofuse.org/evidence/GS-4109-issuance.pdf",
                "evidence_hash": "a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0",
                "is_retired": False,
            },
            {
                "id": "batch-proto-103",
                "batch_number": "CCT-2025-BIO-KENYA-03",
                "owner_id": demo_user.id,
                "creator_id": demo_user.id,
                "project_name": "Biochar Soil Regeneration & Sequestration",
                "project_type": "Biochar Soil Carbon",
                "project_location": "Rift Valley, Kenya",
                "methodology": "Puro.earth Biochar Standard (Prototype Calibration)",
                "registry_name": "EcoFuse Protocol Registry (Prototype)",
                "registry_id": "EF-2025-003",
                "vintage_year": 2025,
                "initial_quantity": 250.0,
                "available_quantity": 250.0,
                "unit": "tCO2e",
                "verification_org": "EcoFuse Internal Sustainability Review Team",
                "verification_status": "verified",
                "evidence_doc_name": "Kenya_Biochar_Lab_Analysis_Report.pdf",
                "evidence_doc_url": "https://ecofuse.org/evidence/biochar-lab-2025.pdf",
                "evidence_hash": "c8f1e2d3b4a567890123456789abcdef0123456789abcdef0123456789abcdef",
                "is_retired": False,
            },
        ]
        for b in sample_batches:
            if not db.query(CreditBatch).filter(CreditBatch.id == b["id"]).first():
                batch_obj = CreditBatch(**b)
                db.add(batch_obj)
                db.flush()
                log = CreditVerificationLog(
                    batch_id=batch_obj.id,
                    actor_id=admin_user.id if admin_user else demo_user.id,
                    from_status="submitted",
                    to_status="verified",
                    notes=f"Initial seed verification certified by {batch_obj.verification_org}.",
                )
                db.add(log)
        db.commit()

    # Seed Initial Listings
    if demo_user:
        sample_listings = [
            {
                "id": "list-101",
                "seller_id": demo_user.id,
                "seller_address": "0x32A4...88F1",
                "amount": 150.0,
                "price_per_credit": 12.50,
                "price_per_credit_eth": 0.0039,
                "project": "Amazon Rainforest Afforestation Block #44",
                "country": "Brazil",
                "status": "active",
                "batch_id": "batch-vcs-101",
            },
            {
                "id": "list-102",
                "seller_id": demo_user.id,
                "seller_address": "0x99B1...12C0",
                "amount": 80.0,
                "price_per_credit": 11.80,
                "price_per_credit_eth": 0.0037,
                "project": "Nordic Offshore Wind Park Generation",
                "country": "Denmark",
                "status": "active",
                "batch_id": "batch-gs-102",
            },
            {
                "id": "list-103",
                "seller_id": demo_user.id,
                "seller_address": "0x54F8...009A",
                "amount": 220.0,
                "price_per_credit": 13.00,
                "price_per_credit_eth": 0.0041,
                "project": "Biochar Soil Regeneration & Sequestration",
                "country": "Kenya",
                "status": "active",
                "batch_id": "batch-proto-103",
            },
        ]
        for l in sample_listings:
            if not db.query(MarketListing).filter(MarketListing.id == l["id"]).first():
                db.add(MarketListing(**l))
        db.commit()

    # Seed Initial Reduction Target
    if demo_user and db.query(UserReductionTarget).filter(UserReductionTarget.user_id == demo_user.id).count() == 0:
        target = UserReductionTarget(
            user_id=demo_user.id,
            target_name="Corporate 2026 Climate Neutrality Milestone",
            target_type="reduction_percentage",
            target_value=25.0,
            baseline_annual_kg=14800.0,
            target_annual_kg=11100.0,
            target_year=2026,
            status="active",
        )
        db.add(target)
        db.commit()

    # Seed Corporate Facilities & Scope 1, 2, 3 Emissions Records
    if demo_user:
        fac = db.query(CorporateFacility).filter(CorporateFacility.id == "fac-hq-01").first()
        if not fac:
            fac = CorporateFacility(
                id="fac-hq-01",
                user_id=demo_user.id,
                organization_name=demo_user.organization or "EcoFuse Global Network",
                facility_name="North American Headquarters & Innovation Campus",
                department="Operations & Engineering",
                country="United States",
            )
            db.add(fac)
            db.flush()

        if db.query(CorporateEmissionRecord).filter(CorporateEmissionRecord.facility_id == "fac-hq-01").count() == 0:
            records = [
                CorporateEmissionRecord(
                    facility_id=fac.id,
                    user_id=demo_user.id,
                    reporting_period="2025-Annual",
                    scope="Scope 1",
                    category="Stationary Natural Gas Combustion",
                    emissions_kg=4200.0,
                    activity_metric=850.0,
                    metric_unit="therms",
                    emission_factor_source="EPA 2024 GHG Hub (4.94 kg/therm)",
                    audit_status="verified",
                ),
                CorporateEmissionRecord(
                    facility_id=fac.id,
                    user_id=demo_user.id,
                    reporting_period="2025-Annual",
                    scope="Scope 2",
                    category="Purchased Grid Electricity (Location-Based)",
                    emissions_kg=18500.0,
                    activity_metric=45000.0,
                    metric_unit="kWh",
                    emission_factor_source="eGRID 2024 NWPP Subregion (0.411 kg/kWh)",
                    audit_status="verified",
                ),
                CorporateEmissionRecord(
                    facility_id=fac.id,
                    user_id=demo_user.id,
                    reporting_period="2025-Annual",
                    scope="Scope 3",
                    category="Employee Commuting & Business Rail",
                    emissions_kg=3100.0,
                    activity_metric=14200.0,
                    metric_unit="passenger-km",
                    emission_factor_source="UK Defra / IEA 2024 Travel Factors",
                    audit_status="internal_review",
                ),
            ]
            for r in records:
                db.add(r)
            db.commit()
