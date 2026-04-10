import { motion } from "framer-motion";
import { useI18n } from "@/contexts/I18nContext";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { ShoppingBag, Package, Calendar, Truck } from "lucide-react";

const Orders = () => {
  const { t } = useI18n();
  const { user } = useAuth();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("orders")
        .select("*")
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const statusColor: Record<string, string> = {
    placed: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    confirmed: "bg-primary/15 text-primary",
    delivered: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    cancelled: "bg-destructive/15 text-destructive",
  };

  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        <motion.h1
          className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-foreground mb-6 sm:mb-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          📦 My Orders
        </motion.h1>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-5 shadow-card animate-pulse">
                <div className="h-5 w-1/2 rounded bg-muted mb-3" />
                <div className="h-3 w-1/3 rounded bg-muted/60" />
              </div>
            ))}
          </div>
        ) : orders && orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-xl border border-border p-5 shadow-card hover:shadow-card-hover transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Package className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-foreground">{order.book_title}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        {order.price != null && <span className="text-sm font-bold text-primary">₹{order.price}</span>}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusColor[order.status] || "bg-muted text-muted-foreground"}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {user?.id === order.buyer_id ? "You bought" : "You sold"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(order.order_date).toLocaleDateString()}</span>
                    {order.expected_delivery && (
                      <span className="flex items-center gap-1 text-primary"><Truck className="w-3 h-3" /> Delivery: {new Date(order.expected_delivery).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>No orders yet. Browse books to place your first order!</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Orders;
