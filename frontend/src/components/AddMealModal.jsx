import React, { useState } from 'react';
import { X, Plus, Utensils } from 'lucide-react';

export default function AddMealModal({ isOpen, onClose, onAddMeal }) {
  const [mealCategory, setMealCategory] = useState('Breakfast');
  const [foodName, setFoodName] = useState('');
  const [quantity, setQuantity] = useState('1 serving');
  const [calories, setCalories] = useState(150);
  const [protein, setProtein] = useState(10);
  const [carbs, setCarbs] = useState(15);
  const [fats, setFats] = useState(5);

  const predefinedFoods = [
    { name: 'Boiled Eggs (2)', category: 'Breakfast', qty: '2 eggs', cal: 140, p: 12, c: 1, f: 10, img: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=120&h=120&q=80' },
    { name: 'Oatmeal with Berries', category: 'Breakfast', qty: '1 bowl', cal: 220, p: 7, c: 38, f: 4, img: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=120&h=120&q=80' },
    { name: 'Chicken Breast (Grilled)', category: 'Lunch', qty: '150 g', cal: 248, p: 46, c: 0, f: 5, img: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=120&h=120&q=80' },
    { name: 'Greek Yogurt with Honey', category: 'Evening Snack', qty: '1 cup', cal: 130, p: 15, c: 12, f: 2, img: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=120&h=120&q=80' },
    { name: 'Avocado Toast', category: 'Breakfast', qty: '2 slices', cal: 280, p: 6, c: 28, f: 16, img: 'https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?auto=format&fit=crop&w=120&h=120&q=80' },
    { name: 'Salmon Fillet', category: 'Dinner', qty: '180 g', cal: 320, p: 34, c: 0, f: 18, img: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=120&h=120&q=80' }
  ];

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!foodName.trim()) return;

    onAddMeal({
      mealCategory,
      food: {
        name: foodName,
        qty: quantity,
        calories: Number(calories),
        protein: Number(protein),
        carbs: Number(carbs),
        fats: Number(fats),
        image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=120&h=120&q=80'
      }
    });
    onClose();
  };

  const selectPredefined = (food) => {
    setFoodName(food.name);
    setMealCategory(food.category);
    setQuantity(food.qty);
    setCalories(food.cal);
    setProtein(food.p);
    setCarbs(food.c);
    setFats(food.f);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0D141C] border border-[#1E2D42] w-full max-w-lg rounded-2xl p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-[#1E2D42]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Add Meal to Food Diary</h3>
              <p className="text-xs text-slate-400">Log custom food or select from quick items</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#121B26] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick select presets */}
        <div className="mt-4">
          <label className="text-xs font-semibold text-slate-300 block mb-2">Quick Picks</label>
          <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto scrollbar-thin pr-1">
            {predefinedFoods.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => selectPredefined(item)}
                className="flex items-center gap-2.5 p-2 rounded-xl bg-[#0B111A] hover:bg-[#121B26] border border-[#1E2D42] text-left transition-colors cursor-pointer"
              >
                <img src={item.img} alt={item.name} className="w-7 h-7 rounded-lg object-cover" />
                <div className="overflow-hidden">
                  <p className="text-xs font-medium text-white truncate">{item.name}</p>
                  <p className="text-[10px] text-emerald-400">{item.cal} kcal • {item.p}g P</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-300 block mb-1">Meal Time</label>
              <select
                value={mealCategory}
                onChange={(e) => setMealCategory(e.target.value)}
                className="w-full bg-[#0B111A] border border-[#1E2D42] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Breakfast">Breakfast (08:00 AM)</option>
                <option value="Lunch">Lunch (01:00 PM)</option>
                <option value="Evening Snack">Evening Snack (05:30 PM)</option>
                <option value="Dinner">Dinner (08:00 PM)</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">Serving / Quantity</label>
              <input
                type="text"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-[#0B111A] border border-[#1E2D42] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                placeholder="e.g. 1 bowl / 150g"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-300 block mb-1">Food Item Name</label>
            <input
              type="text"
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              className="w-full bg-[#0B111A] border border-[#1E2D42] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              placeholder="e.g. Scrambled Eggs with Avocado"
              required
            />
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Calories</label>
              <input
                type="number"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="w-full bg-[#0B111A] border border-[#1E2D42] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-[11px] text-emerald-400 block mb-1">Protein (g)</label>
              <input
                type="number"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                className="w-full bg-[#0B111A] border border-[#1E2D42] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-[11px] text-cyan-400 block mb-1">Carbs (g)</label>
              <input
                type="number"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                className="w-full bg-[#0B111A] border border-[#1E2D42] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-[11px] text-purple-400 block mb-1">Fats (g)</label>
              <input
                type="number"
                value={fats}
                onChange={(e) => setFats(e.target.value)}
                className="w-full bg-[#0B111A] border border-[#1E2D42] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-[#121B26] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#2BAF34] hover:bg-[#218928] text-black font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Add to Diary
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
