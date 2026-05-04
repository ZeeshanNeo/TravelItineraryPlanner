import { useState, useEffect, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Map, Plane,
  CreditCard, Users, FolderOpen,
  LogOut, Menu, X, Settings, Search, Plus,
  User, HelpCircle,
  ChevronRight
} from 'lucide-react';
import { useSearch } from '../../context/SearchContext';
import { authService } from '../../services/auth.service';
import { useIsSmallScreen } from '../../hooks/useMediaQuery';


interface LayoutProps {
  children: ReactNode;
  showNav?: boolean;
}

const Layout = ({ children, showNav = true }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isSmallScreen = useIsSmallScreen();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userProfile, setUserProfile] = useState<{ firstName: string; lastName: string } | null>(null);
  const { searchQuery, setSearchQuery } = useSearch();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await authService.getProfile();
        setUserProfile(profile);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
      window.location.href = '/login';
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Itinerary', path: '/itinerary', icon: Map },
    { name: 'Bookings', path: '/bookings', icon: Plane },
    { name: 'Expenses', path: '/expenses', icon: CreditCard },
    { name: 'Collaboration', path: '/collaboration', icon: Users },
    { name: 'Vault', path: '/vault', icon: FolderOpen },
  ];

  if (!showNav) {
    return <div className="min-h-screen bg-mesh text-on-background font-body-md animate-fade-in">{children}</div>;
  }

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const fullName = userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : 'Agent Voyager';
  const firstName = userProfile?.firstName || 'Voyager';

  return (
    <div className="bg-background text-foreground font-body-md min-h-screen flex flex-col md:flex-row overflow-hidden transition-colors duration-500">
      {/* SideNavBar / Mobile Drawer */}
      <aside
        className={`flex flex-col z-50 bg-card border-r border-border shadow-[0_0_50px_rgba(0,0,0,0.1)] transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isSmallScreen
            ? `fixed left-0 top-0 h-full w-80 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`
            : `relative h-screen shrink-0 ${isCollapsed ? 'w-24' : 'w-80'}`
        }`}
      >
        {/* Branding Area */}
        <div className={`h-28 flex items-center ${isCollapsed && !isSmallScreen ? 'justify-center' : 'px-8 justify-between'} shrink-0`}>
          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate('/dashboard')}>
            <div className={`motion-float flex items-center justify-center bg-primary text-primary-foreground shadow-2xl shadow-primary/40 transition-all duration-500 group-hover:scale-110 
              ${isCollapsed && !isSmallScreen ? 'w-12 h-12 rounded-xl' : 'w-14 h-14 rounded-2xl rotate-[-6deg]'}`}>
              <Plane className={`transition-transform duration-500 ${isCollapsed && !isSmallScreen ? 'w-6 h-6' : 'w-7 h-7 -rotate-45 group-hover:rotate-0'}`} />
            </div>
            {(!isCollapsed || isSmallScreen) && (
              <div className="flex flex-col animate-fade-in">
                <h1 className="text-2xl font-black text-foreground tracking-tighter leading-none">Voyager</h1>
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mt-1 italic">Enterprise Edition</span>
              </div>
            )}
          </div>
          {isSmallScreen && (
            <button onClick={toggleSidebar} className="p-3 rounded-xl hover:bg-secondary text-muted-foreground transition-all">
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 px-4 space-y-2.5 overflow-y-auto no-scrollbar py-6">
          <p className={`px-4 text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] mb-6 transition-all duration-300
            ${isCollapsed && !isSmallScreen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}`}>
            Intelligence Hub
          </p>
          
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => isSmallScreen && setIsSidebarOpen(false)}
                className={`flex items-center gap-4 h-14 rounded-2xl transition-all duration-300 group relative
                  ${isActive 
                    ? 'bg-secondary text-slate-950 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)]' 
                    : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'} 
                  ${isCollapsed && !isSmallScreen ? 'justify-center px-0' : 'px-5'}`}
                title={isCollapsed && !isSmallScreen ? item.name : ''}
              >
                <item.icon size={22} className={`enterprise-icon ${isActive ? 'scale-110 text-primary' : ''}`} />
                {(!isCollapsed || isSmallScreen) && (
                  <span className={`text-sm font-black tracking-tight animate-fade-in ${isActive ? 'text-slate-950' : ''}`}>{item.name}</span>
                )}
                {isActive && !isCollapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.8)]" />
                )}
                {isActive && isCollapsed && !isSmallScreen && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-primary rounded-l-full shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
                )}
              </Link>
            );
          })}

          <div className="pt-10">
             <p className={`px-4 text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] mb-6 transition-all duration-300
               ${isCollapsed && !isSmallScreen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}`}>
               Management
             </p>
             {[
               { name: 'Profile', path: '/profile', icon: User },
               { name: 'Settings', path: '/settings', icon: Settings }
             ].map((item) => {
               const isActive = location.pathname === item.path;
               return (
                 <Link
                   key={item.name}
                   to={item.path}
                   className={`flex items-center gap-4 h-14 rounded-2xl transition-all duration-300 group relative mb-2
                     ${isActive 
                       ? 'bg-secondary text-slate-950 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)]' 
                       : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'} 
                     ${isCollapsed && !isSmallScreen ? 'justify-center px-0' : 'px-5'}`}
                   title={isCollapsed && !isSmallScreen ? item.name : ''}
                 >
                   <item.icon size={22} className={`enterprise-icon ${isActive ? 'scale-110 text-primary' : ''}`} />
                   {(!isCollapsed || isSmallScreen) && (
                     <span className={`text-sm font-black tracking-tight animate-fade-in ${isActive ? 'text-slate-950' : ''}`}>{item.name}</span>
                   )}
                 </Link>
               );
             })}
          </div>
        </nav>

        {/* Footer Area */}
        <div className={`p-6 border-t border-border mt-auto space-y-4 bg-muted/30 ${isCollapsed && !isSmallScreen ? 'flex flex-col items-center' : ''}`}>
          {!isCollapsed || isSmallScreen ? (
            <button
              onClick={() => { navigate('/plan-trip'); if (isSmallScreen) setIsSidebarOpen(false); }}
              className="w-full h-14 rounded-2xl bg-slate-950 text-white font-black flex items-center justify-center gap-3 hover:bg-black shadow-2xl transition-all active:scale-95 group"
            >
              <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
              <span className="text-sm uppercase tracking-widest">Plan New Trip</span>
            </button>
          ) : (
            <button
              onClick={() => navigate('/plan-trip')}
              className="w-14 h-14 rounded-2xl bg-slate-950 text-white flex items-center justify-center hover:bg-black shadow-2xl transition-all active:scale-95 group"
              title="Plan New Trip"
            >
              <Plus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
            </button>
          )}

          <button 
            onClick={handleLogout} 
            className={`flex items-center gap-4 h-14 w-full rounded-2xl text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-all duration-300 font-bold text-sm ${isCollapsed && !isSmallScreen ? 'justify-center' : 'px-5'}`}
            title={isCollapsed && !isSmallScreen ? 'Logout' : ''}
          >
            <LogOut size={22} />
            {(!isCollapsed || isSmallScreen) && <span className="uppercase tracking-widest text-xs">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Overlay for mobile drawer */}
      {isSmallScreen && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-40 animate-fade-in"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 relative flex flex-col h-screen overflow-hidden">
        {/* Cinematic Header */}
        <header className="min-h-24 md:h-28 flex items-center justify-between gap-4 px-4 sm:px-6 md:px-10 shrink-0 bg-background/80 backdrop-blur-xl border-b border-border/40 z-40">
          <div className="flex items-center gap-3 md:gap-6 flex-1 min-w-0">
            <button 
              onClick={isSmallScreen ? toggleSidebar : toggleCollapse} 
              className="p-3.5 rounded-2xl bg-secondary text-foreground shadow-sm border border-border hover:bg-accent transition-all active:scale-95 group"
            >
              {isSmallScreen ? <Menu size={22} /> : (isCollapsed ? <ChevronRight size={22} /> : <Menu size={22} className="group-hover:rotate-180 transition-transform duration-500" />)}
            </button>
            <div className="relative max-w-xl w-full group hidden sm:block">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search itineraries, bookings, intelligence..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-16 pr-6 py-4 bg-muted border border-border rounded-2xl text-sm font-black tracking-tight focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-inner"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-8 ml-2 md:ml-8">
            <div className="flex items-center gap-3">
              <button className="p-3.5 rounded-2xl hover:bg-secondary text-muted-foreground transition-all">
                <HelpCircle size={22} />
              </button>
            </div>

            <div className="h-10 w-px bg-border/60"></div>

            <div className="flex items-center gap-5 pl-2 group cursor-pointer" onClick={() => navigate('/profile')}>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-foreground tracking-tight group-hover:text-primary transition-colors">{fullName}</p>
                <div className="flex items-center justify-end gap-1.5 mt-0.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                   <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] italic">Verified Agent</span>
                </div>
              </div>
              <div className="relative">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}`} 
                  alt="User" 
                  className="w-14 h-14 rounded-2xl border-2 border-primary/20 shadow-xl group-hover:scale-105 transition-all duration-300"
                />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-lg border-4 border-background shadow-lg"></div>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Canvas */}
        <div className="flex-1 overflow-y-auto no-scrollbar bg-mesh">
           <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-10">
             {children}
           </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
