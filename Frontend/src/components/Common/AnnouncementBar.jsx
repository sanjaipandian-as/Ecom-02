import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../../api';

const AnnouncementBar = () => {
    const [announcement, setAnnouncement] = useState(null);
    const [timeLeft, setTimeLeft] = useState({ days: '00', hours: '00', mins: '00', secs: '00' });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAnnouncement = async () => {
            try {
                const response = await API.get('/announcements/active');
                if (response.data) {
                    setAnnouncement(response.data);
                }
            } catch (error) {
                console.error('Error fetching announcement:', error);
            }
        };
        fetchAnnouncement();
    }, []);

    useEffect(() => {
        if (!announcement || !announcement.endDate) return;

        const timer = setInterval(() => {
            const now = new Date().getTime();
            const endDate = new Date(announcement.endDate).getTime();
            const distance = endDate - now;

            if (distance < 0) {
                clearInterval(timer);
                setTimeLeft({ days: '00', hours: '00', mins: '00', secs: '00' });
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const mins = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const secs = Math.floor((distance % (1000 * 60)) / 1000);

            setTimeLeft({
                days: days.toString().padStart(2, '0'),
                hours: hours.toString().padStart(2, '0'),
                mins: mins.toString().padStart(2, '0'),
                secs: secs.toString().padStart(2, '0')
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [announcement]);

    if (!announcement || !announcement.isActive) return null;

    return (
        <div className="bg-[#B81D1D] text-white py-2 px-4 w-full flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-sm font-semibold tracking-wide">
            <div className="flex flex-col items-center">
                <div className="flex items-center gap-1 text-center">
                    <span>{announcement.message}</span>
                    <span className="font-bold">{announcement.discountText}</span>
                </div>
                {announcement.endDate && (
                    <span className="text-[11px] uppercase opacity-90 mt-0.5 font-normal tracking-widest">ends in</span>
                )}
            </div>
            
            {announcement.endDate && (
                <div className="flex items-center gap-2">
                    <div className="flex flex-col items-center">
                        <span className="text-xl sm:text-2xl font-bold bg-transparent">{timeLeft.days}</span>
                        <span className="text-[10px] uppercase font-normal opacity-90">Days</span>
                    </div>
                    <span className="text-xl font-bold mb-3">:</span>
                    <div className="flex flex-col items-center">
                        <span className="text-xl sm:text-2xl font-bold bg-transparent">{timeLeft.hours}</span>
                        <span className="text-[10px] uppercase font-normal opacity-90">Hrs</span>
                    </div>
                    <span className="text-xl font-bold mb-3">:</span>
                    <div className="flex flex-col items-center">
                        <span className="text-xl sm:text-2xl font-bold bg-transparent">{timeLeft.mins}</span>
                        <span className="text-[10px] uppercase font-normal opacity-90">Mins</span>
                    </div>
                    <span className="text-xl font-bold mb-3">:</span>
                    <div className="flex flex-col items-center">
                        <span className="text-xl sm:text-2xl font-bold bg-transparent">{timeLeft.secs}</span>
                        <span className="text-[10px] uppercase font-normal opacity-90">Secs</span>
                    </div>
                </div>
            )}
            
            {announcement.link && (
                <button 
                    onClick={() => navigate(announcement.link)}
                    className="mt-1 sm:mt-0 ml-0 sm:ml-4 text-white hover:text-white/80 transition-colors cursor-pointer text-sm font-medium tracking-wider"
                >
                    Shop now!
                </button>
            )}
        </div>
    );
};

export default AnnouncementBar;
