import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen bg-[#F0F5F2] dark:bg-gray-900 flex items-center justify-center p-0 lg:p-8 overflow-hidden">
      <div className="w-full max-w-[1100px] h-full lg:h-[90vh] lg:min-h-[650px] bg-white dark:bg-gray-800 lg:rounded-[40px] shadow-2xl shadow-brand-900/10 dark:shadow-none overflow-hidden flex flex-col lg:flex-row border border-transparent dark:border-gray-800">

        {/* Left Pane - Branding */}
        <div className="hidden lg:flex w-full lg:w-[45%] bg-brand-500 relative items-center justify-center p-12 text-center text-white shrink-0">
          <div className="relative z-1 flex flex-col items-center animate-slide-up">
            <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl shadow-black/20">
              <img
                src="/landify_logo.jpeg"
                className="w-16 h-16 object-contain"
                alt="Landify Logo"
              />
            </div>
            <h1 className="text-4xl font-bold mb-4 tracking-tight">Landify Systems</h1>
            <p className="text-white/80 text-lg leading-relaxed max-w-[280px]">
              Advanced grass cultivation and harvesting management for professional agricultural operations.
            </p>
          </div>
          {/* Subtle background pattern could go here */}
        </div>

        {/* Right Pane - Form */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-12 lg:p-16 relative bg-white dark:bg-gray-800 overflow-y-auto no-scrollbar">
          <div className="w-full max-w-md mx-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
