import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, Hash, Users, Mic, Headphones, Settings, MessageSquare, Shield, Wallet } from 'lucide-react';
// TODO: Re-enable wallet functionality
// import useWallet from '../hooks/useWallet';
import { toast } from 'sonner';

// Example channel and message data
const channels = [
  { id: 'demon-slayer', name: '#-demon-slayer', icon: <Hash size={18} /> },
  { id: 'attack-on-titan', name: '#-attack-on-titan', icon: <Hash size={18} /> },
  { id: 'jujutsu-kaisen', name: '#-jujutsu-kaisen', icon: <Hash size={18} /> },
  { id: 'my-hero-academia', name: '#-my-hero-academia', icon: <Hash size={18} /> },
];

const initialMessages = [
  {
    user: 'ProBot',
    avatar: '/avatars/probot.png',
    time: '7:54 PM',
    content: "Welcome to OtakuVerse! We're thrilled to have you on board for this exciting journey. Check out the #rules-and-guidelines channel to stay informed and say hi in #introductions!",
    bot: true
  },
  {
    user: 'A wild normol',
    avatar: '/avatars/wild.png',
    time: '7:54 PM',
    content: '👋 Wave to say hi',
    bot: false
  }
];

const CommunityDiscord: React.FC = () => {
  const { communityId } = useParams();
  // TODO: Re-enable wallet functionality
  // const { connected: isConnected, connect: connectWallet, address } = useWallet();
  
  // Mock wallet state for debugging
  const isConnected = false;
  const connectWallet = () => toast.info("Wallet connection disabled for debugging");
  const address = null;
  const [activeChannel, setActiveChannel] = React.useState(() => {
    return channels.find(ch => ch.id === communityId) ? communityId : channels[0].id;
  });
  const activeChannelObj = channels.find(ch => ch.id === activeChannel) || channels[0];

  // Message state
  const [messages, setMessages] = React.useState(initialMessages);
  const [input, setInput] = React.useState("");
  const [isJoined, setIsJoined] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  // Join community handler
  const joinCommunity = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate blockchain transaction for joining community
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsJoined(true);
      toast.success('Successfully joined the community!');
      
      // Add welcome message
      setMessages(prev => [
        ...prev,
        {
          user: 'System',
          avatar: '/avatars/system.png',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content: `Welcome! You've successfully joined this decentralized community.`,
          bot: true
        }
      ]);
    } catch (error) {
      toast.error('Failed to join community');
    } finally {
      setIsLoading(false);
    }
  };

  // Send message handler
  const sendMessage = async () => {
    if (input.trim() === "") return;
    if (!isConnected) {
      toast.error('Please connect your wallet to send messages');
      return;
    }
    if (!isJoined) {
      toast.error('Please join the community first');
      return;
    }

    const newMessage = {
      user: wallet?.publicKey?.toString().slice(0, 8) + '...' || 'You',
      avatar: '/avatars/default-user.png',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: input,
      bot: false
    };

    setMessages(prev => [...prev, newMessage]);
    setInput("");

    // Simulate blockchain message storage
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success('Message sent to blockchain');
    } catch (error) {
      toast.error('Failed to store message on blockchain');
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#1a133b] via-[#934EFB]/70 to-[#14F194]/60 text-white font-sans">
      {/* Sidebar */}
      <aside className="w-20 flex flex-col items-center py-4 bg-[#18122B] border-r border-[#2a1d4e]/40 shadow-lg">
        <Link to="/communities" className="mb-6 hover:bg-[#26204a] p-2 rounded-full transition-colors">
          <ArrowLeft size={28} />
        </Link>
        {/* Server Icons */}
        <div className="flex flex-col gap-3 items-center mt-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#934EFB] to-[#14F194] shadow-lg flex items-center justify-center text-2xl font-bold border-2 border-[#fff2]">
            OV
          </div>
        </div>
      </aside>

      {/* Channel List */}
      <nav className="w-64 bg-[#20194a]/90 border-r border-[#2a1d4e]/40 flex flex-col py-4 px-2 shadow-lg">
        <h2 className="text-lg font-bold mb-4 px-2">Anime Channels</h2>
        <ul className="flex flex-col gap-1">
          {channels.map((ch, idx) => (
            <li
              key={ch.name}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${activeChannel === ch.id ? 'bg-gradient-to-r from-[#934EFB]/80 to-[#14F194]/50 text-[#18122B] font-bold shadow-lg' : 'hover:bg-[#14F194]/20 text-white/90'}`}
              onClick={() => setActiveChannel(ch.id)}
            >
              {ch.icon}
              <span className="font-medium">{ch.name}</span>
            </li>
          ))}
        </ul>
        <h2 className="text-lg font-bold mt-8 mb-4 px-2">Voice Channels</h2>
        <ul className="flex flex-col gap-1">
          <li className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#934EFB]/20 cursor-pointer transition-colors">
            <Mic size={18} />
            <span className="font-medium text-white/90">General</span>
          </li>
        </ul>
      </nav>

      {/* Chat Area */}
      <main className="flex-1 flex flex-col bg-[#23204a]/80">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-[#2a1d4e]/40 bg-[#23204a]/90 shadow">
          <div className="flex items-center gap-3">
            <Hash size={22} className="text-[#14F194]" />
            <span className="font-bold text-xl">{activeChannelObj.name}</span>
            <Shield size={18} className="text-[#934EFB]" title="Decentralized & Secure" />
          </div>
          <div className="flex items-center gap-3">
            {!isConnected ? (
              <button
                onClick={connectWallet}
                className="flex items-center gap-2 bg-gradient-to-r from-[#934EFB] to-[#14F194] px-4 py-2 rounded-lg font-bold text-[#18122B] hover:from-[#14F194] hover:to-[#934EFB] transition-all"
              >
                <Wallet size={16} />
                Connect Wallet
              </button>
            ) : !isJoined ? (
              <button
                onClick={joinCommunity}
                disabled={isLoading}
                className="flex items-center gap-2 bg-gradient-to-r from-[#14F194] to-[#934EFB] px-4 py-2 rounded-lg font-bold text-[#18122B] hover:from-[#934EFB] hover:to-[#14F194] transition-all disabled:opacity-50"
              >
                <Users size={16} />
                {isLoading ? 'Joining...' : 'Join Community'}
              </button>
            ) : (
              <div className="flex items-center gap-2 text-[#14F194]">
                <Users size={16} />
                <span className="font-medium">Member</span>
              </div>
            )}
          </div>
        </header>
        {/* Messages */}
        <section className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
          {messages.map((msg, idx) => (
            <div key={idx} className="flex gap-4 items-start">
              <img src={msg.avatar} alt={msg.user} className="w-10 h-10 rounded-full border-2 border-[#934EFB] bg-[#fff1]" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white/90">{msg.user}</span>
                  {msg.bot && <span className="bg-[#14F194] text-[#18122B] text-xs px-2 py-0.5 rounded-full ml-1">BOT</span>}
                  <span className="text-xs text-white/50">{msg.time}</span>
                </div>
                <div className="mt-1 text-white/80 leading-relaxed">{msg.content}</div>
              </div>
            </div>
          ))}
        </section>
        {/* Message Input */}
        <footer className="p-6 border-t border-[#2a1d4e]/40 bg-[#23204a]/90 flex items-center gap-4">
          <input
            type="text"
            placeholder={`Message ${activeChannelObj.name}`}
            className="flex-1 p-3 rounded-lg bg-[#18122B] text-white border border-[#934EFB]/30 focus:outline-none focus:ring-2 focus:ring-[#14F194]/50"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleInputKeyDown}
          />
          <button
            className="bg-gradient-to-tr from-[#934EFB] to-[#14F194] px-5 py-2 rounded-lg font-bold shadow text-[#18122B] hover:from-[#14F194] hover:to-[#934EFB] transition-all"
            onClick={sendMessage}
          >
            Send
          </button>
        </footer>
      </main>

      {/* Member List */}
      <aside className="w-64 bg-[#20194a]/80 border-l border-[#2a1d4e]/40 flex flex-col py-4 px-4 shadow-lg">
        <h2 className="text-lg font-bold mb-4">Online</h2>
        <ul className="space-y-3">
          <li className="flex items-center gap-3">
            <span className="w-3 h-3 bg-[#934EFB] rounded-full inline-block"></span>
            <img src="/avatars/probot.png" alt="ProBot" className="w-8 h-8 rounded-full border-2 border-[#934EFB]" />
            <span className="font-medium">ProBot</span>
          </li>
        </ul>
      </aside>
    </div>
  );
};

export default CommunityDiscord;
