
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { ProfileType } from '../types';

const ProfileSelector = ({ type, onClose }: { type: ProfileType, onClose: () => void }) => {
  const { profiles, switchProfile, addProfile } = useUser();
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const navigate = useNavigate();

  const filteredProfiles = profiles.filter(p => p.type === type);

  const handleSelect = (id: string) => {
    switchProfile(id);
    onClose();
    if (type === 'adult') navigate('/adults');
    else navigate('/kids');
  };

  const handleCreate = () => {
    if (newName.trim()) {
      addProfile(newName.trim(), type);
      onClose();
      if (type === 'adult') navigate('/adults');
      else navigate('/kids');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg p-6 md:p-8 animate-in zoom-in duration-300 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Who is learning?</h2>
          <button onClick={onClose}><X size={24} className="text-gray-400 hover:text-gray-600" /></button>
        </div>

        {!isAdding ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {filteredProfiles.map(p => (
              <button key={p.id} onClick={() => handleSelect(p.id)} className="flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all group">
                <div className="w-20 h-20 rounded-full bg-gray-100 text-4xl flex items-center justify-center border-4 border-white shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                  {p.avatar}
                </div>
                <span className="font-bold text-gray-700">{p.name}</span>
              </button>
            ))}
            <button onClick={() => setIsAdding(true)} className="flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-gray-50 border-2 border-dashed border-gray-300 hover:border-primary group transition-all">
              <div className="w-20 h-20 rounded-full bg-white text-gray-400 flex items-center justify-center group-hover:text-primary transition-colors">
                <Plus size={32} />
              </div>
              <span className="font-bold text-gray-500 group-hover:text-primary">Add Profile</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-600">New {type === 'adult' ? 'Adult' : 'Kid'} Profile</h3>
            <input 
              autoFocus 
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Enter Name"
              className="w-full p-4 bg-gray-100 rounded-xl font-bold text-lg outline-none focus:ring-2 focus:ring-primary text-gray-800"
            />
            <div className="flex gap-3">
              <button onClick={() => setIsAdding(false)} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl">Cancel</button>
              <button onClick={handleCreate} disabled={!newName.trim()} className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-orange-600 disabled:opacity-50">Create</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSelector;
