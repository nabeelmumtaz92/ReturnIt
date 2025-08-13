import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Send, Bot, User, MessageCircle, Phone } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai' | 'support';
  timestamp: Date;
}

interface SupportContext {
  type: 'driver' | 'customer';
  name: string;
  orderId?: string;
}

interface SupportChatProps {
  isOpen: boolean;
  onClose: () => void;
  context?: SupportContext;
}

export function SupportChatFixed({ isOpen, onClose, context }: SupportChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isEscalated, setIsEscalated] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const addMessage = (content: string, sender: 'user' | 'ai' | 'support') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      sender,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    
    addMessage(inputMessage, 'user');
    setInputMessage('');
    
    if (!isEscalated) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        addMessage("I understand your concern. Let me help you with that right away. Can you provide more details about your specific issue?", 'ai');
      }, 2000);
    }
  };

  const handleEscalate = () => {
    setIsEscalated(true);
    addMessage("Connecting you with a human support agent. Please wait...", 'ai');
    
    setTimeout(() => {
      const supportAgents = ['Sarah', 'Mike', 'Jessica', 'David', 'Emily'];
      const randomAgent = supportAgents[Math.floor(Math.random() * supportAgents.length)];
      const currentTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      
      addMessage(
        `Hi ${context?.name || 'there'}! This is ${randomAgent} from Returnly Support (${currentTime}). I'm here to help you resolve this issue. How can I assist you today?`,
        'support'
      );
    }, 3000);
  };

  const handleCallSupport = () => {
    window.open('tel:+13145550199');
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setTimeout(() => {
        addMessage("Hello! I'm here to help with your return pickup. What can I assist you with?", 'ai');
        
        setTimeout(() => {
          addMessage("Please select what best describes your issue:", 'ai');
        }, 1000);
      }, 500);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: '800px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          border: '2px solid #ea580c',
          height: '600px',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: 'white',
          borderRadius: '8px 8px 0 0',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isEscalated ? (
                <User style={{ width: '20px', height: '20px', color: '#16a34a' }} />
              ) : (
                <Bot style={{ width: '20px', height: '20px', color: '#2563eb' }} />
              )}
              <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>
                {isEscalated ? 'Human Support' : 'AI Assistant'}
              </h3>
              {isEscalated && (
                <Badge className="bg-green-100 text-green-800 text-xs">Live</Badge>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Button size="sm" variant="outline" onClick={handleCallSupport}>
                <Phone style={{ width: '12px', height: '12px', marginRight: '4px' }} />
                Call
              </Button>
              <Button size="sm" variant="outline" onClick={onClose}>
                <X style={{ width: '16px', height: '16px' }} />
              </Button>
            </div>
          </div>
          {context && (
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
              {context.type === 'driver' ? 'Driver' : 'Customer'} Support • {context.name}
            </p>
          )}
        </div>

        {/* Messages */}
        <div style={{
          flex: 1,
          overflow: 'hidden',
          backgroundColor: '#f9fafb'
        }}>
          <div style={{
            height: '100%',
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {messages.map((message) => (
              <div
                key={message.id}
                style={{
                  display: 'flex',
                  justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div
                  style={{
                    maxWidth: '80%',
                    padding: '12px',
                    borderRadius: '8px',
                    backgroundColor: message.sender === 'user' ? '#ea580c' : '#f3f4f6',
                    color: message.sender === 'user' ? 'white' : '#374151'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    {message.sender === 'user' ? (
                      <User style={{ width: '12px', height: '12px' }} />
                    ) : message.sender === 'support' ? (
                      <User style={{ width: '12px', height: '12px', color: '#16a34a' }} />
                    ) : (
                      <Bot style={{ width: '12px', height: '12px', color: '#2563eb' }} />
                    )}
                    <span style={{ fontSize: '12px', fontWeight: '500' }}>
                      {message.sender === 'user' ? 'You' : 
                       message.sender === 'support' ? 'Support' : 'AI Assistant'}
                    </span>
                    <span style={{ fontSize: '10px', opacity: 0.7 }}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.4' }}>
                    {message.content}
                  </p>
                  {message.sender === 'ai' && !isEscalated && (
                    <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                      <Button size="sm" variant="outline" onClick={handleEscalate}>
                        <MessageCircle style={{ width: '12px', height: '12px', marginRight: '4px' }} />
                        Talk to Human
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCallSupport}>
                        <Phone style={{ width: '12px', height: '12px', marginRight: '4px' }} />
                        Call Support
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  backgroundColor: '#f3f4f6',
                  borderRadius: '8px',
                  padding: '12px',
                  maxWidth: '80%'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Bot style={{ width: '12px', height: '12px', color: '#2563eb' }} />
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#9ca3af',
                        borderRadius: '50%',
                        animation: 'bounce 1.4s ease-in-out infinite both'
                      }}></div>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#9ca3af',
                        borderRadius: '50%',
                        animation: 'bounce 1.4s ease-in-out infinite both',
                        animationDelay: '0.16s'
                      }}></div>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#9ca3af',
                        borderRadius: '50%',
                        animation: 'bounce 1.4s ease-in-out infinite both',
                        animationDelay: '0.32s'
                      }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div style={{
          padding: '16px',
          borderTop: '1px solid #e5e7eb',
          backgroundColor: 'white',
          borderRadius: '0 0 8px 8px',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={isEscalated ? "Message support..." : "Type your message..."}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              style={{ flex: 1, backgroundColor: 'white' }}
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={!inputMessage.trim()}
              style={{ backgroundColor: '#ea580c', color: 'white' }}
            >
              <Send style={{ width: '16px', height: '16px' }} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}