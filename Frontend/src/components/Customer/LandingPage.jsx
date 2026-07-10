import React from 'react';
import Hero from './Landing/Hero';
import Categories from './Landing/Categories';
import BestSellers from './Landing/BestSellers';

const LandingPage = () => {
    return (
        <div className="w-full bg-white pb-0 relative overflow-hidden">
            <Hero />
            <Categories />
            <BestSellers />
        </div>
    );
};

export default LandingPage;
