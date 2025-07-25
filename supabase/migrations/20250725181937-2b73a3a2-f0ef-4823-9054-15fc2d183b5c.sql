-- Drop the trigger first, then recreate the function with proper security settings
DROP TRIGGER IF EXISTS update_chat_sessions_updated_at ON public.chat_sessions;

DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- Recreate function with proper security settings
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate the trigger
CREATE TRIGGER update_chat_sessions_updated_at
    BEFORE UPDATE ON public.chat_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();