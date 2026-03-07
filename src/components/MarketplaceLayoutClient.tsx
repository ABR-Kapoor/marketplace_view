'use client';

import { useState, useEffect, useCallback } from 'react';
import { Navbar } from './Navbar';
import ProfileEditModal from './ProfileEditModal';

interface MarketplaceLayoutClientProps {
  children: React.ReactNode;
  userName?: string;
  userImage?: string | null;
  userEmail?: string;
  isAuthenticated: boolean;
  cartCount?: number;
}

export default function MarketplaceLayoutClient({
  children,
  userName,
  userImage,
  userEmail,
  isAuthenticated,
  cartCount = 0,
}: MarketplaceLayoutClientProps) {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Live navbar values — start with the Kinde session data, update from DB after fetch
  const [liveUserName, setLiveUserName] = useState(userName || '');
  const [liveUserImage, setLiveUserImage] = useState(userImage || '');

  const [profileData, setProfileData] = useState({
    name: userName || '',
    email: userEmail || '',
    phone: '',
    profile_image_url: userImage || '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
  });

  const fetchProfile = useCallback(async () => {
    try {
      // Always bypass browser/CDN cache
      const syncResponse = await fetch('/api/sync-user', { cache: 'no-store' });
      if (!syncResponse.ok) return;
      const { user } = await syncResponse.json();
      if (!user?.uid) return;

      const response = await fetch(
        `/api/patient/profile?uid=${user.uid}&t=${Date.now()}`,
        { cache: 'no-store' }
      );
      if (!response.ok) return;
      const data = await response.json();

      if (data.success) {
        const freshName = data.user?.name || userName || '';
        const freshImage = data.user?.profile_image_url || userImage || '';

        // Update navbar immediately
        setLiveUserName(freshName);
        setLiveUserImage(freshImage);

        // Address comes from doctors table for doctors, patients table for everyone else
        const addressSource = data.doctor || data.patient;

        // Update modal form data
        setProfileData({
          name: freshName,
          email: data.user?.email || userEmail || '',
          phone: data.user?.phone || '',
          profile_image_url: freshImage,
          address_line1: addressSource?.address_line1 || '',
          address_line2: addressSource?.address_line2 || '',
          city: addressSource?.city || '',
          state: addressSource?.state || '',
          postal_code: addressSource?.postal_code || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  }, [userName, userImage, userEmail]);

  // Sync from DB on mount so Navbar shows correct name/image right away
  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated, fetchProfile]);

  // Re-sync when modal opens to show latest saved data
  useEffect(() => {
    if (isAuthenticated && isProfileModalOpen) {
      fetchProfile();
    }
  }, [isProfileModalOpen, isAuthenticated, fetchProfile]);

  return (
    <>
      <Navbar
        userName={liveUserName || userName}
        userImage={liveUserImage || userImage}
        isAuthenticated={isAuthenticated}
        cartCount={cartCount}
        onProfileClick={() => setIsProfileModalOpen(true)}
      />
      {children}
      <ProfileEditModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        initialData={profileData}
        onSuccess={fetchProfile}
      />
    </>
  );
}
