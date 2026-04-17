import { type MouseEvent, type FC, useCallback } from 'react';

interface SidebarProps {
  zoomLevel: number;
  activeSection: string;
  onNavClick: (section: string) => void;
  onFlyToPoland: () => void;
}

const Sidebar: FC<SidebarProps> = ({ zoomLevel, activeSection, onNavClick, onFlyToPoland }) => {

  const handleNavClick = useCallback((e: MouseEvent<HTMLAnchorElement>, section: string) => {
    e.preventDefault();
    onNavClick(section);

    // Ripple effect
    const item = e.currentTarget;
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    const rect = item.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
    item.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  }, [onNavClick]);

  const handleMouseMove = useCallback((e: MouseEvent<HTMLAnchorElement>) => {
    const item = e.currentTarget;
    const rect = item.getBoundingClientRect();
    item.style.transform = `translate(${(e.clientX - rect.left - rect.width / 2) * 0.05}px, ${(e.clientY - rect.top - rect.height / 2) * 0.05}px)`;
  }, []);

  const handleMouseLeave = useCallback((e: MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.transform = '';
  }, []);

  const navItems = [
    { section: 'map', label: 'Map View', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
    )},
    { section: 'demographics', label: 'Demographics', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    )},
    { section: 'economy', label: 'Economy', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
    )},
    { section: 'analytics', label: 'Analytics', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
    )},
    { section: 'compare', label: 'Compare', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
    )},
  ];

  return (
    <nav id="sidebar" className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="url(#logoGrad)"/>
            <path d="M8 16L14 10L20 16L14 22L8 16Z" fill="white" opacity="0.9"/>
            <path d="M14 16L20 10L26 16L20 22L14 16Z" fill="white" opacity="0.6"/>
            <defs><linearGradient id="logoGrad" x1="0" y1="0" x2="32" y2="32"><stop stopColor="#6366f1"/><stop offset="1" stopColor="#8b5cf6"/></linearGradient></defs>
          </svg>
          <span className="logo-text">PolMap</span>
        </div>
      </div>

      <div className="sidebar-nav">
        {navItems.map(({ section, label, icon }) => (
          <a
            key={section}
            href="#"
            className={`nav-item${activeSection === section ? ' active' : ''}`}
            data-section={section}
            id={`nav-${section}`}
            onClick={(e) => handleNavClick(e, section)}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <div className="nav-icon">{icon}</div>
            <span className="nav-label">{label}</span>
            <div className="nav-indicator"></div>
          </a>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="zoom-info">
          <span className="zoom-label">Zoom</span>
          <span className="zoom-value" id="zoom-level">{zoomLevel}</span>
        </div>
        <a
          href="#"
          className="nav-item"
          id="btn-fly-poland"
          onClick={(e) => { e.preventDefault(); onFlyToPoland(); }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <div className="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
          </div>
          <span className="nav-label">Fly to Poland</span>
          <div className="nav-indicator"></div>
        </a>
        <a
          href="#"
          className="nav-item"
          data-section="settings"
          id="nav-settings"
          onClick={(e) => handleNavClick(e, 'settings')}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <div className="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </div>
          <span className="nav-label">Settings</span>
          <div className="nav-indicator"></div>
        </a>
      </div>
    </nav>
  );
};

export default Sidebar;
