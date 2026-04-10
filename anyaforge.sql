ALTER TABLE public.books ADD COLUMN IF NOT EXISTS quantity integer NOT NULL DEFAULT 1;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS delivery_days integer DEFAULT 3;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS seller_phone text;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS is_combo boolean DEFAULT false;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS combo_items text;

-- Create orders table
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid REFERENCES public.books(id) ON DELETE SET NULL,
  buyer_id uuid NOT NULL,
  seller_id uuid NOT NULL,
  book_title text NOT NULL,
  price numeric,
  quantity integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'placed',
  order_date timestamp with time zone NOT NULL DEFAULT now(),
  expected_delivery timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Buyers can see their orders
CREATE POLICY "Users can view their own orders" ON public.orders
FOR SELECT TO authenticated
USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Authenticated users can place orders
CREATE POLICY "Users can insert orders" ON public.orders
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = buyer_id);

-- Sellers can update order status
CREATE POLICY "Sellers can update their orders" ON public.orders
FOR UPDATE TO authenticated
USING (auth.uid() = seller_id);
