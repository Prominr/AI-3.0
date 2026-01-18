import React, { useState, useRef, useEffect } from 'react';

// Using emojis instead of lucide-react to avoid potential issues
const Icons = {
  Send: () => '➤',
  Image: () => '🖼️',
  X: () => '✕',
  Bot: () => '🤖',
  User: () => '👤',
  Trash: () => '🗑️'
};

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [responseMode, setResponseMode] = useState('fast');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
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

  const simulateAIResponse = async () => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const responses = {
      fast: ["Yo! What's up?", "Cool!", "Tell me more!", "Interesting!", "Hmm..."],
      expert: ["Based on my analysis...", "Let me explain...", "There are several factors...", "From a technical perspective...", "I can provide detailed insights..."]
    };
    
    const modeResponses = responseMode === 'fast' ? responses.fast : responses.expert;
    return modeResponses[Math.floor(Math.random() * modeResponses.length)];
  };

  const handleSend = async () => {
    if (!input.trim() && !imagePreview) return;

    const userMessage = {
      role: 'user',
      content: input || '(sent an image)',
      image: imagePreview,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    const aiResponse = await simulateAIResponse();
    
    const assistantMessage = {
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, assistantMessage]);
    setLoading(false);
    removeImage();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: '#111827',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#1f2937',
        padding: '16px',
        borderBottom: '1px solid #374151'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(to right, #8b5cf6, #ec4899)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px'
            }}>
              {Icons.Bot()}
            </div>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '20px' }}>AI Assistant</div>
              <div style={{ fontSize: '12px', color: '#9ca3af' }}>Chat Interface</div>
            </div>
          </div>
          <button 
            onClick={clearChat}
            style={{
              padding: '8px',
              backgroundColor: '#374151',
              border: '1px solid #4b5563',
              borderRadius: '8px',
              color: '#d1d5db',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            {Icons.Trash()}
          </button>
        </div>

        {/* Mode selector */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setResponseMode('fast')}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '8px',
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
              padding: '8px',
              borderRadius: '8px',
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
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '16px'
      }}>
        {messages.length === 0 ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(to right, #8b5cf6, #ec4899)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '32px'
              }}>
                {Icons.Bot()}
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Start a conversation</h2>
              <p style={{ color: '#9ca3af' }}>Type a message to begin chatting</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '12px', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: '16px' }}>
                {msg.role === 'assistant' && (
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#8b5cf6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontSize: '14px'
                  }}>
                    {Icons.Bot()}
                  </div>
                )}
                
                <div style={{
                  maxWidth: '70%',
                  padding: '16px',
                  borderRadius: '16px',
                  backgroundColor: msg.role === 'user' ? '#3b82f6' : '#1f2937',
                  border: msg.role === 'user' ? 'none' : '1px solid #374151'
                }}>
                  {msg.image && (
                    <img 
                      src={msg.image} 
                      alt="Sent" 
                      style={{ borderRadius: '8px', marginBottom: '8px', maxWidth: '100%', maxHeight: '200px' }} 
                    />
                  )}
                  <div>{msg.content}</div>
                  <div style={{ fontSize: '12px', opacity: 0.6, marginTop: '8px', textAlign: 'right' }}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {msg.role === 'user' && (
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#3b82f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontSize: '14px'
                  }}>
                    {Icons.User()}
                  </div>
                )}
              </div>
            ))}
            
            {loading && (
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#8b5cf6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px'
                }}>
                  {Icons.Bot()}
                </div>
                <div style={{ backgroundColor: '#1f2937', borderRadius: '16px', padding: '16px', border: '1px solid #374151' }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#8b5cf6',
                      borderRadius: '50%',
                      animation: 'bounce 1s infinite'
                    }}></div>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#8b5cf6',
                      borderRadius: '50%',
                      animation: 'bounce 1s infinite 0.2s'
                    }}></div>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#8b5cf6',
                      borderRadius: '50%',
                      animation: 'bounce 1s infinite 0.4s'
                    }}></div>
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
        <div style={{ padding: '0 16px 8px' }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <img src={imagePreview} alt="Preview" style={{ height: '80px', borderRadius: '8px' }} />
            <button
              onClick={removeImage}
              style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                backgroundColor: '#ef4444',
                color: 'white',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              {Icons.X()}
            </button>
          </div>
        </div>
      )}

      {/* Input area */}
      <div style={{
        backgroundColor: '#1f2937',
        padding: '16px',
        borderTop: '1px solid #374151'
      }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            style={{ display: 'none' }}
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: '12px',
              backgroundColor: '#374151',
              border: '1px solid #4b5563',
              borderRadius: '12px',
              color: '#d1d5db',
              cursor: 'pointer',
              flexShrink: 0,
              fontSize: '16px',
              height: '48px'
            }}
          >
            {Icons.Image()}
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
              padding: '12px', 
              borderRadius: '12px', 
              border: '1px solid #4b5563',
              resize: 'none',
              minHeight: '48px',
              fontFamily: 'inherit',
              fontSize: '14px'
            }}
            rows={1}
          />

          <button
            onClick={handleSend}
            disabled={loading || (!input.trim() && !imagePreview)}
            style={{ 
              padding: '12px', 
              backgroundColor: '#8b5cf6', 
              border: 'none', 
              borderRadius: '12px', 
              color: 'white', 
              cursor: 'pointer',
              opacity: (loading || (!input.trim() && !imagePreview)) ? 0.5 : 1,
              flexShrink: 0,
              fontSize: '16px',
              height: '48px'
            }}
          >
            {Icons.Send()}
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

export default App;