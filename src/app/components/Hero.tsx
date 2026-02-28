import imgImage167 from "../../assets/logo_small.png";
import { JoinNowButton } from "./JoinNowButton";


export function Hero() {
  return (
    <div className="relative overflow-hidden">
      {/* Logo */}
      <div className="flex justify-center pt-6 pb-4">
        <img
          src={imgImage167}
          alt="Logo"
          className="w-24 h-24 md:w-32 md:h-32 object-contain"
        />
      </div>

      {/* Main Headline */}
      <div className="px-4 md:px-8 lg:px-16 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Gradient Background for Title */}
          <div className="bg-gradient-to-r from-purple-700 to-pink-600 rounded-lg p-6 md:p-8 mb-8 backdrop-blur-sm">
            <h1 className="font-['Poppins:SemiBold',sans-serif] text-2xl md:text-3xl lg:text-4xl text-white text-center mb-4">
              UI/UX Interview Cracking Workshop
            </h1>
          </div>

          {/* Emotional Headline in Tamil */}
          <div className="border-2 border-pink-400 rounded-xl p-6 md:p-10 bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-sm">
            <h2 className="font-['Baloo_Thambi:Regular',sans-serif] text-3xl md:text-4xl lg:text-5xl text-white text-center leading-tight mb-4">
              நீங்க எங்க படித்தாலும் சரி!!
            </h2>
            <p className="font-['Baloo_Thambi:Regular',sans-serif] text-2xl md:text-3xl lg:text-4xl text-white text-center">
              UX Interview Crack Panalam?
            </p>
          </div>

          {/* Subheadline */}
          <div className="mt-8 text-center">
            <p className="text-white text-lg md:text-xl lg:text-2xl font-['Poppins:Medium',sans-serif] leading-relaxed">
              <span className="block mb-2">Stop letting interviews slip through your fingers.</span>
              <span className="block text-pink-400">Your dream UX career is just one workshop away.</span>
            </p>
          </div>

          {/* Workshop Date */}
          <div className="flex justify-center mt-6">
            <div className="inline-flex items-center gap-4 bg-white/5 border border-white/10 px-6 md:px-10 py-4 rounded-2xl backdrop-blur-sm hover:border-pink-500/50 transition-colors group">
              <div className="bg-pink-600/20 p-3 rounded-xl group-hover:bg-pink-600/30 transition-colors">
                <span className="text-3xl">📅</span>
              </div>
              <div className="text-left">
                <p className="text-pink-400 text-xs md:text-sm uppercase tracking-[0.2em] font-bold mb-1">Workshop Date</p>
                <p className="text-white font-['Poppins:Bold',sans-serif] text-xl md:text-2xl">March 01, 2026</p>
              </div>
            </div>
          </div>

          {/* Urgency Element */}
          <div className="flex justify-center mt-6">
            <div className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 px-6 py-3 rounded-full animate-pulse">
              <p className="font-['Poppins:Bold',sans-serif] text-black text-sm md:text-base">
                🔥 Limited Seats Available - Join 12,000+ Success Stories
              </p>
            </div>
          </div>

          {/* Join Now Button */}
          <div className="mt-8 flex justify-center">
            <JoinNowButton
              amount={499}
              text="Join Now @ ₹499 Only"
              className="inline-block cursor-pointer bg-gradient-to-r from-yellow-400 to-orange-500 px-8 md:px-12 py-4 md:py-6 rounded-full shadow-2xl hover:shadow-yellow-500/50 transition-all duration-300 transform hover:scale-105 text-xl md:text-2xl text-black"
            />
          </div>
        </div>
      </div>
    </div>
  );
}