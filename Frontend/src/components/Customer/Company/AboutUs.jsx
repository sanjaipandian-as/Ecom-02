import { FiHeart, FiStar, FiAward, FiSmile } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import Topbar from '../Topbar';
import Footer from '../Footer';

const AboutUs = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col w-full min-h-screen bg-cream-soft">
            <Topbar />

            <main className="flex-1 w-full bg-cream-soft">
                {/* Hero Header */}
                <section className="py-20 text-center relative overflow-hidden bg-gradient-to-b from-emerald-deep to-emerald-dark text-white px-4 sm:px-6 lg:px-8">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(197,168,128,0.15),transparent_45%)]" />
                    <div className="max-w-4xl mx-auto relative z-10 space-y-4">
                        <p className="text-gold-lustrous text-xs font-bold uppercase tracking-[0.3em] animate-fade-in">Established with Love</p>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight font-serif flex items-center justify-center gap-3 flex-wrap">
                            <span className="bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#AA771C] bg-clip-text text-transparent font-serif uppercase tracking-wider font-extrabold">
                                Plenora
                            </span>
                            <span className="text-gold-lustrous">— Our Story ✨</span>
                        </h1>
                        <p className="text-stone-300 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-sans pt-2">
                            "Because true beauty starts with healthy, happy skin… It’s about glowing with confidence every single day."
                        </p>
                    </div>
                </section>

                {/* The Brand Story Section */}
                <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
                        
                        {/* Left Column: Founder Image & Quote Badge */}
                        <div className="lg:col-span-5 space-y-6">
                            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-gold-champagne/20 group">
                                <img 
                                    src="/PlenoraFounder.jpeg" 
                                    alt="Founder of Plenora Scientific Skin" 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                {/* Overlay text */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 sm:p-8">
                                    <span className="text-gold-lustrous text-xs font-bold uppercase tracking-[0.2em] mb-1">Founder's Note</span>
                                    <h3 className="text-white text-2xl sm:text-3xl font-serif font-bold">
                                        Pavithra
                                    </h3>
                                    <p className="text-stone-300 text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] mt-1">
                                        Founder, Plenora Scientific Skin
                                    </p>
                                </div>
                            </div>

                            {/* Philosophy Callout */}
                            <div className="bg-white border border-gold-champagne/15 rounded-2xl p-6 shadow-sm flex items-start gap-4">
                                <span className="p-3 rounded-xl bg-gold-light/50 border border-gold-champagne/20 text-gold-lustrous flex-shrink-0">
                                    <FiHeart className="w-6 h-6 animate-pulse" />
                                </span>
                                <div>
                                    <h4 className="text-stone-500 text-xs uppercase tracking-wider font-bold">Our Philosophy</h4>
                                    <p className="text-emerald-deep font-serif text-sm font-semibold mt-1">
                                        Empowering you to feel confident and beautiful in your own skin.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Founder's Narrative */}
                        <div className="lg:col-span-7 space-y-6">
                            <div className="space-y-2">
                                <span className="text-gold-lustrous text-xs font-bold uppercase tracking-[0.3em] block">Our Journey</span>
                                <h2 className="text-3xl sm:text-4xl font-bold text-emerald-deep font-serif leading-tight">
                                    The Story Behind Plenora Scientific Skin
                                </h2>
                                <div className="h-1 w-20 bg-gold-lustrous rounded-full" />
                            </div>

                            <div className="text-stone-750 text-sm sm:text-base leading-relaxed space-y-5 font-sans">
                                <p className="font-semibold text-emerald-deep text-base sm:text-lg leading-relaxed">
                                    My passion for skincare began in childhood. I always loved caring for others and helping them achieve healthy, confident skin. That passion eventually became my purpose, leading me to create Plenora Scientific Skin—a brand that combines the power of nature with science to develop skin-friendly, effective skincare solutions.
                                </p>
                                
                                <p>
                                    Skincare is deeply personal to me because I have walked the same path as many of our customers. During my teenage years, I struggled with severe acne, trying countless products without finding lasting results. That experience motivated me to research, formulate, and develop our <strong className="text-emerald-deep font-bold">Acne Clear Kit</strong> with the goal of helping others overcome the same challenges.
                                </p>

                                <p>
                                    Our journey has been filled with love and trust from our customers. Our <strong className="text-emerald-deep font-bold">Red Wine Facial Kit</strong> became a viral favorite, earning countless positive reviews and heartfelt compliments. Seeing the confidence our products bring to people's lives inspires us to keep innovating.
                                </p>

                                <p>
                                    Today, the overwhelming positive feedback and success stories from our customers remind us why we started. Every product we create is carefully formulated with skin-friendly ingredients, backed by thoughtful research, and made with one mission—to help people feel confident in their own skin.
                                </p>

                                <div className="border-l-4 border-gold-lustrous bg-white/70 p-5 rounded-r-2xl shadow-sm italic text-emerald-deep font-serif font-medium leading-relaxed my-6">
                                    "At Plenora Scientific Skin, we don't just create skincare products; we create solutions inspired by real experiences, driven by science, and made with care."
                                </div>
                            </div>
                        </div>

                    </div>
                </section>


                {/* Core Brand Pillars */}
                <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h3 className="text-center text-2xl sm:text-3xl font-bold text-emerald-deep font-serif mb-12">
                        What We Promise You
                    </h3>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Card 1 */}
                        <div className="bg-white border border-gold-champagne/15 rounded-2xl p-8 space-y-4 hover:shadow-lg transition-all duration-300">
                            <div className="w-12 h-12 rounded-xl bg-gold-light/40 flex items-center justify-center text-gold-lustrous">
                                <FiStar className="w-6 h-6" />
                            </div>
                            <h4 className="text-lg font-bold text-emerald-deep font-serif">Science-Driven Formulas</h4>
                            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                                Our skincare products are backed by scientific research and dermatologist testing to ensure safety, potency, and visible results.
                            </p>
                        </div>

                        {/* Card 2 */}
                        <div className="bg-white border border-gold-champagne/15 rounded-2xl p-8 space-y-4 hover:shadow-lg transition-all duration-300">
                            <div className="w-12 h-12 rounded-xl bg-gold-light/40 flex items-center justify-center text-gold-lustrous">
                                <FiHeart className="w-6 h-6" />
                            </div>
                            <h4 className="text-lg font-bold text-emerald-deep font-serif">Skin Friendly Ingredients</h4>
                            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                                We formulate our products with pure, skin-friendly botanical ingredients and active compounds, free from harsh chemicals and preservatives.
                            </p>
                        </div>

                        {/* Card 3 */}
                        <div className="bg-white border border-gold-champagne/15 rounded-2xl p-8 space-y-4 hover:shadow-lg transition-all duration-300">
                            <div className="w-12 h-12 rounded-xl bg-gold-light/40 flex items-center justify-center text-gold-lustrous">
                                <FiAward className="w-6 h-6" />
                            </div>
                            <h4 className="text-lg font-bold text-emerald-deep font-serif">Empowering Your Skin Journey</h4>
                            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                                A brand built on real experiences and shared stories. We are here to guide you toward skin health, self-care, and ultimate confidence.
                            </p>
                        </div>
                    </div>
                </section>

                {/* HQ & Location Details */}
                <section className="py-16 bg-cream-dark/30 border-t border-gold-champagne/10">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
                        <h3 className="text-2xl font-bold text-emerald-deep font-serif">Connect With Us</h3>
                        <p className="text-stone-600 text-sm max-w-md mx-auto">
                            Have questions or want to collaborate? Our support team is here to assist you.
                        </p>

                        <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto pt-4">
                            <div className="bg-white border border-gold-champagne/10 rounded-2xl p-6">
                                <p className="font-bold text-emerald-deep mb-1 text-sm uppercase tracking-wider">Email Address</p>
                                <p className="text-stone-600 text-sm">plenorascientificskin@gmail.com</p>
                            </div>
                            <div className="bg-white border border-gold-champagne/10 rounded-2xl p-6">
                                <p className="font-bold text-emerald-deep mb-1 text-sm uppercase tracking-wider">Phone Support</p>
                                <p className="text-stone-600 text-sm">+91 74488 33345</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-20 bg-emerald-deep text-white text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(197,168,128,0.1),transparent_40%)]" />
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
                        <h2 className="text-3xl sm:text-4xl font-bold font-serif">Ready to start your skin journey?</h2>
                        <p className="text-stone-300 text-sm sm:text-base max-w-xl mx-auto">
                            Explore our clinically researched, botanical skincare collections crafted to reveal your natural glow.
                        </p>
                        <button
                            onClick={() => navigate('/products')}
                            className="bg-white hover:bg-gold-light text-emerald-deep font-bold text-xs uppercase tracking-[0.2em] py-4 px-10 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer border border-gold-champagne/10"
                        >
                            Shop Collections
                        </button>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default AboutUs;
