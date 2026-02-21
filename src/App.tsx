import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// 1. Import thư viện Toaster và CSS của nó
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import Brands from './pages/Brands';
import About from './pages/About';
import Contact from './pages/Contact';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/profile_Customer/Profile';
import './App.css';

function App() {
  return (
    <Router>
      {/* 2. Đặt Toaster ở đây để có thể hiển thị thông báo trên toàn app */}
      <Toaster 
        position="top-right" // Vị trí hiển thị (góc trên bên phải)
        reverseOrder={false}
        toastOptions={{
          // Tùy chỉnh giao diện mặc định cho giống tông màu EyewearHut
          duration: 3000,
          style: {
            background: '#fff',
            color: '#333',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            borderRadius: '8px',
            fontSize: '14px',
          },
          success: {
            iconTheme: {
              primary: '#2ecc71',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#cc0000', // Màu đỏ thương hiệu cho lỗi
              secondary: '#fff',
            },
          },
        }}
      />
      
      <div className="app">
        <Header />
        <main className="app-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/products" element={<Products />} />
            <Route path="/brands" element={<Brands />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-success" element={<OrderSuccess />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;