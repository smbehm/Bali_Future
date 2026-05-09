/*
  # Enhance Events Table

  1. Modified Tables
    - `events`
      - Added `start_time` (text) - e.g. "09:00 AM"
      - Added `end_time` (text) - e.g. "12:00 PM"
      - Added `address` (text) - full street address
      - Added `status` (text) - open, almost_full, closed, starting_soon
      - Added `price` (numeric) - ticket price, 0 for free
      - Added `organizer` (text) - who's hosting
      - Added `tags` (text) - comma separated tags

  2. Updates existing event data with richer info
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'start_time'
  ) THEN
    ALTER TABLE events ADD COLUMN start_time text DEFAULT '09:00 AM';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'end_time'
  ) THEN
    ALTER TABLE events ADD COLUMN end_time text DEFAULT '12:00 PM';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'address'
  ) THEN
    ALTER TABLE events ADD COLUMN address text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'status'
  ) THEN
    ALTER TABLE events ADD COLUMN status text DEFAULT 'open';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'price'
  ) THEN
    ALTER TABLE events ADD COLUMN price numeric DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'organizer'
  ) THEN
    ALTER TABLE events ADD COLUMN organizer text DEFAULT 'Bali Future Foundation';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'tags'
  ) THEN
    ALTER TABLE events ADD COLUMN tags text DEFAULT '';
  END IF;
END $$;

-- Update existing events with richer data
UPDATE events SET
  start_time = '09:00 AM',
  end_time = '12:00 PM',
  address = 'Kuta Beach South End, Jl. Pantai Kuta, Kuta, Bali 80361',
  status = 'open',
  price = 0,
  organizer = 'Bali Future Foundation',
  tags = 'environment,community,outdoor',
  registered = 42
WHERE title = 'Beach Cleanup Day';

UPDATE events SET
  start_time = '10:00 AM',
  end_time = '01:00 PM',
  address = 'Ubud Community Center, Jl. Raya Ubud No. 35, Ubud, Bali 80571',
  status = 'almost_full',
  price = 0,
  organizer = 'Bali Future Arts Program',
  tags = 'children,art,education',
  registered = 26
WHERE title = 'Children Art Workshop';

UPDATE events SET
  start_time = '08:00 AM',
  end_time = '02:00 PM',
  address = 'Tegallalang Organic Farm, Jl. Tegallalang, Gianyar, Bali 80561',
  status = 'open',
  price = 0,
  organizer = 'Bali Future Sustainability',
  tags = 'sustainability,farming,education',
  registered = 12
WHERE title = 'Sustainable Farming Course';

UPDATE events SET
  start_time = '06:00 PM',
  end_time = '10:00 PM',
  address = 'Four Seasons Resort Bali at Jimbaran Bay, Jl. Bukit Permai, Jimbaran',
  status = 'open',
  price = 75,
  organizer = 'Bali Future Foundation',
  tags = 'fundraiser,gala,networking',
  registered = 134
WHERE title = 'Annual Charity Gala';

-- Insert additional events for a fuller experience
INSERT INTO events (title, description, event_date, start_time, end_time, location, address, capacity, registered, image_url, category, status, price, organizer, tags) VALUES
  ('Youth Leadership Camp', 'A 3-day immersive leadership program for teens aged 13-17, building confidence, teamwork, and community service skills.', '2026-06-28T08:00:00Z', '08:00 AM', '05:00 PM', 'Bali Eco Camp, Tabanan', 'Bali Eco Camp, Jl. Baturiti, Tabanan, Bali 82191', 40, 31, 'https://images.pexels.com/photos/8423042/pexels-photo-8423042.jpeg?auto=compress&cs=tinysrgb&w=800', 'education', 'almost_full', 0, 'Bali Future Youth Program', 'youth,leadership,education'),
  ('Coral Reef Restoration Dive', 'Join marine biologists to restore coral reefs off the coast of Sanur. All equipment and training provided.', '2026-07-12T07:00:00Z', '07:00 AM', '11:00 AM', 'Sanur Marine Center', 'Sanur Marine Center, Jl. Danau Tamblingan No. 78, Sanur, Bali', 20, 8, 'https://images.pexels.com/photos/3100361/pexels-photo-3100361.jpeg?auto=compress&cs=tinysrgb&w=800', 'community', 'open', 0, 'Bali Future Ocean Program', 'marine,diving,environment');
