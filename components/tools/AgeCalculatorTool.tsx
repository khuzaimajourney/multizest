'use client';

import React, { useState, useMemo } from 'react';
import { Calendar, Clock, Sparkles, Cake, Compass } from 'lucide-react';

export default function AgeCalculatorTool() {
  const [birthDate, setBirthDate] = useState<string>('1998-05-15');
  const [targetDate, setTargetDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  const calculation = useMemo(() => {
    if (!birthDate || !targetDate) return null;

    const start = new Date(birthDate);
    const end = new Date(targetDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
      return null;
    }

    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();

    if (days < 0) {
      months--;
      // Days in previous month
      const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
      days += prevMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    // Total milliseconds
    const diffMs = end.getTime() - start.getTime();
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalMonths = years * 12 + months;
    const totalHours = totalDays * 24;
    const totalMinutes = totalHours * 60;

    // Day of the week born on
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayBorn = daysOfWeek[start.getDay()];

    // Next birthday countdown
    let nextBday = new Date(end.getFullYear(), start.getMonth(), start.getDate());
    if (nextBday < end) {
      nextBday = new Date(end.getFullYear() + 1, start.getMonth(), start.getDate());
    }
    const daysToNextBday = Math.ceil((nextBday.getTime() - end.getTime()) / (1000 * 60 * 60 * 24));

    // Western Zodiac
    const m = start.getMonth() + 1;
    const d = start.getDate();
    let zodiac = 'Aries';
    if ((m === 1 && d >= 20) || (m === 2 && d <= 18)) zodiac = 'Aquarius ♒';
    else if ((m === 2 && d >= 19) || (m === 3 && d <= 20)) zodiac = 'Pisces ♓';
    else if ((m === 3 && d >= 21) || (m === 4 && d <= 19)) zodiac = 'Aries ♈';
    else if ((m === 4 && d >= 20) || (m === 5 && d <= 20)) zodiac = 'Taurus ♉';
    else if ((m === 5 && d >= 21) || (m === 6 && d <= 20)) zodiac = 'Gemini ♊';
    else if ((m === 6 && d >= 21) || (m === 7 && d <= 22)) zodiac = 'Cancer ♋';
    else if ((m === 7 && d >= 23) || (m === 8 && d <= 22)) zodiac = 'Leo ♌';
    else if ((m === 8 && d >= 23) || (m === 9 && d <= 22)) zodiac = 'Virgo ♍';
    else if ((m === 9 && d >= 23) || (m === 10 && d <= 22)) zodiac = 'Libra ♎';
    else if ((m === 10 && d >= 23) || (m === 11 && d <= 21)) zodiac = 'Scorpio ♏';
    else if ((m === 11 && d >= 22) || (m === 12 && d <= 21)) zodiac = 'Sagittarius ♐';
    else zodiac = 'Capricorn ♑';

    return {
      years,
      months,
      days,
      totalMonths,
      totalWeeks,
      totalDays,
      totalHours,
      totalMinutes,
      dayBorn,
      daysToNextBday,
      zodiac,
    };
  }, [birthDate, targetDate]);

  return (
    <div className="space-y-6">
      {/* Date Pickers */}
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Date of Birth
          </label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Calculate Age as of Date
          </label>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {calculation ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Main Primary Age Card */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-rose-500 via-pink-600 to-purple-600 text-white shadow-xl text-center">
            <span className="text-xs uppercase font-bold tracking-widest opacity-80 block mb-1">
              Exact Chronological Age
            </span>
            <div className="text-3xl sm:text-5xl font-black tracking-tight mt-2">
              {calculation.years} Years, {calculation.months} Months, {calculation.days} Days
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs font-medium opacity-90">
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md">
                Born on a {calculation.dayBorn}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md">
                Zodiac: {calculation.zodiac}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md">
                🎂 Next Birthday in {calculation.daysToNextBday} days
              </span>
            </div>
          </div>

          {/* Granular Breakdown Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
              <div className="text-xl sm:text-2xl font-black text-rose-600 font-mono">
                {calculation.totalMonths.toLocaleString()}
              </div>
              <div className="text-xs text-slate-500 mt-1 uppercase font-semibold">Total Months</div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
              <div className="text-xl sm:text-2xl font-black text-pink-600 font-mono">
                {calculation.totalWeeks.toLocaleString()}
              </div>
              <div className="text-xs text-slate-500 mt-1 uppercase font-semibold">Total Weeks</div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
              <div className="text-xl sm:text-2xl font-black text-purple-600 font-mono">
                {calculation.totalDays.toLocaleString()}
              </div>
              <div className="text-xs text-slate-500 mt-1 uppercase font-semibold">Total Days</div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
              <div className="text-xl sm:text-2xl font-black text-blue-600 font-mono">
                {calculation.totalHours.toLocaleString()}
              </div>
              <div className="text-xs text-slate-500 mt-1 uppercase font-semibold">Total Hours</div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
              <div className="text-xl sm:text-2xl font-black text-emerald-600 font-mono">
                {calculation.totalMinutes.toLocaleString()}
              </div>
              <div className="text-xs text-slate-500 mt-1 uppercase font-semibold">Total Minutes</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 text-center text-sm text-slate-500">
          Please enter a valid birth date that precedes the target date.
        </div>
      )}
    </div>
  );
}
