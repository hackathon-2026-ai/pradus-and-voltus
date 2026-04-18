import { type FC, useEffect, useRef } from 'react';

interface SettingsPopupProps {
  open: boolean;
  theme: 'dark' | 'light';
  onThemeToggle: () => void;
  onClose: () => void;
}

const SettingsPopup: FC<SettingsPopupProps> = ({ open, theme, onThemeToggle, onClose }) => {
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(e.target as Node) &&
        !(e.target as HTMLElement).closest('#nav-settings')
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, onClose]);

  return (
    <div ref={popupRef} className={`settings-popup${open ? ' settings-popup-open' : ''}`}>
      <div className="settings-popup-header">Ustawienia</div>
      <div className="settings-popup-row">
        <span className="settings-popup-label">Motyw</span>
        <button
          className={`theme-toggle${theme === 'light' ? ' theme-toggle-light' : ''}`}
          onClick={onThemeToggle}
          aria-label={`Przełącz na tryb ${theme === 'dark' ? 'jasny' : 'ciemny'}`}
        >
          <span className="theme-toggle-track">
            {/* Moon icon */}
            <span className="theme-toggle-icon theme-toggle-moon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            </span>
            {/* Sun icon */}
            <span className="theme-toggle-icon theme-toggle-sun">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            </span>
            <span className="theme-toggle-thumb"></span>
          </span>
        </button>
      </div>
    </div>
  );
};

export default SettingsPopup;
