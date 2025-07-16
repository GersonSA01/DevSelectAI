'use client';

import Navbar from "../../app/components/navbar/Navbar";
import { AuthProvider } from "../../context/AuthContext";

export default function Layout({ children }) {
  return (
    <AuthProvider>
      <Navbar />
      {children}
    </AuthProvider>
  );
}
