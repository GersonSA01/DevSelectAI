'use client';

import { Toaster } from 'sonner';

export default function ToasterAlert() {
  return (
    <Toaster
      position="top-right"
      closeButton
      expand={true}
      duration={5000}
      visibleToasts={3}
      toastOptions={{
        classNames: {
          toast:
            'bg-pageBackground text-white border-l-4 border-primaryButton rounded-xl p-4 pr-12 shadow-lg animate-slideInOut relative overflow-hidden max-w-sm sm:max-w-md',
          title: 'font-semibold',
          description: 'text-sm',
          closeButton:
            'absolute right-3 top-3 text-white hover:text-primaryButton',
        },
      }}
    />
  );
}
