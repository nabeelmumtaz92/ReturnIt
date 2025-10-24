import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import SupportChat from './SupportChat';

interface ContactSupportButtonProps {
  context?: {
    type: 'driver' | 'customer';
    id: string;
    name: string;
  };
  className?: string;
}

export default function ContactSupportButton({ context, className = "" }: ContactSupportButtonProps) {
  const [showSupportChat, setShowSupportChat] = useState(false);

  return (
    <>
      {/* Floating Contact Support Button */}
      <div className={`fixed bottom-6 left-6 z-40 ${className}`}>
        <Button
          onClick={() => setShowSupportChat(true)}
          className="bg-amber-600 hover:bg-amber-700 text-white rounded-full px-6 py-3 shadow-lg flex items-center space-x-2 font-medium"
          size="lg"
          data-testid="button-contact-support"
        >
          <MessageCircle className="h-5 w-5" />
          <span>Contact Support</span>
        </Button>
      </div>

      {/* Support Chat Modal */}
      <SupportChat 
        isOpen={showSupportChat}
        onClose={() => setShowSupportChat(false)}
        context={context || { type: 'customer', id: 'GUEST', name: 'Customer' }}
      />
    </>
  );
}