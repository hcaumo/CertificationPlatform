import React from 'react';

const AdminSignIn = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form className="bg-white p-6 rounded shadow-md">
        <h2 className="text-2xl mb-4">Admin Sign In</h2>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input type="email" id="email" className="mt-1 block w-full border border-gray-300 rounded-md p-2" required />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
          <input type="password" id="password" className="mt-1 block w-full border border-gray-300 rounded-md p-2" required />
        </div>
        <button type="submit" className="w-full bg-primary text-white p-2 rounded">Sign In</button>
      </form>
    </div>
  );
};

export default AdminSignIn;