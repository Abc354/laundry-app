import { supabase } from "@/lib/supabase";
import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, Search, ShoppingBag, User, Phone, Calendar, Trash2, CheckCircle2, Tag, Camera, X, ImageIcon } from "lucide-react";
import { CATALOG, CATEGORIES, type CatalogItem } from "@/lib/catalog";
import { formatCurrency, cn } from "@/lib/utils";

import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/Layout";

type CartItem = {
  id: string;
  name: string;
  category: string;
  unitPrice: number;
  quantity: number;
  isCustomPrice: boolean;
};

export default function NewOrder() {
  const { toast } = useToast();
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeCategory, setActiveCategory] = useState<string>(CATEGORIES[0]);
  const [searchQuery, setSearchQuery] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split("T")[0]);
  const [estimatedReadyDate, setEstimatedReadyDate] = useState("");
  const [notes, setNotes] = useState("");
  const [discountAmount, setDiscountAmount] = useState<string>("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [customItemName, setCustomItemName] = useState("");
const [customItemPrice, setCustomItemPrice] = useState<number | "">("");

  const filteredCatalog = useMemo(() => {
    return CATALOG.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = searchQuery ? true : item.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
  }, [cart]);

  const discount = useMemo(() => {
    const d = parseFloat(discountAmount);
    return isNaN(d) || d < 0 ? 0 : d;
  }, [discountAmount]);

  const totalAmount = useMemo(() => {
    return Math.max(0, subtotal - discount);
  }, [subtotal, discount]);

  const handleAddToCart = (item: CatalogItem) => {
    setCart((prev) => {
      if (item.price !== null) {
        const existing = prev.find((c) => c.name === item.name && !c.isCustomPrice);
        if (existing) {
          return prev.map((c) =>
            c.id === existing.id ? { ...c, quantity: c.quantity + 1 } : c
          );
        }
      }
      return [
        ...prev,
        {
          id: Math.random().toString(36).substr(2, 9),
          name: item.name,
          category: item.category,
          unitPrice: item.price || 0,
          quantity: 1,
          isCustomPrice: item.price === null,
        },
      ];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQ = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQ };
        }
        return item;
      })
    );
  };

  const updateCustomPrice = (id: string, newPrice: number) => {
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, unitPrice: newPrice } : item))
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newPhotos = [...photos, ...files];
    setPhotos(newPhotos);

    const newUrls = files.map(f => URL.createObjectURL(f));
    setPhotoPreviewUrls(prev => [...prev, ...newUrls]);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removePhoto = (idx: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== idx));
    setPhotoPreviewUrls(prev => {
      URL.revokeObjectURL(prev[idx]);
      return prev.filter((_, i) => i !== idx);
    });
  };



  const handleSubmit = async () => {
  if (!customerName || !whatsappNumber) {
    toast({
      title: "Missing Information",
      description: "Please provide customer name and WhatsApp number.",
      variant: "destructive",
    });
    return;
  }

  if (cart.length === 0) {
    toast({
      title: "Empty Order",
      description: "Please add at least one item to the order.",
      variant: "destructive",
    });
    return;
  }

  try {
    // Upload images
    let imageUrls: string[] = [];

    if (photos.length > 0) {
      setIsUploading(true);

      for (const file of photos) {
        const fileName = `${Date.now()}-${file.name}`;

        const { error: uploadError } = await supabase.storage
          .from("Orders")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("Orders")
          .getPublicUrl(fileName);

        imageUrls.push(data.publicUrl);
      }
    }

    // Insert into DB
    const { data, error } = await supabase
      .from("orders")
      .insert([
        {
          customer_name: customerName,
          whatsapp_number: whatsappNumber,
          order_date: orderDate,
          estimated_ready_date: estimatedReadyDate || null,
          items: cart,
          total_amount: totalAmount,
          discount_amount: discount > 0 ? discount : null,
          notes,
          photo_urls: imageUrls,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    toast({
      title: "Order Created!",
      description: "Order saved successfully.",
    });

    const phone = whatsappNumber.replace(/\D/g, "");

    const itemsList = cart
      .map(c => `- ${c.quantity}x ${c.name} – ₹${c.unitPrice * c.quantity}`)
      .join("\n");
     // const orderId = data.id.slice(0, 6).toUpperCase();
     const displayId =String(data.order_number).padStart(3,"0");

const formattedDate = estimatedReadyDate
  ? new Date(estimatedReadyDate).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  : "Not specified";

  const photosLine = imageUrls.length > 0
  ? `\n Photos:\n${imageUrls.map((url, i) => `${i+1}. ${url}`).join("\n")}`
  : "";

    const msg = `Hello ${customerName},

Your laundry order has been placed successfully at *SW Laundry & Dry Cleaners*.

Order ID: #${displayId}
Items:
${itemsList}

Total Amount: ₹${totalAmount}
Estimated Ready Date: ${formattedDate}${photosLine}

Thank you for choosing us! We will notify you once your order is ready.`;

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
    // Reset
    setCart([]);
    setCustomerName("");
    setWhatsappNumber("");
    setNotes("");
    setEstimatedReadyDate("");
    setDiscountAmount("");
    setPhotos([]);
    setPhotoPreviewUrls([]);

    setIsUploading(false);
  } catch (err: any) {
    console.error(err);
    toast({
      title: "Error",
      description: err.message || "Something went wrong",
      variant: "destructive",
    });
  } finally {
    setIsUploading(false);
  }
};
 const isSubmitting = isUploading;

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Column: Catalog */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col h-[calc(100vh-6rem)]">
          <div className="mb-6">
            <h2 className="text-3xl font-display font-bold text-foreground">Create Order</h2>
            <p className="text-muted-foreground mt-1 text-sm">Select items to add to the customer's cart.</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-border/50 p-4 mb-6 sticky top-0 z-10 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 border border-transparent focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl transition-all outline-none"
              />
            </div>
          </div>

          {!searchQuery && (
            <div className="flex overflow-x-auto gap-2 mb-6 pb-2 scrollbar-hide">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "px-5 py-2.5 rounded-full font-medium text-sm whitespace-nowrap transition-all duration-200",
                    activeCategory === cat
                      ? "bg-foreground text-background shadow-lg scale-105"
                      : "bg-white border border-border text-muted-foreground hover:bg-secondary hover:border-border/80"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          <div className="flex-1 overflow-y-auto pr-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredCatalog.map((item, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={item.name}
                  className="group bg-white border border-border/50 rounded-2xl p-4 hover:shadow-lg hover:border-primary/20 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-bold tracking-wider text-primary/80 uppercase bg-primary/10 px-2 py-1 rounded-md mb-2 inline-block">
                      {item.category}
                    </span>
                    <h3 className="font-semibold text-foreground mt-1">{item.name}</h3>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="font-display font-bold text-lg">
                      {item.price === null ? "Variable" : formatCurrency(item.price)}
                    </span>
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground p-2 rounded-xl transition-colors shadow-sm"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))}

              {filteredCatalog.length === 0 && (
                <div className="col-span-full py-12 text-center text-muted-foreground">
                  No items found matching your search.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Customer Details */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col h-[calc(100vh-6rem)]">
          <div className="bg-white rounded-3xl shadow-xl shadow-black/5 border border-border/50 overflow-hidden flex flex-col h-full">

            <div className="p-6 bg-gradient-to-br from-primary/5 to-transparent border-b border-border/50">
              <h3 className="font-display font-bold text-xl flex items-center gap-2">
                <User className="w-5 h-5 text-primary" /> Customer Info
              </h3>

              <div className="space-y-4 mt-5">
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Customer Name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm"
                  />
                </div>

                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="tel"
                    placeholder="WhatsApp No. (with country code, e.g. 919876543210)"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Order Date</label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="date"
                        value={orderDate}
                        onChange={(e) => setOrderDate(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Est. Ready Date</label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-primary/60" />
                      <input
                        type="date"
                        value={estimatedReadyDate}
                        onChange={(e) => setEstimatedReadyDate(e.target.value)}
                        min={orderDate}
                        className="w-full pl-9 pr-4 py-2.5 bg-background border border-primary/30 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-secondary/10">
              <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" /> Current Order
              </h3>

              {cart.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-3">
                    <ShoppingBag className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                  <p className="text-muted-foreground text-sm">Cart is empty. Add items from the catalog.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {cart.map((item) => (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        key={item.id}
                        className="bg-white p-3 rounded-2xl shadow-sm border border-border flex flex-col gap-2"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1 pr-2">
                            <h4 className="font-medium text-sm text-foreground leading-tight">{item.name}</h4>
                            {item.isCustomPrice && (
                              <div className="mt-1.5 flex items-center gap-2">
                                <span className="text-xs text-muted-foreground font-medium">Price: ₹</span>
                                <input
                                  type="number"
                                  min="0"
                                  value={item.unitPrice || ''}
                                  onChange={(e) => updateCustomPrice(item.id, Number(e.target.value))}
                                  placeholder="0"
                                  className="w-20 px-2 py-1 text-xs border border-primary/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                              </div>
                            )}
                          </div>

                          <button onClick={() => removeFromCart(item.id)} className="text-muted-foreground hover:text-destructive p-1">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex justify-between items-center mt-1">
                          <div className="font-display font-bold text-primary">
                            {formatCurrency(item.unitPrice * item.quantity)}
                          </div>
                          <div className="flex items-center gap-2 bg-secondary rounded-lg p-1">
                            <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-white rounded-md transition-colors text-foreground">
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-white rounded-md transition-colors text-foreground">
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            <div className="p-6 bg-white border-t border-border mt-auto space-y-4">
              <input
                type="text"
                placeholder="Order notes (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:outline-none focus:border-primary text-sm"
              />

              {/* Discount Field */}
              <div className="relative">
                <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="number"
                  min="0"
                  placeholder="Discount amount (optional)"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-xl focus:outline-none focus:border-primary text-sm"
                />
              </div>

              {/* Photo Upload */}
              <div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 py-2 border border-dashed border-primary/40 rounded-xl text-sm text-primary/80 hover:bg-primary/5 transition-colors"
                >
                  <Camera className="w-4 h-4" />
                  Upload Photos (optional)
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handlePhotoSelect}
                />
                {photoPreviewUrls.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {photoPreviewUrls.map((url, i) => (
                      <div key={i} className="relative w-14 h-14 rounded-lg overflow-hidden border border-border group">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={() => removePhoto(i)}
                          className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    ))}
                    <div className="w-14 h-14 rounded-lg border border-dashed border-border flex items-center justify-center text-xs text-muted-foreground">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                  </div>
                )}
              </div>

              {/* Totals */}
              {discount > 0 ? (
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-emerald-600">
                    <span>Discount</span>
                    <span className="font-medium">- {formatCurrency(discount)}</span>
                  </div>
                  <div className="flex justify-between items-end pt-1 border-t border-border">
                    <span className="text-muted-foreground font-medium">Grand Total</span>
                    <span className="text-3xl font-display font-bold text-foreground">
                      {formatCurrency(totalAmount)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-end">
                  <span className="text-muted-foreground font-medium">Grand Total</span>
                  <span className="text-3xl font-display font-bold text-foreground">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={cart.length === 0 || !customerName || !whatsappNumber || isSubmitting}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-primary to-primary/80 hover:to-primary text-white rounded-xl font-bold text-lg shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span className="animate-pulse">{photos.length>0 ? "Uploading Photos..." : "Processing..."}</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" /> Submit Order
                  </>
                )}
              </button>
            </div>

          </div>
        </div>

      </div>
    </Layout>
  );
}
