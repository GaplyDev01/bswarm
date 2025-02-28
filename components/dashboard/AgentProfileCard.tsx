import React from 'react';
import Image from 'next/image';
import { Bot, TrendingUp, Award } from 'lucide-react';

interface AgentProfileProps {
  name: string;
  role: string;
  imageUrl?: string;
  performance?: {
    monthly: number;
    allTime: number;
  };
  specialization: string;
  status: 'active' | 'inactive' | 'learning';
  className?: string;
}

export const AgentProfileCard: React.FC<AgentProfileProps> = ({
  name,
  role,
  imageUrl,
  performance = { monthly: 0, allTime: 0 },
  specialization,
  status,
  className = '',
}) => {
  const statusColorMap = {
    active: 'bg-green-500',
    inactive: 'bg-red-500',
    learning: 'bg-yellow-500',
  };

  const statusTextMap = {
    active: 'Active',
    inactive: 'Inactive',
    learning: 'Learning',
  };

  return (
    <div
      className={`backdrop-blur-md bg-sapphire-800/30 border border-emerald-400/30 rounded-lg overflow-hidden ${className}`}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex gap-4 items-center">
            <div className="relative">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={name}
                  width={60}
                  height={60}
                  className="rounded-full border-2 border-emerald-400/30"
                />
              ) : (
                <div className="w-[60px] h-[60px] rounded-full bg-emerald-400/10 border-2 border-emerald-400/30 flex items-center justify-center">
                  <Bot className="text-emerald-400 w-8 h-8" />
                </div>
              )}

              <div
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-sapphire-800 ${statusColorMap[status]}`}
              />
            </div>

            <div>
              <h3 className="text-xl font-cyber text-emerald-400">{name}</h3>
              <p className="text-emerald-400/60 text-sm">{role}</p>
            </div>
          </div>

          <div className="px-2 py-1 text-xs rounded-full bg-emerald-400/10 border border-emerald-400/30 text-emerald-400">
            {statusTextMap[status]}
          </div>
        </div>

        <div className="mb-6">
          <div className="text-sm text-emerald-400/60 mb-1">Specialization</div>
          <div className="text-emerald-400 font-medium flex items-center gap-2">
            <Award className="w-4 h-4" />
            {specialization}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-sapphire-900/40 rounded-lg p-4">
            <div className="text-xs text-emerald-400/60 mb-1">Monthly Return</div>
            <div className="text-xl font-cyber text-emerald-400 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              {performance.monthly > 0 ? '+' : ''}
              {performance.monthly}%
            </div>
          </div>

          <div className="bg-sapphire-900/40 rounded-lg p-4">
            <div className="text-xs text-emerald-400/60 mb-1">All-Time Return</div>
            <div className="text-xl font-cyber text-emerald-400 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              {performance.allTime > 0 ? '+' : ''}
              {performance.allTime}%
            </div>
          </div>
        </div>

        <button className="w-full py-2 px-4 bg-emerald-400 text-sapphire-900 rounded-md font-cyber hover:bg-emerald-300 transition-colors">
          CHAT WITH AGENT
        </button>
      </div>
    </div>
  );
};
