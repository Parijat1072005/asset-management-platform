import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, Loader2 } from 'lucide-react';
import axios from 'axios';

const Inventory = ({ user }) => {
    const [assets, setAssets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showCustomCategory, setShowCustomCategory] = useState(false);

    // Form State
    const [formData, setFormData] = useState({ _id: null, name: '', category: '', description: '', quantity: 0, status: 'Available' });
    const [isEditing, setIsEditing] = useState(false);

    // Default categories + any unique ones already in the database
    const defaultCategories = ['DSLR Cameras', 'Audio Systems', 'Lighting', 'Costumes', 'Stage Props'];
    const uniqueCategories = Array.from(new Set([
        ...defaultCategories,
        ...assets.map(a => a.category).filter(Boolean)
    ])).sort();

    // Fetch Assets from Backend on Component Mount
    useEffect(() => {
        const fetchAssets = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                
                const response = await axios.get('http://localhost:5000/api/assets', config);
                setAssets(response.data);
            } catch (error) {
                console.error("Error fetching assets:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAssets();
    }, []);

    // Filter logic
    const filteredAssets = assets.filter(asset =>
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Form Handlers
    const openAddModal = () => {
        setFormData({ _id: null, name: '', category: '', description: '', quantity: 0, status: 'Available' });
        setIsEditing(false);
        setShowCustomCategory(false);
        setIsModalOpen(true);
    };

    const openEditModal = (asset) => {
        setFormData(asset);
        setIsEditing(true);
        setShowCustomCategory(false);
        setIsModalOpen(true);
    };

    // API Call: Delete Asset
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this asset?')) {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                
                await axios.delete(`http://localhost:5000/api/assets/${id}`, config);
                setAssets(assets.filter(a => a._id !== id));
            } catch (error) {
                console.error("Error deleting asset:", error);
                alert("Error deleting asset. Ensure you have admin privileges.");
            }
        }
    };

    // API Call: Add or Edit Asset
    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        try {
            if (isEditing) {
                const response = await axios.put(`http://localhost:5000/api/assets/${formData._id}`, formData, config);
                setAssets(assets.map(a => a._id === formData._id ? response.data : a));
            } else {
                const response = await axios.post('http://localhost:5000/api/assets', formData, config);
                setAssets([...assets, response.data]);
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error("Error saving asset:", error);
            alert("Error saving asset. Ensure you have admin privileges.");
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
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Inventory Management</h1>
                    <p className="text-gray-500 text-sm">Manage campus resources and asset quantities.</p>
                </div>
                {user?.role === 'admin' && (
                    <button
                        onClick={openAddModal}
                        className="bg-brand-blue text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Add Asset
                    </button>
                )}
            </div>

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                <Search className="text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search assets by name or category..."
                    className="w-full outline-none text-gray-700 bg-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm">
                                <th className="p-4 font-semibold">Asset Name</th>
                                <th className="p-4 font-semibold">Category</th>
                                <th className="p-4 font-semibold">Quantity</th>
                                <th className="p-4 font-semibold">Status</th>
                                {user?.role === 'admin' && <th className="p-4 font-semibold text-right">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredAssets.map((asset) => (
                                <tr key={asset._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 flex flex-col">
                                        <span className="font-medium text-gray-800">{asset.name}</span>
                                        <span className="text-xs text-gray-500">{asset.description}</span>
                                    </td>
                                    <td className="p-4 text-gray-600">{asset.category}</td>
                                    <td className="p-4 text-gray-600 font-medium">{asset.quantity}</td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                            asset.status === 'Available' ? 'bg-green-100 text-green-700' :
                                            asset.status === 'Low Stock' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                            {asset.status}
                                        </span>
                                    </td>
                                    {user?.role === 'admin' && (
                                        <td className="p-4 flex items-center justify-end gap-3">
                                            <button onClick={() => openEditModal(asset)} className="text-gray-400 hover:text-brand-blue transition">
                                                <Edit2 size={18} />
                                            </button>
                                            <button onClick={() => handleDelete(asset._id)} className="text-gray-400 hover:text-red-500 transition">
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                            {filteredAssets.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-500">
                                        No assets found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800">{isEditing ? 'Edit Asset' : 'Add New Asset'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Asset Name</label>
                                <input required type="text" className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-blue"
                                    value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                {!showCustomCategory ? (
                                    <select
                                        required
                                        className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-blue"
                                        value={formData.category}
                                        onChange={(e) => {
                                            if (e.target.value === '___CUSTOM___') {
                                                setShowCustomCategory(true);
                                                setFormData({ ...formData, category: '' });
                                            } else {
                                                setFormData({ ...formData, category: e.target.value });
                                            }
                                        }}
                                    >
                                        <option value="" disabled>Select a category...</option>
                                        {uniqueCategories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                        <option value="___CUSTOM___">✏️ Add Custom Category...</option>
                                    </select>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="flex gap-2">
                                            <input
                                                required
                                                type="text"
                                                placeholder="Type new category name..."
                                                className="w-full p-2 border border-brand-blue rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100"
                                                value={formData.category}
                                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                autoFocus
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowCustomCategory(false);
                                                    setFormData({ ...formData, category: '' });
                                                }}
                                                className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 border border-gray-200 rounded-lg transition whitespace-nowrap"
                                            >
                                                ← Back
                                            </button>
                                        </div>
                                        <p className="text-xs text-brand-blue font-medium">New category — will be available for future assets too.</p>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea required rows="3" className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-blue"
                                    value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                                    <input required type="number" min="0" className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-blue"
                                        value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })} />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-blue"
                                        value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                                        <option value="Available">Available</option>
                                        <option value="Low Stock">Low Stock</option>
                                        <option value="Out of Stock">Out of Stock</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition">
                                    Cancel
                                </button>
                                <button type="submit" className="px-4 py-2 bg-brand-blue text-white font-medium hover:bg-blue-700 rounded-lg transition">
                                    {isEditing ? 'Save Changes' : 'Add Asset'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;