import React from "react";
import { Trophy, ChartBar, Newspaper } from "lucide-react";

const Features = () => {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-white">
            Dominate Your League
          </h2>
          <p className="text-white/80">Everything you need to win your fantasy football leagues</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Trophy,
              title: "League Management",
              description: "Join multiple leagues, manage your teams, and track your performance across all platforms",
            },
            {
              icon: ChartBar,
              title: "Advanced Stats",
              description: "Get detailed player statistics, performance trends, and AI-powered predictions",
            },
            {
              icon: Newspaper,
              title: "Latest Updates",
              description: "Stay informed with real-time injury reports, trade analysis, and player news",
            },
          ].map((feature, index) => (
            <div 
              key={index} 
              className="bg-forest-light p-8 rounded-xl border border-mint/10"
            >
              <div className="w-12 h-12 bg-mint rounded-full flex items-center justify-center mb-6">
                {React.createElement(feature.icon, { className: "w-6 h-6 text-forest" })}
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
              <p className="text-white/80">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;