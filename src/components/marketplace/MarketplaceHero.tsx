import { Star } from "lucide-react";

export const MarketplaceHero = () => {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-sky-900/80 to-sky-190 dark:from-mint/20 dark:to-mint/5 backdrop-blur-xl p-8">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-5 mix-blend-overlay"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1649972904349-6e44c42644a7')" }}
      />
      <div className="relative">
        <div className="flex items-center gap-2 dark:bg-mint/10 w-fit px-4 py-2 rounded-full border border-gray-100 dark:border-mint/20 mb-6">
          <Star className="w-4 h-4 text-gray-100 dark:text-mint" />
          <span className="text-gray-100 dark:text-mint text-sm font-medium">League Marketplace</span>
        </div>
        
        <h1 className="text-4xl font-bold text-white mb-4 text-start">
          Find Your Perfect League
        </h1>
        
        <p className="text-lg text-white/80 max-w-2xl text-start">
          Browse open leagues, connect with commissioners, and join competitive fantasy communities. 
          Whether you're looking to join a league or recruit players, this is your destination.
        </p>
      </div>
    </div>
  );
};