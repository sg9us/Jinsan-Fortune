import { useLocation } from "wouter";
import { 
  Home, 
  Compass, 
  CalendarDays,
  Scroll
} from "lucide-react";

export function BottomNav() {
  const [location, navigate] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  const navItems = [
    { path: "/", label: "홈", icon: Home },
    { path: "/fengshui", label: "풍수", icon: Compass },
    { path: "/saju", label: "사주", icon: Scroll },
    { path: "/booking", label: "예약", icon: CalendarDays },
  ];

  return (
    <nav className="bg-white border-t border-neutral-200 fixed bottom-0 left-0 right-0 h-16 flex items-center justify-around z-10 max-w-md mx-auto">
      {navItems.map((item) => (
        <button
          key={item.path}
          onClick={() => navigate(item.path)}
          className={`flex flex-col items-center w-1/4 ${
            isActive(item.path) ? "text-primary" : "text-neutral-400"
          }`}
        >
          <item.icon className="text-lg" size={20} />
          <span className="text-xs mt-1">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
