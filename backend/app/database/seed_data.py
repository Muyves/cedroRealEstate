from sqlalchemy.orm import Session
from app.models.user import User
from app.models.listing import Listing
from app.models.inquiry import Inquiry
from app.core.security import get_password_hash

def seed_database(db: Session):
    # Check if data already exists
    if db.query(User).first():
        return

    print("Seeding initial database data...")

    # 1. Create Demo Users
    admin_user = User(
        email="Cedro@gmail.com",
        hashed_password=get_password_hash("Cedro@200"),
        full_name="Victoria Sterling (Admin)",
        role="admin",
        phone="+1 (555) 100-2000",
        avatar_url="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80"
    )
    seller_user = User(
        email="seller@cedro.com",
        hashed_password=get_password_hash("password123"),
        full_name="Marcus Vance (Elite Properties)",
        role="seller",
        phone="+1 (555) 234-5678",
        avatar_url="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80"
    )
    buyer_user = User(
        email="buyer@cedro.com",
        hashed_password=get_password_hash("password123"),
        full_name="Elena Rostova (Investor)",
        role="buyer",
        phone="+1 (555) 876-5432",
        avatar_url="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80"
    )

    db.add_all([admin_user, seller_user, buyer_user])
    db.commit()
    db.refresh(admin_user)
    db.refresh(seller_user)
    db.refresh(buyer_user)

    # 2. Seed Property Listings (Land & Buildings)
    sample_listings = [
        # --- LAND LISTINGS ---
        Listing(
            title="Highland Ridge 15-Acre Development Parcel",
            description="Spectacular 15-acre panoramic view parcel perched above the Barton Creek greenbelt. Prime residential or mixed-use potential with city water and electricity directly at the frontage line. Gentle topography with mature live oaks and limestone bluffs. Complete topographical survey and phase 1 environmental study available.",
            category="land",
            property_type="residential_land",
            location="Austin, TX",
            address="4200 Barton Ridge Blvd",
            city="Austin",
            state="TX",
            zip_code="78746",
            size_value=15.0,
            size_unit="acres",
            price=1450000,
            status="available",
            bedrooms=None,
            bathrooms=None,
            features=["Rolling Topography", "City Water & Power at Road", "Mature Live Oaks", "Zoned Low-Density Residential", "Unrestricted Skyline Views"],
            media_urls=[
                "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80"
            ],
            is_featured=True,
            seller_id=seller_user.id
        ),
        Listing(
            title="Silver Creek Valley Ranch & Agricultural Land",
            description="Expansive 85-acre irrigated hay farm and equestrian retreat nestled against the Gallatin Mountain range. Features adjudicated senior water rights dating back to 1912, a 4,000 sq ft equipment barn, three cross-fenced pastures, and private year-round creek frontage.",
            category="land",
            property_type="agricultural_land",
            location="Bozeman, MT",
            address="712 Silver Creek Valley Rd",
            city="Bozeman",
            state="MT",
            zip_code="59718",
            size_value=85.0,
            size_unit="acres",
            price=2350000,
            status="available",
            bedrooms=None,
            bathrooms=None,
            features=["Senior Water Rights", "Year-round Creek Frontage", "4,000 SqFt Equipment Barn", "Perimeter & Cross Fenced", "Subdivision Potential"],
            media_urls=[
                "https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1200&q=80"
            ],
            is_featured=True,
            seller_id=seller_user.id
        ),
        Listing(
            title="Emerald Coast Oceanfront Custom Building Lot",
            description="Rare shovel-ready beachfront plot with 120 feet of pristine Gulf of Mexico frontage. Approved architectural plans for an 8-bedroom luxury residence included with purchase. Geotechnical borings and coastal construction permits in hand.",
            category="land",
            property_type="residential_land",
            location="Destin, FL",
            address="890 Scenic Gulf Dr",
            city="Destin",
            state="FL",
            zip_code="32541",
            size_value=0.85,
            size_unit="acres",
            price=1980000,
            status="pending",
            bedrooms=None,
            bathrooms=None,
            features=["120 Ft Gulf Frontage", "Approved Coastal Construction Permits", "Private Dune Walkover", "All Utilities On-Site"],
            media_urls=[
                "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=80"
            ],
            is_featured=False,
            seller_id=seller_user.id
        ),
        Listing(
            title="Sonoma Valley Vineyard & Estate Parcel",
            description="Picturesque 24-acre parcel with 16 acres planted to award-winning Cabernet Sauvignon and Pinot Noir clones. High-capacity agricultural well producing 140 GPM. Custom build site overlooking the valley floor with heritage olive trees.",
            category="land",
            property_type="agricultural_land",
            location="Sonoma, CA",
            address="1500 Vineyard View Way",
            city="Sonoma",
            state="CA",
            zip_code="95476",
            size_value=24.0,
            size_unit="acres",
            price=3800000,
            status="available",
            bedrooms=None,
            bathrooms=None,
            features=["16 Acres Planted Vines", "140 GPM High Capacity Well", "Heritage Olive Groves", "Scenic Hilltop Building Site"],
            media_urls=[
                "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80"
            ],
            is_featured=True,
            seller_id=seller_user.id
        ),
        Listing(
            title="Metro Gateway Commercial Logistics Acreage",
            description="Strategically positioned 18-acre parcel zoned Light Industrial / Distribution. Direct interchange access to I-35 with dual corner curb cuts approved. Ideal for regional logistics hub, fulfillment center, or corporate fleet base.",
            category="land",
            property_type="commercial_land",
            location="Dallas, TX",
            address="9100 Industrial Pkwy",
            city="Dallas",
            state="TX",
            zip_code="75237",
            size_value=18.0,
            size_unit="acres",
            price=2850000,
            status="sold",
            bedrooms=None,
            bathrooms=None,
            features=["Interstate 35 Visibility", "Light Industrial Zoning (LI)", "Heavy Power Capacity", "Dual Street Frontage"],
            media_urls=[
                "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80"
            ],
            is_featured=False,
            seller_id=admin_user.id
        ),

        # --- BUILDING LISTINGS ---
        Listing(
            title="The Glasshouse: Modern Architectural Sanctuary",
            description="A striking triumph of steel, stone, and ultra-clear glass. Perched on a private promontory with 270-degree jetliner views of the skyline and Pacific Ocean. Features motorized Fleetwood doors, zero-edge infinity pool, 800-bottle glass wine cellar, and private home theater.",
            category="building",
            property_type="single_family",
            location="Los Angeles, CA",
            address="1420 Blue Jay Way",
            city="Los Angeles",
            state="CA",
            zip_code="90069",
            size_value=7200,
            size_unit="sqft",
            price=5950000,
            status="available",
            bedrooms=5,
            bathrooms=6.5,
            features=["Zero-Edge Heated Pool", "Motorized Fleetwood Pocket Glass", "Sub-Zero & Wolf Kitchen", "800-Bottle Wine Vault", "Smart Home Automation"],
            media_urls=[
                "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80"
            ],
            is_featured=True,
            seller_id=seller_user.id
        ),
        Listing(
            title="Skyline Tower Luxury Corner Penthouse",
            description="Occupying the entire 48th floor corner of Tribeca's premier residential tower. 11-foot finished ceilings, private elevator vestibule, herringbone white oak floors, and a 650 sq ft landscaped wraparound terrace with gas fireplace.",
            category="building",
            property_type="apartment",
            location="New York, NY",
            address="56 Leonard St, PH 48",
            city="New York",
            state="NY",
            zip_code="10013",
            size_value=3850,
            size_unit="sqft",
            price=4250000,
            status="available",
            bedrooms=4,
            bathrooms=4.0,
            features=["Wraparound Skyline Terrace", "Private Elevator Access", "Calacatta Marble Baths", "24/7 White-Glove Concierge", "Private Storage Unit"],
            media_urls=[
                "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80"
            ],
            is_featured=True,
            seller_id=seller_user.id
        ),
        Listing(
            title="Cedar Creek Modern Mountain Craftsman",
            description="Exquisite mountain contemporary design crafted with Douglas fir timbers and native Colorado stone. Gourmet kitchen with double islands, radiant heated concrete floors, oversized 3-car heated garage with EV chargers, and direct access to hiking trails.",
            category="building",
            property_type="single_family",
            location="Denver, CO",
            address="8400 Foothills Rd",
            city="Denver",
            state="CO",
            zip_code="80215",
            size_value=4600,
            size_unit="sqft",
            price=1850000,
            status="pending",
            bedrooms=4,
            bathrooms=4.5,
            features=["Radiant Heated Floors", "Timber Frame Construction", "EV-Ready 3-Car Garage", "Outdoor Covered Fireplace", "Trailhead Proximity"],
            media_urls=[
                "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"
            ],
            is_featured=False,
            seller_id=seller_user.id
        ),
        Listing(
            title="Metro Financial Class-A Commercial Tower",
            description="High-profile 5-story office and retail asset in downtown financial district. 100% occupied with credit-worthy institutional tenants. Triple net (NNN) leases with steady annual escalations. Rooftop solar array and state-of-the-art HVAC systems.",
            category="building",
            property_type="commercial_building",
            location="Chicago, IL",
            address="330 S Wacker Dr",
            city="Chicago",
            state="IL",
            zip_code="60606",
            size_value=32000,
            size_unit="sqft",
            price=9200000,
            status="available",
            bedrooms=None,
            bathrooms=10.0,
            features=["100% NNN Leased", "LEED Silver Certified", "Underground Parking Facility", "High Foot Traffic Corner", "New Dual Chiller Systems"],
            media_urls=[
                "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80"
            ],
            is_featured=True,
            seller_id=admin_user.id
        ),
        Listing(
            title="Biscayne Bay Tropical Waterfront Villa",
            description="Secluded Venetian-style waterfront residence offering 100 feet of deep-water frontage with private dock accommodating up to an 80ft yacht. Lush tropical garden courtyard, salt-water pool, summer kitchen, and staff quarters.",
            category="building",
            property_type="single_family",
            location="Miami, FL",
            address="230 Palm Island Dr",
            city="Miami",
            state="FL",
            zip_code="33139",
            size_value=5600,
            size_unit="sqft",
            price=4600000,
            status="sold",
            bedrooms=6,
            bathrooms=6.5,
            features=["Private Yacht Dock (80ft)", "Saltwater Pool & Spa", "Full Summer Kitchen", "24hr Guard-Gated Island", "Impact Glass Windows"],
            media_urls=[
                "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=1200&q=80"
            ],
            is_featured=False,
            seller_id=seller_user.id
        ),
        Listing(
            title="The Grandview Traditional Manor & Gardens",
            description="Timeless brick colonial residence set on 2 acres of manicured gardens and rolling lawns. Double-height grand foyer with curving staircase, paneled cherry library, renovated chef's kitchen, and a detached guest carriage house.",
            category="building",
            property_type="single_family",
            location="Atlanta, GA",
            address="4500 Paces Ferry Rd NW",
            city="Atlanta",
            state="GA",
            zip_code="30327",
            size_value=5200,
            size_unit="sqft",
            price=1495000,
            status="available",
            bedrooms=5,
            bathrooms=5.0,
            features=["Detached Carriage House", "Paneled Cherry Library", "Renovated Chef Kitchen", "2-Acre Private Lot", "Buckhead Location"],
            media_urls=[
                "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1598228723793-52759bba239c?auto=format&fit=crop&w=1200&q=80"
            ],
            is_featured=False,
            seller_id=seller_user.id
        )
    ]

    db.add_all(sample_listings)
    db.commit()

    # 3. Seed an initial sample inquiry from buyer to seller
    first_listing = db.query(Listing).first()
    if first_listing:
        sample_inquiry = Inquiry(
            listing_id=first_listing.id,
            buyer_id=buyer_user.id,
            buyer_name=buyer_user.full_name,
            buyer_email=buyer_user.email,
            buyer_phone=buyer_user.phone,
            message="Hello Marcus, I am very interested in this property parcel for an upcoming project. Is the topographical survey available for download? Also, are you open to a 30-day closing window?",
            offer_amount=1380000.0,
            status="pending"
        )
        db.add(sample_inquiry)
        db.commit()

    print("Seeding completed successfully!")
