'use client';

import Navbar from "../../app/components/navbar/Navbar";

export default function Layout({ children }) {
  return (
    <div>
      <Navbar/>
      {children}
    </div>
  );
}