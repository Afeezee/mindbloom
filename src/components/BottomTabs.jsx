import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, Plus, Library } from "lucide-react";

const tabs = [
  { title: "Dashboard", url: createPageUrl("Dashboard"), icon: Home },
  { title: "Create",    url: createPageUrl("Create"),    icon: Plus },
  { title: "Library",   url: createPageUrl("Library"),   icon: Library },
];

export default function BottomTabs({ onNavClick }) {
  const location = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-gray-100 shadow-[0_-2px_12px_rgba(0,0,0,0.06)] select-none"
      style={{ paddingBottom: "env(safe-area-inset-bottom)", overscrollBehavior: "none" }}
    >
      <div className="flex items-center h-16">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.url;
          return (
            <Link
              key={tab.title}
              to={tab.url}
              onClick={onNavClick ? (e) => onNavClick(e, tab.url) : undefined}
              className={`relative flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors duration-200 ${
                isActive ? "text-purple-600" : "text-gray-400"
              }`}
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-purple-600 rounded-b-full" />
              )}
              <tab.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{tab.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}