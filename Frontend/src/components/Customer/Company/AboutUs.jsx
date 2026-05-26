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
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight font-serif flex items-center justify-center gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 170 89" className="h-12 sm:h-16 w-auto shrink-0">
                                <defs>
                                    <linearGradient id="shiningGoldAbout" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#BF953F" />
                                        <stop offset="25%" stopColor="#FCF6BA" />
                                        <stop offset="50%" stopColor="#B38728" />
                                        <stop offset="75%" stopColor="#FBF5B7" />
                                        <stop offset="100%" stopColor="#AA771C" />
                                    </linearGradient>
                                </defs>
                                <path fill="url(#shiningGoldAbout)" d="m73.5 13.3c0-6.4 2.1-10.7 8.1-10.7v-1h-30.4v1c5.6 0 8.5 2.4 8.5 10.4v25.3h-36.7v-25.3c0-6.1 1.8-10.5 8-10.5v-0.9h-29.2v0.9c4.7 0 7.3 2.4 7.3 9.2v61.4c0 7.2-2.5 10.2-7.4 10.3v1h29.3v-0.9c-5-0.1-8-1.7-8-10.7v-30.9h36.7v30.5c0 8.2-2.7 11-8.5 11.1v0.9h42.3v-0.9c-2.5 0-4.6-1.1-4.6-3.8 0-2.3 0.6-4.6 1.5-6.7l8.9-22.4c-1.1 0-2.5 0.2-3.6 0.5l-9.8 23.3c-1.8 4.4-4.2 8.7-7.1 8.7-2.6 0-5.3-2.1-5.3-10.5v-59.3z"/>
                                <path fill="url(#shiningGoldAbout)" d="m152.9 75.9-5.9-12.3v-0.1l-0.6-1.4c-1.7-0.5-3-1.6-3.7-2.4-1.4-1.6-4.6-1.8-4.6-1.5 0.7 0.2 3.2-0.2 4.7 1.4 1.7 1.7 3.8 2.7 6.3 2.8 1.9 0.1 5.8-0.3 8-0.3-2.4-1-5.1-6-9.5-5.8-1.4-0.1-2.5 0.2-3.3 0.4l0.6 0.1h-0.8-0.1-0.4l-0.1-1.5c2.9-1.2 7.3-3 9.1-2.1 1.8 1 4 1.7 6.7 1.8 5.3 0 7.2-2.9 10.6-3.1l0.1-0.3c-3-0.2-4.7-2.6-7.4-2.8-3.5-0.8-5-1.2-10.5 2.3l-0.4 0.3c-2.4 0.9-5.3 1.1-8.8 2.8h-0.3l0.3 0.1h0.1-0.1-0.1-0.2-0.1-0.1-0.1l0.4-0.1-0.4 0.1 0.1-0.4-0.1-0.8c7.6-2.5 8.8-7.8 10.6-12.2l1.5-2.3c-3 2.3-9 2.4-12 6.8-1.5 2-2.1 4.2-1.9 6.7-0.7 4-3.9 5.5-5.9 6.9l2.5-2.5c1-0.9 1.9-2.5 2.4-3.6-0.2-1.6 0-2.9 0.3-4.1l-21.9-47.2h-1.4l-19.8 47c-4.6 1-9.3 3.7-11.9 6.8l0.1 0.4c3.2-3 9-5.9 14.5-5.9 3.6 0 7.6 3.4 7.9 7.5-0.4 0.2-0.7 0.5-0.7 1s0.3 0.8 0.7 1l-2.4 4.2h-1.3l-2.1 2.9c1.9 3.4 6.1 7.8 6.1 7.8s3.9-4.2 6-7.8l-2-2.9h-1.2l-2.6-4.2c0.4-0.1 0.7-0.5 0.7-1s-0.3-0.8-0.6-1c0-2.5-1.8-5.8-4.5-7.8 10 0 20 6.5 20 16 0 7.2-5.8 15.4-12.6 21.8h1.3c4.4-2.5 8.9-8.5 12.8-14.8 2.5-4.7 6.6-7.1 8.6-6.6h0.1l4.6 10.9c1.9 3.7-0.6 6.5-4.4 6.5v0.9h29.8v-0.8c-4.3 0-7.6-1.4-10.7-7.6zm-45.4-16.8c-0.4 0-0.6-0.3-0.6-0.6 0-0.4 0.2-0.7 0.6-0.7s0.6 0.3 0.6 0.7c0 0.3-0.2 0.6-0.6 0.6zm16 12c0.6-1.3 1-3.3 1-5.5 0-9.2-8.5-17.6-21.6-17.6h-2.4l12.1-29.9 18.8 43.4v0.1h0.1c-2.2 2.3-6.6 7-8 9.5zm5.5-5.2 3.1-3.1 0.8 2.1c-1 0-2.4 0.2-3.9 1z"/>
                            </svg>
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
                                HA was born from the dream of a woman who believed that every girl deserves to feel beautiful, confident, and special every single day.
                            </p>
                            <p>
                                Behind this brand is not just a business… It’s a journey of passion, courage, and hard work. ✨
                            </p>
                            <p>
                                From small beginnings and big dreams, HA was created to bring elegant, premium anti-tarnish jewellery that helps women shine without worrying about fading trends or losing sparkle. 💎
                            </p>
                            <p>
                                We believe jewellery is more than an accessory. It’s confidence. It’s self-love. It’s the little sparkle that reminds a woman of her strength and beauty. 🌸
                            </p>
                            <p>
                                Every chain, ring, bracelet, and earring is chosen with love for women who dream big, work hard, and glow through every phase of life. At HA, we celebrate every woman — her confidence, her independence, and her story.
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
                                That’s why **HA Anti-Tarnish** was created — a brand for women who work hard, dream fearlessly, and never stop glowing. 🌸
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
                                <p className="text-stone-600 text-sm">hello@heyyazhagi.com</p>
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
