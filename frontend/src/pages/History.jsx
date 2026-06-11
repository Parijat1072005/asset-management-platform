import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, Clock, AlertCircle, XCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

const History = ({ user }) => {
  const [historyData, setHistoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Default to system view if admin, otherwise personal
  const [viewMode, setViewMode] = useState(user?.role === 'admin' ? 'system' : 'personal'); 

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        // Dynamically choose endpoint based on view mode
        const endpoint = viewMode === 'personal' 
          ? 'http://localhost:5000/api/bookings/mybookings' 
          : 'http://localhost:5000/api/bookings';
          
        const response = await axios.get(endpoint, config);
        setHistoryData(response.data);
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [viewMode]); // Re-run whenever view mode changes

  // Filter logic based on search
  const filteredHistory = historyData.filter(record => {
    const assetMatch = record.asset?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const userMatch = record.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return assetMatch || userMatch;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Returned': return <CheckCircle size={16} className="text-green-600" />;
      case 'Approved': return <Clock size={16} className="text-blue-600" />;
      case 'Pending': return <Clock size={16} className="text-yellow-600" />;
      case 'Overdue': return <AlertCircle size={16} className="text-red-600" />;
      case 'Rejected': return <XCircle size={16} className="text-gray-500" />;
      default: return null;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Returned': return 'bg-green-100 text-green-700';
      case 'Approved': return 'bg-blue-100 text-blue-700';
      case 'Pending': return 'bg-yellow-100 text-yellow-700';
      case 'Overdue': return 'bg-red-100 text-red-700';
      case 'Rejected': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Borrowing History</h1>
          <p className="text-gray-500 text-sm">Track active bookings and monitor past requests.</p>
        </div>
      </div>

      {/* Controls: Tabs & Search */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex bg-gray-100 p-1 rounded-lg w-full md:w-auto">
          <button 
            className={`flex-1 md:flex-none px-6 py-2 text-sm font-medium rounded-md transition-all ${viewMode === 'personal' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setViewMode('personal')}
          >
            My History
          </button>
          
          {user?.role === 'admin' && (
            <button 
              className={`flex-1 md:flex-none px-6 py-2 text-sm font-medium rounded-md transition-all ${viewMode === 'system' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setViewMode('system')}
            >
              System Activity (Admin)
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 w-full md:w-64 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
          <Search className="text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search assets or users..." 
            className="w-full outline-none text-gray-700 bg-transparent text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden min-h-[300px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-64 text-brand-blue">
             <Loader2 className="animate-spin" size={32} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm">
                  <th className="p-4 font-semibold">Asset Name</th>
                  {viewMode === 'system' && <th className="p-4 font-semibold">Borrower</th>}
                  <th className="p-4 font-semibold">Borrow Date</th>
                  <th className="p-4 font-semibold">Expected Return</th>
                  <th className="p-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredHistory.map((record) => (
                  <tr key={record._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-gray-800">{record.asset?.name || 'Deleted Asset'}</td>
                    {viewMode === 'system' && <td className="p-4 text-gray-600">{record.user?.name || 'Unknown User'}</td>}
                    <td className="p-4 text-gray-600 text-sm">{new Date(record.startDate).toLocaleDateString()}</td>
                    <td className="p-4 text-gray-600 text-sm">
                      {new Date(record.endDate).toLocaleDateString()}
                      {record.actualReturnDate && (
                        <span className="block text-xs text-green-600 mt-1">Returned: {new Date(record.actualReturnDate).toLocaleDateString()}</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(record.status)}`}>
                        {getStatusIcon(record.status)}
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredHistory.length === 0 && (
                  <tr>
                    <td colSpan={viewMode === 'system' ? 5 : 4} className="p-8 text-center text-gray-500">
                      No history records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;