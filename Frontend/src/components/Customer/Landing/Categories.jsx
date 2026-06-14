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
        <section className="w-full pt-2 pb-4 bg-white overflow-hidden">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header with Title and Controls */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex-1"></div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center flex-[2]">
                        What's on your mind?
                    </h2>
                    <div className="flex items-center justify-end gap-3 flex-1">
                        <button
                            onClick={() => scroll('left')}
                            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95"
                            aria-label="Previous"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95"
                            aria-label="Next"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Categories Grid/Scroll */}
                <div
                    ref={scrollRef}
                    className="flex overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory gap-6 sm:gap-8 md:gap-10 pb-4"
                    style={{
                        WebkitOverflowScrolling: 'touch',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                    }}
                >
                    {loading ? (
                        [...Array(6)].map((_, i) => (
                            <div key={i} className="flex-shrink-0 flex flex-col items-center animate-pulse">
                                <div className="w-36 h-36 sm:w-44 sm:h-44 md:w-56 md:h-56 rounded-xl bg-gray-100 mb-4"></div>
                                <div className="w-24 h-4 bg-gray-100 rounded"></div>
                            </div>
                        ))
                    ) : (
                        categories.map((cat, i) => (
                            <button
                                key={cat._id || i}
                                onClick={() => handleCategoryClick(cat.name)}
                                className="flex-shrink-0 flex flex-col items-center group cursor-pointer snap-center"
                                style={{ width: 'auto' }}
                            >
                                {/* Box Image Container */}
                                <div className="relative w-36 h-36 sm:w-44 sm:h-44 md:w-56 md:h-56 mb-5 overflow-hidden rounded-xl border border-gray-100 shadow-sm group-hover:shadow-md transition-all duration-500">
                                    <img
                                        src={cat.icon || '/Placeholder.png'}
                                        alt={cat.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    {/* Subtle Overlay */}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500"></div>
                                </div>
                                {/* Category Name */}
                                <span className="text-sm sm:text-base font-bold text-gray-800 text-center max-w-[140px] sm:max-w-[180px] leading-tight group-hover:text-black transition-colors">
                                    {cat.name}
                                </span>
                            </button>
                        ))
                    )}
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
