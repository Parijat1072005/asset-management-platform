import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Loader2, ArrowLeftRight } from 'lucide-react';
import axios from 'axios';

const Approvals = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      // Fetches all system bookings (Admin only route)
      const response = await axios.get('/api/bookings', config);
      setRequests(response.data);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const pendingRequests = requests.filter(req => req.status === 'Pending');
  const activeAllocations = requests.filter(req => req.status === 'Approved');

  const handleAction = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      await axios.put(`/api/bookings/${id}/status`, { status: newStatus }, config);
      
      // Re-fetch to ensure data and inventory counts are perfectly synced
      fetchBookings();
    } catch (error) {
      console.error("Error updating status:", error);
      alert(error.response?.data?.message || "Error updating booking status.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full text-brand-blue">
        <Loader2 className="animate-spin" size={32} />
        <span className="ml-3 font-medium">Loading requests...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Approval Workflow</h1>
        <p className="text-gray-500 text-sm">Review booking requests and manage active asset allocations.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button 
          className={`py-3 px-6 font-medium text-sm flex items-center gap-2 ${activeTab === 'pending' ? 'border-b-2 border-brand-blue text-brand-blue' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Requests
          <span className="bg-blue-100 text-brand-blue py-0.5 px-2 rounded-full text-xs">{pendingRequests.length}</span>
        </button>
        <button 
          className={`py-3 px-6 font-medium text-sm flex items-center gap-2 ${activeTab === 'active' ? 'border-b-2 border-brand-blue text-brand-blue' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('active')}
        >
          Active Allocations
          <span className="bg-green-100 text-green-700 py-0.5 px-2 rounded-full text-xs">{activeAllocations.length}</span>
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm">
                <th className="p-4 font-semibold">Requester</th>
                <th className="p-4 font-semibold">Asset Details</th>
                <th className="p-4 font-semibold">Duration</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(activeTab === 'pending' ? pendingRequests : activeAllocations).map((req) => (
                <tr key={req._id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <span className="font-medium text-gray-800 block">{req.user?.name || 'Unknown User'}</span>
                    <span className="text-xs text-gray-500 truncate max-w-[150px] block" title={req.purpose}>"{req.purpose}"</span>
                  </td>
                  <td className="p-4">
                    <span className="font-medium text-gray-800 block">{req.asset?.name || 'Deleted Asset'}</span>
                    <span className="text-xs text-gray-500">Qty: {req.quantity}</span>
                  </td>
                  <td className="p-4 text-gray-600 text-sm">
                    {new Date(req.startDate).toLocaleDateString()} to {new Date(req.endDate).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <span className={`flex items-center gap-1 text-sm font-medium ${
                      req.status === 'Pending' ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {req.status === 'Pending' ? <Clock size={16} /> : <CheckCircle size={16} />}
                      {req.status}
                    </span>
                  </td>
                  <td className="p-4 flex items-center justify-end gap-2">
                    {activeTab === 'pending' && (
                      <>
                        <button 
                          onClick={() => handleAction(req._id, 'Approved')}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition" title="Approve"
                        >
                          <CheckCircle size={20} />
                        </button>
                        <button 
                          onClick={() => handleAction(req._id, 'Rejected')}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Reject"
                        >
                          <XCircle size={20} />
                        </button>
                      </>
                    )}
                    {activeTab === 'active' && (
                      <button 
                        onClick={() => handleAction(req._id, 'Returned')}
                        className="px-3 py-1.5 text-sm bg-blue-50 text-brand-blue hover:bg-brand-blue hover:text-white font-medium rounded-lg transition flex items-center gap-1"
                      >
                        <ArrowLeftRight size={14} /> Mark Returned
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {(activeTab === 'pending' ? pendingRequests : activeAllocations).length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    No {activeTab} records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Approvals;