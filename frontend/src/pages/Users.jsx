import React, { useState, useEffect } from 'react';
import { Search, Shield, User as UserIcon, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

const Users = ({ user: currentUser }) => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', msg }

  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  };

  // Fetch real users from the database
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await axios.get('/api/auth/users', config);
        setUsers(data);
      } catch (err) {
        showToast('error', 'Failed to load users.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const handleRoleChange = async (userId, newRole) => {
    // Guard: can't change your own role
    if (userId === currentUser?._id) {
      showToast('error', 'You cannot change your own role.');
      return;
    }
    setUpdatingId(userId);
    try {
      const { data } = await axios.put(
        `/api/auth/users/${userId}/role`,
        { role: newRole },
        config
      );
      setUsers(prev => prev.map(u => u._id === userId ? data : u));
      showToast('success', `${data.name} is now ${newRole === 'admin' ? 'an Administrator' : 'a Consumer'}.`);
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to update role.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full text-brand-blue">
        <Loader2 className="animate-spin" size={32} />
        <span className="ml-3 font-medium">Loading users...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium animate-fade-in ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {toast.type === 'success'
            ? <CheckCircle size={18} />
            : <AlertCircle size={18} />
          }
          {toast.msg}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
        <p className="text-gray-500 text-sm">
          Manage system access and assign administrator privileges.
          <span className="ml-2 text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-0.5 rounded-full">
            You cannot change your own role
          </span>
        </p>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
        <Search className="text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search users by name or email..."
          className="w-full outline-none text-gray-700 bg-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm">
              <th className="p-4 font-semibold">User Details</th>
              <th className="p-4 font-semibold">Current Role</th>
              <th className="p-4 font-semibold text-right">Change Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredUsers.map((u) => {
              const isSelf = u._id === currentUser?._id;
              const isUpdating = updatingId === u._id;
              return (
                <tr key={u._id} className={`hover:bg-gray-50 transition-colors ${isSelf ? 'opacity-60' : ''}`}>
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-brand-blue flex items-center justify-center font-bold text-sm shrink-0">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 flex items-center gap-2">
                        {u.name}
                        {isSelf && (
                          <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-semibold">You</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                      u.role === 'admin'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {u.role === 'admin' ? <Shield size={12} /> : <UserIcon size={12} />}
                      {u.role === 'admin' ? 'Administrator' : 'Consumer'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {isSelf ? (
                      <span className="text-xs text-gray-400 italic">Cannot edit self</span>
                    ) : isUpdating ? (
                      <div className="flex items-center justify-end gap-2 text-gray-400 text-sm">
                        <Loader2 size={16} className="animate-spin" />
                        Saving...
                      </div>
                    ) : (
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        className="p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-blue cursor-pointer"
                      >
                        <option value="consumer">Consumer</option>
                        <option value="admin">Administrator</option>
                      </select>
                    )}
                  </td>
                </tr>
              );
            })}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan="3" className="p-8 text-center text-gray-400 text-sm">
                  No users match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;