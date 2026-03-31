import { useState, useMemo } from "react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Trash2,
  MessageCircle,
  CheckCircle,
  Clock,
  PackageCheck,
  AlertCircle,
  CalendarRange,
  TrendingUp,
  Image,
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { useOrders, useUpdateOrder, useDeleteOrder } from "@/hooks/use-orders";
import { formatCurrency, cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
//import type { OrderStatus } from "../lib/api-client-react/src";

export default function OrdersList() {
  const { data: orders, isLoading, error } = useOrders();
  console.log("ORDERS RAW:", orders);
console.log("LOADING:", isLoading);
console.log("ERROR:", error);
  const updateOrder = useUpdateOrder();
  const deleteOrder = useDeleteOrder();
  const { toast } = useToast();

 // const [filter, setFilter] = useState<OrderStatus | "all">("all");
 const [filter, setFilter] = useState<"all" | "pending" | "ready" | "delivered">("all");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [expandedPhotos, setExpandedPhotos] = useState<number | null>(null);
const safeOrders = orders || [];
  const filteredOrders = useMemo(() => {
    console.log("INSIDE FILTER, orders:", orders);
    return safeOrders?.filter((order) => {
      const matchesFilter = filter === "all" || order.status === filter;
      const searchLower = search.toLowerCase();
      const matchesSearch =
  (order.customerName || "").toLowerCase().includes(searchLower) ||
  (order.whatsappNumber || "").includes(searchLower) ||
  String(order.id || "").includes(searchLower);

      let matchesDate = true;
      if (dateFrom || dateTo) {
      //  const orderCreated = order.createdAt ? new Date(order.createdAt) : new Date().toISOString().split("T")[0];
      const orderCreated = order.createdAt
  ? new Date(order.createdAt).toISOString().split("T")[0]
  : "";
        if (dateFrom && orderCreated < dateFrom) matchesDate = false;
        if (dateTo && orderCreated > dateTo) matchesDate = false;
      }

      return matchesFilter && matchesSearch && matchesDate;
    });
  }, [orders, filter, search, dateFrom, dateTo]);

  const totalRevenue = useMemo(() => {
    return filteredOrders?.reduce((acc, o) => acc + Number(o.totalAmount), 0) ?? 0;
  }, [filteredOrders]);

  const handleUpdateStatus = (id: number, newStatus: OrderStatus) => {
    updateOrder.mutate({ id, data: { status: newStatus } }, {
      onSuccess: () => {
        toast({ title: "Status Updated", description: `Order #${id} marked as ${newStatus}` });
      }
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this order?")) {
      deleteOrder.mutate({ id }, {
        onSuccess: () => {
          toast({ title: "Order Deleted", description: `Order #${id} has been removed.` });
        }
      });
    }
  };

  const openWhatsApp = (order: NonNullable<typeof orders>[number]) => {
    const phone = order.whatsappNumber.replace(/\D/g, "");
    const displayId = String(order.order_number || 0).padStart(3, "0");

const msg = `Hello ${order.customerName},

Great news! Your laundry order (#${displayId}) at *SW Laundry & Dry Cleaners* is ready for pickup.

Total Amount: ₹${order.totalAmount}

Please visit us to collect your clothes. Thank you for choosing us!`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case "pending": return <Clock className="w-4 h-4 text-amber-500" />;
      case "ready": return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case "delivered": return <PackageCheck className="w-4 h-4 text-blue-500" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const StatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-amber-100 text-amber-700 border-amber-200";
      case "ready": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "delivered": return "bg-blue-100 text-blue-700 border-blue-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const hasDateFilter = dateFrom || dateTo;

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-display font-bold text-foreground">Order Management</h2>
          <p className="text-muted-foreground mt-1">Track and manage customer laundry orders.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search ID, Name or Phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-64 pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white border border-border rounded-2xl p-4 mb-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <CalendarRange className="w-4 h-4" />
            <span>Date Range:</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary text-sm"
            />
            <span className="text-muted-foreground text-sm">to</span>
            <input
              type="date"
              value={dateTo}
              min={dateFrom}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary text-sm"
            />
            {hasDateFilter && (
              <button
                onClick={() => { setDateFrom(""); setDateTo(""); }}
                className="px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
              >
                Clear
              </button>
            )}
          </div>
          {/* Revenue Summary */}
          {(filteredOrders && filteredOrders.length > 0) && (
            <div className="flex items-center gap-2 ml-auto bg-primary/5 border border-primary/20 rounded-xl px-4 py-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <div className="text-sm">
                <span className="text-muted-foreground">{filteredOrders.length} orders · Total: </span>
                <span className="font-display font-bold text-primary">{formatCurrency(totalRevenue)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {(["all", "pending", "ready", "delivered"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-5 py-2 rounded-xl font-medium text-sm capitalize whitespace-nowrap transition-all duration-200",
              filter === f
                ? "bg-foreground text-background shadow-md"
                : "bg-white border border-border text-muted-foreground hover:bg-secondary"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="mt-4 text-muted-foreground font-medium">Loading orders...</p>
        </div>
      ) : error ? (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-6 rounded-2xl flex items-start gap-4">
          <AlertCircle className="w-6 h-6 mt-0.5" />
          <div>
            <h3 className="font-bold text-lg">Failed to load orders</h3>
            <p className="opacity-90">Please check your connection and try again.</p>
          </div>
        </div>
      ) : filteredOrders?.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-border border-dashed">
          <PackageCheck className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-xl font-display font-bold text-foreground">No orders found</h3>
          <p className="text-muted-foreground mt-2">Create a new order or adjust your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredOrders?.map((order, i) => {
  const displayId = String(order.order_number || 0).padStart(3, "0");
  return (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: i * 0.05 }}
                key={order.id}
                className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-border/60 hover:shadow-xl hover:border-primary/20 transition-all overflow-hidden flex flex-col"
              >
                <div className="p-5 border-b border-border/50 flex justify-between items-start bg-secondary/30">
                  <div>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-1">
                      Order #{displayId}
                    </span>
                    <h3 className="font-bold text-lg text-foreground">{order.customerName}</h3>
                    <p className="text-sm text-muted-foreground">{order.whatsappNumber}</p>
                  </div>
                  <div className={cn("px-3 py-1.5 rounded-lg border flex items-center gap-1.5 text-sm font-semibold capitalize", StatusColor(order.status))}>
                    <StatusIcon status={order.status} />
                    {order.status}
                  </div>
                </div>

                <div className="p-5 flex-1">
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="text-muted-foreground">Order Date</span>
                    <span className="font-medium text-foreground">
                      {order.orderDate
  ? format(new Date(order.orderDate), "MMM d, yyyy")
  : "-"}
                    </span>
                  </div>
                  {order.estimatedReadyDate && (
                    <div className="flex justify-between items-center text-sm mb-4">
                      <span className="text-muted-foreground">Est. Ready By</span>
                      <span className="font-semibold text-primary">
                        {order.estimatedReadyDate
  ? format(new Date(order.estimatedReadyDate), "MMM d, yyyy")
  : "-"}
                      </span>
                    </div>
                  )}

                  <div className="mb-4">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">Items Summary ({(order.items || []).reduce((acc, i) => acc + (i.quantity || 0), 0)})</span>
                    <ul className="text-sm space-y-1 text-foreground/80 max-h-24 overflow-y-auto pr-2 custom-scrollbar">
                      {(order.items || []).map((item, idx) => (
                        <li key={idx} className="flex justify-between">
                          <span className="truncate pr-4">{item.quantity}x {item.name}</span>
                          <span className="font-medium">₹{item.totalPrice}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {order.notes && (
                    <div className="bg-amber-50 text-amber-800 text-xs p-3 rounded-lg border border-amber-100 mb-4">
                      <strong>Notes:</strong> {order.notes}
                    </div>
                  )}

                  {/* Photos */}
                  {order.photoUrls && order.photoUrls.length > 0 && (
                    <div className="mb-3">
                      <button
                        onClick={() => setExpandedPhotos(expandedPhotos === order.id ? null : order.id)}
                        className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                      >
                        <Image className="w-3.5 h-3.5" />
                        {order.photoUrls.length} photo{order.photoUrls.length > 1 ? "s" : ""}
                        {expandedPhotos === order.id ? " (hide)" : " (view)"}
                      </button>
                      {expandedPhotos === order.id && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {order.photoUrls.map((url, pi) => (
                            <a key={pi} href={url} target="_blank" rel="noopener noreferrer">
                              <img
                                src={url}
                                alt={`Photo ${pi + 1}`}
                                className="w-16 h-16 object-cover rounded-lg border border-border hover:opacity-80 transition-opacity"
                              />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="px-5 py-4 bg-background border-t border-border flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-muted-foreground font-medium text-sm">Total</span>
                      {order.discountAmount && Number(order.discountAmount) > 0 && (
                        <p className="text-xs text-emerald-600">Discount: -₹{Number(order.discountAmount)}</p>
                      )}
                    </div>
                    <span className="font-display font-bold text-2xl text-primary">{formatCurrency(Number(order.totalAmount))}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {order.status === "pending" && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, "ready")}
                        disabled={updateOrder.isPending}
                        className="flex-1 bg-foreground text-background font-semibold py-2.5 rounded-xl hover:bg-primary hover:text-white transition-colors flex justify-center items-center gap-2"
                      >
                        Mark Ready
                      </button>
                    )}

                    {order.status === "ready" && (
                      <>
                        <button
                          onClick={() => openWhatsApp(order)}
                          className="flex-1 bg-[#25D366] text-white font-semibold py-2.5 rounded-xl hover:bg-[#1DA851] transition-colors shadow-lg shadow-[#25D366]/20 flex justify-center items-center gap-2"
                        >
                          <MessageCircle className="w-4 h-4" /> WhatsApp
                        </button>
                        <button
                          onClick={() => {
                            handleUpdateStatus(order.id, "delivered");
                            const phone = order.whatsappNumber.replace(/\D/g, "");
                           const displayId = String(order.order_number || 0).padStart(3, "0");

const msg = `Hello ${order.customerName},

Thank you for visiting *SW Laundry & Dry Cleaners*!

Your laundry order (#${displayId}) has been successfully delivered.

Total Amount: ₹${order.totalAmount}

We hope to see you again soon!`;
                            window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
                          }}
                          disabled={updateOrder.isPending}
                          className="flex-1 bg-blue-100 text-blue-700 font-semibold py-2.5 rounded-xl hover:bg-blue-200 transition-colors flex justify-center items-center gap-2"
                        >
                          <MessageCircle className="w-4 h-4" /> Deliver
                        </button>
                      </>
                    )}

                    {order.status === "delivered" && (
                      <button
                        disabled
                        className="flex-1 bg-secondary text-muted-foreground font-semibold py-2.5 rounded-xl cursor-not-allowed opacity-70 flex justify-center items-center gap-2"
                      >
                        Completed
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(order.id)}
                      disabled={deleteOrder.isPending}
                      className="p-2.5 border border-border rounded-xl text-muted-foreground hover:bg-destructive hover:text-white hover:border-destructive transition-colors"
                      title="Delete Order"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
);
})}
          </AnimatePresence>
        </div>
      )}
    </Layout>
  );
}
