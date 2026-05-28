import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../../../api';
import { 
  ChevronLeft, 
  ChevronRight, 
  ShieldCheck 
} from 'lucide-react';

// Fallback high-resolution jewelry slide images from Unsplash
const fallbackSlides = [
  { image: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=1600&q=80" },
  { image: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=1600&q=80" },
  { image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1600&q=80" }
];

const slideContents = [
  {
    subtitle: "EXCLUSIVE BRIDAL DESIGNS",
    title: "Heritage Wedding Masterpieces",
    desc: "Exquisite heavy chokers and necklace sets handcrafted in pure 22K gold. Offered with our signature zero wastage and zero making charges policy.",
    badge: "VA - 0% | MC - 0",
    badgeDesc: "Zero Wastage • Zero Making Cost",
    ctaText: "View Bridal Sets",
    ctaLink: "/category/jewelry-sets"
  },
  {
    subtitle: "SHIELD AGAINST MARKET HIKES",
    title: "Gold Price Pre-Booking Plan",
    desc: "Lock in today's gold rate by paying a simple 10% advance. Safeguard your wedding ornament budget from sudden market price fluctuations.",
    badge: "LOCK RATE TODAY",
    badgeDesc: "Pay 10% • Guard Against Hikes",
    ctaText: "Pre-Book Gold Rate",
    ctaLink: "/category/bracelets"
  },
  {
    subtitle: "HA SAVINGS PLANS",
    title: "Flexi-100 Savings Scheme",
    desc: "Invest monthly starting from ₹1,000. Get 100% discount on Wastage (VA) at maturity, plus one free monthly installment contribution from our brand.",
    badge: "11 MONTH SCHEME",
    badgeDesc: "1 Month Free Contribution Bonus",
    ctaText: "Explore Schemes",
    ctaLink: "/category/rings"
  }
];

const Hero = () => {
  const navigate = useNavigate();
  const [heroSlides, setHeroSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(1); // Start at index 1 (first real slide)
  const [transitionEnabled, setTransitionEnabled] = useState(true);

  // Fetch slides from backend
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const response = await API.get('/hero');
        if (response.data.slides && response.data.slides.length > 0) {
          setHeroSlides(response.data.slides);
        } else {
          setHeroSlides(fallbackSlides);
        }
      } catch (error) {
        console.error('Error fetching hero slides, using fallbacks:', error);
        setHeroSlides(fallbackSlides);
      }
    };
    fetchSlides();
  }, []);

  const slides = heroSlides.length > 0 ? heroSlides : fallbackSlides;
  const isLoopable = slides.length > 1;

  // Append clones for infinite loop: last slide at start, first slide at end
  const extendedSlides = isLoopable
    ? [slides[slides.length - 1], ...slides, slides[0]]
    : slides;

  // Adjust starting index once slides load
  useEffect(() => {
    if (slides.length === 1) {
      setCurrentSlide(0);
    } else if (slides.length > 1) {
      setCurrentSlide(1);
    }
  }, [heroSlides]);

  // Jump transitions for infinite loop resetting
  useEffect(() => {
    if (!isLoopable) return;

    if (currentSlide === 0) {
      // Jump to last real slide index
      const timer = setTimeout(() => {
        setTransitionEnabled(false);
        setCurrentSlide(slides.length);
      }, 800);
      return () => clearTimeout(timer);
    }
    
    if (currentSlide === slides.length + 1) {
      // Jump to first real slide index
      const timer = setTimeout(() => {
        setTransitionEnabled(false);
        setCurrentSlide(1);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [currentSlide, slides.length, isLoopable]);

  // Re-enable transition after reset jump
  useEffect(() => {
    if (!transitionEnabled) {
      const timer = setTimeout(() => {
        setTransitionEnabled(true);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [transitionEnabled]);

  // Auto-slide functionality
  useEffect(() => {
    if (!isLoopable) return;

    const timer = setInterval(() => {
      handleNext();
    }, 2000);
    return () => clearInterval(timer);
  }, [slides.length, currentSlide, transitionEnabled, isLoopable]);

  const handleNext = () => {
    if (!transitionEnabled) return;
    setCurrentSlide((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (!transitionEnabled) return;
    setCurrentSlide((prev) => prev - 1);
  };

  return (
    <div className="relative w-full bg-cream-base border-b border-gold-champagne/20 font-sans h-[500px] sm:h-[600px] lg:h-[700px] overflow-hidden">
      
      {/* Sliding Track Container */}
      <div 
        className={`flex h-full ${transitionEnabled ? 'transition-transform duration-[800ms]' : ''}`}
        style={{ 
          transform: `translate3d(-${extendedSlides.length > 0 ? (currentSlide / extendedSlides.length) * 100 : 0}%, 0, 0)`,
          width: `${extendedSlides.length > 0 ? extendedSlides.length * 100 : 100}%`,
          transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {extendedSlides.map((slide, index) => {
          // Map index to original slide info for correct contents
          let originalIndex = index;
          if (isLoopable) {
            originalIndex = index - 1;
            if (originalIndex < 0) {
              originalIndex = slides.length - 1;
            } else if (originalIndex >= slides.length) {
              originalIndex = 0;
            }
          }
          
          const content = slideContents[originalIndex % slideContents.length];
          
          // Determine visual active state (handles entry animation trigger)
          let currentOriginalIndex = currentSlide;
          if (isLoopable) {
            currentOriginalIndex = currentSlide - 1;
            if (currentOriginalIndex < 0) {
              currentOriginalIndex = slides.length - 1;
            } else if (currentOriginalIndex >= slides.length) {
              currentOriginalIndex = 0;
            }
          }
          const isActive = originalIndex === currentOriginalIndex;
          
          return (
            <div 
              key={index} 
              className="h-full relative overflow-hidden flex-shrink-0"
              style={{ width: `${100 / extendedSlides.length}%` }}
            >
              {/* Full background Image with Ken Burns effect */}
              <div className="absolute inset-0 z-0 overflow-hidden bg-[#090f0c]">
                <div 
                  className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[7000ms] ease-out ${isActive ? 'scale-105' : 'scale-100'}`}
                  style={{ backgroundImage: `url(${slide.image})` }}
                >
                  {/* Subtle dark radial & linear overlay combination to ensure white text pops beautifully */}
                  <div className="absolute inset-0 bg-black/40"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40"></div>
                </div>
              </div>

              {/* Centered Editorial Text Overlay */}
              <div className="relative z-10 flex flex-col items-center justify-center text-center h-full px-6 md:px-12 lg:px-24">
                
                <span className={`text-gold-champagne text-xs sm:text-sm font-bold tracking-[0.3em] uppercase block mb-3 ${isActive ? 'animate-fade-up' : 'opacity-0'}`}>
                  {content.subtitle}
                </span>
                
                <h1 
                  className={`text-white text-3xl sm:text-5xl lg:text-6xl font-bold leading-[1.15] tracking-tight mb-4 max-w-4xl drop-shadow-md ${isActive ? 'animate-fade-up' : 'opacity-0'}`}
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  {content.title}
                </h1>

                {/* VA / MC Luxury Seal Badge - translucent modern glass design */}
                <div className={`inline-flex items-center gap-2 sm:gap-3 mb-6 bg-white/15 backdrop-blur-xs border border-white/20 px-4 py-2 rounded-full shadow-xs ${isActive ? 'animate-fade-up' : 'opacity-0'}`}>
                  <span className="text-gold-champagne font-extrabold text-[10px] sm:text-xs tracking-[0.15em] uppercase">
                    {content.badge}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-lustrous"></span>
                  <span className="text-white/90 text-[10px] sm:text-xs font-semibold tracking-[0.1em] uppercase">
                    {content.badgeDesc}
                  </span>
                </div>

                <p className={`text-white/80 text-xs sm:text-base font-normal leading-relaxed mb-8 max-w-2xl drop-shadow-xs ${isActive ? 'animate-fade-up' : 'opacity-0'}`}>
                  {content.desc}
                </p>

                <div className={`flex justify-center ${isActive ? 'animate-fade-up' : 'opacity-0'}`}>
                  <button
                    onClick={() => navigate(content.ctaLink)}
                    className="px-8 py-3.5 bg-gold-lustrous border border-gold-lustrous text-white hover:bg-white hover:text-black hover:border-white transition-all duration-350 text-xs sm:text-sm font-bold uppercase tracking-widest hover:scale-[1.05] active:scale-95 cursor-pointer rounded-xs"
                  >
                    {content.ctaText}
                  </button>
                </div>
              </div>

              {/* Trust watermark absolute bottom-right */}
              <div className="absolute bottom-6 right-6 md:right-12 z-20 bg-emerald-deep/80 backdrop-blur-md px-3.5 py-2 border border-gold-champagne/20 rounded-xs shadow-md hidden sm:block">
                <span className="text-white text-[9px] font-bold tracking-[0.2em] uppercase flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-gold-lustrous" /> 100% BIS 916 HALLMARKED
                </span>
              </div>

            </div>
          );
        })}
      </div>

      {/* Navigation Controls: Custom Premium Slider UI */}
      {isLoopable && (
        <>
          {/* Slider Direction Arrow Buttons on Left and Right sides */}
          <button
            onClick={handlePrev}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 w-10 h-10 border border-white/20 bg-black/30 hover:bg-white hover:text-black text-white flex items-center justify-center transition-all duration-300 active:scale-90 cursor-pointer rounded-full backdrop-blur-md shadow-lg"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 w-10 h-10 border border-white/20 bg-black/30 hover:bg-white hover:text-black text-white flex items-center justify-center transition-all duration-300 active:scale-90 cursor-pointer rounded-full backdrop-blur-md shadow-lg"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

    </div>
  );
};

export default Hero;
