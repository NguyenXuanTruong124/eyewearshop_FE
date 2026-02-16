import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../API_BE/axiosClient';
import './styles/Products.css';

const Products: React.FC = () => {
  const navigate = useNavigate();
  const [productData, setProductData] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<number | null>(null);
  const [activePriceId, setActivePriceId] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<{ min?: number; max?: number }>({});

  const fetchProducts = async (
    categoryId = selectedCategory,
    brandId = selectedBrand,
    prices = priceRange
  ) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: "1", pageSize: "20" });
      if (categoryId) params.append("categoryId", categoryId.toString());
      if (brandId) params.append("brandId", brandId.toString());
      if (prices.min !== undefined) params.append("minPrice", prices.min.toString());
      if (prices.max !== undefined) params.append("maxPrice", prices.max.toString());

      const response = await axiosClient.get(`/catalog/products?${params.toString()}`);
      setProductData(response.data.items || []);
    } catch (error) {
      console.error("Lỗi tải sản phẩm:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initData = async () => {
      try {
        const [cateRes, brandRes] = await Promise.all([
          axiosClient.get('/catalog/categories'),
          axiosClient.get('/catalog/brands')
        ]);
        setCategories(cateRes.data || []);
        setBrands(brandRes.data || []);
        fetchProducts();
      } catch (error) {
        console.error("Lỗi khởi tạo:", error);
      }
    };
    initData();
  }, []);

  const handlePriceClick = (id: string, min?: number, max?: number) => {
    if (activePriceId === id) {
      setActivePriceId(null);
      setPriceRange({});
      fetchProducts(selectedCategory, selectedBrand, {});
    } else {
      setActivePriceId(id);
      const newPrices = { min, max };
      setPriceRange(newPrices);
      fetchProducts(selectedCategory, selectedBrand, newPrices);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="products-page">
      <aside className="sidebar-filter">
        {/* Bộ lọc Loại sản phẩm */}
        <div className="filter-section">
          <h3>Loại sản phẩm</h3>
          <ul className="filter-list">
            {categories.map((cate: any) => (
              <li key={cate.categoryId} className="filter-item">
                <input 
                  type="checkbox" 
                  checked={selectedCategory === cate.categoryId}
                  onChange={() => {
                    const id = selectedCategory === cate.categoryId ? null : cate.categoryId;
                    setSelectedCategory(id);
                    fetchProducts(id, selectedBrand);
                  }}
                />
                <label>{cate.categoryName}</label>
              </li>
            ))}
          </ul>
        </div>

        {/* Bộ lọc Thương hiệu */}
        <div className="filter-section">
          <h3>Thương hiệu</h3>
          <ul className="filter-list">
            {brands.map((brand: any) => (
              <li key={brand.brandId} className="filter-item">
                <input 
                  type="checkbox" 
                  checked={selectedBrand === brand.brandId}
                  onChange={() => {
                    const id = selectedBrand === brand.brandId ? null : brand.brandId;
                    setSelectedBrand(id);
                    fetchProducts(selectedCategory, id);
                  }}
                />
                <label>{brand.brandName}</label>
              </li>
            ))}
          </ul>
        </div>

        {/* Bộ lọc Khoảng giá */}
        <div className="filter-section">
          <h3>Khoảng giá</h3>
          <ul className="filter-list">
            <li className="filter-item">
              <input type="checkbox" checked={activePriceId === 'p1'} onChange={() => handlePriceClick('p1', 0, 500000)} />
              <label>Dưới 500k</label>
            </li>
            <li className="filter-item">
              <input type="checkbox" checked={activePriceId === 'p2'} onChange={() => handlePriceClick('p2', 500000, 2000000)} />
              <label>500k - 2tr</label>
            </li>
            <li className="filter-item">
              <input type="checkbox" checked={activePriceId === 'p3'} onChange={() => handlePriceClick('p3', 2000000)} />
              <label>Trên 2tr</label>
            </li>
          </ul>
        </div>
      </aside>

      <main className="products-content">
        <div className="products-header">
          <h2>Sản phẩm</h2>
          <p style={{color: '#888', fontSize: '14px'}}>
            Tìm thấy <strong>{productData.length}</strong> sản phẩm
          </p>
        </div>

        {loading ? (
          <div className="loading-state">Đang cập nhật danh sách...</div>
        ) : (
          <div className="product-grid-main">
            {productData.map((item: any) => (
              <div key={item.productId} className="product-card-item">
                <div 
                  className="img-wrapper" 
                  onClick={() => navigate(`/product/${item.productId}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <img 
                    src={item.primaryImageUrl} 
                    alt={item.productName} 
                    onError={(e: any) => e.target.src = "https://placehold.co/400x600?text=EyewearHut"} 
                  />
                </div>
                <div className="info-wrapper">
                  <p className="brand-name">{item.brandName || "EYEWEARHUT"}</p>
                  <h4 className="product-name">{item.productName}</h4>
                  <div className="price-container">
                    <span className="current-p">{formatPrice(item.basePrice)}</span>
                  </div>
                  <div className="product-card-btns">
                    {/* THAY ĐỔI: Gộp thành một nút "Xem chi tiết" duy nhất */}
                    <button 
                      className="btn-full-view" 
                      onClick={() => navigate(`/product/${item.productId}`)}
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && productData.length === 0 && (
          <div className="empty-state">Không tìm thấy sản phẩm nào phù hợp với bộ lọc.</div>
        )}
      </main>
    </div>
  );
};

export default Products;