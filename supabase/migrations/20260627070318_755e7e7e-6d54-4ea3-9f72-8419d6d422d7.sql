
-- Lock down parcels: drop public read; admins manage via existing ALL policy.
-- Public tracking lookups go through server functions using the service role.
DROP POLICY IF EXISTS "Anyone can read parcels" ON public.parcels;

-- Explicit restrictive policies on user_roles to prevent privilege escalation.
-- Only admins may insert/update/delete role rows. The handle_new_user trigger
-- runs as SECURITY DEFINER and bypasses RLS, so default 'user' role assignment
-- on signup continues to work.
CREATE POLICY "Only admins insert roles"
  ON public.user_roles AS RESTRICTIVE
  FOR INSERT TO authenticated, anon
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins update roles"
  ON public.user_roles AS RESTRICTIVE
  FOR UPDATE TO authenticated, anon
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins delete roles"
  ON public.user_roles AS RESTRICTIVE
  FOR DELETE TO authenticated, anon
  USING (public.has_role(auth.uid(), 'admin'));
