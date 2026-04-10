import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/contexts/I18nContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Upload, X, ChevronLeft, ChevronRight, MapPin, Locate, Sparkles, Package, Tag } from "lucide-react";
import { toast } from "sonner";

const classes = ["1","2","3","4","5","6","7","8","9","10","11","12","College","Other"];

const conditions = [
  { value: "like_new", label: "Like New", emoji: "✨", desc: "Barely used" },
  { value: "good", label: "Good", emoji: "👍", desc: "Minor wear" },
  { value: "old", label: "Old", emoji: "📦", desc: "Well used" },
];

const priceSuggestions: Record<string, string> = {
  like_new: "₹200–400 recommended for Like New",
  good: "₹100–250 recommended for Good condition",
  old: "₹50–150 recommended for Old condition",
};

const SellBook = () => {
  const { t } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [classVal, setClassVal] = useState("");
  const [subject, setSubject] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [condition, setCondition] = useState("");
  const [price, setPrice] = useState("");
  const [isFree, setIsFree] = useState(false);
  const [location, setLocation] = useState("");
  const [detectingLoc, setDetectingLoc] = useState(false);
  const [isCombo, setIsCombo] = useState(false);
  const [comboItems, setComboItems] = useState("");
  const [deliveryDays, setDeliveryDays] = useState("3");
  const [sellerPhone, setSellerPhone] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [slideIdx, setSlideIdx] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files).slice(0, 4 - images.length);
    setImages((prev) => [...prev, ...newFiles]);
    newFiles.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (e) => setPreviews((prev) => [...prev, e.target?.result as string]);
      reader.readAsDataURL(f);
    });
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
    if (slideIdx >= previews.length - 1) setSlideIdx(Math.max(0, previews.length - 2));
  };

  const detectLocation = () => {
    if (!navigator.geolocation) return;
    setDetectingLoc(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        setDetectingLoc(false);
      },
      () => { setDetectingLoc(false); toast.error("Could not detect location"); }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim()) return;
    setLoading(true);

    try {
      let imageUrl: string | null = null;
      if (images[0]) {
        const ext = images[0].name.split(".").pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("book-images").upload(path, images[0]);
        if (!uploadError) {
          const { data } = supabase.storage.from("book-images").getPublicUrl(path);
          imageUrl = data.publicUrl;
        }
      }

      const { error } = await supabase.from("books").insert({
        user_id: user.id,
        title,
        subject: subject || null,
        price: isFree ? 0 : price ? parseFloat(price) : null,
        condition: condition || null,
        image_url: imageUrl,
        location_name: location || null,
        quantity: parseInt(quantity) || 1,
        delivery_days: parseInt(deliveryDays) || 3,
        seller_phone: sellerPhone || null,
        is_combo: isCombo,
        combo_items: isCombo ? comboItems : null,
      });

      if (error) throw error;
      toast.success("Book listed successfully! 🎉");
      navigate("/books");
    } catch (err: any) {
      toast.error(err.message || "Failed to list book");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 input-glow transition-all duration-300";

  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-foreground">📖 {t("sellBook")}</h1>
          <p className="text-sm text-muted-foreground mt-1">List your book and reach students nearby. It's quick and easy!</p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl border border-border shadow-card p-5 sm:p-6 space-y-5"
        >
          {/* Image Upload with Slider */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">{t("uploadImage")} (up to 4)</label>
            {previews.length > 0 ? (
              <div className="relative rounded-xl overflow-hidden border border-border mb-2" style={{ height: 200 }}>
                <AnimatePresence mode="wait">
                  <motion.img
                    key={slideIdx}
                    src={previews[slideIdx]}
                    alt=""
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>
                <button type="button" onClick={() => removeImage(slideIdx)} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-lg">
                  <X className="w-4 h-4" />
                </button>
                {previews.length > 1 && (
                  <>
                    <button type="button" onClick={() => setSlideIdx((slideIdx - 1 + previews.length) % previews.length)} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/70 flex items-center justify-center">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => setSlideIdx((slideIdx + 1) % previews.length)} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/70 flex items-center justify-center">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {previews.map((_, i) => (
                    <button key={i} type="button" onClick={() => setSlideIdx(i)} className={`w-2 h-2 rounded-full transition-all ${i === slideIdx ? "bg-primary scale-125" : "bg-white/50"}`} />
                  ))}
                </div>
              </div>
            ) : null}
            {images.length < 4 && (
              <button type="button" onClick={() => fileRef.current?.click()} className="w-full h-24 rounded-xl border-2 border-dashed border-border flex items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-all duration-300">
                <Upload className="w-5 h-5" /> Upload Images
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
          </div>

          {/* Book Name */}
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Book Name *" className={inputClass} required />

          {/* Class & Subject */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <select value={classVal} onChange={(e) => setClassVal(e.target.value)} className={inputClass}>
              <option value="">Class</option>
              {classes.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder={t("subject")} className={inputClass} />
          </div>

          {/* Quantity & Delivery */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Quantity" type="number" min="1" className={inputClass} />
            <input value={deliveryDays} onChange={(e) => setDeliveryDays(e.target.value)} placeholder="Delivery Days (e.g. 2-3)" type="number" min="1" className={inputClass} />
          </div>

          {/* Condition Picker */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">{t("condition")}</label>
            <div className="grid grid-cols-3 gap-3">
              {conditions.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setCondition(c.value)}
                  className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-300 ${
                    condition === c.value
                      ? "border-primary bg-primary/10 shadow-[0_0_15px_hsl(var(--primary)/0.3)]"
                      : "border-border bg-muted hover:border-primary/50"
                  }`}
                >
                  <span className="text-2xl mb-1">{c.emoji}</span>
                  <span className="text-xs font-semibold text-foreground">{c.label}</span>
                  <span className="text-[10px] text-muted-foreground">{c.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Price */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <input
                value={isFree ? "" : price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder={t("price")}
                type="number"
                disabled={isFree}
                className={`${inputClass} ${isFree ? "opacity-50" : ""}`}
              />
              <button
                type="button"
                onClick={() => setIsFree(!isFree)}
                className={`shrink-0 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all duration-300 ${
                  isFree
                    ? "border-primary bg-primary/10 text-primary shadow-[0_0_15px_hsl(var(--primary)/0.3)]"
                    : "border-border text-muted-foreground hover:border-primary/50"
                }`}
              >
                <Tag className="w-4 h-4 inline mr-1" />
                Free
              </button>
            </div>
            {condition && !isFree && (
              <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-primary flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> {priceSuggestions[condition]}
              </motion.p>
            )}
          </div>

          {/* Location */}
          <div className="flex gap-3">
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder={t("location")} className={inputClass} />
            <button
              type="button"
              onClick={detectLocation}
              disabled={detectingLoc}
              className="shrink-0 px-4 py-3 rounded-xl border border-border bg-muted text-foreground hover:border-primary transition-all flex items-center gap-1.5 text-sm"
            >
              <Locate className={`w-4 h-4 ${detectingLoc ? "animate-spin" : ""}`} />
              {detectingLoc ? "..." : "Detect"}
            </button>
          </div>

          {/* Seller Phone */}
          <input value={sellerPhone} onChange={(e) => setSellerPhone(e.target.value)} placeholder="Seller Phone (optional)" className={inputClass} />

          {/* Combo Option */}
          <div className="border border-border rounded-xl p-4 bg-muted/30">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={isCombo} onChange={(e) => setIsCombo(e.target.checked)} className="w-4 h-4 accent-[hsl(var(--primary))]" />
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Sell as Combo</span>
              </div>
            </label>
            <AnimatePresence>
              {isCombo && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <textarea
                    value={comboItems}
                    onChange={(e) => setComboItems(e.target.value)}
                    placeholder="What's included? e.g. Bag, Notes, Lab manual..."
                    rows={2}
                    className={`${inputClass} mt-3 resize-none`}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!title.trim() || loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary to-[hsl(var(--primary)/0.8)] text-primary-foreground font-bold text-lg shadow-[0_0_20px_hsl(var(--primary)/0.3)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.5)] hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? "Publishing..." : "🚀 Publish Listing"}
          </button>
        </motion.form>
      </main>
    </div>
  );
};

export default SellBook;
