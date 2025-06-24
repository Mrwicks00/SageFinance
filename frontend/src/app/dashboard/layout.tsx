// src/app/dashboard/layout.tsx
"use client"; // This layout is interactive

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { useState } from "react"; // For mobile sidebar toggle

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false); // State for mobile sidebar

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header - Stays at the top for all dashboard pages */}
      <DashboardHeader />

      {/* Main content area: Sidebar + Page content */}
      <div className="flex">
        {/* Sidebar - Visible on large screens, fixed and accounted for */}
        <DashboardSidebar className="hidden lg:block fixed left-0 top-16 h-[calc(100vh-4rem)] z-30" />
        
        {/* Mobile Sidebar Overlay (when open) */}
        {isMobileSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileSidebarOpen(false)} // Close on overlay click
          ></div>
        )}
        <DashboardSidebar 
          className={`fixed inset-y-0 left-0 bg-gray-900/90 backdrop-blur-sm z-50 transform transition-transform duration-300 ease-in-out lg:hidden 
            ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        />

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8"> {/* Adjusted padding-top */}
          <div className="max-w-7xl mx-auto">
            {children} {/* This is where your specific page content (e.g., DashboardPage, YieldPage) will render */}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Toggle Button */}
      <div className="lg:hidden fixed bottom-4 right-4 z-50">
        <button 
          onClick={() => setIsMobileSidebarOpen(true)} // Open sidebar
          className="bg-yellow-400 text-black p-3 rounded-full shadow-lg hover:bg-yellow-500 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}