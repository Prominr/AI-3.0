import React, { useState, useRef, useEffect, ChangeEvent, KeyboardEvent } from 'react';
import { Send, Image, X, Bot, User, Trash2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  image?: string | null;
  timestamp: Date;
}

type ResponseMode = 'fast' | 'expert';

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [responseMode, setResponseMode] = useState<ResponseMode>('fast');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            setSelectedImage(file);
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

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const callClaudeAPI = async (conversationHistory: Message[], imageData: string | null = null): Promise<string> => {
    try {
      const messageContent: any[] = [];
      
      if (imageData) {
        const base64Data = imageData.split(',')[1];
        const mediaType = imageData.split(';')[0].split(':')[1];
        
        messageContent.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: mediaType,
            data: base64Data
          }
        });
      }
      
      messageContent.push({
        type: 'text',
        text: conversationHistory[conversationHistory.length - 1].content
      });

      const systemPrompt = responseMode === 'fast' 
        ? `You're a chill AI assistant. Act natural and relaxed. Get straight to the point with concise answers. Keep it easygoing and playful. Be a bit goofy sometimes. Talk like Gen Z - casual and real. You can curse sometimes when it fits. Don't sound like a typical AI - be yourself. You're knowledgeable about everything but don't be formal about it. You can roast people a bit and be playful. Keep responses SHORT and relaxed but helpful. Don't use too many emojis. Just be chill and real.`
        : `You're an expert AI assistant with deep knowledge. Provide detailed, comprehensive, and thoroughly explained responses. Be professional but still approachable. Give in-depth analysis and multiple perspectives when relevant. Include examples, context, and nuanced explanations. You're knowledgeable and articulate - show expertise while remaining conversational. Still maintain a natural tone but prioritize thoroughness and accuracy.`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.REACT_APP_CLAUDE_API_KEY || '',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: responseMode === 'fast' ? 500 : 2000,
          system: systemPrompt,
          messages: conversationHistory.slice(-5).map(msg => ({
            role: msg.role,
            content: msg.role === 'user' && msg.image ? messageContent : msg.content
          }))
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.content && data.content[0] && data.content[0].text) {
        return data.content[0].text;
      } else {
        return "Yo my bad, something went wrong with that request. Try again?";
      }
    } catch (error) {
      console.error('API Error:', error);
      return "Damn, hit an error there. Could be network issues or something. Try again in a sec?";
    }
  };

  const handleSend = async () => {
    if (!input.trim() && !selectedImage) return;

    const userMessage: Message = {
      role: 'user',
      content: input || (selectedImage ? '(sent an image)' : ''),
      image: imagePreview,
      timestamp: new Date()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const aiResponse = await callClaudeAPI(newMessages, imagePreview);
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      removeImage();
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-600 flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">AI Assistant</h1>
              <p className="text-xs text-gray-400">Powered by Claude • Full Memory</p>
            </div>
          </div>
          <button
            onClick={clearChat}
            className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors border border-gray-700 hover:border-gray-600"
            title="Clear chat"
            aria-label="Clear chat"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setResponseMode('fast')}
            className={`flex-1 px-4 py-2 rounded-lg transition-all ${
              responseMode === 'fast'
                ? 'bg-gradient-to-br from-orange-400 to-amber-600 text-white shadow-lg'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
            }`}
            aria-label="Fast response mode"
          >
            ⚡ Fast Response
          </button>
          <button
            onClick={() => setResponseMode('expert')}
            className={`flex-1 px-4 py-2 rounded-lg transition-all ${
              responseMode === 'expert'
                ? 'bg-gradient-to-br from-orange-400 to-amber-600 text-white shadow-lg'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
            }`}
            aria-label="Expert response mode"
          >
            🎓 Expert Response
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-amber-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Bot className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Start a conversation</h2>
              <p className="text-gray-400 mb-6">Ask me anything or send an image to get started</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-800/50 rounded-lg p-3 text-sm">
                  <div className="font-semibold text-amber-400">Fast Mode</div>
                  <div className="text-gray-400 text-xs">Quick, casual responses</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3 text-sm">
                  <div className="font-semibold text-amber-400">Expert Mode</div>
                  <div className="text-gray-400 text-xs">Detailed, thorough answers</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-amber-600 flex items-center justify-center flex-shrink-0 shadow-md">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                
                <div
                  className={`max-w-[70%] rounded-2xl p-4 shadow-lg ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white'
                      : 'bg-gray-800/80 backdrop-blur-sm text-white border border-gray-700'
                  }`}
                >
                  {msg.image && (
                    <img
                      src={msg.image}
                      alt="Uploaded content"
                      className="rounded-lg mb-2 max-w-full h-auto max-h-64 object-contain"
                    />
                  )}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  <p className="text-xs opacity-60 mt-2 text-right">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-md">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            ))}
            
            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-amber-600 flex items-center justify-center shadow-md">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-700 shadow-lg">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Thinking...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {imagePreview && (
        <div className="px-4 pb-2 animate-in fade-in slide-in-from-bottom-4">
          <div className="relative inline-block bg-gray-800/80 backdrop-blur-sm rounded-lg p-2 border border-gray-700 shadow-lg">
            <img
              src={imagePreview}
              alt="Preview"
              className="h-20 rounded object-cover"
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-md"
              aria-label="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="bg-gray-900/80 backdrop-blur-sm border-t border-gray-700 p-4">
        <div className="flex gap-2 items-end">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
            aria-label="Upload image"
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-colors border border-gray-700 hover:border-gray-600 shadow-sm"
            aria-label="Attach image"
            title="Attach image (Ctrl+V to paste)"
          >
            <Image className="w-5 h-5" />
          </button>

          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything or paste/send an image..."
            className="flex-1 bg-gray-800 text-white placeholder-gray-400 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500 border border-gray-700 focus:border-amber-500 shadow-sm min-h-[44px] max-h-32"
            rows={1}
            aria-label="Message input"
          />

          <button
            onClick={handleSend}
            disabled={loading || (!input.trim() && !selectedImage)}
            className="p-3 bg-gradient-to-br from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all shadow-lg hover:shadow-xl disabled:shadow-none"
            aria-label="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-gray-500 text-center mt-2">
          Tip: You can paste images directly (Ctrl+V) • Remember to add your Claude API key in environment variables
        </p>
      </div>
    </div>
  );
}