import { useState, useEffect, useRef } from 'react';
import { FaCheckCircle, FaStar, FaArrowRight } from 'react-icons/fa';
import { Sun, FlaskConical, Feather, Leaf, ShieldCheck, Sparkles } from 'lucide-react';

const useInView = (threshold = 0.12) => {
    const [isInView, setIsInView] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) { setIsInView(true); obs.unobserve(e.target); } },
            { threshold }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, [threshold]);
    return [ref, isInView];
};

const anim = (inView, delay = 0) => ({
    opacity: inView ? 1 : 0,
    transform: inView ? 'translateY(0)' : 'translateY(32px)',
    transition: `all 0.85s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
});

const BrandStory = () => {
    const [s1, s1In] = useInView();
    const [s2, s2In] = useInView();

    const benefits = [
        'Brightens dull and tired-looking skin',
        'Deeply hydrates and nourishes',
        'Improves skin texture and smoothness',
        'Promotes an even, radiant complexion',
        'Suitable for most skin types',
        'Ideal for everyday skincare',
    ];

    return (
        <div className="w-full">


            {/* ═══════════════════════════════════════════
                SECTION 1.5 — FOUNDER'S NOTE  
            ═══════════════════════════════════════════ */}
            <section className="relative bg-white overflow-hidden pt-8 sm:pt-12 lg:pt-16 pb-8 sm:pb-12 lg:pb-16">
                <div className="relative max-w-[1320px] mx-auto px-6 sm:px-10 lg:px-16">
                    <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">

                        {/* Left: Founder Image (Matches text height on desktop) */}
                        {/* Left: Founder Image */}
                        <div className="w-[90%] sm:w-[75%] md:w-[65%] lg:w-[42%] relative rounded-[24px] overflow-hidden aspect-[4/5] shadow-2xl flex-shrink-0 mx-auto lg:mx-0">
                            <img 
                                src="/PlenoraFounder.jpeg" 
                                alt="Founder" 
                                className="w-full h-full object-cover"
                            />
                            {/* Overlay text */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 sm:p-10">
                                <h3 className="text-white text-2xl sm:text-3xl font-bold font-serif">
                                    Pavithra
                                </h3>
                                <p className="text-white/90 text-[12px] sm:text-[13px] font-semibold uppercase tracking-[0.2em] mt-2">
                                    Founder at Plenora
                                </p>
                            </div>
                        </div>

                        {/* Right: Content (Skincare story) */}
                        <div className="w-full lg:w-[58%] flex flex-col justify-center lg:pl-10">
                            <h2 className="text-[32px] sm:text-[40px] lg:text-[44px] font-bold leading-[1.1] text-[#b38e55] mb-6 tracking-tight font-serif">
                                The Story Behind Plenora Scientific Skin
                            </h2>
                            
                            <div className="space-y-4 text-stone-600 text-base sm:text-lg leading-[1.7] mb-8 opacity-90 max-w-[700px]">
                                <p>My passion for skincare began in childhood. I always loved caring for others and helping them achieve healthy, confident skin. That passion eventually became my purpose, leading me to create Plenora Scientific Skin—a brand that combines the power of nature with science to develop skin-friendly, effective skincare solutions.</p>
                                <p>Our journey has been filled with love and trust from our customers. Our <strong>Red Wine Glow Kit</strong> became a viral favorite, earning countless positive reviews and heartfelt compliments. Seeing the confidence our products bring to people's lives inspires us to keep innovating.</p>
                                <p>Skincare is deeply personal to me because I have walked the same path as many of our customers. During my teenage years, I struggled with severe acne, trying countless products without finding lasting results. That experience motivated me to research, formulate, and develop our Acne Clear Kit with the goal of helping others overcome the same challenges.</p>
                                <p>Today, the overwhelming positive feedback and success stories from our customers remind us why we started. Every product we create is carefully formulated with skin-friendly ingredients, backed by thoughtful research, and made with one mission—to help people feel confident in their own skin.</p>
                                <p>At Plenora Scientific Skin, we don't just create skincare products; we create solutions inspired by real experiences, driven by science, and made with care.</p>
                            </div>
                        </div>



                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════
                SECTION 1.6 — TRUST BADGES  
            ═══════════════════════════════════════════ */}
            <section className="bg-white pt-6 sm:pt-10 lg:pt-12 pb-10 sm:pb-12 lg:pb-16 border-b border-[#f2ebe1]">
                <div className="max-w-[1320px] mx-auto px-6 sm:px-10 lg:px-16 text-center">
                    <h2 className="text-2xl sm:text-3xl md:text-[34px] font-serif font-bold text-[#b38e55] mb-12 lg:mb-20">
                        Grounded In Nature, Growing With Science
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-10">
                        {[
                            { label: 'Made for Indian Skintone', icon: Sun },
                            { label: 'No Harsh Chemicals', icon: FlaskConical },
                            { label: 'Gentle and Effective', icon: Feather },
                            { label: 'Skin Friendly Ingredients', icon: Leaf },
                            { label: 'No Harsh Preservatives', icon: ShieldCheck },
                            { label: 'Parabens & Sulphate Free', icon: Sparkles }
                        ].map((item, i) => (
                            <div key={item.label} className="flex flex-col items-center">
                                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border border-stone-300 flex items-center justify-center mb-5 hover:border-[#b38e55] transition-colors duration-300 group shadow-sm bg-white">
                                    <item.icon className="w-8 h-8 sm:w-10 sm:h-10 text-stone-500 stroke-[1.25] group-hover:text-[#b38e55] transition-colors duration-300" />
                                </div>
                                <h4 className="text-[14px] sm:text-[16px] font-bold text-stone-900 font-sans text-center leading-snug">
                                    {item.label}
                                </h4>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════
                SECTION 2 — BESTSELLING SKIN GLOW KIT  
            ═══════════════════════════════════════════ */}
            <section ref={s2} className="relative bg-[#faf9f6] overflow-hidden">

                {/* subtle warmth */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-1/2 w-[900px] h-[500px] rounded-full bg-gold-champagne/[0.045] blur-[180px] -translate-x-1/2 -translate-y-1/3" />
                </div>

                <div className="relative max-w-[1320px] mx-auto px-6 sm:px-10 lg:px-16 pt-12 sm:pt-16 lg:pt-20 pb-12 sm:pb-16 lg:pb-20">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-14 lg:gap-20 items-start">

                        {/* Left column — 3 of 5 */}
                        <div className="lg:col-span-3" style={anim(s2In, 0)}>

                            {/* Eyebrow */}
                            <div className="flex items-center gap-3 mb-6">
                                <FaStar className="w-4 h-4 text-gold-lustrous" />
                                <span className="text-[13px] sm:text-[14px] font-bold uppercase tracking-[0.3em] text-gold-lustrous">
                                    Bestseller
                                </span>
                            </div>

                            {/* Title */}
                            <h2
                                style={anim(s2In, 0.08)}
                                className="text-[34px] sm:text-[46px] lg:text-[56px] font-bold leading-[1.1] tracking-tight text-emerald-deep mb-6"
                            >
                                Bestselling Skin{' '}
                                <span className="text-gold-lustrous">Glow Kit</span>
                            </h2>

                            {/* Description */}
                            <p
                                style={anim(s2In, 0.16)}
                                className="text-[17px] sm:text-[19px] lg:text-[21px] leading-[1.75] text-stone-500 max-w-2xl mb-12"
                            >
                                Experience the perfect blend of science and skincare with the Plenora Scientific Skin Bestselling Skin Glow Kit — your daily ritual for naturally glowing, healthy-looking skin.
                            </p>

                            {/* CTA */}
                            <div style={anim(s2In, 0.24)}>
                                <button
                                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                    className="group inline-flex items-center gap-4 bg-emerald-deep hover:bg-emerald-dark text-white rounded-full px-9 py-4 text-[14px] sm:text-[15px] font-bold uppercase tracking-[0.2em] transition-all duration-400 hover:shadow-xl hover:shadow-emerald-deep/15 active:scale-[0.97]"
                                >
                                    Explore Collection
                                    <FaArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1.5" />
                                </button>
                            </div>
                        </div>

                        {/* Right column — Benefits — 2 of 5 */}
                        <div className="lg:col-span-2" style={anim(s2In, 0.2)}>

                            <h4
                                style={anim(s2In, 0.22)}
                                className="text-[13px] sm:text-[14px] font-bold uppercase tracking-[0.3em] text-emerald-deep mb-8"
                            >
                                Key Benefits
                            </h4>

                            <ul className="space-y-5">
                                {benefits.map((b, i) => (
                                    <li
                                        key={i}
                                        className="flex items-start gap-4"
                                        style={anim(s2In, 0.28 + i * 0.06)}
                                    >
                                        <FaCheckCircle className="w-5 h-5 sm:w-[22px] sm:h-[22px] text-emerald-deep mt-0.5 flex-shrink-0" />
                                        <span className="text-[15px] sm:text-[17px] lg:text-[18px] leading-[1.5] text-stone-600 font-medium">
                                            {b}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            {/* small separator */}
                            <div
                                style={anim(s2In, 0.7)}
                                className="mt-10 flex gap-2"
                            >
                                {[...Array(4)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="h-[3px] rounded-full bg-gold-champagne"
                                        style={{
                                            width: i === 0 ? 32 : i === 1 ? 20 : i === 2 ? 12 : 8,
                                            opacity: 0.6 - i * 0.12,
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default BrandStory;
