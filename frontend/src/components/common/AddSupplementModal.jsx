import React, { useState, useEffect } from 'react';
import { X, Plus, Sparkles, Check, Loader2 } from 'lucide-react';
import wheyImg from '../../assets/images/product-whey.jpg';
import { fetchProducts, resolveProductImage } from '../../services/supplementsApi';

export default function AddSupplementModal({
  isOpen,
  onClose,
  onAddSupplement,
  editItem = null,
  onUpdateSupplement = null,
}) {
  const [catalogueProducts, setCatalogueProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Protein',
    dosage: '',
    timing: 'Post Workout',
    startDate: new Date().toISOString().split('T')[0],
    status: 'Active',
    notes: '',
  });

  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setIsSubmitting(false);

      // Load products for catalogue dropdown
      fetchProducts().then((prods) => {
        if (prods && Array.isArray(prods)) {
          setCatalogueProducts(prods);
        }
      });

      if (editItem) {
        setFormData({
          name: editItem.name || '',
          category: editItem.category || 'Protein',
          dosage: editItem.dosage || '',
          timing: editItem.timing || 'Post Workout',
          startDate: editItem.startDate || editItem.start_date || new Date().toISOString().split('T')[0],
          status: editItem.status || 'Active',
          notes: editItem.notes || '',
        });
        setSelectedProductId(editItem.product || '');
      } else {
        setFormData({
          name: '',
          category: 'Protein',
          dosage: '',
          timing: 'Post Workout',
          startDate: new Date().toISOString().split('T')[0],
          status: 'Active',
          notes: '',
        });
        setSelectedProductId('');
      }
    }
  }, [isOpen, editItem]);

  if (!isOpen) return null;

  const handleProductSelect = (e) => {
    const val = e.target.value;
    setSelectedProductId(val);
    if (!val) return; // Custom supplement selected

    const prod = catalogueProducts.find((p) => String(p.id) === String(val));
    if (prod) {
      setFormData((prev) => ({
        ...prev,
        name: prod.name,
        category: prod.category || prod.category_slug || prev.category,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.name.trim() || !formData.dosage.trim()) {
      setErrorMsg('Please fill out supplement name and dosage.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editItem && onUpdateSupplement) {
        await onUpdateSupplement(editItem.id, {
          name: formData.name.trim(),
          category: formData.category,
          dosage: formData.dosage.trim(),
          timing: formData.timing,
          startDate: formData.startDate,
          status: formData.status,
          notes: formData.notes.trim(),
        });
      } else {
        const prod = catalogueProducts.find((p) => String(p.id) === String(selectedProductId));
        await onAddSupplement({
          product: selectedProductId ? Number(selectedProductId) : null,
          name: formData.name.trim(),
          category: formData.category,
          dosage: formData.dosage.trim(),
          timing: formData.timing,
          startDate: formData.startDate,
          status: formData.status,
          notes: formData.notes.trim(),
          image: prod ? resolveProductImage(prod) : wheyImg,
        });
      }
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save supplement. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#0D141C] border border-[#1E2D42] rounded-2xl shadow-2xl p-6 overflow-hidden">
        {/* Glow corner */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#2BAF34]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#162230]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#2BAF34]/15 border border-[#2BAF34]/30 flex items-center justify-center text-[#2BAF34]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {editItem ? 'Edit Stack Supplement' : 'Add Supplement to Stack'}
              </h3>
              <p className="text-xs text-slate-400">Track dosage, schedule timing, and monitor consistency.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Select from catalogue */}
          {!editItem && (
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                Choose from Catalogue <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
              <select
                value={selectedProductId}
                onChange={handleProductSelect}
                className="w-full px-3.5 py-2.5 bg-[#090D16] border border-[#1E2D42] rounded-xl text-white focus:outline-none focus:border-[#2BAF34] cursor-pointer"
              >
                <option value="">-- Custom Supplement (Type your own) --</option>
                {catalogueProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.brand} - {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">Supplement Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Optimum Nutrition Whey, Creatine Monohydrate"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#090D16] border border-[#1E2D42] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#2BAF34]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#090D16] border border-[#1E2D42] rounded-xl text-white focus:outline-none focus:border-[#2BAF34] cursor-pointer"
              >
                <option value="Protein">Protein</option>
                <option value="Creatine">Creatine</option>
                <option value="Pre-Workout">Pre-Workout</option>
                <option value="Vitamins">Vitamins</option>
                <option value="Amino Acids">Amino Acids</option>
                <option value="Omega 3">Omega 3 & Fats</option>
                <option value="Recovery">Post-Workout & Recovery</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Dosage</label>
              <input
                type="text"
                required
                placeholder="e.g. 1 scoop (30 g), 5 g, 2 capsules"
                value={formData.dosage}
                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#090D16] border border-[#1E2D42] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#2BAF34]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Timing</label>
              <select
                value={formData.timing}
                onChange={(e) => setFormData({ ...formData, timing: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#090D16] border border-[#1E2D42] rounded-xl text-white focus:outline-none focus:border-[#2BAF34] cursor-pointer"
              >
                <option value="Pre Workout">Pre Workout (30m before)</option>
                <option value="Post Workout">Post Workout</option>
                <option value="After Breakfast">After Breakfast</option>
                <option value="After Dinner">After Dinner</option>
                <option value="Before Bed">Before Bed</option>
                <option value="With Water Daily">Anytime with Water</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#090D16] border border-[#1E2D42] rounded-xl text-white focus:outline-none focus:border-[#2BAF34] cursor-pointer"
              >
                <option value="Active">Active</option>
                <option value="Paused">Paused</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#090D16] border border-[#1E2D42] rounded-xl text-white focus:outline-none focus:border-[#2BAF34] cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                Notes <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Take with warm water"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#090D16] border border-[#1E2D42] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#2BAF34]"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#162230]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-[#2BAF34] hover:bg-[#35D440] text-black font-bold transition-all shadow-md shadow-[#2BAF34]/25 active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : editItem ? (
                <>
                  <Check className="w-4 h-4" />
                  Update Supplement
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add to Stack
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
