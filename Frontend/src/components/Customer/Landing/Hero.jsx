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
    subtitle: "HEY AZHAGI SAVINGS PLANS",
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
  const [currentSlide, setCurrentSlide] = useState(0);

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

  // Auto-slide functionality
  useEffect(() => {
    if (heroSlides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  return (
    <div className="relative w-full bg-cream-base border-b border-gold-champagne/20 font-sans h-[480px] lg:h-[580px] overflow-hidden">
      
      {/* Inner Content Slider */}
      <div className="relative h-full w-full overflow-hidden">
        {heroSlides.map((slide, index) => {
          const content = slideContents[index % slideContents.length];
          const isActive = index === currentSlide;
          
          return (
            <div 
              key={index} 
              className={`absolute inset-0 flex flex-col md:flex-row transition-all duration-1000 ease-in-out ${isActive ? 'opacity-100 z-10 scale-100 pointer-events-auto' : 'opacity-0 z-0 scale-95 pointer-events-none'}`}
            >
              {/* Left Half: Editorial Text */}
              <div className="w-full md:w-[50%] p-6 md:p-12 lg:p-20 flex flex-col justify-center text-left relative bg-cream-soft h-[55%] md:h-full">
                
                {/* Double gold layout frame for premium paper look */}
                <div className="absolute inset-4 md:inset-8 border border-gold-champagne/15 pointer-events-none rounded-none"></div>
                <div className="absolute inset-5 md:inset-9 border border-gold-champagne/5 pointer-events-none rounded-none"></div>
                
                {/* Premium elements inside slide */}
                <div className="relative z-10">
                  <span className="text-gold-lustrous text-xs font-bold tracking-[0.25em] uppercase block mb-2 md:mb-3">
                    {content.subtitle}
                  </span>
                  
                  <h1 
                    className="text-emerald-deep text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.1] tracking-tight mb-4"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    {content.title}
                  </h1>

                  {/* VA / MC Luxury Seal Badge */}
                  <div className="inline-flex flex-col mb-5">
                    <div className="border border-gold-champagne/50 text-gold-lustrous font-semibold text-xs sm:text-xs px-3.5 py-1.5 tracking-[0.2em] uppercase bg-white/60 backdrop-blur-xs shadow-xs self-start rounded-xs">
                      {content.badge}
                    </div>
                    <span className="text-emerald-light text-[9px] sm:text-[10px] font-bold tracking-[0.1em] uppercase mt-1.5 ml-1">
                      {content.badgeDesc}
                    </span>
                  </div>

                  <p className="text-slate-650 text-xs sm:text-sm font-normal leading-relaxed mb-6 max-w-md">
                    {content.desc}
                  </p>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => navigate(content.ctaLink)}
                      className="px-6 py-3 bg-emerald-deep border border-emerald-deep text-cream-base hover:bg-gold-lustrous hover:border-gold-lustrous hover:shadow-lg transition-all duration-350 text-xs font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-95 cursor-pointer rounded-xs"
                    >
                      {content.ctaText}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Half: Jewelry Showcase Image (Ken Burns effect) */}
              <div className="w-full md:w-[50%] h-[45%] md:h-full relative overflow-hidden bg-[#090f0c]">
                <div 
                  className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[7000ms] ease-out ${isActive ? 'scale-110' : 'scale-100'}`}
                  style={{ backgroundImage: `url(${slide.image})` }}
                >
                  {/* Dark radial glow overlay to frame jewelry details */}
                  <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/50 via-black/10 to-transparent mix-blend-multiply"></div>
                </div>
                {/* Double gold picture frame */}
                <div className="absolute inset-3 border border-white/10 pointer-events-none"></div>
                <div className="absolute inset-4 border border-gold-champagne/20 pointer-events-none"></div>

                {/* Trust watermark */}
                <div className="absolute bottom-4 right-4 bg-emerald-deep/80 backdrop-blur-md px-3 py-1.5 border border-gold-champagne/20 rounded-xs">
                  <span className="text-white text-[9px] font-bold tracking-[0.2em] uppercase flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-gold-lustrous" /> 100% BIS 916 HALLMARKED
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Controls: Custom Premium Slider UI */}
      {heroSlides.length > 1 && (
        <div className="absolute bottom-4 left-6 md:left-12 right-6 md:right-12 z-20 flex justify-between items-center bg-transparent pointer-events-none">
          
          {/* Pagination text & gold slider timeline */}
          <div className="flex items-center gap-4 pointer-events-auto">
            <span className="text-emerald-deep text-xs font-bold tracking-widest font-mono">
              {String(currentSlide + 1).padStart(2, '0')} <span className="text-gold-champagne font-sans">/</span> {String(heroSlides.length).padStart(2, '0')}
            </span>
            <div className="w-24 h-[2px] bg-gold-champagne/20 overflow-hidden">
              <div 
                className="h-full bg-gold-lustrous transition-all duration-7000 ease-linear"
                style={{ width: `${((currentSlide + 1) / heroSlides.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Slider Direction Arrow Buttons */}
          <div className="flex gap-2 pointer-events-auto">
            <button
              onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
              className="w-9 h-9 border border-gold-champagne/45 bg-cream-base hover:bg-gold-lustrous hover:border-gold-lustrous text-emerald-deep hover:text-white flex items-center justify-center transition-all duration-300 active:scale-90 cursor-pointer shadow-xs rounded-full"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
              className="w-9 h-9 border border-gold-champagne/45 bg-cream-base hover:bg-gold-lustrous hover:border-gold-lustrous text-emerald-deep hover:text-white flex items-center justify-center transition-all duration-300 active:scale-90 cursor-pointer shadow-xs rounded-full"
              aria-label="Next slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
};

export default Hero;
