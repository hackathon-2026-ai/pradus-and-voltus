import { useEffect, type FC } from 'react';
import { generateCountyEnergy, type EnergyData, type CountyFeature } from '../data/energyUtils';
import type { ViewMode } from './MapView';

interface FaceplateProps {
  visible: boolean;
  title: string;
  subtitle: string;
  data: EnergyData | null;
  counties: CountyFeature[];
  viewMode: ViewMode;
  showCountyList: boolean;
  onClose: () => void;
  onBack: () => void;
  onCountyClick: (countyName: string) => void;
  activeCounty: string | null;
}

const Faceplate: FC<FaceplateProps> = ({
  visible,
  title,
  subtitle,
  data,
  counties,
  viewMode,
  showCountyList,
  onClose,
  onBack,
  onCountyClick,
  activeCounty,
}) => {

  // Animate bars after render
  useEffect(() => {
    if (!visible || !data) return;
    const timer = setTimeout(() => {
      const stabEl = document.getElementById('bar-stability');
      const renewEl = document.getElementById('bar-renewable');
      const reserveEl = document.getElementById('bar-reserve');
      if (stabEl) stabEl.style.width = data.gridStability + '%';
      if (renewEl) renewEl.style.width = data.renewableShare + '%';
      if (reserveEl) reserveEl.style.width = Math.min(data.reserveMargin, 100) + '%';
    }, 150);
    return () => clearTimeout(timer);
  }, [visible, data]);

  // Reset bars when data changes (to trigger animation)
  useEffect(() => {
    const stabEl = document.getElementById('bar-stability');
    const renewEl = document.getElementById('bar-renewable');
    const reserveEl = document.getElementById('bar-reserve');
    if (stabEl) stabEl.style.width = '0%';
    if (renewEl) renewEl.style.width = '0%';
    if (reserveEl) reserveEl.style.width = '0%';
  }, [data]);

  if (!data) return null;

  const load = Math.round((data.usageMW / data.capacityMW) * 100);

  // Build county list items
  const countyItems = showCountyList && counties.length > 0
    ? counties
        .map(f => ({ name: f.properties.nazwa, data: generateCountyEnergy(f.properties.nazwa) }))
        .sort((a, b) => b.data.usageMW - a.data.usageMW)
    : null;

  // Build detail rows for single county view
  const detailRows = !showCountyList ? [
    { label: 'Current Usage', value: `${data.usageMW} MW`, color: '#f59e0b' },
    { label: 'Total Capacity', value: `${data.capacityMW} MW`, color: '#6366f1' },
    { label: 'Available', value: `${data.availableMW} MW`, color: '#10b981' },
    { label: 'Grid Stability', value: `${data.gridStability}%`, color: '#22d3ee' },
    { label: 'Renewable Share', value: `${data.renewableShare}%`, color: '#22c55e' },
    { label: 'Reserve Margin', value: `${data.reserveMargin}%`, color: '#f43f5e' },
  ] : null;

  return (
    <div id="faceplate" className={`faceplate${visible ? '' : ' hidden'}`}>
      <button id="faceplate-close" className="faceplate-close" aria-label="Close" onClick={onClose}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>

      <div className="faceplate-header">
        <button
          id="btn-back-provinces"
          className={`btn-back${viewMode === 'provinces' ? ' hidden' : ''}`}
          title="Back to provinces"
          onClick={onBack}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          <span>Back</span>
        </button>
        <h2 id="region-name">{title}</h2>
        <p id="region-capital" className="region-subtitle">{subtitle}</p>
        <div className="live-indicator">
          <span className="live-dot"></span>
          <span className="live-text">LIVE</span>
        </div>
      </div>

      <div className="faceplate-stats">
        <div className="stat-card">
          <div className="stat-icon usage">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          </div>
          <div className="stat-info">
            <span className="stat-value" id="stat-usage">{Math.round(data.usageMW)} MW</span>
            <span className="stat-label">Current Usage</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon capacity">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="6" width="18" height="12" rx="2"/><line x1="23" y1="10" x2="23" y2="14"/></svg>
          </div>
          <div className="stat-info">
            <span className="stat-value" id="stat-capacity">{Math.round(data.capacityMW)} MW</span>
            <span className="stat-label">Total Capacity</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon available">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          </div>
          <div className="stat-info">
            <span className="stat-value" id="stat-available">{Math.round(data.availableMW)} MW</span>
            <span className="stat-label">Available Energy</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon load">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div className="stat-info">
            <span className="stat-value" id="stat-load">{load}%</span>
            <span className="stat-label">Load Factor</span>
          </div>
        </div>
      </div>

      <div className="faceplate-details">
        <div className="detail-row">
          <span className="detail-label">Grid Stability</span>
          <div className="detail-bar-wrapper">
            <div className="detail-bar stability" id="bar-stability"></div>
          </div>
          <span className="detail-value" id="stat-stability">{data.gridStability}%</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Renewable Share</span>
          <div className="detail-bar-wrapper">
            <div className="detail-bar renewable" id="bar-renewable"></div>
          </div>
          <span className="detail-value" id="stat-renewable">{data.renewableShare}%</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Reserve Margin</span>
          <div className="detail-bar-wrapper">
            <div className="detail-bar reserve" id="bar-reserve"></div>
          </div>
          <span className="detail-value" id="stat-reserve">{data.reserveMargin}%</span>
        </div>
      </div>

      <div className="faceplate-cities">
        <h3 id="counties-header">
          {showCountyList && countyItems ? `Counties (${countyItems.length})` : 'County Details'}
        </h3>
        <div id="counties-list" className="cities-list">
          {countyItems && countyItems.map(({ name, data: cd }) => {
            const countyLoad = Math.round((cd.usageMW / cd.capacityMW) * 100);
            const display = name.replace('powiat ', '');
            const dotColor = countyLoad > 80 ? '#dc2626' : countyLoad > 65 ? '#f59e0b' : countyLoad > 50 ? '#3b82f6' : '#22c55e';
            return (
              <div
                key={name}
                className={`city-item clickable${activeCounty === name ? ' active-county' : ''}`}
                data-county={name}
                onClick={() => onCountyClick(name)}
              >
                <span className="city-dot" style={{ background: dotColor, boxShadow: `0 0 8px ${dotColor}44` }}></span>
                <span className="city-name">{display}</span>
                <span className="city-pop">{cd.usageMW}/{cd.capacityMW} MW</span>
              </div>
            );
          })}
          {detailRows && detailRows.map(r => (
            <div key={r.label} className="city-item">
              <span className="city-dot" style={{ background: r.color, boxShadow: `0 0 8px ${r.color}44` }}></span>
              <span className="city-name">{r.label}</span>
              <span className="city-pop">{r.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Faceplate;
