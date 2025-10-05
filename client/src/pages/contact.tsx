import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Mail, MapPin, Phone, Send } from 'lucide-react';
import { Link } from 'wouter';

const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  subject: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

export default function Contact() {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      const response = await apiRequest('/api/contact', 'POST', data);
      return response;
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: 'Message sent!',
        description: 'Thank you for contacting us. We\'ll get back to you soon.',
      });
      form.reset();
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: ContactFormData) => {
    sendMessageMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-[#f8f7f5] dark:bg-[#231b0f]">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <h1 className="text-2xl font-bold text-foreground hover:text-muted-foreground transition-colors cursor-pointer">
                Return It
              </h1>
            </Link>
            <nav className="flex items-center gap-6">
              <Link href="/">
                <span className="text-foreground hover:text-primary cursor-pointer">Home</span>
              </Link>
              <Link href="/about">
                <span className="text-foreground hover:text-primary cursor-pointer">About</span>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Get in Touch
            </h1>
            <p className="text-lg text-muted-foreground">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Contact Info Cards */}
            <div className="space-y-6">
              <Card className="bg-white/90 backdrop-blur-sm border-border">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-accent p-3 rounded-lg">
                      <Mail className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Email</h3>
                      <p className="text-sm text-muted-foreground">support@returnit.online</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm border-border">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-accent p-3 rounded-lg">
                      <Phone className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Phone</h3>
                      <p className="text-sm text-muted-foreground">(636) 254-4821</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm border-border">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-accent p-3 rounded-lg">
                      <MapPin className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Location</h3>
                      <p className="text-sm text-muted-foreground">
                        St. Louis, MO<br />
                        Serving the Greater Metro Area
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="md:col-span-2">
              <Card className="bg-white/90 backdrop-blur-sm border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Send us a message</CardTitle>
                  <CardDescription>
                    Fill out the form below and we'll get back to you within 24 hours.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isSubmitted ? (
                    <div className="text-center py-8">
                      <div className="bg-green-100 text-green-800 rounded-lg p-6 mb-4">
                        <h3 className="text-xl font-semibold mb-2">Thank you!</h3>
                        <p>Your message has been sent successfully. We'll be in touch soon.</p>
                      </div>
                      <Button
                        onClick={() => setIsSubmitted(false)}
                        variant="outline"
                        className="border-border text-foreground hover:bg-[#f8f7f5] dark:bg-[#231b0f]"
                        data-testid="button-send-another"
                      >
                        Send another message
                      </Button>
                    </div>
                  ) : (
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-foreground">Name *</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Your name"
                                  className="border-border focus:border-border"
                                  data-testid="input-name"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-foreground">Email *</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="email"
                                  placeholder="your.email@example.com"
                                  className="border-border focus:border-border"
                                  data-testid="input-email"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="subject"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-foreground">Subject</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="What is this about?"
                                  className="border-border focus:border-border"
                                  data-testid="input-subject"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-foreground">Message *</FormLabel>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  placeholder="Tell us what's on your mind..."
                                  className="border-border focus:border-border min-h-[150px]"
                                  data-testid="textarea-message"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button
                          type="submit"
                          className="w-full bg-primary hover:bg-primary/90 text-white"
                          disabled={sendMessageMutation.isPending}
                          data-testid="button-submit-contact"
                        >
                          {sendMessageMutation.isPending ? (
                            'Sending...'
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              Send Message
                            </>
                          )}
                        </Button>
                      </form>
                    </Form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
