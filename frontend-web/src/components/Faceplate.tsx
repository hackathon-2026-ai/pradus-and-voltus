import { useEffect, type FC } from 'react';
import { generateCountyEnergy, type EnergyData, type CountyFeature } from '../data/energyUtils';
import { FACILITY_TYPE_CONFIG, type EnergyFacility } from '../data/energyFacilities';
import {
  getCurrentWeather,
  computeFacilityMetrics,
  getWeatherIconSVG,
  type FacilityMetrics,
  type WeatherData,
} from '../data/weatherService';
import { ENERGY_FACILITIES } from '../data/energyFacilities';
import type { ViewMode } from './MapView';

// ===== FACEPLATE MODE =====
type FaceplateMode = 'region' | 'facility';

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
  // Facility mode
  facility: EnergyFacility | null;
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
  facility,
}) => {
  const mode: FaceplateMode = facility ? 'facility' : 'region';

  // Animate bars after render (region mode)
  useEffect(() => {
    if (!visible || !data || mode !== 'region') return;
    const timer = setTimeout(() => {
      const stabEl = document.getElementById('bar-stability');
      const renewEl = document.getElementById('bar-renewable');
      const reserveEl = document.getElementById('bar-reserve');
      if (stabEl) stabEl.style.width = data.gridStability + '%';
      if (renewEl) renewEl.style.width = data.renewableShare + '%';
      if (reserveEl) reserveEl.style.width = Math.min(data.reserveMargin, 100) + '%';
    }, 150);
    return () => clearTimeout(timer);
  }, [visible, data, mode]);

  // Reset bars when data changes
  useEffect(() => {
    if (mode !== 'region') return;
    const stabEl = document.getElementById('bar-stability');
    const renewEl = document.getElementById('bar-renewable');
    const reserveEl = document.getElementById('bar-reserve');
    if (stabEl) stabEl.style.width = '0%';
    if (renewEl) renewEl.style.width = '0%';
    if (reserveEl) reserveEl.style.width = '0%';
  }, [data, mode]);

  if (!visible) return null;
  if (mode === 'region' && !data) return null;

  // ===== FACILITY MODE =====
  if (mode === 'facility' && facility) {
    const weather = getCurrentWeather();
    const metrics = computeFacilityMetrics(facility, weather, ENERGY_FACILITIES);
    const config = FACILITY_TYPE_CONFIG[facility.type];
    const isHouse = facility.type === 'house';

    return (
      <div id="faceplate" className="faceplate">
        <button id="faceplate-close" className="faceplate-close" aria-label="Close" onClick={onClose}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        <div className="faceplate-header">
          <button className="btn-back" title="Back" onClick={onBack}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            <span>Back</span>
          </button>
          <h2 id="region-name">{facility.name}</h2>
          <div className={`facility-type-badge ${facility.type}`}>
            {config.label}
          </div>
          <div className="live-indicator">
            <span className="live-dot"></span>
            <span className="live-text">LIVE</span>
          </div>
        </div>

        {/* Description */}
        <p className="facility-description">{facility.description}</p>
        {facility.operator && (
          <p className="facility-operator">Operated by <strong>{facility.operator}</strong>{facility.yearBuilt ? ` · Since ${facility.yearBuilt}` : ''}</p>
        )}

        {/* Hero stats */}
        <div className="faceplate-stats">
          {isHouse ? (
            <>
              <StatCard icon="usage" label="Consumption" value={`${metrics.consumptionMW} MW`} />
              <StatCard icon="load" label="Monthly Bill" value={`${metrics.monthlyBillPLN} PLN`} />
              <StatCard icon="available" label="Efficiency" value={`${metrics.efficiency}%`} />
              <StatCard icon="capacity" label="Weather Impact" value={`${metrics.weatherImpact > 0 ? '+' : ''}${metrics.weatherImpact}%`} />
            </>
          ) : (
            <>
              <StatCard icon="usage" label="Current Output" value={`${metrics.currentOutputMW} MW`} />
              <StatCard icon="capacity" label="Capacity" value={`${facility.capacityMW} MW`} />
              <StatCard icon="available" label="Efficiency" value={`${metrics.efficiency}%`} />
              <StatCard icon="load" label="Daily Output" value={`${metrics.dailyOutputMWh} MWh`} />
            </>
          )}
        </div>

        {/* Weather Impact Section */}
        <WeatherSection weather={weather} metrics={metrics} />

        {/* Metrics grid */}
        <div className="facility-metrics">
          {isHouse ? (
            <>
              <MetricCard label="Energy Rating" value={metrics.efficiencyRating || 'N/A'} />
              <MetricCard label="CO₂ Footprint" value={`${(metrics.co2Factor * (metrics.consumptionMW || 0) * 24).toFixed(1)} t/day`} />
              <MetricCard label="Base Efficiency" value={`${facility.baseEfficiency}%`} />
              <MetricCard label="Grid Supply" value="Connected" />
            </>
          ) : (
            <>
              <MetricCard label="Grid Share" value={`${metrics.gridContribution}%`} />
              <MetricCard label={metrics.co2Factor > 0 ? 'CO₂ Emitted' : 'CO₂ Avoided'} value={`${(metrics.co2Factor > 0 ? metrics.co2Factor * metrics.currentOutputMW * 24 : (0.45 - metrics.co2Factor) * metrics.currentOutputMW * 24).toFixed(0)} t/day`} />
              <MetricCard label="Cost/MWh" value={`${metrics.operatingCostPerMWh} PLN`} />
              <MetricCard label="Year Built" value={facility.yearBuilt ? `${facility.yearBuilt}` : 'N/A'} />
            </>
          )}
        </div>

        {/* Energy efficiency rating for houses */}
        {isHouse && metrics.efficiencyRating && (
          <div className="efficiency-rating">
            <div className={`rating-badge ${metrics.efficiencyRating}`}>
              {metrics.efficiencyRating}
            </div>
            <div className="rating-info">
              <span className="rating-title">Energy Efficiency Rating</span>
              <span className="rating-subtitle">Based on insulation, heating system & weather response</span>
            </div>
          </div>
        )}

        {/* Nearby suppliers for houses */}
        {isHouse && metrics.nearbySuppliers && metrics.nearbySuppliers.length > 0 && (
          <div className="suppliers-section">
            <h4>Nearby Energy Suppliers</h4>
            <div className="cities-list">
              {metrics.nearbySuppliers.map((name) => (
                <div key={name} className="city-item">
                  <span className="city-dot" style={{ background: '#6366f1', boxShadow: '0 0 8px rgba(99,102,241,0.4)' }}></span>
                  <span className="city-name">{name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ===== REGION MODE (existing behavior) =====
  if (!data) return null;

  const load = Math.round((data.usageMW / data.capacityMW) * 100);
  const countyItems = showCountyList && counties.length > 0
    ? counties
        .map(f => ({ name: f.properties.nazwa, data: generateCountyEnergy(f.properties.nazwa) }))
        .sort((a, b) => b.data.usageMW - a.data.usageMW)
    : null;

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

// ===== SUB-COMPONENTS =====

const StatCard: FC<{ icon: string; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="stat-card">
    <div className={`stat-icon ${icon}`}>
      {icon === 'usage' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>}
      {icon === 'capacity' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="6" width="18" height="12" rx="2"/><line x1="23" y1="10" x2="23" y2="14"/></svg>}
      {icon === 'available' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>}
      {icon === 'load' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
    </div>
    <div className="stat-info">
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  </div>
);

const MetricCard: FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="metric-card">
    <div className="metric-card-value">{value}</div>
    <div className="metric-card-label">{label}</div>
  </div>
);

const WeatherSection: FC<{ weather: WeatherData; metrics: FacilityMetrics }> = ({ weather, metrics }) => {
  const impactClass = metrics.weatherImpact > 5 ? 'positive' : metrics.weatherImpact < -5 ? 'negative' : 'neutral';
  const impactText = metrics.weatherImpact > 0 ? `+${metrics.weatherImpact}%` : `${metrics.weatherImpact}%`;

  return (
    <div className="weather-section">
      <div className="weather-header">
        <div className="weather-icon-wrapper">
          <svg width="24" height="24" viewBox="0 0 24 24" dangerouslySetInnerHTML={{ __html: getWeatherIconSVG(weather.condition) }} />
        </div>
        <div>
          <div className="weather-condition">
            {weather.conditionLabel}
            <span className={`impact-indicator ${impactClass}`}>
              {impactText}
            </span>
          </div>
          <div className="weather-temp">{weather.temperature}°C</div>
        </div>
      </div>

      <div className="weather-explanation">{metrics.weatherExplanation}</div>

      <div className="weather-gauges">
        <div className="weather-gauge">
          <span className="weather-gauge-label">Wind</span>
          <div className="weather-gauge-bar">
            <div className="weather-gauge-fill wind" style={{ width: `${Math.min(weather.windSpeed / 25 * 100, 100)}%` }}></div>
          </div>
          <span className="weather-gauge-value">{weather.windSpeed} m/s</span>
        </div>
        <div className="weather-gauge">
          <span className="weather-gauge-label">Sunshine</span>
          <div className="weather-gauge-bar">
            <div className="weather-gauge-fill sun" style={{ width: `${weather.sunshineIndex * 100}%` }}></div>
          </div>
          <span className="weather-gauge-value">{Math.round(weather.sunshineIndex * 100)}%</span>
        </div>
        <div className="weather-gauge">
          <span className="weather-gauge-label">Rain</span>
          <div className="weather-gauge-bar">
            <div className="weather-gauge-fill rain" style={{ width: `${weather.rainProbability * 100}%` }}></div>
          </div>
          <span className="weather-gauge-value">{Math.round(weather.rainProbability * 100)}%</span>
        </div>
        <div className="weather-gauge">
          <span className="weather-gauge-label">Temp</span>
          <div className="weather-gauge-bar">
            <div className="weather-gauge-fill temp" style={{ width: `${Math.min(Math.max((weather.temperature + 10) / 45 * 100, 5), 100)}%` }}></div>
          </div>
          <span className="weather-gauge-value">{weather.temperature}°C</span>
        </div>
      </div>
    </div>
  );
};

export default Faceplate;
