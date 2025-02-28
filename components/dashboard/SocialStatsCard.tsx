// @ts-nocheck
import React from 'react';
import { Users, MessageSquare, Share2, ArrowUpRight, Twitter, Repeat } from 'lucide-react';
import Link from 'next/link';

interface SocialPost {
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  url: string;
}

interface SocialStatsProps {
  followersCount: number;
  postsCount: number;
  engagementRate: number;
  recentPosts: SocialPost[];
  className?: string;
}

export const SocialStatsCard: React.FC<SocialStatsProps> = ({
  followersCount,
  postsCount,
  engagementRate,
  recentPosts,
  className = '',
}) => {
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffMins < 24 * 60) {
      return `${Math.floor(diffMins / 60)}h ago`;
    } else {
      return `${Math.floor(diffMins / (60 * 24))}d ago`;
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  };

  return (
    <div
      className={`backdrop-blur-md bg-sapphire-800/30 border border-emerald-400/30 rounded-lg overflow-hidden ${className}`}
    >
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-cyber text-emerald-400">Social Presence</h3>
          <div className="px-2 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/30 text-emerald-400 text-xs flex items-center gap-1">
            <Twitter className="w-3 h-3" />
            CONNECTED
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-sapphire-900/40 rounded-lg p-3 text-center">
            <div className="flex justify-center mb-2">
              <Users className="text-emerald-400 w-5 h-5" />
            </div>
            <div className="text-lg font-cyber text-emerald-400">
              {formatNumber(followersCount)}
            </div>
            <div className="text-xs text-emerald-400/60">Followers</div>
          </div>

          <div className="bg-sapphire-900/40 rounded-lg p-3 text-center">
            <div className="flex justify-center mb-2">
              <Repeat className="text-emerald-400 w-5 h-5" />
            </div>
            <div className="text-lg font-cyber text-emerald-400">{postsCount}</div>
            <div className="text-xs text-emerald-400/60">Posts</div>
          </div>

          <div className="bg-sapphire-900/40 rounded-lg p-3 text-center">
            <div className="flex justify-center mb-2">
              <Share2 className="text-emerald-400 w-5 h-5" />
            </div>
            <div className="text-lg font-cyber text-emerald-400">{engagementRate}%</div>
            <div className="text-xs text-emerald-400/60">Engagement</div>
          </div>
        </div>

        <div className="mb-6">
          <div className="text-sm text-emerald-400/80 mb-3">Recent Updates</div>

          <div className="space-y-3">
            {recentPosts.length > 0 ? (
              recentPosts.map((post, index) => (
                <div key={index} className="bg-sapphire-900/40 rounded-lg p-3">
                  <div className="text-sm text-emerald-400/90 mb-2">
                    {truncateText(post.content, 100)}
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3 text-xs text-emerald-400/60">
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {formatNumber(post.likes)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Repeat className="w-3 h-3" />
                        {formatNumber(post.comments)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Share2 className="w-3 h-3" />
                        {formatNumber(post.shares)}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-xs text-emerald-400/60">
                        {formatTimestamp(post.timestamp)}
                      </span>
                      <Link href={post.url} target="_blank" rel="noopener noreferrer">
                        <ArrowUpRight className="w-3 h-3 text-emerald-400/80" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-emerald-400/60">
                No recent social posts available
              </div>
            )}
          </div>
        </div>

        <Link
          href="https://twitter.com/TradesXBT"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex justify-center items-center py-2 px-4 bg-sapphire-900/60 border border-emerald-400/30 text-emerald-400 rounded-md font-cyber text-sm hover:bg-emerald-400/10 transition-colors"
        >
          FOLLOW US <Twitter className="w-4 h-4 ml-2" />
        </Link>
      </div>
    </div>
  );
};
