
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/entities/User";
import { BookOpen, Home, Plus, Library, Sparkles, LogOut, Settings } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import UserSettingsModal from "./components/settings/UserSettingsModal";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: Home,
    color: "text-emerald-600"
  },
  {
    title: "Create Story",
    url: createPageUrl("Create"),
    icon: Plus,
    color: "text-purple-600"
  },
  {
    title: "My Library",
    url: createPageUrl("Library"),
    icon: Library,
    color: "text-blue-600"
  }
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
      } catch (error) {
        // Not logged in
      }
    };
    fetchUser();
  }, []);

  if (currentPageName === "Landing") {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    try {
      await User.logout();
      navigate(createPageUrl("Landing"));
    } catch (error) {
      console.error("Failed to log out:", error);
      // Optionally, display an error message to the user
    }
  };
  
  const getInitials = (name) => {
    if (!name) return "?";
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <SidebarProvider>
      <style>
        {`
          :root {
            --mindbloom-primary: 168 85% 67%;
            --mindbloom-secondary: 217 91% 60%;
            --mindbloom-accent: 280 100% 70%;
            --mindbloom-warm: 25 95% 53%;
            --mindbloom-success: 142 71% 45%;
            --mindbloom-background: 210 40% 98%;
            --mindbloom-surface: 0 0% 100%;
          }
          
          .mindbloom-gradient {
            background: linear-gradient(135deg, 
              hsl(var(--mindbloom-primary)) 0%, 
              hsl(var(--mindbloom-secondary)) 50%, 
              hsl(var(--mindbloom-accent)) 100%);
          }
          
          .mindbloom-warm-gradient {
            background: linear-gradient(135deg, 
              hsl(var(--mindbloom-warm)) 0%, 
              hsl(var(--mindbloom-primary)) 100%);
          }
          
          .animate-float {
            animation: float 6s ease-in-out infinite;
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          
          .animate-bounce-slow {
            animation: bounce 3s infinite;
          }
        `}
      </style>
      <div className="min-h-screen flex w-full" style={{ backgroundColor: 'hsl(var(--mindbloom-background))' }}>
        <Sidebar className="border-r border-gray-100 shadow-sm flex flex-col">
          <SidebarHeader className="border-b border-gray-100 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 mindbloom-gradient rounded-2xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-xl text-gray-900 tracking-tight">MindBloom</h2>
                <p className="text-xs text-gray-500 font-medium">AI Story Creator</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-4 flex-1 flex flex-col justify-between">
            <div>
              <SidebarGroup>
                <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-3">
                  Create & Explore
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-2">
                    {navigationItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          asChild 
                          className={`rounded-xl p-4 transition-all duration-300 group hover:shadow-md ${
                            location.pathname === item.url 
                              ? 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 shadow-sm' 
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <Link to={item.url} className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg ${item.color} bg-opacity-10`}>
                              <item.icon className={`w-5 h-5 ${item.color}`} />
                            </div>
                            <span className="font-medium text-gray-700 group-hover:text-gray-900">
                              {item.title}
                            </span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              <SidebarGroup className="mt-8">
                <SidebarGroupContent>
                  <div className="px-4 py-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-100">
                    <div className="flex items-center gap-3 mb-3">
                      <Sparkles className="w-5 h-5 text-purple-600 animate-bounce-slow" />
                      <span className="font-semibold text-gray-800">Magic Tips</span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Be specific with your story ideas! The more details you provide, the better our AI can create your perfect children's book.
                    </p>
                  </div>
                </SidebarGroupContent>
              </SidebarGroup>
            </div>

            {user && (
              <SidebarGroup className="mt-8">
                <SidebarGroupContent>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 transition-colors text-left">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={user.avatar_url} />
                          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold">
                            {getInitials(user.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 overflow-hidden">
                          <p className="font-semibold text-gray-800 truncate">{user.full_name}</p>
                          <p className="text-sm text-gray-500 truncate">{user.email}</p>
                        </div>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 mb-2" side="top" align="start">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <Dialog>
                        <DialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                          </DropdownMenuItem>
                        </DialogTrigger>
                        <UserSettingsModal />
                      </Dialog>
                      <DropdownMenuItem onSelect={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 flex flex-col bg-white">
          <header className="bg-white border-b border-gray-100 px-6 py-4 md:hidden shadow-sm">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-gray-100 p-2 rounded-lg transition-colors duration-200" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 mindbloom-gradient rounded-xl flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-lg font-bold text-gray-900">MindBloom</h1>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
