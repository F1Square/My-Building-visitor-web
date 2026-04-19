import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Send } from 'lucide-react';
import api from '../../lib/apiClient';

interface ChatMsg {
  id: string;
  user_id: string;
  message: string;
  sender_name?: string;
  created_at: string;
}

export default function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastIdRef = useRef<string | null>(null);

  const fetchMessages = async () => {
    try {
      const data = await api.get<ChatMsg[]>('/chat');
      setMessages(data);
      if (data.length > 0) lastIdRef.current = data[data.length - 1].id;
    } catch { /* ignore */ }
  };

  const fetchNew = async () => {
    if (!lastIdRef.current) { await fetchMessages(); return; }
    try {
      const data = await api.get<ChatMsg[]>(`/chat/new?after_id=${lastIdRef.current}`);
      if (data.length > 0) {
        setMessages(prev => [...prev, ...data]);
        lastIdRef.current = data[data.length - 1].id;
      }
    } catch { /* ignore */ }
  };

  useEffect(() => {
    fetchMessages().finally(() => setLoading(false));
    const interval = setInterval(fetchNew, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      const sent = await api.post<ChatMsg>('/chat', { message: text });
      setMessages(prev => [...prev, sent]);
      lastIdRef.current = sent.id;
      setText('');
    } catch { /* ignore */ } finally { setSending(false); }
  };

  if (loading) return <div className="p-4"><LoadingSkeleton /></div>;

  return (
    <div className="flex flex-col h-[calc(100vh-180px)]">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Group Chat</h1>
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {messages.length === 0 && (
          <p className="text-center text-gray-400 mt-12">No messages yet. Say hello! 👋</p>
        )}
        {messages.map(m => {
          const isMe = m.user_id === user?.id;
          return (
            <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${isMe ? 'bg-blue-600 text-white' : 'bg-white border border-gray-100 text-gray-900'}`}>
                {!isMe && <p className="text-xs font-semibold mb-1 text-blue-600">{m.sender_name ?? 'Unknown'}</p>}
                <p className="text-sm">{m.message}</p>
                <p className={`text-[10px] mt-1 ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                  {new Date(m.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2 mt-4">
        <Input value={text} onChange={e => setText(e.target.value)} placeholder="Type a message..."
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()} />
        <Button onClick={handleSend} disabled={sending || !text.trim()} size="icon">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
