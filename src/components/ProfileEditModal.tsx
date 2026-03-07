'use client';

import { useState, useEffect } from 'react';
import { X, Camera, Loader2, User, CheckCircle, MapPin, Phone, UserCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadImage } from '@/lib/upload';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: {
    profile_image_url?: string;
    name?: string;
    email?: string;
    phone?: string;
    address_line1?: string;
    address_line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
  };
  onSuccess: () => void;
}

const inputClass =
  'w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition text-sm text-gray-900 placeholder-gray-400';

export default function ProfileEditModal({
  isOpen,
  onClose,
  initialData,
  onSuccess,
}: ProfileEditModalProps) {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    phone: initialData.phone || '',
    address_line1: initialData.address_line1 || '',
    address_line2: initialData.address_line2 || '',
    city: initialData.city || '',
    state: initialData.state || '',
    postal_code: initialData.postal_code || '',
  });

  const [profileImage, setProfileImage] = useState(initialData.profile_image_url || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: initialData.name || '',
        phone: initialData.phone || '',
        address_line1: initialData.address_line1 || '',
        address_line2: initialData.address_line2 || '',
        city: initialData.city || '',
        state: initialData.state || '',
        postal_code: initialData.postal_code || '',
      });
      setProfileImage(initialData.profile_image_url || '');
    }
  }, [initialData, isOpen]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const uploadedUrl = await uploadImage(file);
      if (uploadedUrl) {
        setProfileImage(uploadedUrl);
        toast.success('Photo updated!');
      } else {
        toast.error('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    setSaving(true);
    try {
      const syncRes = await fetch('/api/sync-user');
      const { user } = await syncRes.json();

      if (!user?.uid) {
        toast.error('User not found');
        return;
      }

      const response = await fetch('/api/patient/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
          user: {
            name: formData.name,
            phone: formData.phone || null,
            profile_image_url: profileImage,
          },
          patient: {
            address_line1: formData.address_line1 || null,
            address_line2: formData.address_line2 || null,
            city: formData.city || null,
            state: formData.state || null,
            postal_code: formData.postal_code || null,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Profile saved!');
        onSuccess();
        onClose();
      } else {
        toast.error(data.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="relative h-24 bg-gradient-to-r from-emerald-600 to-teal-500">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-white/80 hover:text-white hover:bg-white/20 rounded-full p-1.5 transition"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Avatar - overlaps header */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
            <div className="relative">
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-9 h-9 text-emerald-300" />
                )}
              </div>
              {uploading && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                </div>
              )}
              <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center cursor-pointer shadow-md transition active:scale-95">
                <Camera className="w-3.5 h-3.5" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 pt-14 pb-5 max-h-[65vh] overflow-y-auto space-y-5">
            {/* Email displayed under avatar as read-only identity */}
            {initialData.email && (
              <p className="text-center text-sm text-gray-400 -mt-1 truncate">
                {initialData.email}
              </p>
            )}

            {/* Personal Info Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <UserCircle className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Personal Info</span>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your full name"
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Enter phone number"
                      className={`${inputClass} pl-9`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-100" />

            {/* Address Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Delivery Address</span>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Address Line 1
                  </label>
                  <input
                    type="text"
                    value={formData.address_line1}
                    onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                    placeholder="Street, area, colony"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Address Line 2 <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.address_line2}
                    onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                    placeholder="Flat no., building, landmark"
                    className={inputClass}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="City"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">State</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      placeholder="State"
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={formData.postal_code}
                    onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                    placeholder="PIN / ZIP code"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Footer Buttons */}
          <div className="px-6 py-4 border-t border-gray-100 flex gap-3 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border-2 border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition font-semibold text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl hover:shadow-md hover:shadow-emerald-200 active:scale-95 transition disabled:opacity-60 disabled:cursor-not-allowed font-semibold text-sm flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
