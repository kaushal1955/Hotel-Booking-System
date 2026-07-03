import React, { useEffect, useState } from 'react';
import { FiSearch, FiToggleLeft, FiToggleRight, FiTrash2 } from 'react-icons/fi';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    try {
      const params = {};
      if (roleFilter) params.role = roleFilter;
      const { data } = await adminAPI.getUsers(params);
      setUsers(data.data);
    } catch (err) { toast.error('Failed to load users'); }
    setLoading(false);
  };

  const handleToggleStatus = async (id) => {
    try {
      const { data } = await adminAPI.toggleUserStatus(id);
      toast.success(data.message);
      loadUsers();
    } catch (err) { toast.error('Failed to toggle status'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user permanently?')) return;
    try {
      await adminAPI.deleteUser(id);
      toast.success('User deleted');
      loadUsers();
    } catch (err) { toast.error('Failed to delete'); }
  };

  const filteredUsers = users.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const roleColors = {
    admin: 'bg-purple-100 text-purple-700',
    owner: 'bg-blue-100 text-blue-700',
    customer: 'bg-green-100 text-green-700',
    guest: 'bg-gray-100 text-gray-700',
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Manage Users</h1>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..." className="input-field pl-10" />
        </div>
        <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); loadUsers(); }} className="input-field sm:w-48">
          <option value="">All Roles</option>
          <option value="customer">Customer</option>
          <option value="owner">Owner</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" /></div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left p-4">User</th>
                <th className="text-left p-4">Email</th>
                <th className="text-left p-4">Phone</th>
                <th className="text-left p-4">Role</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Verified</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id} className="border-t hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 font-semibold text-xs">{user.name?.[0]?.toUpperCase() || '?'}</span>
                      </div>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-500">{user.email}</td>
                  <td className="p-4 text-gray-500">{user.phone || '-'}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${roleColors[user.role] || 'bg-gray-100'}`}>{user.role}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {user.isActive ? 'Active' : 'Blocked'}
                    </span>
                  </td>
                  <td className="p-4">
                    {user.isVerified ? <span className="text-green-600 font-medium">Yes</span> : <span className="text-gray-400">No</span>}
                  </td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <button onClick={() => handleToggleStatus(user._id)} className={`p-1.5 rounded-lg hover:bg-gray-100 ${user.isActive ? 'text-orange-500' : 'text-green-500'}`} title={user.isActive ? 'Block' : 'Activate'}>
                        {user.isActive ? <FiToggleRight size={18} /> : <FiToggleLeft size={18} />}
                      </button>
                      <button onClick={() => handleDelete(user._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-600" title="Delete"><FiTrash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && <tr><td colSpan="7" className="p-8 text-center text-gray-500">No users found.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;