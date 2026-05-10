/*
  Public total for Tree of Future — anon cannot SELECT donations directly (RLS).
  This SECURITY DEFINER function returns the sum for display only.
*/
CREATE OR REPLACE FUNCTION public.get_total_donations()
RETURNS numeric
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(SUM(amount), 0)::numeric FROM donations WHERE status = 'completed';
$$;

REVOKE ALL ON FUNCTION public.get_total_donations() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_total_donations() TO anon, authenticated;
