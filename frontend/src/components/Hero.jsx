// import { useState } from "react";
// import AuthModal from "../components/AuthModal";

// function Hero() {
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   return (
//     <div className="w-full h-screen flex items-center justify-center bg-[#121212]">
//       <div className="container mx-auto">
//         <div className="grid grid-cols-1 gap-8 items-center lg:grid-cols-2">
//           <div className="flex gap-4 flex-col">
//             <h1 className="text-5xl md:text-7xl max-w-lg tracking-tighter text-left font-regular text-white">
//               Smarter Urban Mobility Starts Here
//             </h1>
//             <p className="text-xl leading-relaxed tracking-tight text-gray-400 max-w-md text-left">
//               Join us in reducing your carbon footprint by making smarter transport choices. 
//               Our platform helps you track your emissions, optimize routes, and gamify your commute.
//             </p>
//             <p className="text-lg text-gray-400 max-w-md text-left mt-4">
//               Ready to make a difference? Get started today!
//             </p>
//             <div className="flex flex-row gap-4 mt-6">
//               <button
//                 className="px-6 py-3 text-lg text-black rounded-lg"
//                 onClick={() => setIsModalOpen()}
//               >
//                 Get Started
//               </button>
//             </div>
//           </div>
//           <div 
//             className="bg-contain bg-center bg-no-repeat rounded-md aspect-square" 
//             style={{ backgroundImage: "url('https://img.freepik.com/free-photo/full-shot-people-with-electric-transport-outdoors_23-2149383284.jpg?ga=GA1.1.1434408627.1742753418')" }}
//           ></div>

//         </div>
//       </div>
//       {isModalOpen && <AuthModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} />}
//     </div>
//   );
// }

// export default Hero;


import React from 'react';
import { useState } from "react";
import AuthModal from "../components/AuthModal";

function Hero() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Left Side */}
      <div className="flex-1 bg-gradient-to-b from-[#f8fafc] to-[#fbeaea] p-12 flex flex-col justify-center">
        <h2 className="text-5xl font-serif font-bold leading-tight text-gray-900">
        Smarter Healthcare Access For Patients & Doctors
        </h2>
        <p className="text-gray-500 mt-6">
        Book appointments with ease and connect with the right specialists — all in one place.
        </p>
        <div className="mt-8 flex items-center space-x-4">
          <button className="bg-[#f597dc] text-white px-6 py-3 rounded shadow hover:bg-[#e58bdf] transition"
          onClick={() => setIsModalOpen(true)} >
            Get Started
          </button>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex-1 bg-[#383838] flex flex-col justify-center items-center p-10 relative">
        <div className="rounded-t-full overflow-hidden border-4 border-gray-800" style={{ width: '350px', height: '400px' }}>
          <img 
            src="/img.jpg" 
            alt="Our Hospital" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="bg-white p-4 rounded shadow-lg flex justify-between items-center w-[350px] mt-4">
          <div>
            <p className="font-semibold text-gray-900">@yourhospital</p>
            <p className="text-sm text-gray-600">Committed to Excellence</p>
          </div>
          <div>
            <span className="text-gray-700 font-bold">Open 24/7</span>
          </div>
        </div>

        <div className="flex justify-around w-full text-white mt-6 text-center">
          <div>
            <p className="text-lg font-bold">500+</p>
            <p className="text-sm">Patients Served</p>
          </div>
          <div>
            <p className="text-lg font-bold">100+</p>
            <p className="text-sm">Doctors</p>
          </div>
          <div>
            <p className="text-lg font-bold">50+</p>
            <p className="text-sm">Specialties</p>
          </div>
        </div>
      </div>
      {isModalOpen && <AuthModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} />}
    </div>
  );
};

export default Hero;
