
import React from 'react';
import { Navigate } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import Layout from '../components/Layout';
import { useUser } from '../context/UserContext';
import { ACHIEVEMENTS } from '../constants';

const ProfilePage = () => {
  const { activeProfile, logout } = useUser();
  if (!activeProfile) return <Navigate to="/" />;
  return (
    <Layout title="Profile" showBack backPath="/hub">
       <div className="space-y-6">
          <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
             <div className="text-6xl mb-4">{activeProfile.avatar}</div>
             <h2 className="text-2xl font-bold text-gray-800">{activeProfile.name}</h2>
             <p className="text-gray-500 text-sm font-medium uppercase mt-1">Joined {activeProfile.joinedDate}</p>
             <button onClick={logout} className="mt-6 text-red-500 font-bold hover:bg-red-50 px-6 py-2 rounded-full transition-colors border border-red-100">Log Out</button>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
             <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Trophy size={20} className="text-yellow-500"/> Achievements</h3>
             <div className="space-y-4">
                {ACHIEVEMENTS.map(ach => (
                   <div key={ach.id} className={`flex items-center gap-4 p-3 rounded-xl border ${ach.unlocked ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                      <div className="text-2xl">{ach.unlocked ? ach.icon : '🔒'}</div>
                      <div>
                         <h4 className="font-bold text-gray-800 text-sm">{ach.title}</h4>
                         <p className="text-xs text-gray-500">{ach.description}</p>
                      </div>
                   </div>
                ))}
             </div>
          </div>
       </div>
    </Layout>
  );
};

export default ProfilePage;
