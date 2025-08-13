import { useAuth } from "@/hooks/useAuth-simple";
import { Screen } from '@/components/screen';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, Send, Phone, MapPin, Image, Clock, User, Truck } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Footer from '@/components/Footer';
import { useState } from 'react';

export default function ChatCenter() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeConversation, setActiveConversation] = useState<number | null>(null);
  const [message, setMessage] = useState('');

  const { data: conversations } = useQuery({
    queryKey: ['/api/chat/conversations'],
    enabled: isAuthenticated,
  });

  const { data: messages } = useQuery({
    queryKey: ['/api/chat/messages', activeConversation],
    enabled: isAuthenticated && activeConversation !== null,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ conversationId, content }: { conversationId: number; content: string }) => {
      return await apiRequest('/api/chat/send', 'POST', {
        conversationId,
        content,
        messageType: 'text'
      });
    },
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['/api/chat/messages', activeConversation] });
      queryClient.invalidateQueries({ queryKey: ['/api/chat/conversations'] });
    },
  });

  if (!isAuthenticated) {
    return (
      <Screen className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <MessageCircle className="h-16 w-16 text-amber-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-amber-900 mb-4">Communication Center</h1>
          <p className="text-amber-700 mb-4">Sign in to access your messages</p>
          <Button className="bg-amber-800 hover:bg-amber-900">Sign In</Button>
        </div>
      </Screen>
    );
  }

  const mockConversations = [
    {
      id: 1,
      type: 'customer_driver',
      otherUser: 'Mike Chen (Driver)',
      orderId: 'R12345',
      lastMessage: 'I\'m about 10 minutes away from your location',
      lastMessageTime: '2 min ago',
      status: 'active',
      unreadCount: 1
    },
    {
      id: 2,
      type: 'customer_support',
      otherUser: 'Support Team',
      orderId: null,
      lastMessage: 'Thank you for contacting us. How can we help?',
      lastMessageTime: '1 hour ago',
      status: 'active',
      unreadCount: 0
    },
    {
      id: 3,
      type: 'customer_driver',
      otherUser: 'Sarah Wilson (Driver)',
      orderId: 'R12340',
      lastMessage: 'Package delivered successfully! Thank you.',
      lastMessageTime: '2 days ago',
      status: 'closed',
      unreadCount: 0
    },
  ];

  const mockMessages = activeConversation === 1 ? [
    {
      id: 1,
      senderId: 2,
      content: 'Hi! I\'m Mike, your driver for order R12345. I\'ll be picking up your package shortly.',
      timestamp: '2024-01-13T14:30:00Z',
      messageType: 'text',
      isRead: true
    },
    {
      id: 2,
      senderId: user?.id,
      content: 'Great! How long until you arrive?',
      timestamp: '2024-01-13T14:32:00Z',
      messageType: 'text',
      isRead: true
    },
    {
      id: 3,
      senderId: 2,
      content: 'I\'m about 10 minutes away from your location',
      timestamp: '2024-01-13T14:45:00Z',
      messageType: 'text',
      isRead: false
    },
  ] : [];

  const handleSendMessage = () => {
    if (message.trim() && activeConversation) {
      sendMessageMutation.mutate({
        conversationId: activeConversation,
        content: message.trim()
      });
    }
  };

  return (
    <Screen>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 text-center">
            <MessageCircle className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-blue-900 mb-2">Communication Center</h1>
            <p className="text-blue-700 text-lg">Stay connected with drivers and support</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
            {/* Conversations List */}
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900">Your Conversations</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2 p-4">
                    {mockConversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          activeConversation === conversation.id
                            ? 'bg-blue-100 border-2 border-blue-300'
                            : 'bg-white hover:bg-blue-50 border border-blue-100'
                        }`}
                        onClick={() => setActiveConversation(conversation.id)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {conversation.type === 'customer_driver' ? (
                              <Truck className="h-4 w-4 text-blue-600" />
                            ) : (
                              <User className="h-4 w-4 text-purple-600" />
                            )}
                            <span className="font-semibold text-sm text-blue-900">
                              {conversation.otherUser}
                            </span>
                          </div>
                          {conversation.unreadCount > 0 && (
                            <Badge className="bg-red-500 text-white text-xs">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                        
                        {conversation.orderId && (
                          <p className="text-xs text-blue-600 mb-1">Order: {conversation.orderId}</p>
                        )}
                        
                        <p className="text-sm text-gray-700 truncate mb-1">
                          {conversation.lastMessage}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">{conversation.lastMessageTime}</span>
                          <Badge 
                            variant="outline"
                            className={`text-xs ${
                              conversation.status === 'active' 
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : 'bg-gray-50 text-gray-700 border-gray-200'
                            }`}
                          >
                            {conversation.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Chat Messages */}
            <Card className="lg:col-span-2 border-blue-200">
              {activeConversation ? (
                <>
                  <CardHeader className="border-b border-blue-100">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-blue-900">
                        {mockConversations.find(c => c.id === activeConversation)?.otherUser}
                      </CardTitle>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="border-blue-300">
                          <Phone className="h-4 w-4 mr-2" />
                          Call
                        </Button>
                        <Button size="sm" variant="outline" className="border-blue-300">
                          <MapPin className="h-4 w-4 mr-2" />
                          Location
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-0 flex flex-col">
                    <ScrollArea className="flex-1 p-4 h-[400px]">
                      <div className="space-y-4">
                        {mockMessages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${
                              msg.senderId === user?.id ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                msg.senderId === user?.id
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white border border-blue-200 text-blue-900'
                              }`}
                            >
                              <p className="text-sm">{msg.content}</p>
                              <div className="flex items-center justify-between mt-1">
                                <span className={`text-xs ${
                                  msg.senderId === user?.id ? 'text-blue-100' : 'text-blue-500'
                                }`}>
                                  {new Date(msg.timestamp).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                                {msg.senderId === user?.id && (
                                  <span className="text-xs text-blue-100">
                                    {msg.isRead ? '✓✓' : '✓'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>

                    {/* Message Input */}
                    <div className="border-t border-blue-100 p-4">
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="border-blue-300">
                          <Image className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="border-blue-300">
                          <MapPin className="h-4 w-4" />
                        </Button>
                        <Input
                          placeholder="Type your message..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          className="flex-1 border-blue-300 focus:border-blue-500"
                        />
                        <Button
                          onClick={handleSendMessage}
                          disabled={!message.trim() || sendMessageMutation.isPending}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between mt-2 text-xs text-blue-600">
                        <span>Press Enter to send, Shift+Enter for new line</span>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>Driver typically responds within 2 minutes</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </>
              ) : (
                <CardContent className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MessageCircle className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-blue-900 mb-2">Select a Conversation</h3>
                    <p className="text-blue-700">Choose a conversation from the left to start chatting</p>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader>
                <CardTitle className="text-amber-900">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button className="bg-amber-700 hover:bg-amber-800 h-20 flex-col">
                    <User className="h-6 w-6 mb-2" />
                    <span>Contact Support</span>
                  </Button>
                  
                  <Button variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50 h-20 flex-col">
                    <Phone className="h-6 w-6 mb-2" />
                    <span>Emergency Hotline</span>
                  </Button>
                  
                  <Button variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50 h-20 flex-col">
                    <MapPin className="h-6 w-6 mb-2" />
                    <span>Share Location</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </Screen>
  );
}