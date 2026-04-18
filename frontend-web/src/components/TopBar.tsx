import { type FC, type ChangeEvent } from 'react';
import { useTranslation } from '../i18n/LanguageContext';

interface TopBarProps {
  onSearch: (query: string) => void;
  onTileToggle: () => void;
}

const TopBar: FC<TopBarProps> = ({ onSearch, onTileToggle }) => {
  const { t } = useTranslation();

  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value);
  };

  return (
    <header className="top-bar">
      <div className="top-bar-left">
        <h1 id="page-title">{t('topbar.title')}</h1>
        <span className="breadcrumb">{t('topbar.breadcrumb')}</span>
      </div>
      <div className="top-bar-right">
        <div className="search-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" id="search-input" placeholder={t('topbar.search')} autoComplete="off" onChange={handleInput} />
        </div>
        <button className="tile-toggle" id="tile-toggle" title={t('topbar.tileToggle')} onClick={onTileToggle}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
        </button>
      </div>
    </header>
  );
};

export default TopBar;
