import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trash2, CreditCard, Loader2, CheckCircle2 } from 'lucide-react';
import { PageType } from '../types';
import { apiClient } from '../lib/apiClient';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  sellerId: string;
  seller: { name: string };
  unit?: string;
  image?: string;
}

interface CartProps {
  onNavigate: (page: PageType) => void;
  cart: string[];
  setCart: (cart: string[]) => void;
}

export function Cart({ onNavigate, cart, setCart }: CartProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await apiClient.get<{ products: any[] }>('/api/products');
        const mapped = data.products.map(p => ({
          ...p,
          unit: 'Quintal',
          image: 'https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?auto=format&fit=crop&q=80&w=600'
        }));
        setProducts(mapped);
      } catch (err) {
        console.error('Failed to load cart products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const cartItems = products.filter(p => cart.includes(p.id));
  const subtotal = cartItems.reduce((acc, item) => acc + item.price, 0);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  const removeFromCart = (id: string) => {
    setCart(cart.filter(itemId => itemId !== id));
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    try {
      setCheckingOut(true);
      
      const orderItems = cartItems.map(item => ({
        productId: item.id,
        quantity: 1, // Defaulting to 1 for MVP cart
        price: item.price
      }));

      await apiClient.post('/api/orders', {
        items: orderItems,
        totalAmount: total
      });

      setSuccess(true);
      setCart([]); // Clear cart
      
      // Auto redirect after 3s
      setTimeout(() => {
        onNavigate('marketplace');
      }, 3000);
      
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to place order.');
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => onNavigate('marketplace')}
          className="p-2 bg-white rounded-full shadow-sm hover:bg-slate-50 transition-colors border border-slate-200"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <h2 className="text-2xl font-bold text-slate-800">Your Cart</h2>
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-100">
          <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-800 mb-2">Loading Cart...</h3>
        </div>
      ) : success ? (
        <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-100">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 mb-2">Order Placed Successfully!</h3>
          <p className="text-slate-500 mb-6">Redirecting to marketplace...</p>
        </div>
      ) : cartItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-100">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 mb-2">Your cart is empty</h3>
          <p className="text-slate-500 mb-6">Looks like you haven't added anything to your cart yet.</p>
          <button 
            onClick={() => onNavigate('marketplace')}
            className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium shadow-sm hover:bg-green-700 transition-colors"
          >
            Browse Marketplace
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map(item => (
              <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4">
                <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800 text-lg">{item.name}</h3>
                  <p className="text-sm text-slate-500 mb-1">{item.seller?.name || 'Local Farm'}</p>
                  <p className="font-bold text-green-700">₹{item.price} <span className="text-sm font-normal text-slate-500">/{item.unit}</span></p>
                </div>
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 h-fit">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Order Summary</h3>
            <div className="space-y-4 mb-6 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal ({cartItems.length} items)</span>
                <span className="font-medium text-slate-800">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tax (5%)</span>
                <span className="font-medium text-slate-800">₹{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Shipping</span>
                <span className="font-medium text-green-600">Free</span>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-between">
                <span className="font-bold text-slate-800">Total</span>
                <span className="font-bold text-xl text-green-700">₹{total.toFixed(2)}</span>
              </div>
            </div>
            <button 
              onClick={handleCheckout}
              disabled={checkingOut}
              className="w-full py-3.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              {checkingOut ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" /> Proceed to Checkout
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
