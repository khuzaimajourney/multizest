import React from 'react';
import HeroSection from '@/components/home/HeroSection';
import ToolCategories from '@/components/home/ToolCategories';
import FeaturedTools from '@/components/home/FeaturedTools';
import HowItWorks from '@/components/home/HowItWorks';
import StatsSection from '@/components/home/StatsSection';
import FAQSection from '@/components/home/FAQSection';

export default function HomePage() {
  return (
    <div className="w-full">
      <HeroSection />
      <ToolCategories />
      <FeaturedTools />
      <HowItWorks />
      <StatsSection />
      <FAQSection />
    </div>
  );
}
