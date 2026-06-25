import React, { useState, useEffect } from 'react';
import { Server, Sparkles } from 'lucide-react';

const ServerWakeup = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        let progressInterval = null;
        let fadeOutTimeout = null;

        const handleWakeupEvent = (event) => {
            const { type } = event.detail;

            if (type === 'show') {
                setIsClosing(false);
                setIsVisible(true);
                setProgress(0);

                // Simulate progress bar over 60 seconds
                if (progressInterval) clearInterval(progressInterval);
                progressInterval = setInterval(() => {
                    setProgress((prev) => {
                        if (prev < 40) {
                            return prev + 3; // fast start
                        } else if (prev < 75) {
                            return prev + 1.5; // medium speed
                        } else if (prev < 95) {
                            return prev + 0.5; // slow down near end
                        }
                        return prev;
                    });
                }, 1000);
            } else if (type === 'hide') {
                if (progressInterval) clearInterval(progressInterval);

                // Jump to 100% and fade out
                setProgress(100);
                setIsClosing(true);

                fadeOutTimeout = setTimeout(() => {
                    setIsVisible(false);
                    setIsClosing(false);
                    setProgress(0);
                }, 800); // give enough time for progress animation
            }
        };

        window.addEventListener('render-wakeup', handleWakeupEvent);

    }, []);

    if (!isVisible) return null;

    return (
        <div className={`fixed bottom-6 right-6 z-9999 max-w-sm w-full bg-emerald-deep/95 backdrop-blur-md border border-gold-champagne/30 text-cream-base rounded-xl shadow-2xl p-5 transition-all duration-500 ease-in-out ${isClosing ? 'opacity-0 translate-y-4 scale-95' : 'opacity-100 translate-y-0 scale-100 animate-fade-in'
            }`}>
            {/* Header */}
            <div className="flex items-start gap-4">
                <div className="p-2.5 bg-emerald-dark border border-gold-champagne/20 rounded-lg flex-shrink-0">
                    <Server className="w-5 h-5 text-gold-lustrous animate-pulse" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                        <h4 className="text-[15px] font-bold tracking-wide text-cream-base font-sans uppercase">
                            Establishing Connection
                        </h4>
                        <Sparkles className="w-3.5 h-3.5 text-gold-lustrous" />
                    </div>
                    <p className="text-xs text-cream-base/80 leading-relaxed font-sans font-light">
                        We host on a free-tier server. It takes about 30-60 seconds to spin up from sleep. Thank you for your patience!
                    </p>
                </div>
            </div>

            {/* Progress Area */}
            <div className="mt-4 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-sans text-cream-base/60">
                    <span>Warming up database & backend...</span>
                    <span className="font-bold text-gold-lustrous">{Math.round(progress)}%</span>
                </div>
                <div className="w-full h-1.5 bg-emerald-dark border border-gold-champagne/10 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-gold-champagne to-gold-lustrous transition-all duration-300 ease-out rounded-full"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
    );
};

export default ServerWakeup;
