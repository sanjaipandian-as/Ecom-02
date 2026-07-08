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

                {/* Chapter 1: The Vision */}
                <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-12 gap-12 items-start">
                        {/* Quote Statement */}
                        <div className="lg:col-span-5 space-y-6">
                            <span className="inline-block p-3 rounded-2xl bg-gold-light/50 border border-gold-champagne/20 text-gold-lustrous">
                                <FiHeart className="w-6 h-6" />
                            </span>
                            <h2 className="text-3xl sm:text-4xl font-bold text-emerald-deep font-serif leading-tight">
                                Born from a dream to make every skin glow
                            </h2>
                            <div className="h-1.5 w-16 bg-gold-lustrous rounded-full" />
                            <p className="text-sm font-semibold tracking-wider text-gold-lustrous uppercase">
                                Science, Purity & Self-Love
                            </p>
                        </div>

                        {/* Content Paragraphs */}
                        <div className="lg:col-span-7 text-stone-700 space-y-6 text-sm sm:text-base leading-relaxed">
                            <p className="font-semibold text-emerald-deep text-base sm:text-lg">
                                Plenora Scientific Skin was born from the dream of a woman who believed that everyone deserves to feel beautiful, confident, and comfortable in their own skin every single day.
                            </p>
                            <p>
                                Behind this brand is not just a business… It’s a journey of passion, scientific research, and dedication to skin health. ✨
                            </p>
                            <p>
                                From small beginnings and big dreams, Plenora was created to deliver clean, dermatologist-tested, and highly effective skincare solutions that help you glow without worrying about harsh chemicals or preservatives. 🌿
                            </p>
                            <p>
                                We believe skincare is more than a routine. It’s self-care. It’s the daily ritual that protects, heals, and reminds you of your natural radiance and strength. 🌸
                            </p>
                            <p>
                                Every serum, cream, cleanser, and facial kit is formulated with love for people who want healthy, radiant skin. At Plenora, we celebrate every skin type — its uniqueness, its resilience, and its journey.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Chapter 2: The Founder's Journey */}
                <section className="py-16 bg-white border-y border-gold-champagne/15">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
                        <span className="inline-block p-3 rounded-2xl bg-cream-base border border-gold-champagne/15 text-gold-lustrous">
                            <FiStar className="w-6 h-6 animate-pulse" />
                        </span>

                        <h2 className="text-3xl font-bold text-emerald-deep font-serif">
                            A Journey of Ambition & Science
                        </h2>

                        <div className="relative rounded-3xl border border-gold-champagne/20 bg-cream-soft p-6 sm:p-10 shadow-sm max-w-3xl mx-auto">
                            <p className="text-base sm:text-lg italic text-stone-850 leading-relaxed font-serif">
                                “She started with nothing but a dream in her heart and courage in her soul. 💖 Struggling with skin issues herself, she believed one thing — True beauty is backed by science and nurtured by nature. ✨”
                            </p>
                        </div>

                        <div className="text-stone-700 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto space-y-6 pt-4">
                            <p>
                                Instead of giving up, she turned her passion into purpose. Having struggled with severe acne in her youth, she set out to create real solutions—not just products, but confidence for everyone who uses them. 🧪
                            </p>
                            <p>
                                That’s why **Plenora Scientific Skin** was created — a brand for people who value clean beauty, scientific innovation, and healthy skin that glows naturally. 🌸
                            </p>
                            <p>
                                Every product, from our viral Red Wine Facial Kit to our targeted Acne Clear Kit, is designed to remind you that healthy skin is a journey. Whether you are addressing acne, dullness, or simply maintaining your glow — you deserve gentle, effective care every single day. 💕
                            </p>
                            <p className="font-semibold text-emerald-light text-base sm:text-lg">
                                This is more than a skincare brand. It’s a journey of science, self-love, and empowerment. ✨ Because when you feel good in your skin, you become unstoppable. 💖
                            </p>
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
