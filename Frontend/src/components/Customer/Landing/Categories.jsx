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
        <section className="w-full pt-6 pb-12 md:pt-8 md:pb-16 overflow-hidden" style={{ background: '#FFFDFD' }}>
            <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-5 md:mb-6 px-2 gap-4">
                    <div className="flex flex-col items-start text-left">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-semibold mb-3 tracking-normal" style={{ color: '#2E2E2E' }}>
                            Curated <span style={{ color: '#81C784' }}>Collections</span>
                        </h2>
                        <p className="text-gray-500 font-sans text-[15px] md:text-base max-w-xl leading-relaxed">
                            Discover our handpicked selection of premium, anti-tarnish jewelry designed to bring timeless elegance and confidence to your everyday look.
                        </p>
                    </div>

                    {/* Right side design to fill empty space */}
                    <div className="hidden md:flex items-center gap-6 pb-1 animate-fade-in-up">
                        <div className="flex flex-col text-right">
                            <span className="text-[13px] font-bold tracking-widest uppercase text-[#2E2E2E]">Premium Quality</span>
                            <span className="text-[11px] text-gray-400 font-medium">Anti-Tarnish & Hypoallergenic</span>
                        </div>
                        <div className="h-10 w-px bg-gray-200"></div>
                        <button 
                            onClick={() => navigate('/products')}
                            className="group flex items-center gap-2 bg-white border-2 border-[#81C784] text-[#81C784] px-6 py-2.5 rounded-full text-sm font-bold hover:bg-[#81C784] hover:text-white transition-all shadow-sm"
                        >
                            Explore All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>

                <div className="relative group/nav">
                    {/* Navigation Arrows - Left */}
                    {!loading && categories.length > visibleCards && (
                        <button
                            onClick={() => scroll('left')}
                            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center text-gray-800 shadow-md hover:bg-white transition-all duration-300 opacity-0 group-hover/nav:opacity-100 hidden md:flex"
                            aria-label="Previous categories"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                    )}

                    {/* Navigation Arrows - Right */}
                    {!loading && categories.length > visibleCards && (
                        <button
                            onClick={() => scroll('right')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center text-gray-800 shadow-md hover:bg-white transition-all duration-300 opacity-0 group-hover/nav:opacity-100 hidden md:flex"
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
                                    className="flex-shrink-0 relative transition-transform duration-300 overflow-hidden cursor-pointer group snap-start border border-gray-100 hover:shadow-2xl"
                                    style={{
                                        minWidth: `${cardWidth}px`,
                                        width: `${cardWidth}px`,
                                        height: '420px',
                                        borderRadius: '6px'
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
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-100"></div>

                                    {/* Text and Button Overlay */}
                                    <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center z-10 transform transition-transform duration-300 group-hover:-translate-y-2">
                                        <span className="text-white text-[14px] font-sans font-medium tracking-wide">Explore</span>
                                        <span 
                                            className="text-white text-[28px] italic mb-4 tracking-tight drop-shadow-md" 
                                            style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
                                        >
                                            {cat.name}
                                        </span>
                                        <button className="bg-[#faf3ce] text-[#1a382e] px-5 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 hover:bg-white transition-colors uppercase tracking-widest shadow-md">
                                            Shop <ArrowRight className="w-3 h-3 stroke-[1px]" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="md:hidden flex justify-center items-center gap-2 mt-6 text-sm font-medium" style={{ color: '#81C784' }}>
                    <ChevronLeft className="w-4 h-4 animate-pulse" />
                    <span className="uppercase tracking-widest text-[10px]">Swipe to discover more</span>
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
