import Searchbar from '../components/Customer/Topbar';
import Products from '../components/Customer/Products';
import Footer from '../components/Customer/Footer';

const ProductsPage = () => {
    return (
        <div className="min-h-screen bg-[#fcfaf8] text-slate-900">
            <Searchbar />

            <main className="pt-28 sm:pt-32 pb-16">
                <section id="all-products">
                    <div className="px-4 sm:px-6 lg:px-10">
                        <div className="mx-auto max-w-7xl">
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
                    </div>

                    <Products />
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default ProductsPage;
