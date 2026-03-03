import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { brokerPortalService } from "@/services/brokerPortalService";
import { ChevronDown, LogOut, Menu, Moon, Settings, Sun, User } from "lucide-react";
import { useTheme } from "next-themes";
import { useLocation, useNavigate } from "react-router-dom";

const routeTitles: Record<string, string> = {
    "/broker-portal": "Dashboard",
    "/broker-portal/my-leads": "My Leads",
    "/broker-portal/submit-lead": "Submit Lead",
    "/broker-portal/me": "Profile",
};

const getTimeBasedGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good Morning";
    if (hour >= 12 && hour < 17) return "Good Afternoon";
    if (hour >= 17 && hour < 21) return "Good Evening";
    return "Good Night";
};

interface BrokerHeaderProps {
    onMenuClick: () => void;
}

export const BrokerHeader = ({ onMenuClick }: BrokerHeaderProps) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { resolvedTheme, setTheme } = useTheme();
    const isMobile = useIsMobile();
    const profile = brokerPortalService.getProfileFromStorage();

    const rawUsername = profile?.first_name || 'Broker';
    const username = rawUsername.charAt(0).toUpperCase() + rawUsername.slice(1).toLowerCase();

    const getPageTitle = (): string => {
        const exactMatch = routeTitles[location.pathname];
        if (exactMatch) return exactMatch;
        return "Broker Portal";
    };

    const pageTitle = getPageTitle();

    const handleLogout = async () => {
        await brokerPortalService.logout();
        navigate("/broker-portal/login");
    };

    const handleThemeToggle = () => {
        const newTheme = resolvedTheme === "dark" ? "light" : "dark";
        setTheme(newTheme);
    };

    return (
        <header className="h-14 border-b border-border bg-background px-4 md:px-5 flex items-center justify-between">
            {/* Left */}
            <div className="flex items-center gap-3">
                {isMobile && (
                    <button
                        onClick={onMenuClick}
                        className="p-1.5 rounded-lg hover:bg-accent"
                    >
                        <Menu className="w-4 h-4 text-muted-foreground" />
                    </button>
                )}
                <div>
                    <h1 className="text-sm font-semibold text-foreground">{pageTitle}</h1>
                    <p className="text-xs text-muted-foreground hidden sm:block">
                        {username}, {getTimeBasedGreeting()}
                    </p>
                </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-1.5">
                {/* Settings */}
                <button className="p-2 rounded-lg hover:bg-accent transition-colors">
                    <Settings className="w-4 h-4 text-muted-foreground" />
                </button>

                {/* Theme Toggle */}
                <button
                    onClick={handleThemeToggle}
                    className="relative flex items-center justify-center p-2 rounded-lg hover:bg-accent transition-colors"
                >
                    <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-muted-foreground" />
                    <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-muted-foreground" />
                </button>

                {/* Profile */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-accent transition-colors">
                            <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                                <span className="text-[11px] font-medium text-foreground">
                                    {username.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <span className="hidden md:inline text-xs text-foreground">{username}</span>
                            <ChevronDown className="w-3 h-3 text-muted-foreground" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52">
                        <DropdownMenuLabel>
                            <div className="flex flex-col gap-0.5">
                                <p className="text-sm font-medium">{profile?.first_name} {profile?.last_name}</p>
                                <p className="text-xs text-muted-foreground">{profile?.email}</p>
                                <p className="text-[10px] text-green-500 font-medium tracking-wide mt-1 uppercase">{profile?.approval_status}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer text-sm" onClick={() => navigate("/broker-portal/me")}>
                            <User className="mr-2 h-3.5 w-3.5" />
                            Profile
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="cursor-pointer text-red-600 focus:text-red-600 text-sm"
                            onClick={handleLogout}
                        >
                            <LogOut className="mr-2 h-3.5 w-3.5" />
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
};
