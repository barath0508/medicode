import React from 'react';
import { Heart, Activity, Pill, Stethoscope, Brain, Shield } from 'lucide-react';

export default function FloatingElements() {
  const elements = [
    { Icon: Heart, delay: '0s', duration: '6s', color: 'text-red-400' },
    { Icon: Activity, delay: '1s', duration: '8s', color: 'text-emerald-400' },
    { Icon: Pill, delay: '2s', duration: '7s', color: 'text-blue-400' },
    { Icon: Stethoscope, delay: '3s', duration: '9s', color: 'text-purple-400' },
    { Icon: Brain, delay: '4s', duration: '6s', color: 'text-pink-400' },
    { Icon: Shield, delay: '5s', duration: '8s', color: 'text-teal-400' },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {elements.map((element, index) => (
        <div
          key={index}
          className="absolute opacity-20 dark:opacity-10"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: element.delay,
            animationDuration: element.duration,
          }}
        >
          <element.Icon 
            className={`w-8 h-8 ${element.color} animate-float`}
            style={{
              animation: `float ${element.duration} ease-in-out infinite`,
              animationDelay: element.delay,
            }}
          />
        </div>
      ))}
    </div>
  );
}