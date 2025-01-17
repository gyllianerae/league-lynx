import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/ThemeProvider';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import Players from '@/pages/Players';
import MyLeagues from '@/pages/MyLeagues';
import LeaguePage from '@/pages/LeaguePage';
import Transactions from '@/pages/Transactions';
import MarketplacePage from '@/pages/Marketplace';
import MarketplaceLeaguePage from '@/pages/MarketplaceLeaguePage';
import { useAuthState } from '@/hooks/useAuthState';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { TopNav } from "@/components/TopNav";
import './App.css';
import Community from './pages/Community';

const queryClient = new QueryClient();

function App() {
  const { isAuthenticated, isLoading } = useAuthState();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex justify-center items-center">
        <div className="text-sky-900 dark:text-mint text-xl">Loading...</div>
      </div>
    );
  }

  const AuthenticatedLayout = ({ children }: { children: React.ReactNode }) => (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background relative selection:bg-gray-200 dark:selection:bg-mint/50">
        <AppSidebar />
        <div className="flex-1">
          <TopNav />
          <main className="p-8 overflow-y-auto h-[calc(100vh-4rem)] w-full mt-16 bg-gray-100 dark:bg-forest">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );

  const PublicLayout = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen w-full bg-background">
      <TopNav />
      <main className="p-8 mt-16 bg-background">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <TooltipProvider>
            <Routes>
              <Route 
                path="/auth" 
                element={!isAuthenticated ? <Auth /> : <Navigate to="/dashboard" />} 
              />
              <Route
                path="/dashboard"
                element={
                  isAuthenticated ? (
                    <AuthenticatedLayout>
                      <Dashboard />
                    </AuthenticatedLayout>
                  ) : (
                    <Navigate to="/auth" />
                  )
                }
              />
              <Route
                path="/players/*"
                element={
                  isAuthenticated ? (
                    <AuthenticatedLayout>
                      <Players />
                    </AuthenticatedLayout>
                  ) : (
                    <Navigate to="/auth" />
                  )
                }
              />
              <Route
                path="/leagues"
                element={
                  isAuthenticated ? (
                    <AuthenticatedLayout>
                      <MyLeagues />
                    </AuthenticatedLayout>
                  ) : (
                    <Navigate to="/auth" />
                  )
                }
              />
              <Route
                path="/leagues/:leagueId"
                element={
                  isAuthenticated ? (
                    <AuthenticatedLayout>
                      <LeaguePage />
                    </AuthenticatedLayout>
                  ) : (
                    <Navigate to="/auth" />
                  )
                }
              />
              <Route
                path="/marketplace"
                element={
                  isAuthenticated ? (
                    <AuthenticatedLayout>
                      <MarketplacePage />
                    </AuthenticatedLayout>
                  ) : (
                    <PublicLayout>
                      <MarketplacePage />
                    </PublicLayout>
                  )
                }
              />
              <Route
                path="/marketplace/:leagueId"
                element={
                  isAuthenticated ? (
                    <AuthenticatedLayout>
                      <MarketplaceLeaguePage />
                    </AuthenticatedLayout>
                  ) : (
                    <Navigate to="/auth" />
                  )
                }
              />
              <Route
                path="/transactions"
                element={
                  isAuthenticated ? (
                    <AuthenticatedLayout>
                      <Transactions />
                    </AuthenticatedLayout>
                  ) : (
                    <Navigate to="/auth" />
                  )
                }
              />
              <Route
                path="/community"
                element={
                  isAuthenticated ? (
                    <AuthenticatedLayout>
                      <Community />
                    </AuthenticatedLayout>
                  ) : (
                    <Navigate to="/auth" />
                  )
                }
              />
              <Route 
                path="/" 
                element={<Navigate to={isAuthenticated ? "/dashboard" : "/marketplace"} />} 
              />
            </Routes>
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
