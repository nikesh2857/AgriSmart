import { Calendar, MapPin, Search, ArrowLeft, Clock, Phone, Star, ShieldCheck, Plus, UploadCloud, Trash2, Loader2 } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import tractorImg from '../assets/images/mahindra_tractor_1784304568060.jpg';
import harvesterImg from '../assets/images/combine_harvester_1784304585113.jpg';
import droneImg from '../assets/images/agri_drone_1784304600883.jpg';
import { apiClient } from '../lib/apiClient';

interface Equipment {
  id: string;
  name: string;
  description: string;
  dailyRate: number;
  inventoryCount: number;
  imageUrl?: string;
  // UI specific mocks
  owner: string;
  ownerPhone: string;
  rating: number;
  reviews: number;
  location: string;
}

export function Rental({ user }: { user?: User }) {
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEquipment();
  }, []);

  const loadEquipment = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get<{ equipment: any[] }>('/api/equipment');
      const mapped = data.equipment.map(e => ({
        ...e,
        owner: 'AgriSmart Hub',
        ownerPhone: '+91 800 555 1234',
        rating: 4.8,
        reviews: Math.floor(Math.random() * 50) + 10,
        location: 'Local Warehouse',
      }));
      setEquipmentList(mapped);
    } catch (err) {
      console.error('Failed to load equipment:', err);
    } finally {
      setLoading(false);
    }
  };

  const [selectedEqId, setSelectedEqId] = useState<string | null>(null);
  const [bookingDate, setBookingDate] = useState<string>('');
  const [bookingTime, setBookingTime] = useState<string>('09:00');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isAddingEquipment, setIsAddingEquipment] = useState(false);
  const [newEquipment, setNewEquipment] = useState({
    name: '', owner: '', ownerPhone: '', price: '', unit: 'hour', location: '', description: ''
  });
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedEquipment = equipmentList.find(e => e.id === selectedEqId);

  const filteredEquipment = equipmentList.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBooking = async () => {
    if (!bookingDate || !bookingTime) {
      alert("Please select a date and time for booking.");
      return;
    }
    try {
      const startDate = new Date(`${bookingDate}T${bookingTime}`);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1); // Mock 1 day rental

      await apiClient.post('/api/equipment/rentals', {
        equipmentId: selectedEquipment?.id,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      alert(`Successfully requested booking for ${selectedEquipment?.name}.`);
      setSelectedEqId(null);
      loadEquipment();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to book equipment.');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewImagePreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSaveEquipment = async () => {
    if (!newEquipment.name || !newEquipment.price) {
      alert("Please fill in required fields (Name and Price).");
      return;
    }
    
    try {
      await apiClient.post('/api/equipment', {
        name: newEquipment.name,
        description: newEquipment.description || 'No description provided.',
        dailyRate: Number(newEquipment.price),
        inventoryCount: 1, // Defaulting to 1 for new equipment
      });
      
      setIsAddingEquipment(false);
      setNewEquipment({ name: '', owner: '', ownerPhone: '', price: '', unit: 'day', location: '', description: '' });
      setNewImagePreview(null);
      loadEquipment();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to add equipment.');
    }
  };

  if (isAddingEquipment) {
    return (
      <div className="space-y-6 pb-20 max-w-3xl mx-auto">
        <div className="flex items-center gap-4">
          <button onClick={() => setIsAddingEquipment(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </button>
          <h1 className="text-2xl font-bold text-slate-800">Add New Equipment</h1>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Equipment Name*</label>
              <input 
                type="text" 
                value={newEquipment.name}
                onChange={e => setNewEquipment({...newEquipment, name: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g. Mahindra Tractor"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
              <input 
                type="text" 
                value={newEquipment.location}
                onChange={e => setNewEquipment({...newEquipment, location: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g. 5km away"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Price*</label>
              <input 
                type="number" 
                value={newEquipment.price}
                onChange={e => setNewEquipment({...newEquipment, price: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g. 800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Unit</label>
              <select 
                value={newEquipment.unit}
                onChange={e => setNewEquipment({...newEquipment, unit: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="hour">Per Hour</option>
                <option value="day">Per Day</option>
                <option value="acre">Per Acre</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Owner Name</label>
              <input 
                type="text" 
                value={newEquipment.owner}
                onChange={e => setNewEquipment({...newEquipment, owner: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g. Village Co-op"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Owner Phone</label>
              <input 
                type="tel" 
                value={newEquipment.ownerPhone}
                onChange={e => setNewEquipment({...newEquipment, ownerPhone: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="+91..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
            <textarea 
              value={newEquipment.description}
              onChange={e => setNewEquipment({...newEquipment, description: e.target.value})}
              rows={3}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              placeholder="Provide details about the equipment..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Equipment Image*</label>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImageChange} 
            />
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 w-full h-48 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors overflow-hidden group relative"
            >
              {newImagePreview ? (
                <img src={newImagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center text-slate-500 group-hover:text-green-600 transition-colors">
                  <UploadCloud className="w-8 h-8 mb-2" />
                  <span className="font-medium">Click to upload image</span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button 
              onClick={handleSaveEquipment}
              className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-md transition-colors"
            >
              Save Equipment
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (selectedEquipment) {
    return (
      <div className="space-y-6 pb-20 max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          <button onClick={() => setSelectedEqId(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </button>
          <h1 className="text-2xl font-bold text-slate-800">Book Equipment</h1>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
              <img src={selectedEquipment.imageUrl || tractorImg} alt={selectedEquipment.name} className="w-full h-64 object-cover" />
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-slate-800">{selectedEquipment.name}</h2>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-700 leading-none">₹{selectedEquipment.dailyRate}</p>
                    <p className="text-sm text-slate-500 font-medium">per day</p>
                  </div>
                </div>
                <p className="text-slate-600 leading-relaxed mb-4">{selectedEquipment.description}</p>
                <div className="flex items-center gap-2 text-sm font-medium text-slate-500 bg-slate-50 w-fit px-3 py-1.5 rounded-lg border border-slate-100">
                  <MapPin className="w-4 h-4 text-slate-400" /> {selectedEquipment.location}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-green-500" /> Owner Details
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800 text-lg">{selectedEquipment.owner}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center text-amber-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="font-medium ml-1 text-slate-700">{selectedEquipment.rating}</span>
                    </div>
                    <span className="text-slate-400 text-sm">({selectedEquipment.reviews} reviews)</span>
                  </div>
                </div>
                <a href={`tel:${selectedEquipment.ownerPhone}`} className="w-12 h-12 bg-green-50 hover:bg-green-100 text-green-600 rounded-full flex items-center justify-center transition-colors">
                  <Phone className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 sticky top-6">
              <h3 className="text-xl font-bold text-slate-800 mb-6">Select Booking Slot</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Preferred Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="date" 
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-700 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Preferred Time</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="time" 
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-700 font-medium"
                    />
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mt-6">
                  <p className="text-sm text-blue-800 leading-relaxed">
                    <strong>Note:</strong> You can customize the date and time above. The owner will confirm the exact availability upon receiving your request.
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100">
                <button 
                  onClick={handleBooking}
                  className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-lg shadow-md transition-colors"
                >
                  Confirm Booking Request
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      
      {/* Search Header */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex-1 w-full relative max-w-xl">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tractors, harvesters, drones..." 
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-green-500/20 outline-none"
          />
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          {user?.role === 'admin' && (
            <button 
              onClick={() => setIsAddingEquipment(true)}
              className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium shadow-sm hover:bg-green-700 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Equipment
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredEquipment.length > 0 ? filteredEquipment.map(item => (
          <div key={item.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 flex flex-col relative group">
            <div className="h-48 relative">
              <img src={item.imageUrl || tractorImg} alt={item.name} className="w-full h-full object-cover" />
              {user?.role === 'admin' && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setEquipmentList(prev => prev.filter(eq => eq.id !== item.id));
                  }}
                  className="absolute top-4 left-4 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md transition-colors opacity-0 group-hover:opacity-100"
                  title="Remove Equipment"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <div className="absolute top-4 right-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm ${item.inventoryCount > 0 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                  {item.inventoryCount > 0 ? 'Available' : 'Booked'}
                </span>
              </div>
            </div>
            <div className="p-6 flex flex-col flex-1">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-slate-500">Provided by {item.owner}</p>
                <div className="flex items-center gap-1 text-xs font-medium text-slate-500">
                  <MapPin className="w-3 h-3" /> {item.location}
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-6">{item.name}</h3>
              
              <div className="mt-auto flex items-end justify-between">
                <div>
                  <p className="text-xs text-slate-400 font-medium mb-1">Rental Rate</p>
                  <p className="text-2xl font-bold text-green-700 leading-none">₹{item.dailyRate}<span className="text-sm text-slate-500 font-medium">/day</span></p>
                </div>
                <button 
                  disabled={item.inventoryCount <= 0}
                  onClick={() => setSelectedEqId(item.id)}
                  className={`px-6 py-3 rounded-xl font-semibold shadow-sm transition-all ${
                    item.inventoryCount > 0 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        )) : loading ? (
          <div className="col-span-full py-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Loading equipment...</p>
          </div>
        ) : (
          <div className="col-span-full py-12 text-center">
            <p className="text-slate-500 font-medium">No equipment found matching your search.</p>
          </div>
        )}
      </div>
      
    </div>
  );
}
