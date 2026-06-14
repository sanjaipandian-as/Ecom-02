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
                <Products filters={filters} />
                <Footer />
            </div>
        </div>
    );
};

export default Homepage;
