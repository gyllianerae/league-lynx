import { User } from "lucide-react";

export const WelcomeBanner = () => {
  return (
    <div className="relative w-full h-48 rounded-lg overflow-hidden mb-8">
      {/* Background Image Layer */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: "url('/lovable-uploads/fdc950f0-e2bd-4dd4-91a9-6d3d651d5592.png')",
          filter: "brightness(0.85)"
        }} 
      />
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-forest/30" />
      
      {/* Content Layer */}
      <div className="relative h-full flex items-center p-8 min-w-[320px]">
        <div className="text-left">
          <h2 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
            Welcome to League Lynx
          </h2>
          <p className="text-lg text-white/90 max-w-2xl drop-shadow">
            Your ultimate fantasy sports companion. Track your leagues, monitor player updates, and dominate your fantasy season.
          </p>
        </div>
      </div>
      
      {/* Accent Glow Effects */}
      <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-mint/10 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-1/3 h-full bg-gradient-to-l from-divine/10 to-transparent pointer-events-none" />
    </div>
  );
};