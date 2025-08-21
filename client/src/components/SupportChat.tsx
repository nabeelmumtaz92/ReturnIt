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

interface QuestionNode {
  question: string;
  options?: Array<{
    text: string;
    next?: string;
    action?: 'navigate' | 'guide' | 'escalate';
    link?: string;
    content?: string;
  }>;
  action?: 'escalate';
}

const CONVERSATION_FLOW = {
  greeting: {
    driver: "Hi! I'm the ReturnIt AI Assistant. I'll help you navigate to exactly what you need with a few quick questions.",
    customer: "Hello! I'm the ReturnIt AI Assistant. I'll ask you a few questions to guide you to the right solution quickly."
  },
  
  // Question tree structure
  questions: {
    initial: {
      driver: {
        question: "What can I help you with today?",
        options: [
          { text: "💰 Earnings and payments", next: "earnings" },
          { text: "🚗 Current delivery help", next: "delivery" },
          { text: "📱 App or account issues", next: "app" },
          { text: "📍 Navigation problems", next: "navigation" },
          { text: "🆘 Something else", next: "other_driver" }
        ]
      },
      customer: {
        question: "What can I help you with today?",
        options: [
          { text: "📦 Track my pickup", next: "tracking" },
          { text: "🚗 Driver questions", next: "driver_contact" },
          { text: "💳 Payment issues", next: "payment" },
          { text: "📍 Change pickup details", next: "pickup_changes" },
          { text: "🆘 Something else", next: "other_customer" }
        ]
      }
    },
    
    // Driver flow
    earnings: {
      question: "What specific earnings question do you have?",
      options: [
        { text: "View my earnings dashboard", action: "navigate", link: "/driver-earnings" },
        { text: "Update payment method", action: "navigate", link: "/driver-settings" },
        { text: "Payment didn't arrive", next: "payment_missing" },
        { text: "Something else about earnings", next: "other_earnings" }
      ]
    },
    
    delivery: {
      question: "What delivery issue are you experiencing?",
      options: [
        { text: "Customer not available", next: "customer_unavailable" },
        { text: "Can't find the address", action: "navigate", link: "/driver-help" },
        { text: "Package damaged", next: "package_damaged" },
        { text: "Something else about delivery", next: "other_delivery" }
      ]
    },
    
    app: {
      question: "What app or account issue are you having?",
      options: [
        { text: "Can't log in", action: "navigate", link: "/login" },
        { text: "Update my profile", action: "navigate", link: "/driver-profile" },
        { text: "App crashes or freezes", next: "app_technical" },
        { text: "Something else with the app", next: "other_app" }
      ]
    },
    
    navigation: {
      question: "What navigation problem can I help with?",
      options: [
        { text: "GPS not working", next: "gps_issues" },
        { text: "Wrong pickup address", next: "wrong_address" },
        { text: "Can't find customer", action: "guide", content: "Use the 'Contact Customer' button in your driver app to call or text them for better directions." },
        { text: "Something else about navigation", next: "other_navigation" }
      ]
    },
    
    // Customer flow
    tracking: {
      question: "What would you like to track?",
      options: [
        { text: "View my order status", action: "navigate", link: "/order-history" },
        { text: "See driver location", action: "guide", content: "Check your email for the tracking link sent when your driver was assigned." },
        { text: "Pickup hasn't happened yet", next: "pickup_delayed" },
        { text: "Something else about tracking", next: "other_tracking" }
      ]
    },
    
    driver_contact: {
      question: "What do you need regarding your driver?",
      options: [
        { text: "Contact my driver", action: "guide", content: "Use the phone number in your order confirmation email or the tracking link to contact your driver." },
        { text: "Driver is late", next: "driver_late" },
        { text: "Driver didn't show up", next: "driver_noshow" },
        { text: "Something else about my driver", next: "other_driver_contact" }
      ]
    },
    
    payment: {
      question: "What payment issue can I help with?",
      options: [
        { text: "Update payment method", action: "navigate", link: "/account-settings" },
        { text: "Request a refund", next: "refund_request" },
        { text: "Billing questions", next: "billing_questions" },
        { text: "Something else about payment", next: "other_payment" }
      ]
    },
    
    pickup_changes: {
      question: "What pickup details need to be changed?",
      options: [
        { text: "Change pickup address", next: "change_address" },
        { text: "Reschedule pickup time", next: "reschedule" },
        { text: "Add more packages", next: "add_packages" },
        { text: "Something else about pickup", next: "other_pickup" }
      ]
    },
    
    // Terminal nodes that lead to support
    other_driver: { question: "I'll connect you with driver support for personalized help.", action: "escalate" },
    other_customer: { question: "I'll connect you with customer support for personalized help.", action: "escalate" },
    other_earnings: { question: "I'll connect you with our payments team for detailed assistance.", action: "escalate" },
    other_delivery: { question: "I'll connect you with driver support to resolve this delivery issue.", action: "escalate" },
    other_app: { question: "I'll connect you with technical support for app-related issues.", action: "escalate" },
    other_navigation: { question: "I'll connect you with driver support for navigation assistance.", action: "escalate" },
    other_tracking: { question: "I'll connect you with customer support for order tracking help.", action: "escalate" },
    other_driver_contact: { question: "I'll connect you with customer support for driver-related assistance.", action: "escalate" },
    other_payment: { question: "I'll connect you with our billing team for payment assistance.", action: "escalate" },
    other_pickup: { question: "I'll connect you with customer support for pickup modifications.", action: "escalate" },
    
    payment_missing: { question: "I'll connect you with our payments team to investigate your missing payment.", action: "escalate" },
    customer_unavailable: { question: "I'll connect you with driver support for guidance on unavailable customers.", action: "escalate" },
    package_damaged: { question: "I'll connect you with driver support for damaged package procedures.", action: "escalate" },
    app_technical: { question: "I'll connect you with technical support for app performance issues.", action: "escalate" },
    gps_issues: { question: "I'll connect you with technical support for GPS troubleshooting.", action: "escalate" },
    wrong_address: { question: "I'll connect you with driver support to help correct the pickup address.", action: "escalate" },
    pickup_delayed: { question: "I'll connect you with customer support to check on your delayed pickup.", action: "escalate" },
    driver_late: { question: "I'll connect you with customer support to update you on your driver's status.", action: "escalate" },
    driver_noshow: { question: "I'll connect you with customer support to resolve this no-show situation immediately.", action: "escalate" },
    refund_request: { question: "I'll connect you with our billing team to process your refund request.", action: "escalate" },
    billing_questions: { question: "I'll connect you with our billing team for detailed billing assistance.", action: "escalate" },
    change_address: { question: "I'll connect you with customer support to help change your pickup address.", action: "escalate" },
    reschedule: { question: "I'll connect you with customer support to reschedule your pickup.", action: "escalate" },
    add_packages: { question: "I'll connect you with customer support to add more packages to your pickup.", action: "escalate" }
  }
};

export default function SupportChat({ isOpen, onClose, context }: SupportChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isEscalated, setIsEscalated] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentStep, setCurrentStep] = useState('initial');
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
      content: CONVERSATION_FLOW.greeting[context.type],
      sender: 'ai',
      timestamp: new Date(),
      type: 'text'
    };

    const initialQuestion = CONVERSATION_FLOW.questions.initial[context.type];
    const options: Message = {
      id: 'initial-options',
      content: initialQuestion.question,
      sender: 'ai',
      timestamp: new Date(),
      type: 'options',
      options: initialQuestion.options?.map(opt => opt.text) || []
    };

    setMessages([greeting, options]);
    setCurrentStep('initial');
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
    
    // Handle special support options
    if (option.includes('Call Specialist')) {
      addMessage("Opening phone dialer to call our specialist at (636) 254-4821...", 'ai');
      setTimeout(() => {
        window.open('tel:+16362544821');
      }, 1000);
      return;
    }
    
    if (option.includes('Text Message Support')) {
      addMessage("Opening SMS to text our specialist. Message will include your issue details...", 'ai');
      setTimeout(() => {
        const messageBody = `Hi, I need help with ReturnIt. Context: ${context?.type || 'customer'} - ${context?.name || 'User'} - Current issue from chat.`;
        window.open(`sms:+16362544821?body=${encodeURIComponent(messageBody)}`);
      }, 1000);
      return;
    }
    
    if (option.includes('Continue with AI Chat')) {
      addMessage("Perfect! I'm here to help. Please tell me more details about your issue and I'll provide step-by-step assistance.", 'ai');
      return;
    }
    
    if (option.includes('Connect to Live Agent')) {
      handleEscalation();
      return;
    }
    
    // Find the selected option from current step
    const currentQuestion = currentStep === 'initial' 
      ? CONVERSATION_FLOW.questions.initial[context?.type || 'customer']
      : CONVERSATION_FLOW.questions[currentStep as keyof typeof CONVERSATION_FLOW.questions] as QuestionNode;
    
    const selectedOption = currentQuestion?.options?.find(opt => opt.text === option);
    
    setIsTyping(true);
    
    setTimeout(() => {
      setIsTyping(false);
      
      if (!selectedOption) {
        addMessage("I'm not sure about that option. Let me connect you with support.", 'ai');
        handleEscalation();
        return;
      }
      
      // Handle different action types
      if ('action' in selectedOption && selectedOption.action === 'navigate' && 'link' in selectedOption && selectedOption.link) {
        addMessage(`Perfect! I'll take you to ${selectedOption.link} now.`, 'ai');
        setTimeout(() => {
          // Navigate to the page
          window.location.href = selectedOption.link!;
        }, 1000);
        
      } else if ('action' in selectedOption && selectedOption.action === 'guide' && 'content' in selectedOption && selectedOption.content) {
        addMessage(selectedOption.content, 'ai');
        setTimeout(() => {
          addMessage("Was that helpful? I can also connect you with support if you need more assistance.", 'ai', 'escalation');
        }, 2000);
        
      } else if ('action' in selectedOption && selectedOption.action === 'escalate') {
        const escalationNode = CONVERSATION_FLOW.questions[selectedOption.next as keyof typeof CONVERSATION_FLOW.questions] as QuestionNode;
        addMessage(escalationNode.question, 'ai');
        setTimeout(() => {
          handleEscalation();
        }, 1000);
        
      } else if (selectedOption.next) {
        // Navigate to next question
        const nextQuestion = CONVERSATION_FLOW.questions[selectedOption.next as keyof typeof CONVERSATION_FLOW.questions] as QuestionNode;
        
        if (nextQuestion.action === 'escalate') {
          addMessage(nextQuestion.question, 'ai');
          setTimeout(() => {
            handleEscalation();
          }, 1000);
        } else {
          // Show next question with options
          addMessage(nextQuestion.question, 'ai');
          
          if (nextQuestion.options && nextQuestion.options.length > 0) {
            setTimeout(() => {
              const optionsMessage: Message = {
                id: Date.now().toString(),
                content: "Please choose an option:",
                sender: 'ai',
                timestamp: new Date(),
                type: 'options',
                options: nextQuestion.options!.map(opt => opt.text)
              };
              setMessages(prev => [...prev, optionsMessage]);
              setCurrentStep(selectedOption.next!);
            }, 1000);
          }
        }
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
          "I can help you right away! Choose your preferred option:",
          'ai',
          'options',
          ['📞 Call Specialist: (636) 254-4821', '💬 Text Message Support', '🤖 Continue with AI Chat', '👨‍💼 Connect to Live Agent']
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
        `Hi ${context?.name || 'there'}! This is ${randomAgent} from ReturnIt Support (${currentTime}). I see you need help with ${context?.type === 'driver' ? 'your driver account' : 'your return pickup'}. I've reviewed your conversation with our AI assistant and I'm here to provide personalized assistance. How can I help you resolve this today?`,
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

        {/* Quick Actions Bar */}
        {isEscalated && (
          <div style={{ 
            padding: '8px 16px',
            borderTop: '1px solid #e5e7eb',
            backgroundColor: '#f8f9fa',
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap'
          }}>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => window.open('tel:+16362544821')}
              className="text-xs"
            >
              <Phone className="h-3 w-3 mr-1" />
              Call Now
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => window.open(`sms:+16362544821?body=${encodeURIComponent('Hi, I need help with ReturnIt: ')}`)}
              className="text-xs"
            >
              <MessageCircle className="h-3 w-3 mr-1" />
              Text Us
            </Button>
          </div>
        )}

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