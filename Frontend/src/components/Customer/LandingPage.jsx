import React from 'react';
import Hero from './Landing/Hero';
import Categories from './Landing/Categories';
import BestSellers from './Landing/BestSellers';
import Logo from '../Common/Logo';

const LandingPage = () => {
    return (
        <div className="w-full bg-white pb-20 md:pb-0 relative overflow-hidden">
            {/* Background Decorative Element */}
            <div className="absolute top-[20%] -left-[10%] w-[40%] aspect-square opacity-[0.02] pointer-events-none transform -rotate-12 select-none">
                <Logo className="w-full h-full" />
            </div>
            
            <Hero />
            <Categories />
            <BestSellers />
        </div>
    );
};

export default LandingPage;
