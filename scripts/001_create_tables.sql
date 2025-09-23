-- Create profiles table for contractor information
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  phone TEXT,
  email TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quotes table
CREATE TABLE IF NOT EXISTS public.quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  project_title TEXT NOT NULL,
  project_description TEXT,
  
  -- Good tier
  good_total DECIMAL(10,2) NOT NULL DEFAULT 0,
  good_items JSONB NOT NULL DEFAULT '[]',
  
  -- Better tier  
  better_total DECIMAL(10,2) NOT NULL DEFAULT 0,
  better_items JSONB NOT NULL DEFAULT '[]',
  
  -- Best tier
  best_total DECIMAL(10,2) NOT NULL DEFAULT 0,
  best_items JSONB NOT NULL DEFAULT '[]',
  
  -- Quote settings
  deposit_percentage INTEGER NOT NULL DEFAULT 25,
  valid_until DATE,
  notes TEXT,
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired')),
  selected_tier TEXT CHECK (selected_tier IN ('good', 'better', 'best')),
  
  -- Payment tracking
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  payment_intent_id TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- Quotes policies
CREATE POLICY "quotes_select_own" ON public.quotes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "quotes_insert_own" ON public.quotes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "quotes_update_own" ON public.quotes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "quotes_delete_own" ON public.quotes FOR DELETE USING (auth.uid() = user_id);

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, company_name, contact_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'company_name', 'My Company'),
    COALESCE(NEW.raw_user_meta_data ->> 'contact_name', 'Contact Name'),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger for auto-profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Add updated_at triggers
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER quotes_updated_at
  BEFORE UPDATE ON public.quotes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
