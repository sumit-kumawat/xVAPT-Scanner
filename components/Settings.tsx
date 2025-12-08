
import React, { useState, useEffect } from 'react';
import { User, Client, UserRole } from '../types';
import { Users, Globe, Plus, Trash2, Edit, Save, X, Phone, MapPin, User as UserIcon, CheckCircle, ShieldAlert } from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';

interface SettingsProps {
  currentUser: User;
  users: User[];
  clients: Client[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  onNotify: (type: 'success' | 'error' | 'info', message: string) => void;
  onDeleteClientData: (clientId: string, deleteData: boolean) => void;
  onUpdatePassword: (newPass: string) => void;
}

export const SettingsPage: React.FC<SettingsProps> = ({ 
  currentUser, users, clients, setUsers, setClients, onNotify, onDeleteClientData
}) => {
  const canManageUsers = currentUser.role === UserRole.ADMIN;
  const [activeTab, setActiveTab] = useState<'users' | 'clients'>(canManageUsers ? 'users' : 'clients');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  
  // User Form
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userForm, setUserForm] = useState<Partial<User>>({ username: '', email: '', role: UserRole.VIEWER, assignedClientId: '' });
  const [usernameError, setUsernameError] = useState('');
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  // Client Form
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [clientForm, setClientForm] = useState<Partial<Client>>({ name: '', domain: '', contactEmail: '', phone: '', address: '', contactPerson: '' });
  const [deleteClientConfirmId, setDeleteClientConfirmId] = useState<string | null>(null);
  const [deleteCascade, setDeleteCascade] = useState(true);

  // Live Username Check
  useEffect(() => {
    if (userForm.username && modalMode === 'add') {
      const exists = users.some(u => 
        u.username.toLowerCase() === userForm.username?.toLowerCase() && 
        u.id !== editingUserId
      );
      setUsernameError(exists ? 'Username is already taken' : '');
    } else {
      setUsernameError('');
    }
  }, [userForm.username, users, editingUserId, modalMode]);

  // -- USER ACTIONS --
  const handleOpenUserModal = (user?: User) => {
    if (user) {
      setModalMode('edit');
      setEditingUserId(user.id);
      setUserForm({ ...user });
    } else {
      setModalMode('add');
      setEditingUserId(null);
      setUserForm({ username: '', email: '', role: UserRole.VIEWER, assignedClientId: '' });
    }
    setIsModalOpen(true);
  };

  const handleSaveUser = () => {
    if (usernameError || !userForm.username || !userForm.email) {
      onNotify('error', 'Please fix validation errors.');
      return;
    }
    if (userForm.role === UserRole.VIEWER && !userForm.assignedClientId) {
      onNotify('error', 'Viewers must be assigned to a client.');
      return;
    }

    if (modalMode === 'add') {
      const newUser: User = {
        id: crypto.randomUUID(), 
        username: userForm.username!,
        email: userForm.email!,
        role: userForm.role || UserRole.VIEWER,
        password: 'password123',
        isTempPassword: true,
        assignedClientId: userForm.assignedClientId
      };
      setUsers(prev => [...prev, newUser]);
      onNotify('success', `User ${newUser.username} created.`);
    } else {
      if (!editingUserId) return;
      setUsers(prev => prev.map(u => 
        u.id === editingUserId ? { ...u, ...userForm } as User : u
      ));
      onNotify('success', 'User updated successfully.');
    }
    setIsModalOpen(false);
  };

  const initiateDeleteUser = (id: string) => {
    if (currentUser.id === id) {
      onNotify('error', 'Self-deletion is not permitted.');
      return;
    }
    setDeleteUserId(id);
  };

  const confirmDeleteUser = () => {
    if (deleteUserId) {
      setUsers(prev => prev.filter(u => u.id !== deleteUserId));
      onNotify('success', 'User deleted successfully.');
      setDeleteUserId(null);
    }
  };

  // -- CLIENT ACTIONS --
  const handleOpenClientModal = (client?: Client) => {
    if (client) {
      setModalMode('edit');
      setEditingClientId(client.id);
      setClientForm({ ...client });
    } else {
      setModalMode('add');
      setEditingClientId(null);
      setClientForm({ name: '', domain: '', contactEmail: '', phone: '', address: '', contactPerson: '' });
    }
    setIsModalOpen(true);
  };

  const handleSaveClient = () => {
    if (!clientForm.name || !clientForm.domain) {
      onNotify('error', 'Client Name and Domain are required.');
      return;
    }

    if (modalMode === 'add') {
      const newClient: Client = {
        id: crypto.randomUUID(),
        name: clientForm.name!,
        domain: clientForm.domain!,
        contactEmail: clientForm.contactEmail || '',
        phone: clientForm.phone || '',
        address: clientForm.address || '',
        contactPerson: clientForm.contactPerson || ''
      };
      setClients(prev => [...prev, newClient]);
      onNotify('success', `Client ${newClient.name} registered.`);
    } else {
      if (!editingClientId) return;
      setClients(prev => prev.map(c => 
        c.id === editingClientId ? { ...c, ...clientForm } as Client : c
      ));
      onNotify('success', 'Client details updated.');
    }
    setIsModalOpen(false);
  };

  const confirmDeleteClient = () => {
    if (deleteClientConfirmId) {
      onDeleteClientData(deleteClientConfirmId, deleteCascade);
      onNotify('success', 'Client removal processed.');
      setDeleteClientConfirmId(null);
    }
  };

  const canManageClients = currentUser.role !== UserRole.VIEWER;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-800 pb-4">
        {canManageUsers && (
          <button 
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-all font-medium ${
              activeTab === 'users' 
                ? 'bg-gradient-to-r from-blue-700 to-[#4285F4] text-white shadow-lg shadow-blue-900/20' 
                : 'text-slate-400 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <Users size={18} /> User Access
          </button>
        )}
        {canManageClients && (
          <button 
            onClick={() => setActiveTab('clients')}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-all font-medium ${
              activeTab === 'clients' 
                ? 'bg-gradient-to-r from-blue-700 to-[#4285F4] text-white shadow-lg shadow-blue-900/20' 
                : 'text-slate-400 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <Globe size={18} /> Clients
          </button>
        )}
      </div>

      {/* USERS TAB */}
      {activeTab === 'users' && canManageUsers && (
        <div className="animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-200">System Users</h3>
              <p className="text-sm text-slate-500">Manage access and RBAC roles</p>
            </div>
            <button 
              type="button"
              onClick={() => handleOpenUserModal()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-emerald-900/20 font-medium transition-transform active:scale-95"
            >
              <Plus size={18} /> Create User
            </button>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-slate-400">
              <thead className="bg-slate-950 text-slate-300 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Identity</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Scope</th>
                  <th className="px-6 py-4 text-right">Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-200 flex items-center gap-2">
                        {user.username}
                        {user.id === currentUser.id && <span className="text-[10px] bg-blue-500/20 text-[#4285F4] px-1.5 rounded uppercase">You</span>}
                      </div>
                      <div className="text-sm text-slate-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                        user.role === UserRole.ADMIN ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                        user.role === UserRole.MANAGER ? 'bg-blue-500/10 text-[#4285F4] border border-blue-500/20' :
                        'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono">
                      {user.role === UserRole.VIEWER ? (
                        <span className="text-orange-300 flex items-center gap-1">
                          <Globe size={12}/> {clients.find(c => c.id === user.assignedClientId)?.name || 'Unassigned'}
                        </span>
                      ) : (
                        <span className="text-green-400 flex items-center gap-1"><CheckCircle size={12}/> Global</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex justify-end gap-2">
                         <button 
                            type="button"
                            onClick={() => handleOpenUserModal(user)} 
                            className="text-[#4285F4] hover:text-white p-2 hover:bg-blue-600/20 rounded transition-colors" 
                            title="Edit User"
                          >
                           <Edit size={16} />
                         </button>
                         {user.id !== currentUser.id && (
                           <button 
                              type="button"
                              onClick={() => initiateDeleteUser(user.id)} 
                              className="text-red-400 hover:text-white p-2 hover:bg-red-600/20 rounded transition-colors" 
                              title="Delete User"
                            >
                             <Trash2 size={16} />
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
      )}

      {/* CLIENTS TAB */}
      {activeTab === 'clients' && canManageClients && (
        <div className="animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-200">Client Portfolio</h3>
              <p className="text-sm text-slate-500">Manage client profiles and scan targets</p>
            </div>
            <button 
                type="button"
                onClick={() => handleOpenClientModal()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-emerald-900/20 font-medium transition-transform active:scale-95"
            >
              <Plus size={18} /> New Client
            </button>
          </div>

          {clients.length === 0 ? (
            <div className="text-center py-20 bg-slate-900/50 rounded-xl border border-dashed border-slate-700">
               <Globe className="w-16 h-16 text-slate-600 mx-auto mb-4" />
               <h3 className="text-xl font-bold text-slate-300">No Clients Found</h3>
               <p className="text-slate-500 mt-2 mb-6">Start by registering your first client or target organization.</p>
               <button 
                  onClick={() => handleOpenClientModal()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium inline-flex items-center gap-2"
               >
                 <Plus size={18} /> Add First Client
               </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clients.map(client => (
                <div key={client.id} className="bg-slate-900 border border-slate-800 p-6 rounded-xl hover:border-[#4285F4]/50 transition-all duration-300 group relative shadow-xl hover:shadow-2xl hover:translate-y-[-2px]">
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button type="button" onClick={() => handleOpenClientModal(client)} className="text-slate-400 hover:text-[#4285F4] bg-slate-950 border border-slate-800 p-1.5 rounded shadow-lg">
                      <Edit size={14} />
                    </button>
                    <button type="button" onClick={() => setDeleteClientConfirmId(client.id)} className="text-slate-400 hover:text-red-500 bg-slate-950 border border-slate-800 p-1.5 rounded shadow-lg">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center text-[#4285F4] shadow-inner">
                      <Globe size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-slate-200 leading-tight">{client.name}</h4>
                      <span className="text-xs text-[#4285F4] font-mono mt-1 block">{client.domain}</span>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm text-slate-400 pt-4 border-t border-slate-800/50">
                    <div className="flex items-center gap-3">
                      <UserIcon size={14} className="text-slate-600"/> 
                      <span className="truncate">{client.contactPerson || 'No contact'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone size={14} className="text-slate-600"/> 
                      <span className="truncate">{client.phone || 'No phone'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin size={14} className="text-slate-600"/> 
                      <span className="truncate">{client.address || 'No address'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* USER MODAL */}
      {isModalOpen && activeTab === 'users' && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-lg w-full shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={20}/></button>
            <h3 className="text-xl font-bold text-white mb-6">
              {modalMode === 'add' ? 'Provision New User' : 'Edit User Profile'}
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Username</label>
                  <input 
                    type="text"
                    disabled={modalMode === 'edit'}
                    className={`w-full border rounded p-2.5 text-white transition-colors
                      ${modalMode === 'edit' ? 'bg-slate-800 border-slate-700 text-slate-400 cursor-not-allowed' : 
                      `bg-slate-950 ${usernameError ? 'border-red-500' : 'border-slate-700'} focus:outline-none focus:border-[#4285F4]`
                    }`}
                    value={userForm.username} 
                    onChange={e => setUserForm({...userForm, username: e.target.value})}
                  />
                  {usernameError && <p className="text-xs text-red-500 mt-1">{usernameError}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Email</label>
                  <input 
                    type="email"
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2.5 text-white focus:outline-none focus:border-[#4285F4] transition-colors"
                    value={userForm.email} 
                    onChange={e => setUserForm({...userForm, email: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Role Assignment</label>
                <select 
                   className="w-full bg-slate-950 border border-slate-700 rounded p-2.5 text-white focus:outline-none focus:border-[#4285F4] transition-colors"
                   value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value as UserRole})}
                >
                  <option value={UserRole.MANAGER}>Manager (Full Scan Access)</option>
                  <option value={UserRole.VIEWER}>Viewer (Read-Only Scope)</option>
                </select>
                <p className="text-[10px] text-slate-500 mt-1">Note: Administrator role can only be assigned by system owners.</p>
              </div>
              
              {userForm.role === UserRole.VIEWER && (
                <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <label className="block text-xs font-bold text-orange-400 mb-2">Scope Limitation (Required)</label>
                  <select 
                     className="w-full bg-slate-950 border border-slate-700 rounded p-2.5 text-white"
                     value={userForm.assignedClientId} 
                     onChange={e => setUserForm({...userForm, assignedClientId: e.target.value})}
                  >
                    <option value="">-- Select Assigned Client --</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-800">
                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-400 hover:text-white font-medium">Cancel</button>
                <button onClick={handleSaveUser} className="px-6 py-2 bg-gradient-to-r from-blue-700 to-[#4285F4] rounded-lg text-white hover:opacity-90 flex items-center gap-2 font-bold shadow-lg">
                  <Save size={16}/> Save User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CLIENT MODAL */}
      {isModalOpen && activeTab === 'clients' && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-2xl w-full shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={20}/></button>
            <h3 className="text-xl font-bold text-white mb-6">
              {modalMode === 'add' ? 'Onboard Client' : 'Update Client Details'}
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Company Name *</label>
                  <input type="text" className="w-full bg-slate-950 border border-slate-700 rounded p-2.5 text-white focus:border-[#4285F4]"
                    value={clientForm.name} onChange={e => setClientForm({...clientForm, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Primary Domain *</label>
                  <input type="text" className="w-full bg-slate-950 border border-slate-700 rounded p-2.5 text-white focus:border-[#4285F4] font-mono"
                    value={clientForm.domain} onChange={e => setClientForm({...clientForm, domain: e.target.value})} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Contact Person</label>
                  <input type="text" className="w-full bg-slate-950 border border-slate-700 rounded p-2.5 text-white focus:border-[#4285F4]"
                    value={clientForm.contactPerson} onChange={e => setClientForm({...clientForm, contactPerson: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Email Address</label>
                  <input type="email" className="w-full bg-slate-950 border border-slate-700 rounded p-2.5 text-white focus:border-[#4285F4]"
                    value={clientForm.contactEmail} onChange={e => setClientForm({...clientForm, contactEmail: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Phone Number</label>
                  <input type="text" className="w-full bg-slate-950 border border-slate-700 rounded p-2.5 text-white focus:border-[#4285F4]"
                    value={clientForm.phone} onChange={e => setClientForm({...clientForm, phone: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Physical Address</label>
                  <input type="text" className="w-full bg-slate-950 border border-slate-700 rounded p-2.5 text-white focus:border-[#4285F4]"
                    value={clientForm.address} onChange={e => setClientForm({...clientForm, address: e.target.value})} />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-800">
                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-400 hover:text-white font-medium">Cancel</button>
                <button onClick={handleSaveClient} className="px-6 py-2 bg-gradient-to-r from-blue-700 to-[#4285F4] rounded-lg text-white hover:opacity-90 flex items-center gap-2 font-bold shadow-lg">
                  <Save size={16}/> Confirm Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE USERS */}
      <ConfirmModal 
        isOpen={!!deleteUserId}
        title="Delete User Account"
        message="Are you sure you want to permanently delete this user? They will immediately lose access to the platform."
        isDanger={true}
        confirmText="Remove User"
        onConfirm={confirmDeleteUser}
        onCancel={() => setDeleteUserId(null)}
      />

      {/* CONFIRM DELETE CLIENT */}
      <ConfirmModal 
        isOpen={!!deleteClientConfirmId}
        title="Delete Client Record"
        message="This action will permanently remove the client profile from the system."
        isDanger={true}
        confirmText="Delete Client"
        onConfirm={confirmDeleteClient}
        onCancel={() => setDeleteClientConfirmId(null)}
      >
         <div className="flex items-center gap-3 bg-slate-800 p-3 rounded-lg mb-2 text-left border border-slate-700">
            <input 
              type="checkbox" 
              id="cascade"
              checked={deleteCascade}
              onChange={e => setDeleteCascade(e.target.checked)}
              className="w-5 h-5 rounded border-slate-600 text-red-600 focus:ring-red-500 bg-slate-900"
            />
            <label htmlFor="cascade" className="text-sm text-slate-300">
              Wipe associated scan history?
            </label>
         </div>
      </ConfirmModal>

    </div>
  );
};
