
import React from 'react';
import { Plus } from 'lucide-react';

interface CardProps {
    title: string;
    bgColor?: string;
    textColor?: string;
    className?: string;
    icon?: React.ReactNode;
    showPlus?: boolean;
    onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
    title,
    bgColor = 'bg-white',
    textColor = 'text-gray-800',
    className = '',
    icon,
    showPlus = true,
    onClick
}) => {
    return (
        <div
            onClick={onClick}
            className={`relative p-8 rounded-[2rem] flex flex-col justify-end transition-transform hover:scale-[1.02] cursor-pointer shadow-sm min-h-[240px] h-full ${bgColor} ${textColor} ${className}`}
        >
            {showPlus && (
                <div className="absolute top-6 right-6">
                    <div className="bg-white/20 p-1.5 rounded-full border border-white/20 backdrop-blur-sm">
                        <Plus size={20} className={textColor === 'text-white' ? 'text-white' : 'text-gray-600'} />
                    </div>
                </div>
            )}
            <div className="space-y-4">
                {icon && <div className="mb-2">{icon}</div>}
                <h3 className="text-2xl font-semibold leading-tight pr-4">
                    {title}
                </h3>
            </div>
        </div>
    );
};

export default Card;
