import React, { useState, useEffect, useCallback, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react"
import API from "../../../../api"

const Categories = () => {
    const navigate = useNavigate()
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [index, setIndex] = useState(0)
    const [visibleCards, setVisibleCards] = useState(4)
    const [cardWidth, setCardWidth] = useState(300)
    const [gap, setGap] = useState(12)
    const scrollRef = useRef(null)

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true)
                const response = await API.get('/categories')
                setCategories(response.data || [])
            } catch (error) {
                console.error('Error fetching categories:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchCategories()
    }, [])

    useEffect(() => {
        const calculateLayout = () => {
            const width = window.innerWidth
            let calculatedCardWidth = 300
            let calculatedGap = 12
            let totalPadding = 96

            if (width < 640) {
                calculatedCardWidth = 220
                calculatedGap = 8
                totalPadding = 32
                setVisibleCards(1)
            } else if (width < 768) {
                calculatedCardWidth = 240
                calculatedGap = 12
                totalPadding = 64
                setVisibleCards(2)
            } else if (width < 1024) {
                calculatedCardWidth = 260
                calculatedGap = 12
                totalPadding = 96
                setVisibleCards(3)
            } else {
                calculatedCardWidth = 280
                calculatedGap = 12
                totalPadding = 96
                setVisibleCards(4)
            }

            setCardWidth(calculatedCardWidth)
            setGap(calculatedGap)
        }

        let timeoutId
        const debouncedCalculate = () => {
            clearTimeout(timeoutId)
            timeoutId = setTimeout(calculateLayout, 150)
        }

        calculateLayout()
        window.addEventListener('resize', debouncedCalculate)
        return () => {
            clearTimeout(timeoutId)
            window.removeEventListener('resize', debouncedCalculate)
        }
    }, [])

    const scroll = useCallback((direction) => {
        if (scrollRef.current) {
            const containerWidth = scrollRef.current.offsetWidth;
            const scrollAmount = direction === 'left' ? -(cardWidth + gap) * 2 : (cardWidth + gap) * 2;

            scrollRef.current.scrollBy({
                left: scrollAmount,
                behavior: 'smooth'
            });
        }
    }, [cardWidth, gap]);

    const handleCategoryClick = useCallback((catName) => {
        const slug = catName.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
        navigate(`/category/${slug}`)
    }, [navigate])

    const handleDotClick = useCallback((i) => {
        setIndex(i)
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                left: i * (cardWidth + gap),
                behavior: 'smooth'
            })
        }
    }, [cardWidth, gap])

    useEffect(() => {
        const handleScroll = () => {
            if (scrollRef.current) {
                const scrollPosition = scrollRef.current.scrollLeft
                const newIndex = Math.round(scrollPosition / (cardWidth + gap))
                if (newIndex !== index) {
                    setIndex(newIndex)
                }
            }
        }

        const container = scrollRef.current
        if (container) {
            container.addEventListener('scroll', handleScroll)
            return () => container.removeEventListener('scroll', handleScroll)
        }
    }, [index, cardWidth, gap])

    const totalSlides = Math.ceil(categories.length / visibleCards) || 1

    return (
        <section className="w-full pt-6 pb-12 md:pt-8 md:pb-16 overflow-hidden bg-cream-soft">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 md:mb-8 px-2 gap-4">
                    <div className="flex flex-col items-start text-left">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 tracking-tight text-emerald-deep">
                            Curated <span className="text-gold-lustrous font-normal italic font-serif">Collections</span>
                        </h2>
                        <p className="text-slate-600 font-sans text-sm md:text-base max-w-xl leading-relaxed">
                            Discover our handpicked selection of premium, anti-tarnish jewelry designed to bring timeless elegance and confidence to your everyday look.
                        </p>
                    </div>

                    {/* Right side design to fill empty space */}
                    <div className="hidden md:flex items-center gap-6 pb-1">
                        <div className="flex flex-col text-right">
                            <span className="text-[12px] font-bold tracking-[0.2em] uppercase text-emerald-deep">Premium Quality</span>
                            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-[0.1em] mt-0.5">Anti-Tarnish & Hypoallergenic</span>
                        </div>
                        <div className="h-10 w-px bg-gold-champagne/20"></div>
                        <button 
                            onClick={() => navigate('/products')}
                            className="group flex items-center gap-2.5 bg-white border border-gold-lustrous text-gold-lustrous hover:bg-gold-lustrous hover:text-white transition-all duration-350 shadow-xs px-5 py-2.5 text-xs font-bold uppercase tracking-widest cursor-pointer rounded-xs"
                        >
                            Explore All <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>

                <div className="relative group/nav">
                    {/* Navigation Arrows - Left */}
                    {!loading && categories.length > visibleCards && (
                        <button
                            onClick={() => scroll('left')}
                            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-white/80 backdrop-blur-md border border-gold-champagne/25 rounded-full flex items-center justify-center text-emerald-deep shadow-sm hover:bg-gold-lustrous hover:text-white hover:border-gold-lustrous transition-all duration-350 opacity-0 group-hover/nav:opacity-100 hidden md:flex cursor-pointer"
                            aria-label="Previous categories"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                    )}

                    {/* Navigation Arrows - Right */}
                    {!loading && categories.length > visibleCards && (
                        <button
                            onClick={() => scroll('right')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-white/80 backdrop-blur-md border border-gold-champagne/25 rounded-full flex items-center justify-center text-emerald-deep shadow-sm hover:bg-gold-lustrous hover:text-white hover:border-gold-lustrous transition-all duration-350 opacity-0 group-hover/nav:opacity-100 hidden md:flex cursor-pointer"
                            aria-label="Next categories"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    )}

                    <div
                        ref={scrollRef}
                        className="w-full overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory flex py-4"
                        style={{
                            WebkitOverflowScrolling: 'touch',
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                            gap: `${gap}px`
                        }}
                    >
                        {loading ? (
                            [...Array(visibleCards + 1)].map((_, i) => (
                                <div
                                    key={i}
                                    className="flex-shrink-0 rounded-lg animate-pulse"
                                    style={{
                                        minWidth: `${cardWidth}px`,
                                        height: '420px',
                                        backgroundColor: '#f3f4f6'
                                    }}
                                ></div>
                            ))
                        ) : categories.length === 0 ? (
                            <div className="py-20 text-center w-full">
                                <p className="text-gray-400 font-medium italic text-lg">Our vault is currently empty. Check back soon!</p>
                            </div>
                        ) : (
                            categories.map((cat) => (
                                <div
                                    key={cat._id}
                                    onClick={() => handleCategoryClick(cat.name)}
                                    className="flex-shrink-0 relative transition-all duration-500 overflow-hidden cursor-pointer group snap-start border border-gold-champagne/15 hover:shadow-xl hover:border-gold-lustrous/40"
                                    style={{
                                        minWidth: `${cardWidth}px`,
                                        width: `${cardWidth}px`,
                                        height: '420px',
                                        borderRadius: '4px'
                                    }}
                                >
                                    {/* Full Height Background Image */}
                                    {cat.icon ? (
                                        <img
                                            src={cat.icon}
                                            alt={cat.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                                            <span className="text-4xl font-black uppercase tracking-widest">{cat.name.charAt(0)}</span>
                                        </div>
                                    )}

                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-deep/95 via-black/10 to-transparent opacity-85 transition-opacity duration-500 group-hover:opacity-95"></div>

                                    {/* Text and Button Overlay */}
                                    <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center z-10 transform transition-all duration-500 group-hover:-translate-y-4">
                                        <span className="text-gold-champagne text-xs font-bold uppercase tracking-[0.25em] mb-1">Explore</span>
                                        <span 
                                            className="text-white text-3xl font-bold mb-4 tracking-wide drop-shadow-lg" 
                                            style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
                                        >
                                            {cat.name}
                                        </span>
                                        <button className="bg-cream-base text-emerald-deep px-5 py-2 text-[10px] font-bold flex items-center gap-1.5 hover:bg-gold-lustrous hover:text-white transition-all duration-350 uppercase tracking-widest shadow-md rounded-xs">
                                            Shop Collection <ArrowRight className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="md:hidden flex justify-center items-center gap-2 mt-6 text-sm font-medium" style={{ color: '#b4925a' }}>
                    <ChevronLeft className="w-4 h-4 animate-pulse" />
                    <span className="uppercase tracking-[0.2em] text-[9px] font-bold">Swipe to discover more</span>
                    <ChevronRight className="w-4 h-4 animate-pulse" />
                </div>
            </div>

            <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </section>
    )
}

export default Categories
