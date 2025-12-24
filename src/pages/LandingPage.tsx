import React, { useEffect } from 'react';
import HeroSection from '../components/landing/HeroSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import HowItWorksSection from '../components/landing/HowItWorksSection';
import BenefitsSection from '../components/landing/BenefitsSection';
import Footer from '../components/Footer';
import ThemeToggle from '../components/ThemeToggle';
import { useGetCurrentUserQuery } from '../services/authApi';
import { useNavigate } from 'react-router-dom';


export default function LandingPage() {
  const { data: user, isFetching } = useGetCurrentUserQuery(undefined);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isFetching && user) {
      navigate('/theory');
    }
  }, [isFetching, user, navigate]);

  return (
    <div className="min-h-screen bg-white">
      <ThemeToggle />
      
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <BenefitsSection />
      <Footer />
    </div>
  );
}

