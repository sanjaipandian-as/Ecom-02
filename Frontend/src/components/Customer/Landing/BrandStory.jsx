import { useState, useEffect, useRef } from 'react';
import { FaCheckCircle, FaStar, FaArrowRight } from 'react-icons/fa';

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
                SECTION 1 — BRAND STORY  
            ═══════════════════════════════════════════ */}
            <section ref={s1} className="relative bg-emerald-deep overflow-hidden">

                {/* background ambience */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -top-40 right-0 w-[700px] h-[700px] rounded-full bg-gold-champagne/[0.035] blur-[160px]" />
                    <div className="absolute bottom-0 -left-32 w-[500px] h-[500px] rounded-full bg-gold-champagne/[0.025] blur-[120px]" />
                </div>

                <div className="relative max-w-[1320px] mx-auto px-6 sm:px-10 lg:px-16 py-16 sm:py-20 lg:py-24">

                    {/* Top accent line */}
                    <div style={anim(s1In, 0)} className="flex items-center gap-4 mb-10">
                        <span className="w-14 h-[2px] bg-gold-champagne/50 rounded-full" />
                        <span className="text-[13px] sm:text-sm font-bold uppercase tracking-[0.35em] text-gold-champagne">
                            About Plenora
                        </span>
                    </div>

                    {/* Big headline — editorial style */}
                    <h2
                        style={anim(s1In, 0.08)}
                        className="text-[36px] sm:text-[50px] lg:text-[62px] font-bold leading-[1.08] tracking-tight text-white max-w-4xl mb-10"
                    >
                        Where Science Meets{' '}
                        <span className="text-gold-champagne">Beautiful Skin.</span>
                    </h2>

                    {/* Two-column editorial body */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20 mb-10">
                        <p
                            style={anim(s1In, 0.16)}
                            className="text-[17px] sm:text-[19px] lg:text-[21px] leading-[1.75] text-[#b8c8c0] font-light"
                        >
                            Plenora Scientific Skin is a skincare brand dedicated to combining the power of science with the purity of thoughtfully selected ingredients. Our mission is to create effective, high-quality skincare solutions that nourish, protect, and enhance your skin's natural beauty.
                        </p>
                        <p
                            style={anim(s1In, 0.24)}
                            className="text-[17px] sm:text-[19px] lg:text-[21px] leading-[1.75] text-[#b8c8c0] font-light"
                        >
                            Every formula is developed with a focus on innovation, safety, and visible results — helping you achieve healthy, radiant skin with confidence. We believe skincare should be both a science and a ritual.
                        </p>
                    </div>

                    {/* Separator */}
                    <div style={anim(s1In, 0.3)} className="w-full h-px bg-gradient-to-r from-gold-champagne/30 via-gold-champagne/10 to-transparent mb-10" />

                    {/* Three stats / pillars — horizontal strip */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-6 lg:gap-12">
                        {[
                            { number: '100%', label: 'Science-Driven Formulas', sub: 'Clinically researched & dermatologist tested' },
                            { number: 'Pure', label: 'Selected Ingredients', sub: 'Botanical purity meets active compounds' },
                            { number: 'Safe', label: 'Effective Results', sub: 'Innovation, safety & visible transformation' },
                        ].map((item, i) => (
                            <div
                                key={item.label}
                                style={anim(s1In, 0.35 + i * 0.1)}
                                className="group"
                            >
                                <p className="text-[38px] sm:text-[44px] lg:text-[52px] font-bold text-gold-champagne leading-none mb-3 tracking-tight">
                                    {item.number}
                                </p>
                                <p className="text-[16px] sm:text-[18px] font-semibold text-white mb-1.5 tracking-wide uppercase">
                                    {item.label}
                                </p>
                                <p className="text-[14px] sm:text-[15px] text-[#8a9e94] leading-relaxed">
                                    {item.sub}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Tagline */}
                    <p
                        style={{ opacity: s1In ? 1 : 0, transition: 'opacity 1.2s ease 0.9s' }}
                        className="mt-12 text-[13px] sm:text-[14px] font-semibold uppercase tracking-[0.4em] text-gold-champagne/50 text-center"
                    >
                        Plenora Scientific Skin — Where Science Meets Beautiful Skin.
                    </p>
                </div>
            </section>

            {/* ═══════════════════════════════════════════
                SECTION 1.5 — FOUNDER'S NOTE  
            ═══════════════════════════════════════════ */}
            <section className="relative bg-white overflow-hidden py-20 sm:py-28 lg:py-32">
                <div className="relative max-w-[1320px] mx-auto px-6 sm:px-10 lg:px-16">
                    <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
                        
                        {/* Left: Founder Image (Matches text height on desktop) */}
                        <div className="w-full lg:w-[48%] relative rounded-[24px] overflow-hidden aspect-[4/5] sm:aspect-[4/3] lg:aspect-auto lg:self-stretch shadow-2xl flex-shrink-0">
                            <img 
                                src="/PlenoraFounder.jpeg" 
                                alt="Founder" 
                                className="w-full h-full object-cover"
                            />
                            {/* Overlay text */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent flex flex-col justify-end p-8 sm:p-10">
                                <h3 className="text-white text-2xl sm:text-3xl lg:text-4xl font-bold font-serif">
                                    Priya Sharma
                                </h3>
                                <p className="text-white/90 text-[13px] sm:text-sm font-semibold uppercase tracking-[0.2em] mt-2">
                                    Founder at Plenora
                                </p>
                            </div>
                        </div>

                        {/* Right: Content (Skincare story) */}
                        <div className="w-full lg:w-[52%] flex flex-col justify-center">
                            <h2 className="text-[28px] sm:text-[34px] lg:text-[38px] font-bold leading-[1.2] text-[#8b9d83] mb-6 tracking-tight font-serif">
                                The Story Behind Plenora Scientific Skin
                            </h2>
                            <div className="text-stone-600 text-sm sm:text-[15px] leading-relaxed space-y-4 font-sans opacity-95">
                                <p>
                                    My passion for skincare began in childhood. I always loved caring for others and helping them achieve healthy, confident skin. That passion eventually became my purpose, leading me to create Plenora Scientific Skin—a brand that combines the power of nature with science to develop skin-friendly, effective skincare solutions.
                                </p>
                                <p>
                                    Our journey has been filled with love and trust from our customers. Our Red Wine Facial Kit became a viral favorite, earning countless positive reviews and heartfelt compliments. Seeing the confidence our products bring to people's lives inspires us to keep innovating.
                                </p>
                                <p>
                                    Skincare is deeply personal to me because I have walked the same path as many of our customers. During my teenage years, I struggled with severe acne, trying countless products without finding lasting results. That experience motivated me to research, formulate, and develop our Acne Clear Kit with the goal of helping others overcome the same challenges.
                                </p>
                                <p>
                                    Today, the overwhelming positive feedback and success stories from our customers remind us why we started. Every product we create is carefully formulated with skin-friendly ingredients, backed by thoughtful research, and made with one mission—to help people feel confident in their own skin.
                                </p>
                                <p className="font-semibold text-[#6d7c67] font-serif italic text-[15px]">
                                    "At Plenora Scientific Skin, we don't just create skincare products; we create solutions inspired by real experiences, driven by science, and made with care."
                                </p>
                            </div>
                            <div className="mt-8">
                                <button
                                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                    className="inline-flex items-center justify-center bg-[#8b9d83] hover:bg-[#7a8a73] text-white rounded-[8px] px-7 py-3.5 text-[14px] sm:text-[15px] font-bold tracking-wide transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
                                >
                                    Explore Founder's Picks
                                </button>
                            </div>
                        </div>

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

                <div className="relative max-w-[1320px] mx-auto px-6 sm:px-10 lg:px-16 py-24 sm:py-32 lg:py-36">
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
