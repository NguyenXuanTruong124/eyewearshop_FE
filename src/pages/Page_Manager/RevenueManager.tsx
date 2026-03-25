import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Cell, PieChart, Pie, Legend
} from 'recharts';
import { 
  TrendingUp, ShoppingBag, 
  RotateCcw, DollarSign, Calendar, Search, 
  BarChart2, RefreshCw, Layers
} from 'lucide-react';
import axiosClient from "../../API_BE/axiosClient";
import toast from 'react-hot-toast';
import './RevenueManager.css';

interface RevenueManagerProps {
  triggerToast?: (msg: string) => void;
}

type TabMode = 'SUMMARY' | 'DAILY' | 'MONTHLY' | 'YEARLY' | 'TOP_PRODUCTS';

const RevenueManager: React.FC<RevenueManagerProps> = () => {
  const [activeTab, setActiveTab] = useState<TabMode>('SUMMARY');
  const [loading, setLoading] = useState(false);

  // States for Daily/Summary (Date Range)
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  // States for Monthly/Top Products (Month/Year)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [topLimit, setTopLimit] = useState(10);

  // States for Yearly (Year Range)
  const currentYear = new Date().getFullYear();
  const [startYear, setStartYear] = useState(currentYear - 3);
  const [endYear, setEndYear] = useState(currentYear);

  // Dynamic Year Array for selects
  const yearOptions = useMemo(() => {
    const years = [];
    for (let y = 2015; y <= currentYear + 2; y++) {
      years.push(y);
    }
    return years;
  }, [currentYear]);

  // Data states
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [yearlyData, setYearlyData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);

  const formatDateForAPI = (dateStr: string) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split('-');
    return `${m}/${d}/${y}`;
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  };

  const fetchSummaryAndDaily = async () => {
    try {
      setLoading(true);
      const start = formatDateForAPI(startDate);
      const end = formatDateForAPI(endDate);
      const [sumRes, dailyRes] = await Promise.all([
        axiosClient.get(`/manager/revenue/summary?startDate=${start}&endDate=${end}`),
        axiosClient.get(`/manager/revenue/daily?startDate=${start}&endDate=${end}`)
      ]);
      setSummaryData(sumRes.data);
      setDailyData(dailyRes.data || []);
    } catch (e) {
      toast.error("Lỗi tải báo cáo tổng hợp");
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthly = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(`/manager/revenue/monthly?month=${selectedMonth}&year=${selectedYear}`);
      setMonthlyData(Array.isArray(res.data) ? res.data : [res.data]);
    } catch (e) {
      toast.error("Lỗi tải báo cáo tháng");
    } finally {
      setLoading(false);
    }
  };

  const fetchYearly = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(`/manager/revenue/yearly?startYear=${startYear}&endYear=${endYear}`);
      setYearlyData(res.data || []);
    } catch (e) {
      toast.error("Lỗi tải báo cáo năm");
    } finally {
      setLoading(false);
    }
  };

  const fetchTopProducts = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(`/manager/revenue/top-products?month=${selectedMonth}&year=${selectedYear}&limit=${topLimit}`);
      setTopProducts(res.data || []);
    } catch (e) {
      toast.error("Lỗi tải danh sách sản phẩm chạy nhất");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'SUMMARY' || activeTab === 'DAILY') fetchSummaryAndDaily();
    if (activeTab === 'MONTHLY') fetchMonthly();
    if (activeTab === 'YEARLY') fetchYearly();
    if (activeTab === 'TOP_PRODUCTS') fetchTopProducts();
  }, [activeTab]);

  const dailyChartData = useMemo(() => {
    return dailyData.map(item => ({
      name: new Date(item.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
      revenue: item.totalRevenue,
      orders: item.totalOrders,
      returns: item.returnedOrders
    }));
  }, [dailyData]);

  const yearlyChartData = useMemo(() => {
    return yearlyData.map(item => ({
      name: item.year.toString(),
      revenue: item.totalRevenue,
      orders: item.totalOrders
    }));
  }, [yearlyData]);

  return (
    <div className="revenue-manager-container">
      <header className="rm-header">
        <div className="title-section">
          <h1>Hệ thống Quản trị Doanh thu</h1>
          <p>Phân tích số liệu và hiệu suất kinh doanh đa chiều</p>
        </div>
        
        <div className="rm-tabs-nav">
          <button className={`tab-link ${activeTab === 'SUMMARY' ? 'active' : ''}`} onClick={() => setActiveTab('SUMMARY')}>Tổng quan</button>
          <button className={`tab-link ${activeTab === 'DAILY' ? 'active' : ''}`} onClick={() => setActiveTab('DAILY')}>Theo ngày</button>
          <button className={`tab-link ${activeTab === 'MONTHLY' ? 'active' : ''}`} onClick={() => setActiveTab('MONTHLY')}>Theo tháng</button>
          <button className={`tab-link ${activeTab === 'YEARLY' ? 'active' : ''}`} onClick={() => setActiveTab('YEARLY')}>Theo năm</button>
          <button className={`tab-link ${activeTab === 'TOP_PRODUCTS' ? 'active' : ''}`} onClick={() => setActiveTab('TOP_PRODUCTS')}>Top sản phẩm</button>
        </div>
      </header>

      {/* FILTER PANEL */}
      <div className="rm-filter-panel">
        {(activeTab === 'SUMMARY' || activeTab === 'DAILY') && (
          <div className="filter-row">
            <Calendar size={18} />
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            <span>đến</span>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
            <button className="btn-search" onClick={fetchSummaryAndDaily} disabled={loading}><Search size={16} /> Lọc kết quả</button>
          </div>
        )}

        {activeTab === 'MONTHLY' && (
          <div className="filter-row">
            <Layers size={18} />
            <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
              ))}
            </select>
            <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}>
              {yearOptions.map(y => <option key={y} value={y}>Năm {y}</option>)}
            </select>
            <button className="btn-search" onClick={fetchMonthly} disabled={loading}><RefreshCw size={16} /> Cập nhật</button>
          </div>
        )}

        {activeTab === 'TOP_PRODUCTS' && (
          <div className="filter-row">
            <Layers size={18} />
            <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
              ))}
            </select>
            <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}>
              {yearOptions.map(y => <option key={y} value={y}>Năm {y}</option>)}
            </select>
            <div className="input-with-label">
              <span>Top:</span>
              <input 
                type="number" 
                style={{ width: '70px' }} 
                value={topLimit} 
                onChange={e => setTopLimit(Number(e.target.value))} 
                min={1} 
                max={50}
              />
            </div>
            <button className="btn-search" onClick={fetchTopProducts} disabled={loading}><RefreshCw size={16} /> Cập nhật</button>
          </div>
        )}

        {activeTab === 'YEARLY' && (
          <div className="filter-row">
            <BarChart2 size={18} />
            <span>Từ năm</span>
            <select value={startYear} onChange={e => setStartYear(Number(e.target.value))}>
              {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <span>đến</span>
            <select value={endYear} onChange={e => setEndYear(Number(e.target.value))}>
              {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <button className="btn-search" onClick={fetchYearly} disabled={loading}><Search size={16} /> Thống kê</button>
          </div>
        )}
      </div>

      <div className="rm-content-body">
        {loading && <div className="loading-spinner-overlay"><div className="loader"></div><p>Đang tải dữ liệu...</p></div>}

        {/* SUMMARY TAB */}
        {activeTab === 'SUMMARY' && summaryData && (
          <>
            <div className="rm-stats-grid">
              <div className="stat-card-rm revenue">
                <div className="stat-icon"><TrendingUp size={24} /></div>
                <span className="stat-label">Tổng doanh thu</span>
                <span className="stat-value">{formatCurrency(summaryData.totalRevenue)}</span>
              </div>
              <div className="stat-card-rm orders">
                <div className="stat-icon"><ShoppingBag size={24} /></div>
                <span className="stat-label">Tổng đơn hàng</span>
                <span className="stat-value">{summaryData.totalOrders}</span>
              </div>
              <div className="stat-card-rm returns">
                <div className="stat-icon"><RotateCcw size={24} /></div>
                <span className="stat-label">Tỉ lệ hoàn đơn</span>
                <span className="stat-value">{summaryData.returnRate}%</span>
              </div>
              <div className="stat-card-rm avg">
                <div className="stat-icon"><DollarSign size={24} /></div>
                <span className="stat-label">Doanh thu thuần</span>
                <span className="stat-value">{formatCurrency(summaryData.netRevenue)}</span>
              </div>
            </div>

            <div className="chart-section-grid">
              <div className="chart-card">
                <div className="chart-title">Phân bổ tỉ lệ đơn hàng</div>
                <div style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Thành công', value: summaryData.totalOrders - summaryData.returnedOrders },
                          { name: 'Hoàn/Hủy', value: summaryData.returnedOrders }
                        ]}
                        cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value"
                      >
                        <Cell fill="#e31837" /><Cell fill="#94a3b8" />
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="chart-card">
                <div className="chart-title">Phân bổ doanh thu (VND)</div>
                <div style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Thực nhận', value: summaryData.netRevenue },
                          { name: 'Hoàn trả', value: summaryData.returnedRevenue }
                        ]}
                        cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value"
                      >
                        <Cell fill="#10b981" /><Cell fill="#ef4444" />
                      </Pie>
                      <Tooltip formatter={(val: any) => formatCurrency(val)} />
                      <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}

        {/* DAILY TAB */}
        {activeTab === 'DAILY' && (
          <div className="chart-card full-width">
            <div className="chart-title">Doanh thu chi tiết theo ngày</div>
            <div style={{ height: 400, marginTop: 20 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyChartData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e31837" stopOpacity={0.1}/><stop offset="95%" stopColor="#e31837" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`} />
                  <Tooltip formatter={(val: any) => formatCurrency(val)} />
                  <Area type="monotone" dataKey="revenue" stroke="#e31837" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* MONTHLY TAB */}
        {activeTab === 'MONTHLY' && (
          <div className="chart-card full-width">
            <div className="chart-title">Thống kê doanh thu Tháng {selectedMonth}/{selectedYear}</div>
            <div className="monthly-stats-row">
              {monthlyData.map((m, i) => (
                <div key={i} className="m-stat-item">
                  <div className="m-label">Doanh thu</div>
                  <div className="m-val">{formatCurrency(m.totalRevenue)}</div>
                  <div className="m-label mt-10">Đơn hàng</div>
                  <div className="m-val small">{m.totalOrders} đơn</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* YEARLY TAB */}
        {activeTab === 'YEARLY' && (
          <div className="chart-card full-width">
            <div className="chart-title">Tăng trưởng doanh thu {startYear} - {endYear}</div>
            <div style={{ height: 400, marginTop: 20 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yearlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`} />
                  <Tooltip formatter={(val: any) => formatCurrency(val)} cursor={{fill: '#f8fafc'}} />
                  <Bar dataKey="revenue" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* TOP PRODUCTS TAB */}
        {activeTab === 'TOP_PRODUCTS' && (
          <div className="chart-card full-width">
            <div className="chart-title-row">
              <div className="chart-title">Hiệu suất Sản phẩm & Biến thể</div>
              <div className="top-p-info">Báo cáo top {topLimit} sản phẩm bán chạy tháng {selectedMonth}/{selectedYear}</div>
            </div>
            
            <div className="top-products-table-wrapper">
              <table className="rm-data-table modern">
                <thead>
                  <tr>
                    <th>Hạng</th>
                    <th>Thông tin Sản phẩm</th>
                    <th>Thương hiệu / Loại</th>
                    <th>Tồn kho</th>
                    <th>Doanh số</th>
                    <th>Đơn giá TB</th>
                    <th>Tổng doanh thu</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((p, idx) => (
                    <tr key={idx}>
                      <td>
                        <div className={`rank-badge rank-${idx + 1}`}>
                          {idx + 1}
                        </div>
                      </td>
                      <td>
                        <div className="product-info-cell">
                          <img 
                            src={p.variant.image?.url || 'https://via.placeholder.com/60'} 
                            alt={p.product.productName} 
                            className="product-thumb-rm"
                          />
                          <div className="product-details-rm">
                            <span className="p-name-rm">{p.product.productName}</span>
                            <span className="p-variant-rm">Màu: {p.variant.color} | ID: #{p.variant.variantId}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="tag-group-rm">
                          <span className="tag-brand-rm">{p.product.brand.brandName}</span>
                        </div>
                      </td>
                      <td>
                        <div className="stock-info-rm">
                          <div className="stock-row">
                            <span className="stock-label">Sẵn có:</span>
                            <span className={`stock-val ${p.variant.stockQuantity < 5 ? 'low' : ''}`}>
                              {p.variant.stockQuantity}
                            </span>
                          </div>
                          <div className="stock-row">
                            <span className="stock-label">Đặt trước:</span>
                            <span className="stock-val blue">{p.variant.preOrderQuantity}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="sold-badge">
                          {p.quantitySold} <small>đã bán</small>
                        </div>
                      </td>
                      <td>
                        <div className="price-info-rm">
                          <span className="price-val">{formatCurrency(p.avgPrice)}</span>
                        </div>
                      </td>
                      <td>
                        <div className="revenue-cell-rm">
                          <span className="rev-val">{formatCurrency(p.totalRevenue)}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {topProducts.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '60px 0' }}>
                        <div className="empty-state">
                          <ShoppingBag size={48} strokeWidth={1} style={{ opacity: 0.3 }} />
                          <p>Chưa có dữ liệu giao dịch trong khoảng thời gian này</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RevenueManager;