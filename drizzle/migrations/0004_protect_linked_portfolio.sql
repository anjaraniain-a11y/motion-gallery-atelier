REVOKE ALL ON public.media, public.projects FROM anon, authenticated;
GRANT ALL ON public.media, public.projects TO service_role;
DROP POLICY IF EXISTS "public read media" ON public.media;
DROP POLICY IF EXISTS "public write media" ON public.media;
DROP POLICY IF EXISTS "public all projects" ON public.projects;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;