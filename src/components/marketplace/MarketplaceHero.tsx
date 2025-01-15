import { Star } from "lucide-react";

export const MarketplaceHero = () => {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-mint/50 to-mint/5 border border-mint/10 backdrop-blur-xl p-8">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-5 mix-blend-overlay"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1649972904349-6e44c42644a7')" }}
      />
      <div className="relative">
        <div className="flex items-center gap-2 bg-mint/10 w-fit px-4 py-2 rounded-full border border-mint/20 mb-6">
          <Star className="w-4 h-4 text-mint" />
          <span className="text-foreground text-sm font-medium">League Marketplace</span>
        </div>
        
        <h1 className="text-4xl font-bold text-foreground mb-4 text-start">
          Find Your Perfect League
        </h1>
        
        <p className="text-lg text-foreground/80 max-w-2xl text-start">
          Browse open leagues, connect with commissioners, and join competitive fantasy communities. 
          Whether you're looking to join a league or recruit players, this is your destination.
        </p>
      </div>
    </div>
  );
};