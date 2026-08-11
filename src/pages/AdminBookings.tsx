import { useState, useEffect } from 'react';
import { Search, Calendar, MapPin, Tractor, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { apiClient } from '../lib/apiClient';

export function AdminBookings() {
  const [searchQuery, setSearchQuery] = useState('');
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await apiClient.get('/api/equipment/rentals');
        setBookings(data.rentals || data); // handle both array and paginated response
      } catch (error) {
        console.error("Failed to load bookings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const filteredBookings = (Array.isArray(bookings) ? bookings : []).filter(booking => 
    booking?.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    booking?.equipment?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking?.id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">All Equipment Bookings</h1>
          <p className="text-slate-500 mt-1">Manage and track all equipment rental bookings across the platform.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, User, Equipment..." 
            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-green-500/20 outline-none shadow-sm"
          />
        </div>
      </div>

      <div className="grid gap-6">
        {loading ? (
          <div className="py-12 text-center text-slate-500">Loading bookings...</div>
        ) : filteredBookings.length > 0 ? filteredBookings.map((booking) => (
          <div key={booking.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between transition-all hover:shadow-md">
            
            <div className="flex items-start gap-4 flex-1">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center shrink-0">
                <Tractor className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-slate-800">{booking.equipment?.name || 'Equipment'}</h3>
                  <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{booking.id.slice(0, 8)}</span>
                </div>
                <p className="text-sm text-slate-600 mb-2">Booked by <span className="font-semibold text-slate-800">{booking.user?.name || 'Unknown'}</span></p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-slate-400" /> {new Date(booking.startDate).toLocaleDateString()} to {new Date(booking.endDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between w-full lg:w-auto gap-4 border-t lg:border-t-0 border-slate-100 pt-4 lg:pt-0">
              <div className="text-left lg:text-right">
                <p className="text-lg font-bold text-green-700">₹{booking.totalPrice}</p>
              </div>
              <div className="flex items-center gap-2">
                {booking.status === 'CONFIRMED' && <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-semibold border border-green-100"><CheckCircle2 className="w-4 h-4" /> Confirmed</span>}
                {booking.status === 'PENDING' && <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm font-semibold border border-amber-100"><Clock className="w-4 h-4" /> Pending</span>}
                {booking.status === 'COMPLETED' && <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold border border-blue-100"><CheckCircle2 className="w-4 h-4" /> Completed</span>}
                {booking.status === 'CANCELLED' && <span className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm font-semibold border border-red-100"><XCircle className="w-4 h-4" /> Cancelled</span>}
              </div>
            </div>
            
          </div>
        )) : (
          <div className="py-12 text-center bg-white rounded-2xl border border-slate-100 border-dashed">
            <Tractor className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-slate-700 mb-1">No bookings found</h3>
            <p className="text-slate-500 text-sm">No bookings match your current search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
