'use client';

import { useState, useEffect } from 'react';

export default function ContextMenu() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [subMenuAnchor, setSubMenuAnchor] = useState(null);

  const handleContextMenu = (e) => {
    e.preventDefault();
    setAnchorEl({ left: e.pageX, top: e.pageY });
    setSubMenuAnchor(null);
  };

  const handleClickOutside = (e) => {
    // Check if click is outside the menu and submenu
    if (anchorEl && !e.target.closest('.context-menu') && !e.target.closest('.sub-menu')) {
      setAnchorEl(null);
      setSubMenuAnchor(null);
    }
  };

  useEffect(() => {
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleRefresh = () => {
    window.location.reload();
    setAnchorEl(null);
    setSubMenuAnchor(null);
  };

  const handleOpenSubmenu = (e) => {
    e.stopPropagation();
    setSubMenuAnchor({ left: e.pageX, top: e.pageY });
  };

  const handleCloseSubmenu = () => {
    setSubMenuAnchor(null);
  };

  // Submenu items
  const submenuItems = [
    { label: 'Dashboard', action: () => { /* TODO: open dashboard */ } },
    { label: 'Gallery', action: () => { /* TODO: open gallery */ } },
    { label: 'Music', action: () => { /* TODO: open music */ } },
    { label: 'Settings', action: () => { /* TODO: open settings */ } }
  ];

  return (
    <>
      {/* Context Menu */}
      {anchorEl && (
        <div className="context-menu fixed z-50" style={{ left: anchorEl.left, top: anchorEl.top }}>
          <div 
            className="menu-item px-4 py-2 text-sm hover:bg-blue2/20 transition-colors cursor-default"
            onClick={handleRefresh}
          >
            Refresh
          </div>
          <div 
            className="menu-item has-submenu relative px-4 py-2 text-sm hover:bg-blue2/20 transition-colors cursor-default"
            onMouseEnter={handleOpenSubmenu}
            onMouseLeave={handleCloseSubmenu}
          >
            Menu
            {/* Submenu */}
            {subMenuAnchor && (
              <div className="sub-menu absolute left-[100%] top-0 mt-[-2px]">
                {submenuItems.map((item, index) => (
                  <div 
                    key={index} 
                    className="submenu-item w-48 px-4 py-2 text-sm hover:bg-blue2/20 transition-colors cursor-default"
                    onClick={(e) => {
                      e.stopPropagation();
                      item.action();
                      setAnchorEl(null);
                      setSubMenuAnchor(null);
                    }}
                  >
                    {item.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}