"use client";
import React from "react";

const Mobile = ({ children }) => {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-gradient-to-br from-blue-700 via-purple-700 to-pink-700">
      {/* iOS Status Bar - To be implemented */}
      <div className="absolute top-0 left-0 w-full h-10 bg-black/30 backdrop-blur-md z-50 flex items-center justify-between px-4 text-white text-sm">
        <span>9:41 AM</span>
        <div className="flex items-center gap-1">
          {/* Wi-Fi Icon, Battery Icon */}
           <span>📶</span> 
          <span>🔋</span> 
        </div>
      </div>

      {children}

      {/* iOS Dock - To be implemented */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 mb-2 p-2 bg-white/20 dark:bg-black/20 backdrop-blur-md rounded-xl flex gap-2 z-50">
        {/* App Icons in Dock */}
      </div>
    </div>
  );
};

export default Mobile;
