/*
  # Bali Future Database Schema

  1. New Tables
    - `donations` - Tracks all donations made
      - `id` (uuid, primary key)
      - `donor_name` (text)
      - `donor_email` (text)
      - `amount` (numeric)
      - `currency` (text, default 'USD')
      - `type` (text - one_time, monthly, sponsorship)
      - `category` (text - education, food, medical, tree, general)
      - `message` (text, optional)
      - `is_anonymous` (boolean)
      - `status` (text)
      - `created_at` (timestamptz)
    - `volunteers` - Volunteer applications
      - `id` (uuid, primary key)
      - `full_name` (text)
      - `email` (text)
      - `phone` (text)
      - `country` (text)
      - `skills` (text)
      - `availability` (text)
      - `message` (text)
      - `status` (text)
      - `created_at` (timestamptz)
    - `events` - Community events
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `event_date` (timestamptz)
      - `location` (text)
      - `capacity` (integer)
      - `registered` (integer)
      - `image_url` (text)
      - `category` (text)
      - `created_at` (timestamptz)
    - `tree_leaves` - Messages on the Tree of Future
      - `id` (uuid, primary key)
      - `donor_name` (text)
      - `message` (text)
      - `amount` (numeric)
      - `created_at` (timestamptz)
    - `newsletter_subscribers` - Email newsletter
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `created_at` (timestamptz)

  2. Security
    - RLS enabled on all tables
    - Public insert allowed for donations, volunteers, newsletter
    - Select restricted appropriately
*/

-- Donations table
CREATE TABLE IF NOT EXISTS donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_name text NOT NULL DEFAULT '',
  donor_email text NOT NULL DEFAULT '',
  amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  type text NOT NULL DEFAULT 'one_time',
  category text NOT NULL DEFAULT 'general',
  message text DEFAULT '',
  is_anonymous boolean DEFAULT false,
  status text NOT NULL DEFAULT 'completed',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert donations"
  ON donations FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view own donations"
  ON donations FOR SELECT
  TO authenticated
  USING (donor_email = auth.jwt()->>'email');

-- Volunteers table
CREATE TABLE IF NOT EXISTS volunteers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text DEFAULT '',
  country text DEFAULT '',
  skills text DEFAULT '',
  availability text DEFAULT '',
  message text DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit volunteer application"
  ON volunteers FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  description text DEFAULT '',
  event_date timestamptz NOT NULL DEFAULT now(),
  location text DEFAULT '',
  capacity integer DEFAULT 50,
  registered integer DEFAULT 0,
  image_url text DEFAULT '',
  category text DEFAULT 'workshop',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view events"
  ON events FOR SELECT
  TO anon, authenticated
  USING (event_date >= now() - interval '30 days');

-- Tree leaves table
CREATE TABLE IF NOT EXISTS tree_leaves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_name text NOT NULL DEFAULT 'Anonymous',
  message text DEFAULT '',
  amount numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tree_leaves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tree leaves"
  ON tree_leaves FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can add tree leaves"
  ON tree_leaves FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Newsletter subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe to newsletter"
  ON newsletter_subscribers FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Seed some events
INSERT INTO events (title, description, event_date, location, capacity, category, image_url) VALUES
  ('Beach Cleanup Day', 'Join us for a community beach cleanup along the southern coast of Bali.', '2026-06-15T09:00:00Z', 'Kuta Beach, Bali', 100, 'community', 'https://images.pexels.com/photos/2901209/pexels-photo-2901209.jpeg?auto=compress&cs=tinysrgb&w=800'),
  ('Children Art Workshop', 'Creative art workshop for children aged 6-12 with local Balinese artists.', '2026-06-22T10:00:00Z', 'Ubud Community Center', 30, 'workshop', 'https://images.pexels.com/photos/8535214/pexels-photo-8535214.jpeg?auto=compress&cs=tinysrgb&w=800'),
  ('Sustainable Farming Course', 'Learn organic farming techniques from local Balinese farmers.', '2026-07-05T08:00:00Z', 'Tegallalang, Bali', 25, 'education', 'https://images.pexels.com/photos/2132171/pexels-photo-2132171.jpeg?auto=compress&cs=tinysrgb&w=800'),
  ('Annual Charity Gala', 'An evening of celebration, culture, and fundraising for education programs.', '2026-08-10T18:00:00Z', 'Four Seasons Resort Bali', 200, 'fundraiser', 'https://images.pexels.com/photos/587741/pexels-photo-587741.jpeg?auto=compress&cs=tinysrgb&w=800');

-- Seed tree leaves
INSERT INTO tree_leaves (donor_name, message, amount) VALUES
  ('Sarah M.', 'For the children of Bali. May they grow strong like this tree.', 100),
  ('James & Lisa', 'In honor of our honeymoon in Bali. Giving back to the community.', 250),
  ('Anonymous', 'Every child deserves education.', 50),
  ('The Parker Family', 'Planting seeds of hope for future generations.', 500),
  ('Maria G.', 'From one teacher to another - education changes everything.', 75),
  ('David K.', 'Bali gave us so much. Time to give back.', 150),
  ('Community of Hope Foundation', 'Supporting sustainable futures together.', 1000),
  ('Anonymous', 'Small acts, big impact.', 25);