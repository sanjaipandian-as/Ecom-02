import React, { useState, useEffect } from 'react';
import API from '../../../../api';
import bgImage from '../../../assets/kitchen_bg.png'; // Fallback image

const Hero = () => {
    const [heroSlides, setHeroSlides] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);

    // Fetch slides from backend
    useEffect(() => {
        const fetchSlides = async () => {
            try {
                const response = await API.get('/hero');
                if (response.data.slides && response.data.slides.length > 0) {
                    setHeroSlides(response.data.slides);
                } else {
                    setHeroSlides([{ image: bgImage }]);
                }
            } catch (error) {
                console.error('Error fetching hero slides:', error);
                setHeroSlides([{ image: bgImage }]);
            }
        };

        fetchSlides();
    }, []);

    // Auto-slide functionality
    useEffect(() => {
        if (heroSlides.length <= 1) return;

        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [heroSlides.length]);

    return (
        <div className="relative w-full h-[450px] md:h-[550px] lg:h-[600px] overflow-hidden font-sans group">
            
            {/* Slider Track Container (Horizontal Sliding) */}
            <div 
                className="flex h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
                {heroSlides.map((slide, index) => (
                    <div key={index} className="w-full h-full flex-shrink-0 relative">
                        {/* Background Image */}
                        <div 
                            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                            style={{ backgroundImage: `url(${slide.image})` }}
                        >
                            {/* Dark overlay for better text readability and moody aesthetic */}
                            <div className="absolute inset-0 bg-black/20 mix-blend-multiply"></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-[#0d2a23]/80 via-[#0d2a23]/30 to-transparent"></div>
                        </div>

                        {/* Bottom Right Glass Card (Also moves with slide) */}
                        <div className="absolute bottom-12 right-6 md:bottom-16 md:right-16 z-10 hidden sm:block">
                            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 w-[260px] shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
                                <div className="flex justify-between items-start mb-10">
                                    <p className="text-white text-[15px] font-medium leading-relaxed tracking-wide opacity-90">
                                        Premium.<br />
                                        Anti-Tarnish.<br />
                                        Hypoallergenic.
                                    </p>
                                    <div className="text-white mt-1 opacity-80">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 21.5V12M12 12C9 12 7 9 7 6c0-2 1.5-3 3.5-3S14 4.5 14 6c0 3-2 6-2 6zm0 0c3 0 5 3 5 6 0 2-1.5 3-3.5 3S10 19.5 10 18c0-3 2-6 2-6z"></path>
                                        </svg>
                                    </div>
                                </div>
                                <div className="text-white text-5xl font-serif italic tracking-tight" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
                                    96%
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Slider Dots Indicator (Static at bottom center) */}
            {heroSlides.length > 1 && (
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
                    {heroSlides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`transition-all duration-300 rounded-full h-1.5 ${index === currentSlide ? 'w-8 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70'}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Hero;
