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
                            "Because true beauty is not just about what you wear… It’s about how confidently you shine."
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
                                Born from a dream to make every girl shine
                            </h2>
                            <div className="h-1.5 w-16 bg-gold-lustrous rounded-full" />
                            <p className="text-sm font-semibold tracking-wider text-gold-lustrous uppercase">
                                Confidence & Self-Love
                            </p>
                        </div>

                        {/* Content Paragraphs */}
                        <div className="lg:col-span-7 text-stone-700 space-y-6 text-sm sm:text-base leading-relaxed">
                            <p className="font-semibold text-emerald-deep text-base sm:text-lg">
                                Plenora was born from the dream of a woman who believed that every girl deserves to feel beautiful, confident, and special every single day.
                            </p>
                            <p>
                                Behind this brand is not just a business… It’s a journey of passion, courage, and hard work. ✨
                            </p>
                            <p>
                                From small beginnings and big dreams, Plenora was created to bring elegant, premium anti-tarnish jewellery that helps women shine without worrying about fading trends or losing sparkle. 💎
                            </p>
                            <p>
                                We believe jewellery is more than an accessory. It’s confidence. It’s self-love. It’s the little sparkle that reminds a woman of her strength and beauty. 🌸
                            </p>
                            <p>
                                Every chain, ring, bracelet, and earring is chosen with love for women who dream big, work hard, and glow through every phase of life. At Plenora, we celebrate every woman — her confidence, her independence, and her story.
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
                            A Journey of Ambition & Courage
                        </h2>

                        <div className="relative rounded-3xl border border-gold-champagne/20 bg-cream-soft p-6 sm:p-10 shadow-sm max-w-3xl mx-auto">
                            <p className="text-base sm:text-lg italic text-stone-850 leading-relaxed font-serif">
                                “She started with nothing but a dream in her heart and courage in her soul. 💖 There were days filled with doubts, struggles, and people who said, ‘It’s impossible.’ But she believed one thing — A strong woman can create her own shine. ✨”
                            </p>
                        </div>

                        <div className="text-stone-700 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto space-y-6 pt-4">
                            <p>
                                Instead of giving up, she turned her passion into purpose. She wanted to create something beautiful… not just jewellery, but confidence for every woman who wears it. 💎
                            </p>
                            <p>
                                That’s why **Plenora Anti-Tarnish** was created — a brand for women who work hard, dream fearlessly, and never stop glowing. 🌸
                            </p>
                            <p>
                                Every anti-tarnish piece is designed to remind women that elegance is not about price… it’s about confidence. Whether you’re a student, working woman, business owner, homemaker, or dreamer — you deserve to feel beautiful every single day. 💕
                            </p>
                            <p className="font-semibold text-emerald-light text-base sm:text-lg">
                                This is more than a jewellery brand. It’s a journey of ambition, self-love, and women empowering women. ✨ Because when a woman believes in herself… she becomes unstoppable. 💖
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
                            <h4 className="text-lg font-bold text-emerald-deep font-serif">Premium Anti-Tarnish</h4>
                            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                                Our collection features high-grade anti-tarnish materials designed to keep their brilliance and sparkle through daily wear and active lifestyles.
                            </p>
                        </div>

                        {/* Card 2 */}
                        <div className="bg-white border border-gold-champagne/15 rounded-2xl p-8 space-y-4 hover:shadow-lg transition-all duration-300">
                            <div className="w-12 h-12 rounded-xl bg-gold-light/40 flex items-center justify-center text-gold-lustrous">
                                <FiHeart className="w-6 h-6" />
                            </div>
                            <h4 className="text-lg font-bold text-emerald-deep font-serif">Confidence In Every Gift</h4>
                            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                                We curate rings, necklaces, bracelets, and earrings that reflect strength and self-love, making them the perfect reminder of your personal worth.
                            </p>
                        </div>

                        {/* Card 3 */}
                        <div className="bg-white border border-gold-champagne/15 rounded-2xl p-8 space-y-4 hover:shadow-lg transition-all duration-300">
                            <div className="w-12 h-12 rounded-xl bg-gold-light/40 flex items-center justify-center text-gold-lustrous">
                                <FiAward className="w-6 h-6" />
                            </div>
                            <h4 className="text-lg font-bold text-emerald-deep font-serif">Women Empowering Women</h4>
                            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                                A community-centered brand supporting ambition and independence. We celebrate women dreamers, doers, homemakers, and leaders everywhere.
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
                                <p className="text-stone-600 text-sm">hello@plenora.com</p>
                            </div>
                            <div className="bg-white border border-gold-champagne/10 rounded-2xl p-6">
                                <p className="font-bold text-emerald-deep mb-1 text-sm uppercase tracking-wider">Phone Support</p>
                                <p className="text-stone-600 text-sm">+91 98765 43210</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-20 bg-emerald-deep text-white text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(197,168,128,0.1),transparent_40%)]" />
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
                        <h2 className="text-3xl sm:text-4xl font-bold font-serif">Ready to find your sparkle?</h2>
                        <p className="text-stone-300 text-sm sm:text-base max-w-xl mx-auto">
                            Explore our curated anti-tarnish jewelry collections chosen with love to empower your everyday look.
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
