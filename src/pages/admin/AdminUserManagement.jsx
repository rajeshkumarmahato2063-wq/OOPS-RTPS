import React from 'react';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/common/Badge';
import { Users, Shield, Trash2, UserCheck } from 'lucide-react';

const AdminUserManagement = () => {
  const { usersList, updateUserRole, deleteUser, user: currentUser } = useAuth();

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Users className="w-6 h-6 text-purple-400" />
          Users & Access Control
        </h1>
        <p className="text-xs text-slate-400 mt-1">Manage system accounts and grant Staff/Admin privileges.</p>
      </div>

      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="p-3.5">User Name</th>
              <th className="p-3.5">Email Address</th>
              <th className="p-3.5">Assigned Role</th>
              <th className="p-3.5">Account Status</th>
              <th className="p-3.5 text-right">Role Management</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {usersList.map((u) => (
              <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="p-3.5 font-bold text-white flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold text-xs border border-slate-700">
                    {u.name.charAt(0)}
                  </div>
                  <span>{u.name}</span>
                </td>
                <td className="p-3.5 text-slate-400 font-mono">{u.email}</td>
                <td className="p-3.5">
                  <Badge variant={u.role}>{u.role}</Badge>
                </td>
                <td className="p-3.5">
                  <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Active
                  </span>
                </td>
                <td className="p-3.5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <select
                      value={u.role}
                      onChange={(e) => updateUserRole(u.id, e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 font-medium focus:outline-hidden"
                    >
                      <option value="user">User (Driver)</option>
                      <option value="staff">Staff Gate Operator</option>
                      <option value="admin">System Admin</option>
                    </select>

                    {u.id !== currentUser?.id && (
                      <button
                        onClick={() => deleteUser(u.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUserManagement;
