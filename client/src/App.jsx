import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import Cart from './pages/Cart'; 
import Admin from './pages/Admin';
import MyOrders from './pages/MyOrders';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="bottom-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />
        <Route path="/cart" element={<Cart />} /> 
        <Route path="/admin" element={<Admin />} />
        <Route path="/my-orders" element={<MyOrders />} />
      </Routes>
    </div>
  );
}

export default App;