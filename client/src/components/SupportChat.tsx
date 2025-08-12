import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Send, 
  Bot, 
  User, 
  Phone, 
  MessageCircle, 
  Clock,
  AlertCircle,
  Package,
  MapPin,
  CreditCard
} from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai' | 'support';
  timestamp: Date;
  type?: 'text' | 'options' | 'escalation';
  options?: string[];
}

interface SupportChatProps {
  isOpen: boolean;
  onClose: () => void;
  context?: {
    type: 'driver' | 'customer';
    id: string;
    name: string;
  } | null;
}

const AI_RESPONSES = {
  greeting: {
    driver: "Hi! I'm here to help with your driver account. What seems to be the issue today?",
    customer: "Hello! I'm here to help with your return pickup. What can I assist you with?"
  },
  commonIssues: {
    driver: [
      "Payment/earnings question",
      "Can't access the app", 
      "Problem with a delivery",
      "Customer wasn't available",
      "Vehicle or equipment issue",
      "Account settings",
      "Other issue"
    ],
    customer: [
      "Customer didn't leave package",
      "More packages than stated",
      "Wrong pickup address",
      "Driver hasn't arrived",
      "Payment issue",
      "Cancel pickup",
      "Track my order",
      "Other issue"
    ]
  },
  responses: {
    // Customer responses
    "Customer didn't leave package": "I understand the customer wasn't available. Let me help you with next steps:\n\n1. Did you try calling the customer?\n2. Are you currently at the pickup location?\n3. Is this the correct address: {address}?\n\nI can contact the customer or reschedule the pickup for you.",
    "More packages than stated": "I see there are more packages than expected. This happens sometimes! Here's what we can do:\n\n1. Take a photo of all packages\n2. I'll update the order with additional items\n3. You'll be compensated for the extra packages\n\nShould I add the extra packages to your current order?",
    "Wrong pickup address": "Let me verify the pickup address for you. I'm checking order details now...\n\nThe address on file is: {address}\n\nIs this different from where you are? I can update the address or contact the customer to confirm the correct location.",
    "Driver hasn't arrived": "I apologize for the delay. Let me check on your driver's status immediately.\n\nYour driver is: {driverName}\nEstimated arrival: {time}\n\nWould you like me to:\n1. Contact the driver directly\n2. Send you live tracking updates\n3. Reschedule for a better time",
    "Payment issue": "I can help resolve payment issues right away. What specific problem are you experiencing?\n\n1. Payment method declined\n2. Unexpected charges\n3. Refund question\n4. Promotional code issue\n\nLet me look up your payment details...",
    
    // Driver responses  
    "Payment/earnings question": "I can help with payment questions! What specifically would you like to know?\n\n1. When will I get paid?\n2. Missing payment for a delivery\n3. Payment amount seems wrong\n4. Tax/1099 questions\n5. Update payment method\n\nI can check your earnings and payment schedule.",
    "Can't access the app": "Sorry you're having trouble accessing the app. Let's troubleshoot:\n\n1. Have you tried force-closing and reopening the app?\n2. Is your app updated to the latest version?\n3. Are you getting any specific error messages?\n\nI can also reset your account access if needed.",
    "Problem with a delivery": "I'm here to help with delivery issues. What happened during the delivery?\n\n1. Customer wasn't available\n2. Wrong address/couldn't find location\n3. Package was damaged\n4. Customer refused delivery\n5. Safety concern\n\nPlease tell me more details about what occurred.",
    "Customer wasn't available": "This situation comes up often. Here's what you should do:\n\n1. Call the customer (if you haven't already)\n2. Wait 5 minutes at the location\n3. Take a photo showing you're at the correct address\n4. Mark as 'Customer Not Available'\n\nYou'll still be paid for the attempted delivery. Should I help you process this now?"
  }
};

export default function SupportChat({ isOpen, onClose, context }: SupportChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isEscalated, setIsEscalated] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && context) {
      initializeChat();
    }
  }, [isOpen, context]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeChat = () => {
    if (!context) return;

    const greeting: Message = {
      id: 'greeting',
      content: AI_RESPONSES.greeting[context.type],
      sender: 'ai',
      timestamp: new Date(),
      type: 'text'
    };

    const options: Message = {
      id: 'options',
      content: "Please select what best describes your issue:",
      sender: 'ai',
      timestamp: new Date(),
      type: 'options',
      options: AI_RESPONSES.commonIssues[context.type]
    };

    setMessages([greeting, options]);
  };

  const addMessage = (content: string, sender: 'user' | 'ai' | 'support', type: 'text' | 'options' | 'escalation' = 'text', options?: string[]) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      sender,
      timestamp: new Date(),
      type,
      options
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleOptionClick = (option: string) => {
    // Add user's selection
    addMessage(option, 'user');
    
    // Simulate AI typing
    setIsTyping(true);
    
    setTimeout(() => {
      setIsTyping(false);
      
      // Get AI response
      const response = AI_RESPONSES.responses[option as keyof typeof AI_RESPONSES.responses];
      if (response) {
        let finalResponse = response;
        
        // Replace placeholders with context data
        if (context) {
          finalResponse = finalResponse
            .replace('{address}', '123 Main St, St. Louis, MO')
            .replace('{driverName}', 'John Smith')
            .replace('{time}', '15 minutes');
        }
        
        addMessage(finalResponse, 'ai');
        
        // Add escalation option after AI response
        setTimeout(() => {
          addMessage(
            "Is this helpful? If you need more assistance, I can connect you with a human support agent.",
            'ai',
            'escalation'
          );
        }, 1000);
      } else {
        // Default response for unhandled options
        addMessage(
          "I understand you're experiencing this issue. Let me gather some more information to help you better. Can you describe what happened in more detail?",
          'ai'
        );
        
        setTimeout(() => {
          addMessage(
            "Would you like me to connect you with a human support agent who can provide personalized assistance?",
            'ai',
            'escalation'
          );
        }, 2000);
      }
    }, 1500);
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    
    addMessage(inputMessage, 'user');
    setInputMessage('');
    
    // Simulate AI response
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addMessage(
        "Thank you for providing those details. I'm analyzing your situation and will provide assistance shortly. If you need immediate help, I can connect you with a human agent.",
        'ai',
        'escalation'
      );
    }, 2000);
  };

  const handleEscalation = () => {
    setIsEscalated(true);
    addMessage("Connecting you with a human support agent. Please wait...", 'ai');
    
    setTimeout(() => {
      addMessage(
        `Hi ${context?.name}! This is Sarah from Returnly Support. I see you need help with ${context?.type === 'driver' ? 'your driver account' : 'your return pickup'}. I've reviewed your conversation with our AI assistant. How can I personally help you today?`,
        'support'
      );
    }, 3000);
  };

  const handleCallSupport = () => {
    window.open('tel:+13145550199');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md h-[600px] flex flex-col">
        <CardHeader className="flex-shrink-0 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isEscalated ? (
                <User className="h-5 w-5 text-green-600" />
              ) : (
                <Bot className="h-5 w-5 text-blue-600" />
              )}
              <CardTitle className="text-lg">
                {isEscalated ? 'Human Support' : 'AI Assistant'}
              </CardTitle>
              {isEscalated && (
                <Badge className="bg-green-100 text-green-800 text-xs">Live</Badge>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleCallSupport}
                className="text-blue-600 border-blue-300"
              >
                <Phone className="h-3 w-3 mr-1" />
                Call
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {context && (
            <p className="text-sm text-gray-600">
              {context.type === 'driver' ? 'Driver' : 'Customer'} Support • {context.name}
            </p>
          )}
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-4 space-y-4">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : message.sender === 'support'
                      ? 'bg-green-100 text-green-900 border border-green-300'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    {message.sender === 'ai' && <Bot className="h-3 w-3 text-blue-600" />}
                    {message.sender === 'support' && <User className="h-3 w-3 text-green-600" />}
                    <span className="text-xs opacity-75">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-line">{message.content}</p>
                  
                  {message.type === 'options' && message.options && (
                    <div className="mt-3 space-y-2">
                      {message.options.map((option, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="w-full text-left justify-start text-xs"
                          onClick={() => handleOptionClick(option)}
                        >
                          {option}
                        </Button>
                      ))}
                    </div>
                  )}
                  
                  {message.type === 'escalation' && !isEscalated && (
                    <div className="mt-3 flex space-x-2">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white text-xs"
                        onClick={handleEscalation}
                      >
                        <MessageCircle className="h-3 w-3 mr-1" />
                        Talk to Human
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-blue-600 border-blue-300 text-xs"
                        onClick={handleCallSupport}
                      >
                        <Phone className="h-3 w-3 mr-1" />
                        Call Support
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-3 w-3 text-blue-600" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex-shrink-0 flex space-x-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={isEscalated ? "Message support..." : "Type your message..."}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} disabled={!inputMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}