'use client';

import React, { useState, useMemo } from 'react';
import {
  Activity,
  Heart,
  Droplets,
  Flame,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RotateCcw,
  Scale,
} from 'lucide-react';

type UnitSystem = 'metric' | 'imperial';
type Gender = 'male' | 'female';

export default function BmiCalculatorTool() {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric');
  const [gender, setGender] = useState<Gender>('male');
  const [age, setAge] = useState<number>(28);

  // Metric values
  const [heightCm, setHeightCm] = useState<number>(175);
  const [weightKg, setWeightKg] = useState<number>(70);

  // Imperial values
  const [heightFeet, setHeightFeet] = useState<number>(5);
  const [heightInches, setHeightInches] = useState<number>(9);
  const [weightLbs, setWeightLbs] = useState<number>(154);

  const [copied, setCopied] = useState<boolean>(false);

  // Handle switching units with synchronization
  const handleUnitChange = (newUnit: UnitSystem) => {
    if (newUnit === unitSystem) return;
    if (newUnit === 'imperial') {
      // Metric to imperial
      const totalInches = heightCm / 2.54;
      setHeightFeet(Math.floor(totalInches / 12));
      setHeightInches(Math.round(totalInches % 12));
      setWeightLbs(Math.round(weightKg * 2.20462));
    } else {
      // Imperial to metric
      const totalInches = heightFeet * 12 + heightInches;
      setHeightCm(Math.round(totalInches * 2.54));
      setWeightKg(Math.round(weightLbs / 2.20462));
    }
    setUnitSystem(newUnit);
  };

  const results = useMemo(() => {
    let effectiveHeightM = 0;
    let effectiveWeightKg = 0;

    if (unitSystem === 'metric') {
      effectiveHeightM = heightCm / 100;
      effectiveWeightKg = weightKg;
    } else {
      const totalInches = heightFeet * 12 + heightInches;
      effectiveHeightM = (totalInches * 2.54) / 100;
      effectiveWeightKg = weightLbs / 2.20462;
    }

    if (effectiveHeightM <= 0 || effectiveWeightKg <= 0) {
      return null;
    }

    const bmi = effectiveWeightKg / (effectiveHeightM * effectiveHeightM);
    const roundedBmi = parseFloat(bmi.toFixed(1));

    // Category determination
    let category = 'Normal weight';
    let categoryColor = 'text-emerald-600 dark:text-emerald-400';
    let bgColor = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800';
    let badgeColor = 'bg-emerald-500 text-white';
    let riskLevel = 'Low risk of weight-related health conditions';

    if (bmi < 16.0) {
      category = 'Severe Thinness';
      categoryColor = 'text-blue-700 dark:text-blue-400';
      bgColor = 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800';
      badgeColor = 'bg-blue-600 text-white';
      riskLevel = 'Elevated risk of nutritional deficiency and osteoporosis';
    } else if (bmi < 17.0) {
      category = 'Moderate Thinness';
      categoryColor = 'text-sky-600 dark:text-sky-400';
      bgColor = 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800';
      badgeColor = 'bg-sky-500 text-white';
      riskLevel = 'Increased risk of weakened immunity';
    } else if (bmi < 18.5) {
      category = 'Mild Thinness (Underweight)';
      categoryColor = 'text-cyan-600 dark:text-cyan-400';
      bgColor = 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-800';
      badgeColor = 'bg-cyan-500 text-white';
      riskLevel = 'Slightly below optimal weight range';
    } else if (bmi < 25.0) {
      category = 'Normal weight';
      categoryColor = 'text-emerald-600 dark:text-emerald-400';
      bgColor = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800';
      badgeColor = 'bg-emerald-500 text-white';
      riskLevel = 'Optimal healthy weight for lowest general mortality risk';
    } else if (bmi < 30.0) {
      category = 'Overweight (Pre-obese)';
      categoryColor = 'text-amber-600 dark:text-amber-400';
      bgColor = 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800';
      badgeColor = 'bg-amber-500 text-white';
      riskLevel = 'Moderate risk of hypertension and cardiovascular strain';
    } else if (bmi < 35.0) {
      category = 'Obese Class I (Moderate)';
      categoryColor = 'text-orange-600 dark:text-orange-400';
      bgColor = 'bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800';
      badgeColor = 'bg-orange-500 text-white';
      riskLevel = 'High risk of type 2 diabetes and joint strain';
    } else if (bmi < 40.0) {
      category = 'Obese Class II (Severe)';
      categoryColor = 'text-rose-600 dark:text-rose-400';
      bgColor = 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800';
      badgeColor = 'bg-rose-500 text-white';
      riskLevel = 'Very high risk of cardiovascular disease';
    } else {
      category = 'Obese Class III (Very Severe)';
      categoryColor = 'text-red-700 dark:text-red-400';
      bgColor = 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800';
      badgeColor = 'bg-red-600 text-white';
      riskLevel = 'Extremely high risk requiring clinical management';
    }

    // Healthy weight range (BMI 18.5 - 24.9)
    const minHealthyKg = 18.5 * effectiveHeightM * effectiveHeightM;
    const maxHealthyKg = 24.9 * effectiveHeightM * effectiveHeightM;

    let healthyWeightText = '';
    let weightDiffText = '';

    if (unitSystem === 'metric') {
      healthyWeightText = `${minHealthyKg.toFixed(1)} kg – ${maxHealthyKg.toFixed(1)} kg`;
      if (effectiveWeightKg < minHealthyKg) {
        weightDiffText = `Gain ${(minHealthyKg - effectiveWeightKg).toFixed(1)} kg to reach normal range`;
      } else if (effectiveWeightKg > maxHealthyKg) {
        weightDiffText = `Lose ${(effectiveWeightKg - maxHealthyKg).toFixed(1)} kg to reach normal range`;
      } else {
        weightDiffText = 'You are currently within your healthy weight range';
      }
    } else {
      const minHealthyLbs = minHealthyKg * 2.20462;
      const maxHealthyLbs = maxHealthyKg * 2.20462;
      healthyWeightText = `${minHealthyLbs.toFixed(1)} lbs – ${maxHealthyLbs.toFixed(1)} lbs`;
      const currentLbs = effectiveWeightKg * 2.20462;
      if (currentLbs < minHealthyLbs) {
        weightDiffText = `Gain ${(minHealthyLbs - currentLbs).toFixed(1)} lbs to reach normal range`;
      } else if (currentLbs > maxHealthyLbs) {
        weightDiffText = `Lose ${(currentLbs - maxHealthyLbs).toFixed(1)} lbs to reach normal range`;
      } else {
        weightDiffText = 'You are currently within your healthy weight range';
      }
    }

    // BMI Prime (ratio to 25.0)
    const bmiPrime = (bmi / 25).toFixed(2);

    // Ponderal Index (kg / m^3)
    const ponderalIndex = (effectiveWeightKg / Math.pow(effectiveHeightM, 3)).toFixed(1);

    // Mifflin-St Jeor BMR calculation
    // Men: 10 * weight(kg) + 6.25 * height(cm) - 5 * age + 5
    // Women: 10 * weight(kg) + 6.25 * height(cm) - 5 * age - 161
    const heightCmEffective = effectiveHeightM * 100;
    const baseBmr =
      10 * effectiveWeightKg +
      6.25 * heightCmEffective -
      5 * (age || 25);
    const bmr = Math.round(gender === 'male' ? baseBmr + 5 : baseBmr - 161);

    // Water intake estimate (35ml per kg)
    const waterLiters = (effectiveWeightKg * 0.035).toFixed(1);

    // Gauge needle percentage (clamp between 12 and 42 BMI)
    const minGaugeBmi = 12;
    const maxGaugeBmi = 42;
    const gaugePercent = Math.min(
      Math.max(((bmi - minGaugeBmi) / (maxGaugeBmi - minGaugeBmi)) * 100, 2),
      98
    );

    return {
      bmi: roundedBmi,
      category,
      categoryColor,
      bgColor,
      badgeColor,
      riskLevel,
      healthyWeightText,
      weightDiffText,
      bmiPrime,
      ponderalIndex,
      bmr,
      waterLiters,
      gaugePercent,
    };
  }, [
    unitSystem,
    gender,
    age,
    heightCm,
    weightKg,
    heightFeet,
    heightInches,
    weightLbs,
  ]);

  const handleReset = () => {
    if (unitSystem === 'metric') {
      setHeightCm(175);
      setWeightKg(70);
    } else {
      setHeightFeet(5);
      setHeightInches(9);
      setWeightLbs(154);
    }
    setAge(28);
    setGender('male');
  };

  const handleCopySummary = () => {
    if (!results) return;
    const text = `MultiZest BMI Analysis:
BMI: ${results.bmi} (${results.category})
Healthy Weight Range: ${results.healthyWeightText}
Status: ${results.weightDiffText}
Daily BMR: ~${results.bmr} kcal/day
Recommended Daily Water: ~${results.waterLiters} Liters
Calculated free at MultiZest: https://multizest.com/tools/bmi-calculator`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Unit & Gender Switcher Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            System:
          </span>
          <div className="inline-flex rounded-xl p-1 bg-slate-200/70 dark:bg-slate-900 border border-slate-300 dark:border-slate-800">
            <button
              type="button"
              onClick={() => handleUnitChange('metric')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                unitSystem === 'metric'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Metric (cm, kg)
            </button>
            <button
              type="button"
              onClick={() => handleUnitChange('imperial')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                unitSystem === 'imperial'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Imperial (ft, in, lbs)
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Sex:
            </span>
            <div className="inline-flex rounded-xl p-1 bg-slate-200/70 dark:bg-slate-900 border border-slate-300 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setGender('male')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  gender === 'male'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Male
              </button>
              <button
                type="button"
                onClick={() => setGender('female')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  gender === 'female'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Female
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Age:
            </label>
            <input
              type="number"
              min={2}
              max={120}
              value={age}
              onChange={(e) => setAge(Math.max(2, Math.min(120, parseInt(e.target.value) || 25)))}
              className="w-16 px-2.5 py-1 text-xs font-bold text-center rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
            title="Reset to default values"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Input sliders & inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Height Input Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Scale className="w-4 h-4 text-blue-500" />
              <span>Your Height</span>
            </label>
            {unitSystem === 'metric' ? (
              <span className="text-base font-extrabold text-blue-600 dark:text-blue-400 font-mono">
                {heightCm} cm
              </span>
            ) : (
              <span className="text-base font-extrabold text-blue-600 dark:text-blue-400 font-mono">
                {heightFeet} ft {heightInches} in
              </span>
            )}
          </div>

          {unitSystem === 'metric' ? (
            <div className="space-y-3">
              <input
                type="range"
                min={90}
                max={230}
                value={heightCm}
                onChange={(e) => setHeightCm(parseInt(e.target.value) || 170)}
                className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
              />
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>90 cm</span>
                <input
                  type="number"
                  min={50}
                  max={250}
                  value={heightCm}
                  onChange={(e) => setHeightCm(Math.max(50, Math.min(250, parseInt(e.target.value) || 170)))}
                  className="w-20 px-2 py-1 text-center font-bold text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                <span>230 cm</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-xs text-slate-500 block mb-1">Feet</label>
                <input
                  type="number"
                  min={3}
                  max={8}
                  value={heightFeet}
                  onChange={(e) => setHeightFeet(Math.max(3, Math.min(8, parseInt(e.target.value) || 5)))}
                  className="w-full px-3 py-2 text-center font-bold text-base rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">Inches</label>
                <input
                  type="number"
                  min={0}
                  max={11}
                  value={heightInches}
                  onChange={(e) => setHeightInches(Math.max(0, Math.min(11, parseInt(e.target.value) || 0)))}
                  className="w-full px-3 py-2 text-center font-bold text-base rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* Weight Input Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              <span>Your Weight</span>
            </label>
            {unitSystem === 'metric' ? (
              <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                {weightKg} kg
              </span>
            ) : (
              <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                {weightLbs} lbs
              </span>
            )}
          </div>

          {unitSystem === 'metric' ? (
            <div className="space-y-3">
              <input
                type="range"
                min={30}
                max={180}
                value={weightKg}
                onChange={(e) => setWeightKg(parseInt(e.target.value) || 65)}
                className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
              />
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>30 kg</span>
                <input
                  type="number"
                  min={20}
                  max={300}
                  value={weightKg}
                  onChange={(e) => setWeightKg(Math.max(20, Math.min(300, parseInt(e.target.value) || 65)))}
                  className="w-20 px-2 py-1 text-center font-bold text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                <span>180 kg</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <input
                type="range"
                min={70}
                max={400}
                value={weightLbs}
                onChange={(e) => setWeightLbs(parseInt(e.target.value) || 150)}
                className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
              />
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>70 lbs</span>
                <input
                  type="number"
                  min={50}
                  max={600}
                  value={weightLbs}
                  onChange={(e) => setWeightLbs(Math.max(50, Math.min(600, parseInt(e.target.value) || 150)))}
                  className="w-24 px-2 py-1 text-center font-bold text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                <span>400 lbs</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Results Dashboard */}
      {results && (
        <div className={`p-6 sm:p-8 rounded-3xl border ${results.bgColor} transition-all duration-300 space-y-6 shadow-sm`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Your Calculated BMI
              </span>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                  {results.bmi}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-bold ${results.badgeColor}`}>
                  {results.category}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopySummary}
              className="self-start sm:self-center inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-xs"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied Report' : 'Copy Report'}</span>
            </button>
          </div>

          {/* Visual Gauge Bar */}
          <div className="space-y-2">
            <div className="relative pt-6">
              {/* Needle Indicator */}
              <div
                className="absolute top-0 transform -translate-x-1/2 flex flex-col items-center transition-all duration-300"
                style={{ left: `${results.gaugePercent}%` }}
              >
                <span className="text-[10px] font-black font-mono text-slate-900 dark:text-white bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded shadow border border-slate-300 dark:border-slate-700">
                  {results.bmi}
                </span>
                <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-slate-800 dark:border-t-white mt-0.5" />
              </div>

              {/* Gradient Track */}
              <div className="h-4 rounded-full overflow-hidden flex shadow-inner">
                <div className="w-[21.6%] bg-sky-400" title="Underweight (< 18.5)" />
                <div className="w-[21.3%] bg-emerald-500" title="Normal (18.5 - 24.9)" />
                <div className="w-[16.7%] bg-amber-400" title="Overweight (25 - 29.9)" />
                <div className="w-[16.7%] bg-orange-500" title="Obese Class I (30 - 34.9)" />
                <div className="w-[23.7%] bg-red-600" title="Severe Obese (35+)" />
              </div>
            </div>

            {/* Scale Legends */}
            <div className="flex justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 px-1">
              <span>Underweight (&lt;18.5)</span>
              <span>Normal (18.5–24.9)</span>
              <span>Overweight (25–29.9)</span>
              <span>Obese (30+)</span>
            </div>
          </div>

          {/* Status Message */}
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800">
            {results.bmi >= 18.5 && results.bmi < 25.0 ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            )}
            <div className="space-y-0.5">
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {results.weightDiffText}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {results.riskLevel}
              </p>
            </div>
          </div>

          {/* Secondary Metric Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-800 text-center">
              <div className="flex items-center justify-center gap-1 text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1">
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                <span>Healthy Range</span>
              </div>
              <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white block font-mono">
                {results.healthyWeightText}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-800 text-center">
              <div className="flex items-center justify-center gap-1 text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1">
                <Flame className="w-3.5 h-3.5 text-orange-500" />
                <span>Est. BMR</span>
              </div>
              <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white block font-mono">
                ~{results.bmr} kcal/day
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-800 text-center">
              <div className="flex items-center justify-center gap-1 text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1">
                <Droplets className="w-3.5 h-3.5 text-sky-500" />
                <span>Water Target</span>
              </div>
              <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white block font-mono">
                ~{results.waterLiters} L / day
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-800 text-center">
              <div className="flex items-center justify-center gap-1 text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1">
                <Activity className="w-3.5 h-3.5 text-indigo-500" />
                <span>BMI Prime</span>
              </div>
              <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white block font-mono">
                {results.bmiPrime} (ratio)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Official WHO Reference Classification Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900">
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            World Health Organization (WHO) BMI Classifications
          </h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50/50 dark:bg-slate-800/40 text-slate-500 border-b border-slate-200 dark:border-slate-800 font-semibold">
              <tr>
                <th className="py-2.5 px-4">Category</th>
                <th className="py-2.5 px-4">BMI Range (kg/m²)</th>
                <th className="py-2.5 px-4">Health Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
              <tr className={results?.bmi && results.bmi < 18.5 ? 'bg-sky-50 dark:bg-sky-950/40 font-bold' : ''}>
                <td className="py-2.5 px-4 text-sky-600 dark:text-sky-400">Underweight</td>
                <td className="py-2.5 px-4">&lt; 18.5</td>
                <td className="py-2.5 px-4">Nutritional deficiency, lower immunity</td>
              </tr>
              <tr className={results?.bmi && results.bmi >= 18.5 && results.bmi < 25 ? 'bg-emerald-50 dark:bg-emerald-950/40 font-bold' : ''}>
                <td className="py-2.5 px-4 text-emerald-600 dark:text-emerald-400">Normal (Healthy Weight)</td>
                <td className="py-2.5 px-4">18.5 – 24.9</td>
                <td className="py-2.5 px-4">Lowest overall health risk</td>
              </tr>
              <tr className={results?.bmi && results.bmi >= 25 && results.bmi < 30 ? 'bg-amber-50 dark:bg-amber-950/40 font-bold' : ''}>
                <td className="py-2.5 px-4 text-amber-600 dark:text-amber-400">Overweight</td>
                <td className="py-2.5 px-4">25.0 – 29.9</td>
                <td className="py-2.5 px-4">Increased risk of cardiovascular issues</td>
              </tr>
              <tr className={results?.bmi && results.bmi >= 30 && results.bmi < 35 ? 'bg-orange-50 dark:bg-orange-950/40 font-bold' : ''}>
                <td className="py-2.5 px-4 text-orange-600 dark:text-orange-400">Obese Class I (Moderate)</td>
                <td className="py-2.5 px-4">30.0 – 34.9</td>
                <td className="py-2.5 px-4">High risk of hypertension &amp; diabetes</td>
              </tr>
              <tr className={results?.bmi && results.bmi >= 35 && results.bmi < 40 ? 'bg-rose-50 dark:bg-rose-950/40 font-bold' : ''}>
                <td className="py-2.5 px-4 text-rose-600 dark:text-rose-400">Obese Class II (Severe)</td>
                <td className="py-2.5 px-4">35.0 – 39.9</td>
                <td className="py-2.5 px-4">Very high cardiovascular risk</td>
              </tr>
              <tr className={results?.bmi && results.bmi >= 40 ? 'bg-red-50 dark:bg-red-950/40 font-bold' : ''}>
                <td className="py-2.5 px-4 text-red-600 dark:text-red-400">Obese Class III (Very Severe)</td>
                <td className="py-2.5 px-4">&ge; 40.0</td>
                <td className="py-2.5 px-4">Extremely high clinical risk</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
