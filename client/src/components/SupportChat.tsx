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
    driver: "Hi! I'm the Returnly AI Assistant, and I'm here to help with your driver account and any delivery issues. I can assist with payments, app problems, delivery logistics, and more. What can I help you with today?",
    customer: "Hello! I'm the Returnly AI Assistant, ready to help with your return pickup and any questions you have. I can track your order, resolve delivery issues, handle payments, and connect you with live support when needed. How can I assist you?"
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
    "Wrong pickup address": "Let me verify the pickup address for you. I'm checking order details now...\n\nI can see the address on file. Is this different from where you're currently located? I can:\n\n1. Update the address immediately\n2. Contact the customer to confirm the correct location\n3. Provide turn-by-turn directions to the correct address\n\nWhat would be most helpful right now?",
    "Driver hasn't arrived": "I apologize for the delay. Let me check on your driver's status immediately.\n\nI can see your driver's current location and estimated arrival time. Here's what I can do right now:\n\n1. Contact the driver directly to get an update\n2. Send you live tracking updates via text\n3. Reschedule your pickup for a more convenient time\n4. Assign a different driver if available\n\nWhich option would work best for you?",
    "Payment issue": "I can help resolve payment issues right away. What specific problem are you experiencing?\n\n1. Payment method declined\n2. Unexpected charges\n3. Refund question\n4. Promotional code issue\n\nLet me look up your payment details...",
    
    // Driver responses  
    "Payment/earnings question": "I can help with payment questions! What specifically would you like to know?\n\n1. When will I get paid?\n2. Missing payment for a delivery\n3. Payment amount seems wrong\n4. Tax/1099 questions\n5. Update payment method\n\nI can check your earnings and payment schedule.",
    "Can't access the app": "I can help you get back into the app quickly. Let's troubleshoot this step by step:\n\n1. Try force-closing and reopening the app\n2. Check if your app is updated to the latest version\n3. Clear the app cache if you're on Android\n4. Restart your phone if the issue persists\n\nIf none of these work, I can reset your account access or send you a direct login link. What error message are you seeing, if any?",
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
      
      // Get AI response with improved intelligence
      const response = AI_RESPONSES.responses[option as keyof typeof AI_RESPONSES.responses];
      if (response) {
        let finalResponse = response;
        
        // Replace placeholders with realistic context data
        if (context) {
          const currentTime = new Date();
          const estimatedArrival = new Date(currentTime.getTime() + 15 * 60000);
          
          finalResponse = finalResponse
            .replace('{address}', 'the pickup address on file')
            .replace('{driverName}', context.type === 'driver' ? context.name : 'your assigned driver')
            .replace('{time}', `${estimatedArrival.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`);
        }
        
        addMessage(finalResponse, 'ai');
        
        // Provide more specific follow-up based on the issue
        setTimeout(() => {
          let followUpMessage = "Is this helpful? If you need more assistance, I can connect you with a human support agent.";
          
          if (option.includes("Payment") || option.includes("earnings")) {
            followUpMessage = "I can also check your specific payment details if you'd like. Would you like me to connect you with our payments specialist?";
          } else if (option.includes("Driver hasn't arrived") || option.includes("Customer wasn't available")) {
            followUpMessage = "I can send you real-time updates or contact the other party directly. Would you like me to do that, or connect you with live support?";
          } else if (option.includes("app") || option.includes("access")) {
            followUpMessage = "I can help reset your account or walk you through troubleshooting steps. Would you like to try that, or speak with our technical support team?";
          }
          
          addMessage(followUpMessage, 'ai', 'escalation');
        }, 1000);
      } else {
        // More intelligent default response
        addMessage(
          `I understand you're dealing with "${option}". This is a common issue that our team handles regularly. Let me help you with the best solution.`,
          'ai'
        );
        
        setTimeout(() => {
          let specificHelp = "Based on your issue, here are the immediate steps I recommend:\n\n";
          
          if (option.toLowerCase().includes("payment") || option.toLowerCase().includes("money")) {
            specificHelp += "1. I'll check your payment status\n2. Review any recent transactions\n3. Escalate to our payments team if needed\n\nWould you like me to start by checking your account?";
          } else if (option.toLowerCase().includes("delivery") || option.toLowerCase().includes("pickup")) {
            specificHelp += "1. Verify the current order status\n2. Check driver/customer location\n3. Contact the other party if necessary\n\nShould I look up your current delivery details?";
          } else {
            specificHelp += "1. Document your specific situation\n2. Provide immediate guidance\n3. Connect you with the right specialist\n\nCan you provide a few more details about what happened?";
          }
          
          addMessage(specificHelp, 'ai', 'escalation');
        }, 2000);
      }
    }, 1200);
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    
    const userInput = inputMessage.toLowerCase();
    addMessage(inputMessage, 'user');
    setInputMessage('');
    
    // Simulate AI response with improved intelligence
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      
      let aiResponse = "";
      
      // Intelligent keyword-based responses
      if (userInput.includes("payment") || userInput.includes("money") || userInput.includes("pay") || userInput.includes("earning")) {
        aiResponse = "I understand you have a payment-related question. Let me help you with that right away. I can check your payment status, review recent transactions, or help with payment method updates. ";
        if (context?.type === 'driver') {
          aiResponse += "As a driver, I can see your earnings are typically processed within 24-48 hours. Would you like me to check your specific payment details?";
        } else {
          aiResponse += "For customers, I can review your order charges and refund status. Would you like me to look up your recent transactions?";
        }
      } else if (userInput.includes("driver") && userInput.includes("late") || userInput.includes("where") || userInput.includes("arrived")) {
        aiResponse = "I can help track your driver's location and estimated arrival time. Let me check the current status of your pickup and provide you with real-time updates. If there's a significant delay, I can contact the driver directly or reschedule your pickup.";
      } else if (userInput.includes("cancel") || userInput.includes("refund")) {
        aiResponse = "I can help you with cancellation and refund requests. Depending on the timing and status of your order, you may be eligible for a full refund. Let me check your order status and processing options.";
      } else if (userInput.includes("package") || userInput.includes("item") || userInput.includes("pickup")) {
        aiResponse = "I can assist with package and pickup-related issues. Whether it's about package condition, additional items, or pickup logistics, I'm here to help resolve it quickly.";
      } else if (userInput.includes("app") || userInput.includes("login") || userInput.includes("access") || userInput.includes("password")) {
        aiResponse = "I can help you troubleshoot app access issues. This might involve updating the app, resetting your password, or checking your account status. Let me walk you through the solution.";
      } else if (userInput.includes("address") || userInput.includes("location") || userInput.includes("wrong")) {
        aiResponse = "Address and location issues are common, and I can help correct them quickly. I can update the pickup address, verify the correct location, or contact the other party to confirm details.";
      } else {
        // General intelligent response
        aiResponse = `Thank you for reaching out about "${inputMessage}". I understand this is important to you, and I'm here to provide the best assistance possible. Based on what you've shared, I can help resolve this issue step by step.`;
      }
      
      addMessage(aiResponse, 'ai');
      
      // Offer specific next steps
      setTimeout(() => {
        addMessage(
          "Would you like me to:\n\n1. Provide immediate assistance with this issue\n2. Connect you with a specialist for personalized help\n3. Call our support team directly\n\nI'm here to make sure we solve this for you today.",
          'ai',
          'escalation'
        );
      }, 1500);
    }, 1800);
  };

  const handleEscalation = () => {
    setIsEscalated(true);
    addMessage("Connecting you with a human support agent. Please wait...", 'ai');
    
    setTimeout(() => {
      const supportAgents = ['Sarah', 'Mike', 'Jessica', 'David', 'Emily'];
      const randomAgent = supportAgents[Math.floor(Math.random() * supportAgents.length)];
      const currentTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      
      addMessage(
        `Hi ${context?.name || 'there'}! This is ${randomAgent} from Returnly Support (${currentTime}). I see you need help with ${context?.type === 'driver' ? 'your driver account' : 'your return pickup'}. I've reviewed your conversation with our AI assistant and I'm here to provide personalized assistance. How can I help you resolve this today?`,
        'support'
      );
      
      // Add helpful context message
      setTimeout(() => {
        addMessage(
          `I have access to your account details and can take immediate action to resolve your issue. I'm available right now and dedicated to getting this sorted out for you.`,
          'support'
        );
      }, 2000);
    }, 3000);
  };

  const handleCallSupport = () => {
    window.open('tel:+13145550199');
  };

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
    >
      <div 
        style={{ 
          width: '100%',
          maxWidth: '900px',
          height: '500px',
          backgroundColor: 'white',
          borderRadius: '12px',
          border: '2px solid #ea580c',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{ 
          flexShrink: 0,
          padding: '16px',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: 'white'
        }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isEscalated ? (
                <User className="h-5 w-5 text-green-600" />
              ) : (
                <Bot className="h-5 w-5 text-blue-600" />
              )}
              <h3 className="text-lg font-semibold">
                {isEscalated ? 'Human Support' : 'AI Assistant'}
              </h3>
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
            <p className="text-sm text-gray-600 mt-1">
              {context.type === 'driver' ? 'Driver' : 'Customer'} Support • {context.name}
            </p>
          )}
        </div>

        {/* Messages Area */}
        <div style={{ 
          flex: 1,
          padding: '16px',
          backgroundColor: '#f9fafb',
          overflow: 'hidden'
        }}>
          <div style={{ 
            height: '100%',
            overflowY: 'auto',
            paddingRight: '8px'
          }} className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg p-3 ${
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
                  <p className="text-sm whitespace-pre-line break-words overflow-hidden">{message.content}</p>
                  
                  {message.type === 'options' && message.options && (
                    <div className="mt-3 space-y-1.5 max-w-full">
                      {message.options.map((option, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="w-full text-left justify-start text-xs h-auto py-2 px-3 whitespace-normal break-words"
                          onClick={() => handleOptionClick(option)}
                        >
                          {option}
                        </Button>
                      ))}
                    </div>
                  )}
                  
                  {message.type === 'escalation' && !isEscalated && (
                    <div className="mt-3 flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white text-xs flex-1"
                        onClick={handleEscalation}
                      >
                        <MessageCircle className="h-3 w-3 mr-1" />
                        Talk to Human
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-blue-600 border-blue-300 text-xs flex-1"
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
        </div>

        {/* Input Area */}
        <div style={{ 
          flexShrink: 0,
          padding: '16px',
          borderTop: '1px solid #e5e7eb',
          backgroundColor: 'white'
        }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={isEscalated ? "Message support..." : "Type your message..."}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 bg-white"
              style={{ backgroundColor: 'white' }}
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={!inputMessage.trim()}
              className="bg-orange-500 hover:bg-orange-600"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}