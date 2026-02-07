import Link from 'next/link';
import { ShieldOff } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldOff className="w-10 h-10 text-red-600" />
        </div>
        
        <h1 className="text-3xl font-black text-gray-900 mb-4">
          Access Restricted
        </h1>
        
        <p className="text-gray-600 mb-6 leading-relaxed">
          The marketplace is exclusively available to <strong>patients</strong>. 
          Doctors and clinics cannot access this feature.
        </p>
        
        <div className="space-y-3">
          <a 
            href="/api/auth/logout"
            className="block w-full px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:shadow-lg smooth-transition"
          >
            Logout
          </a>
          
          <Link 
            href="/dashboard"
            className="block w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl font-semibold hover:shadow-lg smooth-transition"
          >
            Go to Dashboard
          </Link>
          
          <Link 
            href="/"
            className="block w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 smooth-transition"
          >
            Go to Home
          </Link>
        </div>
        
        <p className="text-xs text-gray-500 mt-6">
          If you believe this is an error, please contact support.
        </p>
      </div>
    </div>
  );
}
