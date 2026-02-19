import React, { useRef, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, Plus, Library } from "lucide-react";

const TAB_PAGES = ["Dashboard", "Create", "Library"];

const tabs = [
  { title: "Dashboard", page: "Dashboard", icon: Home },
  { title: "Create",    page: "Create",    icon: Plus },
  { title: "Library",   page: "Library",   icon: Library },
];

export default function BottomTabs({ onNavClick }) {
  const location = useLocation();
  const navigate = useNavigate();
  const scrollPositions = useRef({});
  const prevPathRef = useRef(location.pathname);

  // Save scroll position when leaving a tab
  const saveScrollPosition = useCallback(() => {
    const scrollContainer = document.querySelector("[data-scroll-container]");
    if (scrollContainer && prevPathRef.current) {
      scrollPositions.current[prevPathRef.current] = scrollContainer.scrollTop;
    }
  }, []);

  // Restore scroll position when arriving at a tab
  const restoreScrollPosition = useCallback((path) => {
    const saved = scrollPositions.current[path];
    if (saved != null) {
      requestAnimationFrame(() => {
        const scrollContainer = document.querySelector("[data-scroll-container]");
        if (scrollContainer) {
          scrollContainer.scrollTop = saved;
        }
      });
    }
  }, []);

  useEffect(() => {
    if (prevPathRef.current !== location.pathname) {
      saveScrollPosition();
      prevPathRef.current = location.pathname;
      restoreScrollPosition(location.pathname);
    }
  }, [location.pathname, saveScrollPosition, restoreScrollPosition]);

  const handleTabClick = (e, tab) => {
    const tabUrl = createPageUrl(tab.page);
    const isActive = location.pathname === tabUrl;

    if (onNavClick) {
      onNavClick(e, tabUrl);
      if (e.defaultPrevented) return;
    }

    if (isActive) {
      // Already on this tab — reset scroll to top and clear saved position
      e.preventDefault();
      scrollPositions.current[tabUrl] = 0;
      const scrollContainer = document.querySelector("[data-scroll-container]");
      if (scrollContainer) {
        scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-gray-100 shadow-[0_-2px_12px_rgba(0,0,0,0.06)] select-none"
      style={{ paddingBottom: "env(safe-area-inset-bottom)", overscrollBehavior: "none" }}
    >
      <div className="flex items-center h-16">
        {tabs.map((tab) => {
          const tabUrl = createPageUrl(tab.page);
          const isActive = location.pathname === tabUrl;
          return (
            <Link
              key={tab.title}
              to={tabUrl}
              onClick={(e) => handleTabClick(e, tab)}
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