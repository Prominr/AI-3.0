import React, { useState, useRef, useEffect } from 'react';
import { Send, Image, X, Bot, User, Trash2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  image?: string | null;
  timestamp: Date;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [responseMode, setResponseMode] = useState<'fast' | 'expert'>('fast');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const clearChat = () => {
    setMessages([]);
  };

  const simulateAIResponse = async (userInput: string): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (responseMode === 'fast') {
      const responses = [
        "Yo! What's up?",
        "Hmm interesting... tell me more!",
        "That's cool! 😎",
        "Not sure about that one tbh",
        "Aight, I got you"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    } else {
      const responses = [
        "Based on my analysis, there are multiple factors to consider...",
        "This requires understanding of several key principles...",
        "Let me provide a comprehensive explanation...",
        "From a technical perspective, the underlying mechanism involves...",
        "I can offer detailed insights on this topic..."
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
  };

  const handleSend = async () => {
    if (!input.trim() && !imagePreview) return;

    const userMessage: Message = {
      role: 'user',
      content: input || '(sent an image)',
      image: imagePreview,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column' as const,
      height: '100vh',
      backgroundColor: '#111827'
    },
    header: {
      backgroundColor: '#1f2937',
      padding: '1rem',
      borderBottom: '1px solid #374151'
    },
    chatArea: {
      flex: 1,
      overflow: 'auto' as const,
      padding: '1rem'
    },
    messageBubble: {
      maxWidth: '70%',
      padding: '1rem',
      borderRadius: '1rem',
      marginBottom: '0.5rem'
    },
    inputArea: {
      backgroundColor: '#1f2937',
      padding: '1rem',
      borderTop: '1px solid #374151'
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', background: 'linear-gradient(to right, #8b5cf6, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={20} color="white" />
            </div>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>AI Assistant</div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>TypeScript + React</div>
            </div>
          </div>
          <button 
            onClick={clearChat}
            style={{ padding: '0.5rem', backgroundColor: '#374151', border: '1px solid #4b5563', borderRadius: '0.5rem', color: '#d1d5db', cursor: 'pointer' }}
          >
            <Trash2 size={20} />
          </button>
        </div>

        {/* Mode selector */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setResponseMode('fast')}
            style={{
              flex: 1,
              padding: '0.5rem',
              borderRadius: '0.5rem',
              border: 'none',
              backgroundColor: responseMode === 'fast' ? '#8b5cf6' : '#374151',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            ⚡ Fast Mode
          </button>
          <button
            onClick={() => setResponseMode('expert')}
            style={{
              flex: 1,
              padding: '0.5rem',
              borderRadius: '0.5rem',
              border: 'none',
              backgroundColor: responseMode === 'expert' ? '#8b5cf6' : '#374151',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            🎓 Expert Mode
          </button>
        </div>
      </div>

      {/* Chat messages */}
      <div style={styles.chatArea}>
        {messages.length === 0 ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '5rem', height: '5rem', borderRadius: '50%', background: 'linear-gradient(to right, #8b5cf6, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <Bot size={40} color="white" />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Start a conversation</h2>
              <p style={{ color: '#9ca3af' }}>Type a message to begin chatting</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '0.75rem', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: '1rem' }}>
                {msg.role === 'assistant' && (
                  <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', backgroundColor: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Bot size={16} color="white" />
                  </div>
                )}
                
                <div style={{
                  ...styles.messageBubble,
                  backgroundColor: msg.role === 'user' ? '#3b82f6' : '#1f2937',
                  border: msg.role === 'user' ? 'none' : '1px solid #374151'
                }}>
                  {msg.image && (
                    <img 
                      src={msg.image} 
                      alt="Sent" 
                      style={{ borderRadius: '0.5rem', marginBottom: '0.5rem', maxWidth: '100%', maxHeight: '200px' }} 
                    />
                  )}
                  <div>{msg.content}</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '0.5rem', textAlign: 'right' }}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {msg.role === 'user' && (
                  <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <User size={16} color="white" />
                  </div>
                )}
              </div>
            ))}
            
            {loading && (
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', backgroundColor: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={16} color="white" />
                </div>
                <div style={{ backgroundColor: '#1f2937', borderRadius: '1rem', padding: '1rem', border: '1px solid #374151' }}>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <div style={{ width: '0.5rem', height: '0.5rem', backgroundColor: '#8b5cf6', borderRadius: '50%', animation: 'bounce 1s infinite' }}></div>
                    <div style={{ width: '0.5rem', height: '0.5rem', backgroundColor: '#8b5cf6', borderRadius: '50%', animation: 'bounce 1s infinite 0.2s' }}></div>
                    <div style={{ width: '0.5rem', height: '0.5rem', backgroundColor: '#8b5cf6', borderRadius: '50%', animation: 'bounce 1s infinite 0.4s' }}></div>
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
        <div style={{ padding: '0 1rem 0.5rem' }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <img src={imagePreview} alt="Preview" style={{ height: '5rem', borderRadius: '0.5rem' }} />
            <button
              onClick={removeImage}
              style={{ position: 'absolute', top: '-0.5rem', right: '-0.5rem', backgroundColor: '#ef4444', color: 'white', borderRadius: '50%', width: '1.5rem', height: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}
            >
              <X size={12} />
            </button>
          </div>
        </div>
      )}

      {/* Input area */}
      <div style={styles.inputArea}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            style={{ display: 'none' }}
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{ padding: '0.75rem', backgroundColor: '#374151', border: '1px solid #4b5563', borderRadius: '0.75rem', color: '#d1d5db', cursor: 'pointer', flexShrink: 0 }}
          >
            <Image size={20} />
          </button>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            style={{ 
              flex: 1, 
              backgroundColor: '#374151', 
              color: 'white', 
              padding: '0.75rem', 
              borderRadius: '0.75rem', 
              border: '1px solid #4b5563',
              resize: 'none' as const,
              minHeight: '3rem',
              fontFamily: 'inherit'
            }}
            rows={1}
          />

          <button
            onClick={handleSend}
            disabled={loading || (!input.trim() && !imagePreview)}
            style={{ 
              padding: '0.75rem', 
              backgroundColor: '#8b5cf6', 
              border: 'none', 
              borderRadius: '0.75rem', 
              color: 'white', 
              cursor: 'pointer',
              opacity: (loading || (!input.trim() && !imagePreview)) ? 0.5 : 1,
              flexShrink: 0
            }}
          >
            <Send size={20} />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}