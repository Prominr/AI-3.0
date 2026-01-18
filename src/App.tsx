import React, { useState, useRef, useEffect, ChangeEvent, KeyboardEvent } from 'react';

// Icons - using emojis instead of lucide-react to simplify
const Icons = {
  Send: () => <span>➤</span>,
  Image: () => <span>🖼️</span>,
  X: () => <span>✕</span>,
  Bot: () => <span>🤖</span>,
  User: () => <span>👤</span>,
  Trash: () => <span>🗑️</span>
};

interface Message {
  role: 'user' | 'assistant';
  content: string;
  image?: string | null;
  timestamp: Date;
}

type ResponseMode = 'fast' | 'expert';

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [responseMode, setResponseMode] = useState<ResponseMode>('fast');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Image paste handler
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
              setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
          }
          break;
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  // Image upload
  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove image
  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Clear chat
  const clearChat = () => {
    setMessages([]);
  };

  // Simulate AI response (replace with real API)
  const simulateAIResponse = async (userInput: string): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const responses = {
      fast: [
        "Yo, that's interesting! Tell me more.",
        "Hmm, good question. Let me think...",
        "Okay so basically...",
        "Honestly? Not sure about that one chief.",
        "That's wild! 😂"
      ],
      expert: [
        "Based on my analysis, there are several factors to consider...",
        "This is a complex topic that requires understanding of multiple domains...",
        "From a technical perspective, the underlying mechanisms involve...",
        "Historically speaking, this pattern has emerged due to...",
        "Let me provide a comprehensive breakdown of this subject..."
      ]
    };

    const modeResponses = responseMode === 'fast' ? responses.fast : responses.expert;
    return modeResponses[Math.floor(Math.random() * modeResponses.length)];
  };

  // Send message
  const handleSend = async () => {
    if (!input.trim() && !imagePreview) return;

    const userMessage: Message = {
      role: 'user',
      content: input || (imagePreview ? '(sent an image)' : ''),
      image: imagePreview,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Simulate API call
    const aiResponse = await simulateAIResponse(input);
    
    const assistantMessage: Message = {
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, assistantMessage]);
    setLoading(false);
    removeImage();
  };

  // Enter key handler
  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 p-4 border-b border-gray-700">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
              <span className="text-xl">🤖</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">AI Assistant</h1>
              <p className="text-sm text-gray-400">TypeScript + React</p>
            </div>
          </div>
          <button
            onClick={clearChat}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
            title="Clear chat"
          >
            <Icons.Trash />
          </button>
        </div>

        {/* Mode selector */}
        <div className="flex gap-2">
          <button
            onClick={() => setResponseMode('fast')}
            className={`flex-1 py-2 rounded-lg ${responseMode === 'fast' ? 'bg-purple-600' : 'bg-gray-700'}`}
          >
            ⚡ Fast
          </button>
          <button
            onClick={() => setResponseMode('expert')}
            className={`flex-1 py-2 rounded-lg ${responseMode === 'expert' ? 'bg-purple-600' : 'bg-gray-700'}`}
          >
            🎓 Expert
          </button>
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🤖</span>
              </div>
              <h2 className="text-2xl font-bold mb-2">Start chatting</h2>
              <p className="text-gray-400">Type a message or paste an image</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                    <Icons.Bot />
                  </div>
                )}
                
                <div className={`max-w-[70%] rounded-2xl p-4 ${msg.role === 'user' ? 'bg-blue-600' : 'bg-gray-800'}`}>
                  {msg.image && (
                    <img src={msg.image} alt="Sent" className="rounded-lg mb-2 max-w-full h-32 object-cover" />
                  )}
                  <p>{msg.content}</p>
                  <p className="text-xs opacity-60 mt-2">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                    <Icons.User />
                  </div>
                )}
              </div>
            ))}
            
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                  <Icons.Bot />
                </div>
                <div className="bg-gray-800 rounded-2xl p-4">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse delay-150"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse delay-300"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Image preview */}
      {imagePreview && (
        <div className="px-4 py-2">
          <div className="relative inline-block">
            <img src={imagePreview} alt="Preview" className="h-20 rounded-lg" />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
            >
              <Icons.X />
            </button>
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="bg-gray-800 p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 bg-gray-700 rounded-xl"
            title="Upload image"
          >
            <Icons.Image />
          </button>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 bg-gray-700 rounded-xl p-3 resize-none focus:outline-none"
            rows={1}
          />

          <button
            onClick={handleSend}
            disabled={loading || (!input.trim() && !imagePreview)}
            className="p-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-xl"
          >
            <Icons.Send />
          </button>
        </div>
      </div>
    </div>
  );
}