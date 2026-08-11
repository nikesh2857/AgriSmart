import React, { useState, useEffect } from 'react';
import { PageType, User } from '../types';
import { Users, Plus, CheckCircle2, Circle, Calendar, MapPin, Clock, Loader2 } from 'lucide-react';
import { apiClient } from '../lib/apiClient';

interface Job {
  id: string;
  workName: string;
  farmer: { name: string; phone: string; address: string };
  workAddress: string;
  dateTime: string;
  workersNeeded: number;
  status: string;
  assignments?: { worker: { id: string; name: string; email: string; avatarUrl?: string } }[];
}

export function BookWorkers({ user }: { user: User }) {
  const [requests, setRequests] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    workAddress: '',
    workName: '',
    dateTime: '',
    workersNeeded: 1,
    lat: undefined as number | undefined,
    lng: undefined as number | undefined,
  });
  const [gettingLocation, setGettingLocation] = useState(false);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get<{ jobs: Job[] }>('/api/jobs');
      setRequests(data.jobs);
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/api/jobs', {
        workName: formData.workName,
        workAddress: formData.workAddress,
        dateTime: new Date(formData.dateTime).toISOString(),
        workersNeeded: Number(formData.workersNeeded),
        lat: formData.lat,
        lng: formData.lng,
      });
      setShowForm(false);
      setFormData({
        workAddress: '',
        workName: '',
        dateTime: '',
        workersNeeded: 1,
        lat: undefined,
        lng: undefined,
      });
      loadJobs();
    } catch (err) {
      console.error('Failed to create job:', err);
      alert('Failed to post job request.');
    }
  };

  const toggleStatus = async (id: string, action: 'complete' | 'cancel') => {
    try {
      if (action === 'complete') {
        await apiClient.patch(`/api/jobs/${id}/complete`);
      } else {
        await apiClient.patch(`/api/jobs/${id}/cancel`);
      }
      loadJobs();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Book Workers</h1>
          <p className="text-slate-500 mt-1">Request farm laborers and manage your workforce.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          {showForm ? <Circle className="w-5 h-5 rotate-45" /> : <Plus className="w-5 h-5" />}
          {showForm ? 'Cancel Request' : 'New Request'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Submit a Worker Request</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-slate-700">Assigned Work Place Address</label>
                <button
                  type="button"
                  onClick={() => {
                    setGettingLocation(true);
                    navigator.geolocation.getCurrentPosition(
                      (pos) => {
                        setFormData(prev => ({ ...prev, lat: pos.coords.latitude, lng: pos.coords.longitude }));
                        setGettingLocation(false);
                      },
                      (err) => {
                        alert('Could not get location.');
                        setGettingLocation(false);
                      }
                    );
                  }}
                  className="text-xs text-green-600 font-medium hover:underline flex items-center gap-1"
                >
                  {gettingLocation ? <Loader2 className="w-3 h-3 animate-spin" /> : <MapPin className="w-3 h-3" />}
                  {formData.lat ? 'Location Captured ✓' : 'Use Current GPS Location'}
                </button>
              </div>
              <input required type="text" name="workAddress" value={formData.workAddress} onChange={handleInputChange} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name of the Work</label>
              <input required type="text" name="workName" value={formData.workName} onChange={handleInputChange} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date and Time</label>
              <input required type="datetime-local" name="dateTime" value={formData.dateTime} onChange={handleInputChange} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Number of Workers Needed</label>
              <input required type="number" min="1" name="workersNeeded" value={formData.workersNeeded} onChange={handleInputChange} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div className="md:col-span-2 flex justify-end mt-2">
              <button type="submit" className="px-6 py-2.5 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors">
                Submit Request
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-sm font-medium text-slate-600">
                <th className="py-4 px-6">ID</th>
                <th className="py-4 px-6">Farmer</th>
                <th className="py-4 px-6">Work Details</th>
                <th className="py-4 px-6">Location</th>
                <th className="py-4 px-6">Schedule</th>
                <th className="py-4 px-6">Workers</th>
                <th className="py-4 px-6">Status</th>
                {(user.role === 'admin' || user.role === 'farmer') && <th className="py-4 px-6">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.map(req => (
                <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6 font-medium text-slate-800">{req.id.slice(0, 8)}</td>
                  <td className="py-4 px-6">
                    <p className="font-semibold text-slate-800">{req.farmer.name}</p>
                    <p className="text-xs text-slate-500">{req.farmer.phone}</p>
                  </td>
                  <td className="py-4 px-6">
                    <p className="font-medium text-slate-800">{req.workName}</p>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-start gap-1 text-slate-600 max-w-[200px]">
                      <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                      <span className="text-sm truncate" title={req.workAddress}>{req.workAddress}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1.5 text-slate-600 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(req.dateTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5 font-medium text-slate-800">
                        <Users className="w-4 h-4 text-green-600" />
                        <span>Needed: {req.workersNeeded}</span>
                      </div>
                      {req.assignments && req.assignments.length > 0 && (
                        <div className="space-y-1 border-t border-slate-100 pt-1.5 mt-0.5">
                          <p className="text-[10px] uppercase font-bold text-slate-400">Assigned:</p>
                          {req.assignments.map((a, idx) => (
                            <div key={idx} className="text-xs">
                              <p className="font-semibold text-slate-700">{a.worker.name}</p>
                              <a href={`mailto:${a.worker.email}`} className="text-slate-400 hover:text-green-600 hover:underline block truncate max-w-[130px]" title={a.worker.email}>
                                {a.worker.email}
                              </a>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      req.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                      req.status === 'ACCEPTED' ? 'bg-blue-100 text-blue-700' :
                      req.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {req.status.charAt(0).toUpperCase() + req.status.toLowerCase().slice(1)}
                    </span>
                  </td>
                  {(user.role === 'admin' || user.role === 'farmer') && (
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        {req.status === 'ACCEPTED' ? (
                          <>
                            <button 
                              onClick={() => toggleStatus(req.id, 'complete')}
                              className="text-xs font-semibold px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg border border-green-200 transition-colors"
                            >
                              Work Done
                            </button>
                            <button 
                              onClick={() => toggleStatus(req.id, 'cancel')}
                              className="text-xs font-semibold px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg border border-red-200 transition-colors"
                            >
                              Cancel Work
                            </button>
                          </>
                        ) : req.status === 'PENDING' ? (
                          <button 
                            onClick={() => toggleStatus(req.id, 'cancel')}
                            className="text-xs font-semibold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 transition-colors"
                          >
                            Cancel Request
                          </button>
                        ) : (
                          <span className="text-xs font-medium text-slate-400">No actions</span>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-green-600" />
                    Loading requests...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No worker requests found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
