import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../../../api';
import { 
  ChevronLeft, 
  ChevronRight, 
  ShieldCheck,
  ArrowRight,
  Star
} from 'lucide-react';
import placeholderImg from '../../../assets/Placeholder.png';

const Hero = () => {
  const navigate = useNavigate();
  const [heroProducts, setHeroProducts] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        setLoading(true);
        // Fetching actual hero slides from the dedicated hero endpoint
        const response = await API.get('/hero');
        const slides = response.data?.slides || [];
        setHeroProducts(slides);
      } catch (error) {
        console.error('Error fetching hero data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHeroData();
  }, []);

  // Auto-slide logic
  useEffect(() => {
    if (heroProducts.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroProducts.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroProducts.length]);

  const current = useMemo(() => heroProducts[currentSlide] || null, [heroProducts, currentSlide]);

  if (loading) {
    return (
      <div className="w-full h-[400px] lg:h-[500px] bg-gray-50 animate-pulse flex items-center justify-center">
        <div className="text-gray-300 font-bold uppercase tracking-widest">Loading Inspiration...</div>
      </div>
    );
  }

  if (!current) return null;

  // Use product data if linked, otherwise fallback to slide data
  const product = current.product;
  const image = current.image || (product?.images?.[0]) || placeholderImg;
  const name = product?.name || current.title || "Featured Product";
  const description = product?.description || current.desc || "Experience the ultimate in plant-based beauty.";
  const sellingPrice = product?.pricing?.selling_price || parseFloat(current.price) || 0;
  const mrp = product?.pricing?.mrp || sellingPrice;
  const discount = mrp > sellingPrice ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0;
  const rating = product?.averageRating || 4.8;
  const totalReviews = product?.totalReviews || 120;
  const productId = product?._id;
  const mainCategory = product?.category?.main || "";

  return (
    <section className="relative w-full bg-white overflow-hidden py-12 lg:py-16">
      
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          {/* Left Side: Product Showcase */}
          <div className="relative order-2 lg:order-1 flex justify-center lg:justify-start">
            <div 
              className="relative w-full max-w-[320px] lg:max-w-[380px] animate-fade-up cursor-pointer" 
              key={current._id}
              onClick={() => productId && navigate(`/product/${productId}`)}
            >
              {/* Product Image - Reduced size with better containment */}
              <div className="relative z-20 transition-transform duration-700">
                <div className="aspect-square lg:aspect-[4/5] overflow-hidden relative group rounded-2xl border border-gray-100 shadow-sm">
                  <img 
                    src={image} 
                    alt={name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {mainCategory && (
                    <div className="absolute top-6 left-0 bg-[#D32F2F] text-white text-[10px] font-black px-4 py-1.5 rounded-r-full uppercase tracking-widest shadow-md">
                      {mainCategory}
                    </div>
                  )}
                </div>
              </div>

              {/* Deal Badge - Adjusted position */}
              {current.badge && (
                <div className="absolute top-0 right-0 w-20 h-20 lg:w-24 lg:h-24 bg-[#FF9800] rounded-full flex flex-col items-center justify-center text-white shadow-2xl z-30 border-4 border-white transform translate-x-1/4 -translate-y-1/4">
                  <span className="text-[9px] lg:text-[10px] font-bold uppercase tracking-tighter leading-none">
                    {current.badge.split(' ')[0] || 'BEST'}
                  </span>
                  <span className="text-[11px] lg:text-[12px] font-bold uppercase leading-none">
                    {current.badge.split(' ')[1] || 'SELLER'}
                  </span>
                  <span className="text-[13px] lg:text-[14px] font-black uppercase leading-none">CHOICE</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Content in a framed box style similar to 2nd image */}
          <div className="order-1 lg:order-2 animate-fade-up" key={`content-${current._id}`}>
            <div className="relative p-8 lg:p-12 border-[3px] border-[#c5a880]/10 rounded-[3rem] bg-white shadow-sm hover:shadow-md transition-shadow">
              {/* Decorative Heart Element */}
              <div className="absolute top-1/2 -right-6 -translate-y-1/2 w-12 h-12 bg-white flex items-center justify-center rounded-full shadow-lg border border-red-50 z-20">
                <div className="w-9 h-9 rounded-full bg-red-500 flex items-center justify-center text-white text-lg shadow-inner">
                  ❤
                </div>
              </div>

              {/* Quote Icon at bottom */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white px-4">
                <div className="text-4xl text-[#4CAF50] font-serif opacity-40">❞</div>
              </div>

              <div className="space-y-8">
                <div className="flex items-start gap-6">
                  {/* Small product thumbnail in the box like 2nd image */}
                  <div 
                    className="w-16 h-16 lg:w-20 lg:h-20 rounded-full border-4 border-white shadow-lg overflow-hidden flex-shrink-0 bg-gray-50 cursor-pointer"
                    onClick={() => productId && navigate(`/product/${productId}`)}
                  >
                    <img src={image} alt="product thumbnail" className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-2 pt-2">
                    <h1 
                      className="text-3xl lg:text-4xl font-black text-gray-900 leading-tight cursor-pointer hover:text-[#8c6d45] transition-colors"
                      onClick={() => productId && navigate(`/product/${productId}`)}
                    >
                      {name}
                    </h1>
                    <div className="flex items-center gap-2">
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < Math.floor(rating) ? 'fill-current' : 'text-gray-200'}`} />
                        ))}
                      </div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{rating} ({totalReviews} Reviews)</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <p className="text-gray-700 text-lg lg:text-xl leading-relaxed font-medium">
                    {description?.slice(0, 150)}...
                  </p>

                  {/* Price and CTA */}
                  <div className="flex flex-wrap items-center justify-between gap-6 pt-6 border-t border-gray-100">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                        {discount > 0 ? `Save ${discount}% Today` : 'Limited Edition'}
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-gray-900">₹{sellingPrice.toLocaleString()}</span>
                        {mrp > sellingPrice && (
                          <span className="text-sm text-gray-400 line-through font-bold">₹{mrp.toLocaleString()}</span>
                        )}
                      </div>
                    </div>

                    <button 
                      onClick={() => productId ? navigate(`/product/${productId}`) : navigate(current.ctaLink || '/products')}
                      className="px-8 py-4 bg-black text-white rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-gray-800 transition-all active:scale-95 shadow-xl flex items-center gap-2 group"
                    >
                      {current.ctaText || 'Shop This Look'}
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Pagination Dots */}
      {heroProducts.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
          {heroProducts.map((_, i) => (
            <button 
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${i === currentSlide ? 'bg-gray-900 w-8' : 'bg-gray-300 hover:bg-gray-400'}`}
            />
          ))}
        </div>
      )}

    </section>
  );
};

export default Hero;

