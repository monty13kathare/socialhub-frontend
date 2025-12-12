import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "../components/Topbar";

export default function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen and auto-close sidebars
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false);
        setIsRightSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
        setIsRightSidebarOpen(true);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const closeAllSidebars = () => {
    if (isMobile) {
      setIsSidebarOpen(false);
      setIsRightSidebarOpen(false);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="flex flex-col  min-h-screen bg-slate-900">
      <Topbar />

      {/* Main Content Area */}
      <div className="flex flex-1">
        {isMobile && isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
            onClick={closeAllSidebars}
          />
        )}

        <div
          className={`
          fixed lg:sticky top-20 left-0 h-[calc(100vh-5rem)] z-40
          transform transition-all duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:w-80
        `}
        >
          <Sidebar onClose={closeAllSidebars} />
        </div>

        {/* Main Content - Mobile Responsive */}
        <main
          className={`
    flex-1 min-h-screen transition-all duration-300
    w-full overflow-x-hidden
    ${isSidebarOpen ? "lg:ml-0" : "lg:ml-0"}
    ${isRightSidebarOpen ? "lg:mr-0" : "lg:mr-0"}
  `}
          onClick={closeAllSidebars}
        >
          <div className="w-full max-w-full mx-auto p-3 sm:p-4 md:p-5 lg:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
