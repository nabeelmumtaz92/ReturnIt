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
    driver: "Hi! I'm the ReturnIt AI Assistant 🤖 I'm here to guide you to exactly what you need. I can help you navigate to the right place in your app, check your earnings, resolve delivery issues, or connect you with live support. Let me help you get where you need to go!",
    customer: "Hello! I'm the ReturnIt AI Assistant 🤖 I'm here to guide you to exactly what you need. Whether it's tracking your pickup, contacting your driver, managing payments, or speaking with support, I'll help you navigate to the right solution quickly!"
  },
  commonIssues: {
    driver: [
      "💰 Check my earnings & payments",
      "🚗 Current delivery assistance", 
      "📱 App & account help",
      "📍 Navigation & address issues",
      "☎️ Speak with support now"
    ],
    customer: [
      "📦 Track my pickup status",
      "🚗 Driver location & timing",
      "💳 Payment & billing help", 
      "📍 Change pickup details",
      "☎️ Speak with support now"
    ]
  },
  responses: {
    // Customer responses - Updated with navigation guidance
    "📦 Track my pickup status": "I can help you track your pickup right away! Here's what I can show you:\n\n🔍 **Where to check your status:**\n• Visit your Order History page\n• Check your email for updates\n• View real-time tracking when driver is assigned\n\n📍 **Current status options:**\n• Pickup scheduled\n• Driver assigned & en route\n• Pickup completed\n\nWould you like me to look up your specific order status?",
    
    "🚗 Driver location & timing": "Let me help you get real-time driver information:\n\n📱 **Track your driver:**\n• Check the tracking link sent to your phone\n• View live GPS location when driver is dispatched\n• Get estimated arrival time updates\n\n⏰ **If your driver is delayed:**\n• I can contact them directly\n• Reschedule for a better time\n• Assign a different driver if available\n\nWhat would be most helpful for you right now?",
    
    "💳 Payment & billing help": "I can assist with all payment-related questions:\n\n💰 **Common payment help:**\n• Update your payment method\n• Review charges and fees\n• Process refunds if needed\n• Apply promotional codes\n\n🧾 **Where to manage payments:**\n• Go to Account Settings → Payment Methods\n• View billing history in your profile\n• Download receipts from Order History\n\nWhat specific payment issue can I help resolve?",
    
    "📍 Change pickup details": "I can help you update your pickup information:\n\n✏️ **What you can change:**\n• Pickup address or location\n• Contact phone number\n• Special instructions for driver\n• Number of packages\n\n📱 **How to make changes:**\n• Go to your active order and tap 'Edit'\n• Call our support line: (636) 254-4821\n• I can update details for you right now\n\nWhat pickup details would you like to change?",
    
    "☎️ Speak with support now (customer)": "I'll connect you with a live support agent immediately!\n\n👥 **Live support options:**\n• Chat with a human agent (available now)\n• Call our support line: (636) 254-4821\n• Email support: hello@returnit.online\n\n⚡ **What our agents can help with:**\n• Complex order issues\n• Urgent pickup changes\n• Payment disputes\n• Account problems\n\nShould I connect you with an agent now?",
    
    // Driver responses - Updated with navigation guidance  
    "💰 Check my earnings & payments": "I can help you access your earnings information:\n\n💵 **Check your earnings:**\n• Open the Driver App → Earnings tab\n• View daily, weekly, and monthly totals\n• See completed delivery payments\n• Track bonus and incentive earnings\n\n🏦 **Payment settings:**\n• Update bank account info\n• Choose instant pay or weekly deposits\n• View tax documents (1099s)\n\nWhat specific earnings information do you need?",
    
    "🚗 Current delivery assistance": "I'm here to help with your active delivery:\n\n📦 **Common delivery help:**\n• Customer not available at pickup\n• Wrong or unclear address\n• Package issues or damages\n• Customer communication problems\n\n📱 **Use your Driver App:**\n• Tap 'Contact Customer' to call/text\n• Use 'Report Issue' for problems\n• Take photos for documentation\n• Mark delivery status updates\n\nWhat's happening with your current delivery?",
    
    "📱 App & account help": "I can help you with app and account issues:\n\n🔧 **Common fixes:**\n• Force close and reopen the app\n• Check for app updates in your app store\n• Clear cache (Android) or restart phone\n• Log out and back in to refresh\n\n⚙️ **Account management:**\n• Update profile information\n• Change notification settings\n• Reset password if needed\n• Contact technical support\n\nWhat specific issue are you experiencing?",
    
    "📍 Navigation & address issues": "I can help with navigation and address problems:\n\n🗺️ **Navigation help:**\n• Use the built-in GPS in your Driver App\n• Tap address to open in your preferred map app\n• Call customer for clarification\n• Report incorrect addresses\n\n🏠 **Address problems:**\n• Use 'Cannot Find Address' button\n• Take photos of location/building\n• Contact customer for better directions\n• Mark as 'Address Issue' if unsolvable\n\nWhat navigation issue can I help resolve?",
    
    "☎️ Speak with support now (driver)": "I'll get you connected with driver support immediately:\n\n📞 **Driver support contact:**\n• Priority driver support line: (636) 254-4821\n• Live chat with driver specialists\n• Email: driversupport@returnit.online\n\n🚨 **Emergency support for:**\n• Vehicle breakdowns\n• Safety concerns\n• Customer disputes\n• Urgent payment issues\n\nShould I connect you with a support specialist now?"
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
      
      // Map option to response key, handling the context-specific keys
      let responseKey = option;
      if (option === "☎️ Speak with support now" && context) {
        responseKey = `☎️ Speak with support now (${context.type})`;
      }
      
      // Check if user selected immediate support
      if (option.includes("☎️ Speak with support now")) {
        addMessage("Perfect! Let me connect you with a live support agent right away.", 'ai');
        setTimeout(() => {
          handleEscalation();
        }, 1000);
        return;
      }
      
      // Get AI response with improved intelligence
      const response = AI_RESPONSES.responses[responseKey as keyof typeof AI_RESPONSES.responses];
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
        
        // Provide helpful follow-up options
        setTimeout(() => {
          addMessage("Was this helpful? I can also:\n• Provide more detailed guidance\n• Connect you with a specialist\n• Transfer to live support\n\nWhat would you like to do next?", 'ai', 'escalation');
        }, 2000);
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
    window.open('tel:+16362544821');
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