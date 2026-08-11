import basmatiRiceImg from '../assets/images/basmati_rice_1784352163584.jpg';
import organicHoneyImg from '../assets/images/organic_honey_1784352178761.jpg';

export const products = [
  { id: 1, name: 'Organic Premium Wheat', farmer: 'Rajesh K.', price: 2400, unit: 'Quintal', rating: 4.8, image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80', stock: 50 },
  { id: 2, name: 'Basmati Rice (Export Qty)', farmer: 'Singh Farms', price: 4500, unit: 'Quintal', rating: 4.9, image: basmatiRiceImg, stock: 120 },
  { id: 3, name: 'Fresh Potatoes', farmer: 'Green Acres', price: 1200, unit: 'Quintal', rating: 4.5, image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=400&q=80', stock: 200 },
  { id: 4, name: 'Red Onions', farmer: 'Amit Patel', price: 1800, unit: 'Quintal', rating: 4.6, image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=400&q=80', stock: 80 },
  { id: 5, name: 'Pesticide Free Honey', farmer: 'Bee Organics', price: 800, unit: 'Kg', rating: 5.0, image: organicHoneyImg, stock: 30 },
];
