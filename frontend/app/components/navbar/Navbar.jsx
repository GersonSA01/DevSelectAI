'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function NavbarSimple() {
  return (
 <div className="fixed top-0 left-0 w-full h-16 z-50 px-4 bg-[#0A0D1C] flex items-center">      
 <Link href="/" className="flex items-center gap-2">
        <Image
          src="/logo.png" 
          alt="Logo DevSelectAI"
          width={40} 
          height={40}
        />
        <span className="text-white font-bold text-2xl">DevSelectAI</span>
      </Link>
    </div>
  );
}
