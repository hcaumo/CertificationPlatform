"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

interface CourseCardProps {
    id: string;
    title: string;
    description: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    duration: string;
    imageUrl?: string;
}

const CourseCard: React.FC<CourseCardProps> = ({
    id,
    title,
    description,
    level,
    duration,
    imageUrl = '/placeholder-course.jpg'
}) => {
    const router = useRouter();
    
    const getLevelColor = () => {
        switch(level) {
            case 'Beginner': return 'bg-green-500';
            case 'Intermediate': return 'bg-yellow-500';
            case 'Advanced': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };
    
    return (
        <div className="bg-white/10 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="h-48 bg-gray-700 relative">
                {/* Placeholder for course image */}
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                    <span>Course Image</span>
                </div>
                
                <div className={`absolute top-3 right-3 ${getLevelColor()} text-white text-xs font-bold px-2 py-1 rounded`}>
                    {level}
                </div>
            </div>
            
            <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                <p className="text-gray-300 mb-4">{description}</p>
                
                <div className="flex items-center text-gray-400 text-sm mb-6">
                    <span className="mr-4">⏱️ {duration}</span>
                </div>
                
                <button 
                    onClick={() => router.push(`/courses/${id}`)}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded transition-colors duration-200"
                >
                    View Course
                </button>
            </div>
        </div>
    );
};

export default CourseCard;