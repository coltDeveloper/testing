import React, { useState } from "react";
import { Toaster } from "react-hot-toast";
import DigitalLibrary from '../../Components/admin/Library/Digital'
import PhysicalLibrary from '../../Components/admin/Library/Physical'

const Books = () => {
  const [activeTab, setActiveTab] = useState("Physical"); // State for active tab


  return (
    <div className="container mx-auto p-4 border border-[#241763]">
      <Toaster />
      <div className="mb-4 flex flex-wrap justify-between space-x-4">
        {/* Tab Navigation */}
        <div className="flex space-x-4">
          <button 
            className={`p-2 rounded ${activeTab === 'Physical' ? 'bg-[#241763] text-white' : 'bg-white text-[#241763] border-1 border-[#241763]'}`} 
            onClick={() => setActiveTab('Physical')}
          >
            Physical Library
          </button>
          <button 
            className={`p-2 rounded ${activeTab === 'Digital' ? 'bg-[#241763] text-white' : 'bg-white text-[#241763] border-1 border-[#241763]'}`} 
            onClick={() => setActiveTab('Digital')}
          >
            Digital Library
          </button>
        </div>
      </div>

      {activeTab === 'Physical' ? (
        <PhysicalLibrary/>
      ) : (
        <>
          <DigitalLibrary/>
        </>
      )}
    </div>
  );
};

export default Books;