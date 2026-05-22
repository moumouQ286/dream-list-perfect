import React, { useState } from "react";
import { motion } from "motion/react";
import { User } from "lucide-react";

interface OnboardingProps {
  onComplete: (age: number) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [age, setAge] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ageNum = parseInt(age);
    if (!isNaN(ageNum) && ageNum > 0 && ageNum < 120) {
      onComplete(ageNum);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#F2F2F7] flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-10 rounded-[40px] shadow-2xl max-w-md w-full text-center border border-[#D1D1D6]"
      >
        <div className="w-20 h-20 bg-[#FFD60A] rounded-[24px] shadow-inner flex items-center justify-center mx-auto mb-8">
          <User className="w-10 h-10 text-black/40" />
        </div>
        
        <h1 className="text-3xl font-bold mb-2 text-[#1C1C1E] tracking-tight">
          Dream Board
        </h1>
        <p className="text-sm font-bold text-[#8E8E93] uppercase tracking-[0.2em] mb-10">
          人生夢想清單
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <label className="block text-xs font-bold text-[#8E8E93] uppercase tracking-widest">
              How old are you? / 您的年齡
            </label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="00"
              className="w-full bg-[#F2F2F7] px-6 py-5 rounded-2xl border-none focus:ring-2 focus:ring-[#FFD60A] text-center text-4xl font-bold text-[#1C1C1E] placeholder:text-[#D1D1D6]"
              autoFocus
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-[#007AFF] text-white py-5 rounded-2xl font-bold text-lg hover:bg-[#0066D6] transition-all shadow-lg active:scale-95 shadow-blue-500/20"
          >
            Start Journey / 開始規劃
          </button>
        </form>
        
        <p className="mt-12 text-[10px] text-[#8E8E93] leading-relaxed font-bold uppercase tracking-widest opacity-50">
          Visualizing your future decades<br/>
          規劃您未來的每一個十年
        </p>
      </motion.div>
    </div>
  );
};
