'use client';

import { useEffect, useState } from 'react';
import { User, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Image from 'next/image';
import ProfileEditModal from '@/components/ProfileEditModal';

export default function ProfilePage() {
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    profile_image_url: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
  });

  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const syncResponse = await fetch('/api/sync-user');
      const { user } = await syncResponse.json();

      if (!user) {
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/patient/profile?uid=${user.uid}`);
      const data = await response.json();

      if (data.success) {
        setProfileData({
          name: data.user?.name || '',
          email: data.user?.email || '',
          phone: data.user?.phone || '',
          profile_image_url: data.user?.profile_image_url || '',
          address_line1: data.patient?.address_line1 || '',
          address_line2: data.patient?.address_line2 || '',
          city: data.patient?.city || '',
          state: data.patient?.state || '',
          postal_code: data.patient?.postal_code || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const fullAddress = [
    profileData.address_line1,
    profileData.address_line2,
    profileData.city,
    profileData.state,
    profileData.postal_code,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
        <p className="text-gray-600">View and manage your personal information</p>
      </div>

      {/* Profile Card */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <div className="h-32 bg-gradient-to-r from-emerald-600 to-emerald-500"></div>

        <div className="px-6 pb-6">
          {/* Profile Picture and Name */}
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-16 relative z-10">
            <div className="relative">
              <div className="w-32 h-32 bg-white border-4 border-white shadow-lg rounded-2xl overflow-hidden flex items-center justify-center">
                {profileData.profile_image_url ? (
                  <Image
                    src={profileData.profile_image_url}
                    alt={profileData.name}
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                    priority
                  />
                ) : (
                  <User className="w-16 h-16 text-gray-400" />
                )}
              </div>
            </div>

            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-1">
                {profileData.name || 'User'}
              </h2>
              <p className="text-gray-600 mb-4">{profileData.email}</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition shadow-md hover:shadow-lg"
              >
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </button>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid md:grid-cols-2 gap-4 mt-8">
            {/* Contact Info */}
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-3">Contact</h3>
              <div className="space-y-2 text-sm">
                <p className="text-gray-600">
                  <span className="font-medium text-gray-900">Email:</span>{' '}
                  {profileData.email || 'Not added'}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium text-gray-900">Phone:</span>{' '}
                  {profileData.phone || 'Not added'}
                </p>
              </div>
            </div>

            {/* Address Info */}
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-3">Address</h3>
              <p className="text-sm text-gray-600">
                {fullAddress || 'Not added'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <ProfileEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={profileData}
        onSuccess={fetchProfile}
      />
    </div>
  );
}
