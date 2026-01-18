import React, { useState, useRef, useEffect } from 'react';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Simulate AI response
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const responses = [
      "Hello! How can I help you today?",
      "That's an interesting question!",
      "I'd be happy to help with that.",
      "Let me think about that...",
      "Great question! Here's what I think."
    ];
    
    const aiResponse = responses[Math.floor(Math.random() * responses.length)];
    
    const assistantMessage = {
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, assistantMessage]);
    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.title}>
            <div style={styles.logo}>🤖</div>
            <div>
              <h1 style={styles.h1}>AI Chat</h1>
              <p style={styles.subtitle}>Powered by React + Docker</p>
            </div>
          </div>
          <button onClick={clearChat} style={styles.clearButton}>
            🗑️ Clear
          </button>
        </div>
      </div>

      {/* Chat messages */}
      <div style={styles.chatArea}>
        {messages.length === 0 ? (
          <div style={styles.welcome}>
            <div style={styles.welcomeLogo}>🤖</div>
            <h2>Welcome to AI Chat</h2>
            <p>Start a conversation by typing below</p>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <div key={idx} style={{
                ...styles.messageContainer,
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
              }}>
                {msg.role === 'assistant' && (
                  <div style={styles.avatarAssistant}>🤖</div>
                )}
                <div style={{
                  ...styles.messageBubble,
                  backgroundColor: msg.role === 'user' ? '#3b82f6' : '#1f2937',
                  color: msg.role === 'user' ? 'white' : '#f9fafb'
                }}>
                  {msg.content}
                  <div style={styles.timestamp}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                {msg.role === 'user' && (
                  <div style={styles.avatarUser}>👤</div>
                )}
              </div>
            ))}
            
            {loading && (
              <div style={styles.typingIndicator}>
                <div style={styles.typingDots}>
                  <div style={{...styles.dot, animationDelay: '0s'}}></div>
                  <div style={{...styles.dot, animationDelay: '0.2s'}}></div>
                  <div style={{...styles.dot, animationDelay: '0.4s'}}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input area */}
      <div style={styles.inputArea}>
        <div style={styles.inputContainer}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            style={styles.textarea}
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            style={styles.sendButton}
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: '#111827',
    color: 'white',
    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
  },
  header: {
    backgroundColor: '#1f2937',
    padding: '16px',
    borderBottom: '1px solid #374151'
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  logo: {
    fontSize: '32px'
  },
  h1: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 'bold'
  },
  subtitle: {
    margin: 0,
    fontSize: '12px',
    color: '#9ca3af'
  },
  clearButton: {
    padding: '8px 16px',
    backgroundColor: '#374151',
    border: '1px solid #4b5563',
    borderRadius: '8px',
    color: '#d1d5db',
    cursor: 'pointer',
    fontSize: '14px'
  },
  chatArea: {
    flex: 1,
    overflow: 'auto',
    padding: '16px'
  },
  welcome: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center'
  },
  welcomeLogo: {
    fontSize: '64px',
    marginBottom: '16px'
  },
  messageContainer: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
    marginBottom: '16px'
  },
  avatarAssistant: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#8b5cf6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    flexShrink: 0
  },
  avatarUser: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#3b82f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    flexShrink: 0
  },
  messageBubble: {
    maxWidth: '70%',
    padding: '12px 16px',
    borderRadius: '16px',
    fontSize: '14px',
    lineHeight: '1.4'
  },
  timestamp: {
    fontSize: '11px',
    opacity: 0.7,
    marginTop: '4px',
    textAlign: 'right'
  },
  typingIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  typingDots: {
    display: 'flex',
    gap: '4px',
    padding: '12px 16px',
    backgroundColor: '#1f2937',
    borderRadius: '16px',
    border: '1px solid #374151'
  },
  dot: {
    width: '8px',
    height: '8px',
    backgroundColor: '#8b5cf6',
    borderRadius: '50%',
    animation: 'bounce 1s infinite'
  },
  inputArea: {
    backgroundColor: '#1f2937',
    padding: '16px',
    borderTop: '1px solid #374151'
  },
  inputContainer: {
    display: 'flex',
    gap: '8px'
  },
  textarea: {
    flex: 1,
    backgroundColor: '#374151',
    color: 'white',
    padding: '12px',
    borderRadius: '12px',
    border: '1px solid #4b5563',
    resize: 'none',
    minHeight: '48px',
    fontSize: '14px',
    fontFamily: 'inherit'
  },
  sendButton: {
    padding: '12px 20px',
    backgroundColor: '#8b5cf6',
    border: 'none',
    borderRadius: '12px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '18px',
    height: '48px'
  }
};

export default App;