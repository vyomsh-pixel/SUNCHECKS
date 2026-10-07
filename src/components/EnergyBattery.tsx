import React from 'react';
import { BatteryCharging, BatteryLow, BatteryMedium, Battery } from 'lucide-react';

interface EnergyBatteryProps {
  energy: number; // 1 - 10
  onChangeEnergy: (value: number) => void;
}

export const EnergyBattery: React.FC<EnergyBatteryProps> = ({
  energy,
  onChangeEnergy,
}) => {
  const getDescriptor = (val: number) => {
    if (val <= 2) return { text: 'Deep Rest Required', sub: 'Take things extra slow today', color: 'text-pond-600 dark:text-pond-400' };
    if (val <= 4) return { text: 'Low & Gentle Pace', sub: 'Stick to essential priorities', color: 'text-pond-600 dark:text-pond-300' };
    if (val <= 6) return { text: 'Steady & Grounded', sub: 'Sustainable focus window', color: 'text-sage-700 dark:text-sage-300' };
    if (val <= 8) return { text: 'Solid Momentum', sub: 'Great bandwidth for challenging tasks', color: 'text-sage-600 dark:text-sage-400' };
    return { text: 'Peak Energy & Flow', sub: 'High vitality, channel it wisely', color: 'text-ochre-700 dark:text-ochre-300' };
  };

  const desc = getDescriptor(energy);

  const getBatteryIcon = () => {
    if (energy <= 3) return <BatteryLow className="w-5 h-5 text-pond-500" />;
    if (energy <= 7) return <BatteryMedium className="w-5 h-5 text-sage-600" />;
    if (energy <= 9) return <Battery className="w-5 h-5 text-sage-600" />;
    return <BatteryCharging className="w-5 h-5 text-ochre-600" />;
  };

  return (
    <div className="bg-paper-card dark:bg-paper-darkCard rounded-2xl p-5 border border-paper-200 dark:border-paper-darkBorder shadow-xs transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {getBatteryIcon()}
          <div>
            <h2 className="font-sans font-semibold text-base text-slate-800 dark:text-slate-100">
              Energy Battery
            </h2>
            <p className="font-sans text-xs text-slate-500 dark:text-slate-400">
              Honest gauge of your internal battery
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="font-sans font-bold text-lg text-sage-700 dark:text-sage-300">
            {energy}
          </span>
          <span className="text-xs text-slate-400">/10</span>
        </div>
      </div>

      {/* Segmented Meter */}
      <div className="flex space-x-1.5 my-3 h-3">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((val) => {
          const isFilled = val <= energy;
          let fillClass = 'bg-paper-200 dark:bg-paper-darkBorder';
          if (isFilled) {
            if (val <= 3) fillClass = 'bg-pond-400 dark:bg-pond-500';
            else if (val <= 7) fillClass = 'bg-sage-500 dark:bg-sage-400';
            else fillClass = 'bg-ochre-500 dark:bg-ochre-400';
          }

          return (
            <button
              key={val}
              type="button"
              onClick={() => onChangeEnergy(val)}
              className={`flex-1 rounded-sm transition-all duration-150 ${fillClass} hover:opacity-80`}
              title={`Energy ${val}/10`}
            />
          );
        })}
      </div>

      {/* Slider Control */}
      <input
        type="range"
        min="1"
        max="10"
        value={energy}
        onChange={(e) => onChangeEnergy(Number(e.target.value))}
        className="w-full accent-sage-600 dark:accent-sage-400 cursor-pointer h-1.5 bg-paper-200 dark:bg-paper-darkBorder rounded-lg my-1"
      />

      {/* State Caption */}
      <div className="flex justify-between items-center mt-2 text-xs">
        <span className={`font-medium ${desc.color}`}>{desc.text}</span>
        <span className="text-slate-400 dark:text-slate-500">{desc.sub}</span>
      </div>
    </div>
  );
};
