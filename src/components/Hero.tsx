import { Button } from "@/components/ui/button";
import { ArrowRight, Star } from "lucide-react";

const Hero = () => {
  return (
    <section className="pt-32 pb-20 px-4">
      <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <div className="flex items-center gap-2 bg-mint/10 w-fit px-4 py-2 rounded-full border border-mint/20">
            <Star className="w-4 h-4 text-mint" />
            <span className="text-mint text-sm font-medium">Fantasy League Management</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold leading-tight text-white">
            Dominate Your
            <br />
            Fantasy
            <br />
            Leagues
          </h1>
          <p className="text-lg text-white/80 max-w-md">
            Find leagues, track standings, get player insights, and manage all your fantasy teams in one powerful platform.
          </p>
          <div className="flex items-center gap-4">
            <Button className="bg-mint hover:bg-mint/90 text-forest font-medium px-8 py-6 text-lg">
              Join Leagues <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" className="border-mint/20 text-mint hover:bg-mint/10">
              View Rankings
            </Button>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-0.5 bg-mint/20 rounded-2xl blur opacity-30" />
          <img
            src="/lovable-uploads/a0bf587a-e77e-4b20-838f-1433875935a8.png"
            alt="League Lynx mascot"
            className="relative rounded-2xl shadow-2xl"
          />
          <div className="absolute -bottom-10 -left-10 bg-forest-light p-6 rounded-xl shadow-xl border border-mint/10">
            <p className="text-mint text-4xl font-bold">10k+</p>
            <p className="text-white/80">Active leagues</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;