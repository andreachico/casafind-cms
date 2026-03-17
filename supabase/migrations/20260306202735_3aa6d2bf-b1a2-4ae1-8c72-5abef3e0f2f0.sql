-- Create listing_type enum
CREATE TYPE public.listing_type AS ENUM ('sale', 'rent');

-- Create users table (CMS managed users, not auth users)
CREATE TABLE public.cms_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  phone_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create properties table
CREATE TABLE public.properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  listing_type listing_type NOT NULL DEFAULT 'sale',
  price NUMERIC(15, 2) NOT NULL DEFAULT 0,
  room_count INTEGER NOT NULL DEFAULT 0,
  bathroom_count INTEGER NOT NULL DEFAULT 0,
  parking_count INTEGER NOT NULL DEFAULT 0,
  property_size NUMERIC(10, 2),
  lot_size NUMERIC(10, 2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cms_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- For now, allow all operations (CMS admin access)
CREATE POLICY "Allow all access to cms_users" ON public.cms_users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to properties" ON public.properties FOR ALL USING (true) WITH CHECK (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers
CREATE TRIGGER update_cms_users_updated_at
  BEFORE UPDATE ON public.cms_users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();