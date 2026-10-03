import sys
from app.database.connection import engine, SessionLocal, Base
from app.database.seed_data import seed_database
import app.models  # register tables
from app.models.listing import Listing
from app.models.user import User

def main():
    print("Testing database table creation...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    seed_database(db)

    user_count = db.query(User).count()
    listing_count = db.query(Listing).count()
    land_count = db.query(Listing).filter(Listing.category == "land").count()
    building_count = db.query(Listing).filter(Listing.category == "building").count()

    print(f"Users seeded: {user_count}")
    print(f"Listings seeded: {listing_count} (Land: {land_count}, Buildings: {building_count})")
    
    assert user_count >= 3, "Expected at least 3 users"
    assert listing_count >= 10, "Expected at least 10 listings"
    assert land_count >= 4, "Expected land listings"
    assert building_count >= 4, "Expected building listings"

    # Test filtering
    austin_listings = db.query(Listing).filter(Listing.location.ilike("%Austin%")).all()
    print(f"Austin listings found: {len(austin_listings)}")
    assert len(austin_listings) >= 1

    db.close()
    print("Backend test passed successfully!")

if __name__ == "__main__":
    main()
