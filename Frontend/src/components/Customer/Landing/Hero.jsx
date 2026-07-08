import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../../../api';

const Hero = () => {
    const navigate = useNavigate();
    const [slides, setSlides] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSlides = async () => {
            try {
                const response = await API.get('/hero');
                setSlides(response.data.slides || []);
            } catch (error) {
                console.error("Failed to fetch hero slides", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSlides();
    }, []);

    useEffect(() => {
        if (slides.length <= 1) return;
        
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
        }, 5000); // 5 seconds per slide
        
        return () => clearInterval(interval);
    }, [slides.length]);

    const handleSlideClick = (slide) => {
        if (slide.product) {
            const productId = typeof slide.product === 'object' ? slide.product._id : slide.product;
            navigate(`/product/${productId}`);
        }
    };

    if (loading) {
        return (
            <section className="w-full h-[400px] md:h-[600px] bg-slate-100 animate-pulse flex items-center justify-center">
                <span className="text-slate-400 font-bold uppercase tracking-widest text-sm">Loading Banner...</span>
            </section>
        );
    }

    if (slides.length === 0) {
        return null;
    }

    return (
        <section className="relative w-full overflow-hidden bg-slate-50 flex items-center justify-center group">
            <div 
                className="w-full relative h-[250px] sm:h-[350px] md:h-[450px] lg:h-[600px] flex transition-transform duration-700 ease-in-out" 
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {slides.map((slide, index) => (
                    <div 
                        key={slide._id} 
                        className="w-full h-full flex-shrink-0 cursor-pointer relative"
                        onClick={() => handleSlideClick(slide)}
                    >
                        <img 
                            src={slide.image} 
                            alt="Hero Banner" 
                            className="w-full h-full object-cover"
                            loading={index === 0 ? "eager" : "lazy"}
                            fetchPriority={index === 0 ? "high" : "low"}
                        />
                        {/* Interactive overlay on hover */}
                        <div className="absolute inset-0 bg-black/0 hover:bg-black/5 transition-colors duration-300 pointer-events-none"></div>
                    </div>
                ))}
            </div>

            {/* Navigation Arrows (Optional, show on hover) */}
            {slides.length > 1 && (
                <>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
                        }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/30 hover:bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-black opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-md"
                    >
                        ←
                    </button>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setCurrentIndex((prev) => (prev + 1) % slides.length);
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/30 hover:bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-black opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-md"
                    >
                        →
                    </button>
                </>
            )}

            {/* Carousel Dots */}
            {slides.length > 1 && (
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex justify-center gap-3 z-10 bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                index === currentIndex 
                                ? 'bg-white scale-125' 
                                : 'bg-white/50 hover:bg-white/80'
                            }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </section>
    );
};

export default Hero;
