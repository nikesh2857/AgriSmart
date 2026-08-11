import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { Calendar, MapPin, Users, Briefcase, CheckCircle2, Clock, Loader2, LogOut } from 'lucide-react';
import { apiClient } from '../lib/apiClient';
import { io } from 'socket.io-client';

interface Job {
  id: string;
  workName: string;
  farmer: { name: string; phone: string; email: string; address: string };
  workAddress: string;
  dateTime: string;
  workersNeeded: number;
  status: string;
}

export function WorkerJobs({ user }: { user: User }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  // Contacts Slot States
  const [contacts, setContacts] = useState<{ id: string; name: string; email: string; avatarUrl?: string; jobName: string; role: string }[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(true);

  const loadContacts = async () => {
    setLoadingContacts(true);
    try {
      const data = await apiClient.get<typeof contacts>('/api/erp/contacts');
      setContacts(data);
    } catch (err) {
      console.error('Failed to load contacts:', err);
    } finally {
      setLoadingContacts(false);
    }
  };

  useEffect(() => {
    loadContacts();
    const contactsInterval = setInterval(loadContacts, 15000);
    return () => clearInterval(contactsInterval);
  }, []);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get<{ jobs: Job[] }>('/api/jobs');
      setJobs(data.jobs);
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptJob = async (job: Job) => {
    try {
      await apiClient.patch(`/api/jobs/${job.id}/accept`);
      loadJobs(); // refresh the list
      loadContacts(); // refresh contacts
    } catch (err) {
      console.error('Failed to accept job:', err);
      alert('Failed to accept job. It may have been taken or cancelled.');
    }
  };

  const handleRejectJob = async (job: Job) => {
    try {
      await apiClient.post(`/api/jobs/${job.id}/reject`);
      setJobs(jobs.filter(j => j.id !== job.id));
    } catch (err) {
      console.error('Failed to reject job:', err);
    }
  };

  const handleCheckIn = async (job: Job) => {
    if (!navigator.geolocation) return alert('Geolocation not supported');
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        await apiClient.post(`/api/jobs/${job.id}/checkin`, { lat: pos.coords.latitude, lng: pos.coords.longitude });
        loadJobs();
      } catch (err: any) {
        alert(err.response?.data?.error || 'Failed to check-in. Make sure you are near the farm.');
      }
    }, () => alert('Failed to get location'));
  };

  const handleCheckOut = async (job: Job) => {
    try {
      await apiClient.post(`/api/jobs/${job.id}/checkout`);
      loadJobs();
    } catch (err) {
      console.error('Failed to checkout:', err);
    }
  };

  // Real-time tracking for active jobs
  useEffect(() => {
    const activeJobs = jobs.filter(j => j.status === 'ACCEPTED' || j.status === 'IN_PROGRESS');
    if (activeJobs.length === 0) return;

    const socket = io();
    socket.emit('register', user.id);

    const interval = setInterval(() => {
      navigator.geolocation.getCurrentPosition((pos) => {
        activeJobs.forEach(job => {
          socket.emit('worker_ping', {
            userId: user.id,
            jobId: job.id,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
        });
      });
    }, 30000); // Ping every 30 seconds

    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, [jobs, user.id]);

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Available Work</h1>
          <p className="text-slate-500 mt-1">View and accept farming job requests in your area.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Main Work Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-sm font-medium text-slate-600">
                    <th className="py-4 px-6">ID</th>
                    <th className="py-4 px-6">Work Details</th>
                    <th className="py-4 px-6">Farmer Info</th>
                    <th className="py-4 px-6">Work Location</th>
                    <th className="py-4 px-6">Schedule</th>
                    <th className="py-4 px-6">Workers</th>
                    <th className="py-4 px-6">Status / Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {jobs.map(job => (
                    <tr key={job.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-medium text-slate-800">{job.id.slice(0, 8)}</td>
                      <td className="py-4 px-6">
                        <p className="font-semibold text-slate-800 flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-slate-400" />
                          {job.workName}
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-semibold text-slate-800">{job.farmer.name}</p>
                        <a href={`mailto:${job.farmer.email}`} className="text-xs text-green-600 hover:underline block mb-1">
                          {job.farmer.email}
                        </a>
                        <p className="text-xs text-slate-500 truncate max-w-[150px]" title={job.farmer.address}>{job.farmer.address}</p>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-start gap-1 text-slate-600 max-w-[200px]">
                          <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                          <span className="text-sm truncate" title={job.workAddress}>{job.workAddress}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1.5 text-slate-600 text-sm">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(job.dateTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1.5 font-medium text-slate-800">
                          <Users className="w-4 h-4 text-green-600" />
                          {job.workersNeeded}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {job.status === 'PENDING' ? (
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleAcceptJob(job)}
                              className="text-xs font-semibold px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors shadow-sm"
                            >
                              Accept Job
                            </button>
                            <button 
                              onClick={() => handleRejectJob(job)}
                              className="text-xs font-semibold px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl transition-colors shadow-sm"
                            >
                              Reject
                            </button>
                          </div>
                        ) : job.status === 'ACCEPTED' ? (
                          <button 
                            onClick={() => handleCheckIn(job)}
                            className="text-xs font-semibold px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors shadow-sm flex items-center gap-2"
                          >
                            <MapPin className="w-4 h-4" /> Check-In
                          </button>
                        ) : job.status === 'IN_PROGRESS' ? (
                          <button 
                            onClick={() => handleCheckOut(job)}
                            className="text-xs font-semibold px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-colors shadow-sm flex items-center gap-2"
                          >
                            <LogOut className="w-4 h-4" /> Check-Out
                          </button>
                        ) : (
                          <span className={`flex items-center gap-1.5 px-3 py-1.5 w-fit rounded-full text-xs font-semibold bg-green-100 text-green-700`}>
                            <CheckCircle2 className="w-4 h-4" /> Completed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-green-600" />
                        Loading available jobs...
                      </td>
                    </tr>
                  ) : jobs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        No farming jobs available at the moment.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Contacts Slot */}
        <div className="lg:col-span-1 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col h-[280px] lg:h-auto min-h-[250px]">
          <div className="flex items-center gap-2 mb-4 text-slate-800 border-b border-slate-100 pb-2">
            <span className="text-2xl">📞</span>
            <h3 className="font-semibold text-slate-800 text-base">Active Contacts</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-1 space-y-3 scrollbar-thin">
            {loadingContacts ? (
              <div className="h-full flex items-center justify-center py-6 text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin text-green-600 mr-2" />
                <span className="text-xs">Loading contacts...</span>
              </div>
            ) : contacts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-10">
                <p className="text-sm font-medium">No contacts yet.</p>
                <p className="text-xs mt-0.5">Contacts appear once you accept a job request.</p>
              </div>
            ) : (
              contacts.map((contact, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100/70 border border-slate-100 transition-all">
                  <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-sm shrink-0 border border-green-200">
                    {contact.avatarUrl ? (
                      <img src={contact.avatarUrl} alt={contact.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      contact.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-800 text-sm truncate">{contact.name}</h4>
                    <a href={`mailto:${contact.email}`} className="text-xs text-green-600 hover:underline truncate block" title={contact.email}>
                      {contact.email}
                    </a>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-800 font-medium">
                      {contact.role}
                    </span>
                    <span className="block text-[9px] text-slate-400 truncate max-w-[80px] mt-0.5" title={contact.jobName}>
                      {contact.jobName}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
