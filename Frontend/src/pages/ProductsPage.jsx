import React, { useState, useEffect } from 'react';
import API from '../../api';
import Searchbar from '../components/Customer/Topbar';
import Products from '../components/Customer/Products';
import Footer from '../components/Customer/Footer';
import Sidebar from '../components/Customer/Sidebar';

const ProductsPage = () => {
    const [filters, setFilters] = useState({});
    const [categories, setCategories] = useState([]);
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(10000000);

    useEffect(() => {
        const fetchFilterOptions = async () => {
            try {
                const response = await API.get('/products/customer/filter-options');
                const data = response.data;
                setCategories(data.categories || []);
                setMinPrice(data.priceRange?.min || 0);
                setMaxPrice(data.priceRange?.max || 10000000);
            } catch (err) {
                console.error('Error fetching filter options:', err);
            }
        };
        fetchFilterOptions();
    }, []);

    return (
        <div className="min-h-screen bg-[#fcfaf8] text-slate-900 flex flex-col">
            <Searchbar />

            {/* Main Content Area */}
            <div className="flex-1 max-w-[1600px] w-full mx-auto flex flex-col-reverse md:flex-row-reverse items-start pt-28 sm:pt-32">
                
                {/* Filter Sidebar - Sticky Right */}
                <Sidebar
                    showFilters={true}
                    onFiltersChange={setFilters}
                    categories={categories}
                    maxPrice={maxPrice}
                    minPrice={minPrice}
                />

                <main className="flex-1 w-full min-w-0 pb-16">
                    <section id="all-products">
                        <div className="px-4 sm:px-6 lg:px-10">
                            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                    <p className="text-[11px] font-black uppercase tracking-[0.26em] text-slate-400">
                                        Browse The Catalog
                                    </p>
                                    <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                                        All Products
                                    </h2>
                                </div>
                                <p className="max-w-xl text-sm font-medium leading-6 text-slate-500">
                                    Find premium pieces faster with a cleaner grid, direct pricing, and quick actions that keep the shopping flow smooth.
                                </p>
                            </div>
                        </div>

                        <Products filters={filters} />
                    </section>
                </main>
            </div>

            <Footer />
        </div>
    );
};

export default ProductsPage;
