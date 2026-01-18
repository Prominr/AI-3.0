```javascript
const { useState, useRef, useEffect } = React;

// Lucide icons as inline SVGs
const BotIcon = () => (
    
        
        
        
        
        
        
    
);

const UserIcon = () => (
    
        
        
    
);

const SendIcon = () => (
    
        
        
    
);

const ImageIcon = () => (
    
        
        
        
    
);

const XIcon = () => (
    
        
        
    
);

const TrashIcon = () => (
    
        
        
        
    
);

function AIChat() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [responseMode, setResponseMode] = useState('fast');
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const handlePaste = (e) => {
            const items = e.clipboardData?.items;
            if (!items) return;

            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    const file = items[i].getAsFile();
                    if (file) {
                        setSelectedImage(file);
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            setImagePreview(reader.result);
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

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
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

    const callClaudeAPI = async (conversationHistory, imageData = null) => {
        try {
            const messageContent = [];

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
                },
                body: JSON.stringify({
                    model: 'claude-sonnet-4-20250514',
                    max_tokens: responseMode === 'fast' ? 500 : 2000,
                    system: systemPrompt,
                    messages: conversationHistory.map(msg => ({
                        role: msg.role,
                        content: msg.role === 'user' && msg.image ? messageContent : msg.content
                    }))
                })
            });

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

        const userMessage = {
            role: 'user',
            content: input || '(sent an image)',
            image: imagePreview,
            timestamp: new Date()
        };

        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');
        setLoading(true);

        const conversationForAPI = newMessages.map(msg => ({
            role: msg.role,
            content: msg.content,
            image: msg.image
        }));

        const aiResponse = await callClaudeAPI(conversationForAPI, imagePreview);

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
        
            
                
                    
                        
                            
                        
                        
                            AI Assistant
                            Powered by Claude • Full Memory
                        
                    
                    
                        
                    
                

                
                    <button
                        onClick={() => setResponseMode('fast')}
                        className={`flex-1 px-4 py-2 rounded-lg transition-all ${responseMode === 'fast'
                                ? 'bg-gradient-to-br from-orange-400 to-amber-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                    >
                        ⚡ Fast Response
                    
                    <button
                        onClick={() => setResponseMode('expert')}
                        className={`flex-1 px-4 py-2 rounded-lg transition-all ${responseMode === 'expert'
                                ? 'bg-gradient-to-br from-orange-400 to-amber-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                    >
                        🎓 Expert Response
                    
                
            

            
                {messages.length === 0 ? (
                    
                        
                            
                                
                            
                            Start a conversation
                            Ask me anything or send an image to get started
                        
                    
                ) : (
                    <>
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                {msg.role === 'assistant' && (
                                    
                                        
                                    
                                )}

                                <div
                                    className={`max-w-[70%] rounded-2xl p-4 ${msg.role === 'user'
                                            ? 'bg-gray-700 text-white'
                                            : 'bg-gray-900 text-white border border-gray-700'
                                        }`}
                                >
                                    {msg.image && (
                                        
                                    )}
                                    {msg.content}
                                    
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    
                                

                                {msg.role === 'user' && (
                                    
                                        
                                    
                                )}
                            
                        ))}

                        {loading && (
                            
                                
                                    
                                
                                
                                    
                                        
                                        
                                        
                                    
                                
                            
                        )}
                        
                    </>
                )}
            

            {imagePreview && (
                
                    
                        
                        
                            
                        
                    
                
            )}

            
                
                    

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-3 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-xl transition-colors border border-gray-600"
                    >
                        
                    

                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask me anything or send an image..."
                        className="flex-1 bg-gray-700 text-white placeholder-gray-400 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-orange-400 border border-gray-600"
                        rows={1}
                        style={{ maxHeight: '120px' }}
                    />

                    
                        
                    
                
            
        
    );
}

ReactDOM.render(, document.getElementById('root'));
```

---