import { useState } from 'react';
import Products from '../components/Customer/Products';
import Searchbar from '../components/Customer/Topbar';
import LandingPage from '../components/Customer/LandingPage';
import Footer from '../components/Customer/Footer';
import HomepageProductSections from '../components/Customer/HomepageProductSections';

const Homepage = () => {
    const [filters, setFilters] = useState({
        sortBy: 'relevance',
        category: '',
        priceRange: [0, 10000000]
    });

    const handleFiltersChange = (newFilters) => {
        setFilters(newFilters);
    };

    return (
        <div className="flex flex-col w-full min-h-screen bg-white">
            <Searchbar />

            {/* Main Content */}
            <div className="flex-1 w-full">
                <LandingPage />
                <HomepageProductSections hideTopSelling={true} />
                <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 mt-12 mb-6">
                    <div className="flex flex-col gap-2">
                        <p className="text-[11px] font-black uppercase tracking-[0.26em] text-slate-400">
                            Browse The Catalog
                        </p>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 font-serif">
                            All Products
                        </h2>
                    </div>
                </div>
                <Products filters={filters} />
                <Footer />
            </div>
        </div>
    );
};

export default Homepage;
