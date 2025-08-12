import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  X, 
  Send, 
  Phone, 
  Clock,
  User,
  MessageCircle,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface AdminSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  context?: {
    type: 'driver' | 'customer';
    id: string;
    name: string;
  } | null;
}

interface ChatMessage {
  id: string;
  content: string;
  sender: 'admin' | 'user';
  timestamp: Date;
  status?: 'sent' | 'delivered' | 'read';
}

export default function AdminSupportModal({ isOpen, onClose, context }: AdminSupportModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: "Hi! I need help with my delivery. The customer wasn't available when I arrived.",
      sender: 'user',
      timestamp: new Date(Date.now() - 300000), // 5 minutes ago
      status: 'read'
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [ticketStatus, setTicketStatus] = useState<'open' | 'in_progress' | 'resolved'>('open');

  if (!isOpen || !context) return null;

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      content: newMessage,
      sender: 'admin',
      timestamp: new Date(),
      status: 'sent'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const handleStatusChange = (status: 'open' | 'in_progress' | 'resolved') => {
    setTicketStatus(status);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl h-[700px] flex flex-col">
        <CardHeader className="flex-shrink-0 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-amber-600" />
              <div>
                <CardTitle className="text-lg">Support Chat</CardTitle>
                <p className="text-sm text-gray-600">
                  {context.type === 'driver' ? 'Driver' : 'Customer'}: {context.name} • ID: {context.id}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(ticketStatus)}>
                {ticketStatus.replace('_', ' ').toUpperCase()}
              </Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(`tel:${context.type === 'driver' ? '+13145550101' : '+13145550102'}`)}
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
          
          {/* Ticket Actions */}
          <div className="flex space-x-2 mt-3">
            <Button
              size="sm"
              variant={ticketStatus === 'open' ? 'default' : 'outline'}
              onClick={() => handleStatusChange('open')}
              className={ticketStatus === 'open' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              <AlertTriangle className="h-3 w-3 mr-1" />
              Open
            </Button>
            <Button
              size="sm"
              variant={ticketStatus === 'in_progress' ? 'default' : 'outline'}
              onClick={() => handleStatusChange('in_progress')}
              className={ticketStatus === 'in_progress' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
            >
              <Clock className="h-3 w-3 mr-1" />
              In Progress
            </Button>
            <Button
              size="sm"
              variant={ticketStatus === 'resolved' ? 'default' : 'outline'}
              onClick={() => handleStatusChange('resolved')}
              className={ticketStatus === 'resolved' ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Resolved
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-4">
          {/* Context Information */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
            <h4 className="font-semibold text-amber-900 text-sm mb-2">Quick Info</h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-amber-800">
              <div>Type: {context.type === 'driver' ? 'Driver Support' : 'Customer Support'}</div>
              <div>Status: Active</div>
              <div>Location: St. Louis, MO</div>
              <div>Last Active: 2 mins ago</div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-3 mb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === 'admin'
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs opacity-75">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {message.sender === 'admin' && (
                      <span className="text-xs opacity-75">
                        {message.status === 'sent' && '✓'}
                        {message.status === 'delivered' && '✓✓'}
                        {message.status === 'read' && '✓✓ Read'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mb-4">
            <p className="text-xs text-gray-600 mb-2">Quick Responses:</p>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setNewMessage("Thanks for contacting us. I'm looking into your issue now.")}
                className="text-xs"
              >
                Acknowledge
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setNewMessage("Can you provide more details about what happened?")}
                className="text-xs"
              >
                Request Details
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setNewMessage("I've processed a refund for you. You should see it in 3-5 business days.")}
                className="text-xs"
              >
                Refund Processed
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setNewMessage("Your issue has been resolved. Is there anything else I can help you with?")}
                className="text-xs"
              >
                Issue Resolved
              </Button>
            </div>
          </div>

          {/* Message Input */}
          <div className="flex space-x-2">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your response..."
              className="flex-1 min-h-[60px] max-h-[120px]"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={!newMessage.trim()}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}