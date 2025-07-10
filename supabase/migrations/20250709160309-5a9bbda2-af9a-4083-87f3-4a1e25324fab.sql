
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE trip_status AS ENUM ('active', 'completed', 'cancelled');
CREATE TYPE rental_type AS ENUM ('short_term', 'long_term');
CREATE TYPE vehicle_type AS ENUM ('car', 'bike');
CREATE TYPE user_type AS ENUM ('new', 'experienced');

-- Users profile table (extends Supabase auth)
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    age INTEGER NOT NULL CHECK (age >= 18 AND age <= 100),
    profile_photo_url TEXT,
    user_type user_type DEFAULT 'new',
    rating DECIMAL(2,1) DEFAULT 0.0 CHECK (rating >= 0.0 AND rating <= 5.0),
    total_ratings INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Carpool trips table
CREATE TABLE public.carpool_trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    from_destination VARCHAR(255) NOT NULL,
    to_destination VARCHAR(255) NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    reach_time TIMESTAMPTZ NOT NULL,
    price_per_head DECIMAL(10,2) NOT NULL,
    total_seats INTEGER NOT NULL CHECK (total_seats > 0),
    available_seats INTEGER NOT NULL,
    car_number_plate VARCHAR(20) NOT NULL,
    car_model VARCHAR(100) NOT NULL,
    car_color VARCHAR(50) NOT NULL,
    status trip_status DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT check_available_seats CHECK (available_seats >= 0 AND available_seats <= total_seats)
);

-- Intermediate stops for carpool trips
CREATE TABLE public.trip_stops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID REFERENCES public.carpool_trips(id) ON DELETE CASCADE,
    stop_location VARCHAR(255) NOT NULL,
    stop_time TIMESTAMPTZ NOT NULL,
    stop_order INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Carpool bookings table
CREATE TABLE public.carpool_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID REFERENCES public.carpool_trips(id) ON DELETE CASCADE,
    passenger_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    pickup_location VARCHAR(255) NOT NULL,
    pickup_time TIMESTAMPTZ NOT NULL,
    phone_number VARCHAR(15) NOT NULL,
    booking_status VARCHAR(20) DEFAULT 'confirmed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vehicle listings for rent/lease
CREATE TABLE public.vehicle_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    vehicle_type vehicle_type NOT NULL,
    vehicle_number_plate VARCHAR(20) NOT NULL,
    vehicle_model VARCHAR(100) NOT NULL,
    vehicle_color VARCHAR(50) NOT NULL,
    rental_type rental_type NOT NULL,
    rent_price DECIMAL(10,2) NOT NULL,
    max_rental_period INTEGER NOT NULL, -- in hours for short_term, days for long_term
    city VARCHAR(100) NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    photos TEXT[], -- Array of photo URLs
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vehicle bookings table
CREATE TABLE public.vehicle_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID REFERENCES public.vehicle_listings(id) ON DELETE CASCADE,
    renter_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    renter_name VARCHAR(255) NOT NULL,
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    from_time TIME NOT NULL,
    to_time TIME NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    booking_status VARCHAR(20) DEFAULT 'confirmed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User ratings table
CREATE TABLE public.user_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rated_user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    rater_user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(rated_user_id, rater_user_id) -- Prevent duplicate ratings from same user
);

-- Create indexes for better performance
CREATE INDEX idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX idx_carpool_trips_driver ON public.carpool_trips(driver_id);
CREATE INDEX idx_carpool_trips_time ON public.carpool_trips(start_time);
CREATE INDEX idx_carpool_bookings_passenger ON public.carpool_bookings(passenger_id);
CREATE INDEX idx_vehicle_listings_owner ON public.vehicle_listings(owner_id);
CREATE INDEX idx_vehicle_listings_location ON public.vehicle_listings(city, latitude, longitude);
CREATE INDEX idx_vehicle_bookings_renter ON public.vehicle_bookings(renter_id);

-- Row Level Security (RLS) policies
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carpool_trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carpool_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view all profiles" ON public.user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for carpool_trips
CREATE POLICY "Anyone can view active trips" ON public.carpool_trips FOR SELECT USING (status = 'active');
CREATE POLICY "Drivers can manage own trips" ON public.carpool_trips FOR ALL USING (driver_id IN (SELECT id FROM public.user_profiles WHERE user_id = auth.uid()));

-- RLS Policies for trip_stops
CREATE POLICY "Anyone can view stops for active trips" ON public.trip_stops FOR SELECT USING (trip_id IN (SELECT id FROM public.carpool_trips WHERE status = 'active'));
CREATE POLICY "Drivers can manage own trip stops" ON public.trip_stops FOR ALL USING (trip_id IN (SELECT id FROM public.carpool_trips WHERE driver_id IN (SELECT id FROM public.user_profiles WHERE user_id = auth.uid())));

-- RLS Policies for carpool_bookings
CREATE POLICY "Users can view own bookings" ON public.carpool_bookings FOR SELECT USING (passenger_id IN (SELECT id FROM public.user_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users can create bookings" ON public.carpool_bookings FOR INSERT WITH CHECK (passenger_id IN (SELECT id FROM public.user_profiles WHERE user_id = auth.uid()));

-- RLS Policies for vehicle_listings
CREATE POLICY "Anyone can view available listings" ON public.vehicle_listings FOR SELECT USING (is_available = true);
CREATE POLICY "Owners can manage own listings" ON public.vehicle_listings FOR ALL USING (owner_id IN (SELECT id FROM public.user_profiles WHERE user_id = auth.uid()));

-- RLS Policies for vehicle_bookings
CREATE POLICY "Users can view own bookings" ON public.vehicle_bookings FOR SELECT USING (renter_id IN (SELECT id FROM public.user_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users can create bookings" ON public.vehicle_bookings FOR INSERT WITH CHECK (renter_id IN (SELECT id FROM public.user_profiles WHERE user_id = auth.uid()));

-- RLS Policies for user_ratings
CREATE POLICY "Anyone can view ratings" ON public.user_ratings FOR SELECT USING (true);
CREATE POLICY "Users can rate others" ON public.user_ratings FOR INSERT WITH CHECK (rater_user_id IN (SELECT id FROM public.user_profiles WHERE user_id = auth.uid()));

-- Function to update user rating
CREATE OR REPLACE FUNCTION update_user_rating()
RETURNS TRIGGER AS $$
BEGIN
    -- Handle INSERT, UPDATE, and DELETE operations
    IF TG_OP = 'DELETE' THEN
        -- Update rating when a rating is deleted
        UPDATE public.user_profiles 
        SET 
            rating = COALESCE((
                SELECT ROUND(AVG(rating::DECIMAL), 1) 
                FROM public.user_ratings 
                WHERE rated_user_id = OLD.rated_user_id
            ), 0.0),
            total_ratings = (
                SELECT COUNT(*) 
                FROM public.user_ratings 
                WHERE rated_user_id = OLD.rated_user_id
            ),
            updated_at = NOW()
        WHERE id = OLD.rated_user_id;
        RETURN OLD;
    ELSE
        -- Handle INSERT and UPDATE operations
        UPDATE public.user_profiles 
        SET 
            rating = COALESCE((
                SELECT ROUND(AVG(rating::DECIMAL), 1) 
                FROM public.user_ratings 
                WHERE rated_user_id = NEW.rated_user_id
            ), 0.0),
            total_ratings = (
                SELECT COUNT(*) 
                FROM public.user_ratings 
                WHERE rated_user_id = NEW.rated_user_id
            ),
            updated_at = NOW()
        WHERE id = NEW.rated_user_id;
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_update_user_rating ON public.user_ratings;

-- Create trigger to automatically update user rating for all operations
CREATE TRIGGER trigger_update_user_rating
    AFTER INSERT OR UPDATE OR DELETE ON public.user_ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_user_rating();

-- Function to update available seats
CREATE OR REPLACE FUNCTION update_available_seats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.carpool_trips 
    SET available_seats = available_seats - 1,
        updated_at = NOW()
    WHERE id = NEW.trip_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update available seats
CREATE TRIGGER trigger_update_available_seats
    AFTER INSERT ON public.carpool_bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_available_seats();
