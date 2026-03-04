
import React from 'react';
import { ArrowUp } from 'lucide-react';

interface BackButtonProps {
    onClick: () => void;
    bgColor?: string;
    textColor?: string;
    iconColor?: string;
    className?: string;
}

const BackButton: React.FC<BackButtonProps> = ({
    onClick,
    bgColor = 'bg-[#5cc8d7]',
    textColor = 'text-white',
    iconColor = 'border-white text-white',
    className = ''
}) => {
    return (
        <button
            onClick={onClick}
            className={`w-full py-8 md:py-10 px-6 md:px-12 flex items-center justify-center transition-all hover:brightness-95 active:scale-[0.998] ${bgColor} ${className} border-none outline-none`}
        >
            <div className="max-w-7xl w-full flex items-center justify-between">
                <span className={`text-2xl md:text-3xl font-bold ${textColor}`}>
                    Volver al inicio
                </span>
                <div className={`w-12 h-12 md:w-16 md:h-16 rounded-full border-2 flex items-center justify-center shrink-0 ${iconColor}`}>
                    <ArrowUp size={32} />
                </div>
            </div>
        </button>
    );
};

export default BackButton;
