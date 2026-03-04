
import React from 'react';
import { ArrowDown } from 'lucide-react';

const HeaderBar: React.FC<{ title: string }> = ({ title }) => (
    <div className="bg-white w-full py-6 px-6 md:px-10 rounded-xl flex items-center justify-between shadow-sm border-[3px] border-[#702d8d]">
        <h2 className="text-2xl md:text-3xl font-black text-[#702d8d]">{title}</h2>
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-[#702d8d] flex items-center justify-center text-[#702d8d] shrink-0">
            <ArrowDown size={24} />
        </div>
    </div>
);

export default HeaderBar;
