import React, { useState, useEffect } from 'react';
import { Search, Calendar, Clock, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

const Bookings = () => {
  const [assets, setAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Booking Form State
  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
    quantity: 1,
    purpose: ''
  });

  // Fetch Available Assets
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get('http://localhost:5000/api/assets', config);
        // Only show assets that are not out of stock in discovery
        setAssets(response.data);
      } catch (error) {
        console.error("Error fetching assets:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssets();
  }, []);

  const filteredAssets = assets.filter(asset => 
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (bookingData.quantity > selectedAsset.quantity) {
      alert("Requested quantity exceeds available inventory!");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const payload = {
        assetId: selectedAsset._id,
        ...bookingData
      };

      await axios.post('http://localhost:5000/api/bookings', payload, config);
      alert(`Successfully requested ${bookingData.quantity}x ${selectedAsset.name}`);
      
      setSelectedAsset(null);
      setBookingData({ startDate: '', endDate: '', quantity: 1, purpose: '' });
    } catch (error) {
      console.error("Error submitting booking:", error);
      alert(error.response?.data?.message || "Error submitting request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full text-brand-blue">
        <Loader2 className="animate-spin" size={32} />
        <span className="ml-3 font-medium">Loading inventory...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Asset Discovery & Booking</h1>
          <p className="text-gray-500 text-sm">Browse available inventory and request resources.</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
        <Search className="text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Search by asset name or category..." 
          className="w-full outline-none text-gray-700 bg-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Asset Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredAssets.map((asset) => (
          <div key={asset._id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold text-brand-blue bg-blue-50 px-2 py-1 rounded-md">
                  {asset.category}
                </span>
                <span className={`text-xs font-medium px-2 py-1 rounded-md ${
                  asset.quantity > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {asset.quantity} Available
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">{asset.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{asset.description}</p>
            </div>
            
            <button 
              onClick={() => setSelectedAsset(asset)}
              disabled={asset.quantity === 0}
              className={`w-full py-2 rounded-lg font-medium transition-colors ${
                asset.quantity > 0 
                  ? 'bg-gray-900 text-white hover:bg-gray-800' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {asset.quantity > 0 ? 'Request Asset' : 'Out of Stock'}
            </button>
          </div>
        ))}
        {filteredAssets.length === 0 && (
          <div className="col-span-full p-8 text-center text-gray-500 bg-white rounded-xl border border-gray-100">
            No assets found matching your search.
          </div>
        )}
      </div>

      {/* Booking Request Modal */}
      {selectedAsset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Request Asset</h2>
                <p className="text-sm text-gray-500">{selectedAsset.name}</p>
              </div>
            </div>
            
            <form onSubmit={handleBookingSubmit} className="p-6 space-y-4">
              <div className="bg-blue-50 p-3 rounded-lg flex items-start gap-3 border border-blue-100">
                <AlertCircle className="text-brand-blue mt-0.5" size={16} />
                <p className="text-xs text-blue-800">
                  You are requesting an asset that requires admin approval. You can request up to <strong>{selectedAsset.quantity}</strong> items.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <Calendar size={14} /> Start Date
                  </label>
                  <input required type="date" className="w-full p-2 border border-gray-200 rounded-lg focus:border-brand-blue focus:outline-none" 
                    value={bookingData.startDate} onChange={(e) => setBookingData({...bookingData, startDate: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <Clock size={14} /> End Date
                  </label>
                  <input required type="date" className="w-full p-2 border border-gray-200 rounded-lg focus:border-brand-blue focus:outline-none" 
                    value={bookingData.endDate} onChange={(e) => setBookingData({...bookingData, endDate: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Needed</label>
                <input required type="number" min="1" max={selectedAsset.quantity} 
                  className="w-full p-2 border border-gray-200 rounded-lg focus:border-brand-blue focus:outline-none"
                  value={bookingData.quantity} onChange={(e) => setBookingData({...bookingData, quantity: parseInt(e.target.value)})} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purpose of Booking</label>
                <textarea required rows="2" placeholder="Briefly describe why you need this asset..."
                  className="w-full p-2 border border-gray-200 rounded-lg focus:border-brand-blue focus:outline-none"
                  value={bookingData.purpose} onChange={(e) => setBookingData({...bookingData, purpose: e.target.value})} />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setSelectedAsset(null)} disabled={isSubmitting} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition disabled:opacity-50">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-brand-blue text-white font-medium hover:bg-blue-700 rounded-lg transition flex items-center gap-2 disabled:bg-blue-400">
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;