import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const Navbar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
      });
      
      navigate("/auth");
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-nav">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-white">
          League Lynx
        </Link>
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/app" className="text-white/90 hover:text-white transition-colors">
            Dashboard
          </Link>
          <Link to="/pricing" className="text-white/90 hover:text-white transition-colors">
            Leagues
          </Link>
          <Link to="/about" className="text-white/90 hover:text-white transition-colors">
            Players
          </Link>
          <Link to="/blog" className="text-white/90 hover:text-white transition-colors">
            News
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <Button className="bg-mint hover:bg-mint-light text-forest font-medium">
            Join League
          </Button>
          <Button 
            variant="ghost" 
            className="text-white hover:text-mint transition-colors"
            onClick={handleSignOut}
          >
            Sign Out
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;