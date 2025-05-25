import React, { useState, useEffect } from 'react';
import { toast } from '@/components/ui/sonner';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ChevronLeft,
  Heart, Share2, Plus, Gift, Trophy, Star
} from 'lucide-react';
import Navbar from '@/components/Navbar';

interface Episode {
  id: number;
  title: string;
  videoId: string;
  duration: string;
}

const WatchPage = (): JSX.Element => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [watchTime, setWatchTime] = useState(0);
  const [hasEarnedNFT, setHasEarnedNFT] = useState(false);

  // Mock anime data
  const animeData = {
    id: id || '1',
    title: 'Attack on Titan',
    description: 'Humanity fights for survival against giant humanoid Titans.',
    episodes: [
      { id: 1, title: 'To You, in 2000 Years', videoId: 'dQw4w9WgXcQ', duration: '24:30' },
      { id: 2, title: 'That Day', videoId: 'dQw4w9WgXcQ', duration: '24:15' },
      { id: 3, title: 'A Dim Light Amid Despair', videoId: 'dQw4w9WgXcQ', duration: '24:45' },
    ]
  };

  useEffect(() => {
    setCurrentEpisode(animeData.episodes[0]);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setWatchTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleEarnNFT = async () => {
    if (watchTime >= 30) { // 30 seconds for demo
      setHasEarnedNFT(true);
      toast.success("🎉 NFT Earned! You've been rewarded for watching!");
    } else {
      toast.info(`Keep watching! ${30 - watchTime} seconds remaining to earn NFT`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Navbar />
      
      <div className="container mx-auto px-4 py-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/anime')}
          className="flex items-center text-white/80 hover:text-white mb-4 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to Library
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Player Section */}
          <div className="lg:col-span-2">
            <div className="bg-black rounded-lg overflow-hidden mb-4">
              <div className="aspect-video bg-gray-900 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-6xl mb-4">▶️</div>
                  <h3 className="text-xl font-semibold mb-2">
                    {currentEpisode?.title || 'Loading...'}
                  </h3>
                  <p className="text-gray-400">
                    Watch time: {Math.floor(watchTime / 60)}:{(watchTime % 60).toString().padStart(2, '0')}
                  </p>
                </div>
              </div>
            </div>

            {/* Video Controls */}
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">{animeData.title}</h2>
                  <p className="text-gray-300">{currentEpisode?.title}</p>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors">
                    <Heart className="w-5 h-5" />
                  </button>
                  <button className="p-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                  <button className="p-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors">
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* NFT Earning Section */}
            <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-md rounded-lg p-6 border border-purple-500/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-purple-600 rounded-full">
                    <Gift className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Watch to Earn NFT</h3>
                    <p className="text-gray-300 text-sm">
                      {hasEarnedNFT 
                        ? "🎉 NFT Earned!" 
                        : `Watch for ${Math.max(0, 30 - watchTime)} more seconds to earn an NFT`
                      }
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleEarnNFT}
                  disabled={hasEarnedNFT}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    hasEarnedNFT
                      ? 'bg-green-600 text-white cursor-not-allowed'
                      : watchTime >= 30
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'bg-gray-600 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  {hasEarnedNFT ? (
                    <>
                      <Trophy className="w-4 h-4 inline mr-2" />
                      Earned!
                    </>
                  ) : (
                    <>
                      <Star className="w-4 h-4 inline mr-2" />
                      Earn NFT
                    </>
                  )}
                </button>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-300 mb-2">
                  <span>Progress</span>
                  <span>{Math.min(100, Math.round((watchTime / 30) * 100))}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (watchTime / 30) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Episodes List */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Episodes</h3>
            <div className="space-y-2">
              {animeData.episodes.map((episode) => (
                <button
                  key={episode.id}
                  onClick={() => setCurrentEpisode(episode)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    currentEpisode?.id === episode.id
                      ? 'bg-purple-600/50 border border-purple-500'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-white text-sm">
                        Episode {episode.id}
                      </p>
                      <p className="text-gray-300 text-xs mt-1">
                        {episode.title}
                      </p>
                    </div>
                    <span className="text-gray-400 text-xs">
                      {episode.duration}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatchPage;