"use client";
import React from "react";

const Desktop = ({ children }) => {
  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Menu Bar (macOS) - To be implemented */}
      <div className="absolute top-0 left-0 w-full h-8 bg-black/50 backdrop-blur-md z-50 flex items-center px-4 text-white">
        {/* Apple Logo, App Title, Clock/Calendar */}
        <span className="font-bold"></span>
        <span className="ml-4 text-sm">Finder</span>
        <span className="ml-auto text-sm">Mon Jun 15 10:30 AM</span>
      </div>

      {/* Desktop Icons (macOS) - To be implemented */}
      <div className="absolute top-10 left-4 z-10">
        {/* Shortcut Icons */}
      </div>

      {children}

      {/* Dock (macOS) - To be implemented */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 mb-2 p-2 bg-white/20 dark:bg-black/20 backdrop-blur-md rounded-xl flex gap-2 z-50">
        {/* App Icons in Dock */}
      </div>
    </div>
  );
};

export default Desktop;
