import OpenAI from "openai";
import { storage } from "./storage";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

interface OpenAIAssistantResponse {
  message: string;
  action?: string;
  data?: any;
  needsConfirmation?: boolean;
}

export class OpenAIAssistant {
  
  static async processRequest(prompt: string): Promise<OpenAIAssistantResponse> {
    try {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error("OpenAI API key not configured");
      }

      const systemPrompt = `You are an intelligent AI assistant for ReturnIt, a reverse delivery service platform. You help manage customers, drivers, orders, and business operations.

CURRENT CAPABILITIES:
- Answer questions about the ReturnIt platform
- Provide business insights and analytics
- Help with customer service inquiries
- Assist with operational decisions
- Generate reports and summaries
- Support troubleshooting

PLATFORM OVERVIEW:
ReturnIt is a professional reverse delivery service that handles returns, exchanges, and donations. The platform connects customers with drivers for pickup and delivery services.

KEY FEATURES:
- Customer booking system
- Driver management dashboard
- Real-time order tracking
- Payment processing (70/30 split)
- Admin operations dashboard
- AI-powered support chat

RESPONSE GUIDELINES:
- Provide helpful, professional responses
- Focus on business value and user experience
- Suggest actionable insights when possible
- Maintain a friendly but professional tone
- Ask clarifying questions when needed

Current request: "${prompt}"

Please provide a helpful response about the ReturnIt platform or assist with the user's question.`;

      const response = await openai.chat.completions.create({
        model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      });

      const assistantMessage = response.choices[0]?.message?.content || "I'm sorry, I couldn't process that request.";

      return {
        message: assistantMessage,
        action: this.detectAction(prompt),
        needsConfirmation: this.needsConfirmation(prompt)
      };

    } catch (error) {
      console.error('OpenAI Assistant error:', error);
      return {
        message: "I'm experiencing some technical difficulties. Please try again later or contact support if the issue persists.",
        action: "error"
      };
    }
  }

  static async getBusinessInsights(): Promise<OpenAIAssistantResponse> {
    try {
      // Get platform metrics
      const users = await storage.getAllUsers();
      const orders = await storage.getAllOrders();
      
      const customerCount = users.filter(u => u.role === 'customer').length;
      const driverCount = users.filter(u => u.role === 'driver').length;
      const completedOrders = orders.filter(o => o.status === 'completed').length;
      const totalRevenue = orders
        .filter(o => o.status === 'completed')
        .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

      const metricsPrompt = `Based on the following ReturnIt platform metrics, provide business insights:

- Total Customers: ${customerCount}
- Total Drivers: ${driverCount}  
- Total Orders: ${orders.length}
- Completed Orders: ${completedOrders}
- Total Revenue: $${totalRevenue.toFixed(2)}
- Completion Rate: ${orders.length > 0 ? ((completedOrders / orders.length) * 100).toFixed(1) : 0}%

Please analyze these metrics and provide:
1. Key performance indicators assessment
2. Growth opportunities 
3. Operational recommendations
4. Market positioning insights`;

      const response = await openai.chat.completions.create({
        model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025
        messages: [
          {
            role: "system", 
            content: "You are a business intelligence AI for ReturnIt delivery platform. Provide actionable insights based on platform data."
          },
          {
            role: "user",
            content: metricsPrompt
          }
        ],
        max_tokens: 800,
        temperature: 0.3
      });

      return {
        message: response.choices[0]?.message?.content || "Unable to generate insights at this time.",
        data: {
          customerCount,
          driverCount,
          totalOrders: orders.length,
          completedOrders,
          totalRevenue,
          completionRate: orders.length > 0 ? ((completedOrders / orders.length) * 100) : 0
        }
      };

    } catch (error) {
      console.error('Business insights error:', error);
      return {
        message: "Unable to generate business insights at this time. Please try again later."
      };
    }
  }

  static async generateCustomerSummary(userId: number): Promise<OpenAIAssistantResponse> {
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return {
          message: "User not found."
        };
      }

      const userOrders = await storage.getUserOrders(userId);
      
      const summaryPrompt = `Generate a customer summary for the following ReturnIt user:

Customer Details:
- Name: ${user.firstName} ${user.lastName}
- Email: ${user.email}
- Role: ${user.role}
- Account Status: ${user.isActive ? 'Active' : 'Inactive'}
- Total Orders: ${userOrders.length}

Order History:
${userOrders.map(order => `
- Order #${order.id}: ${order.status} - $${order.totalPrice || 0}
  Type: ${order.serviceType || 'pickup'} 
  Date: ${order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
`).join('')}

Please provide:
1. Customer profile summary
2. Order pattern analysis  
3. Customer value assessment
4. Engagement recommendations`;

      const response = await openai.chat.completions.create({
        model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025
        messages: [
          {
            role: "system",
            content: "You are a customer relationship AI for ReturnIt. Analyze customer data and provide actionable insights."
          },
          {
            role: "user", 
            content: summaryPrompt
          }
        ],
        max_tokens: 600,
        temperature: 0.4
      });

      return {
        message: response.choices[0]?.message?.content || "Unable to generate customer summary.",
        data: {
          user,
          orderCount: userOrders.length,
          totalSpent: userOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0)
        }
      };

    } catch (error) {
      console.error('Customer summary error:', error);
      return {
        message: "Unable to generate customer summary at this time."
      };
    }
  }

  private static detectAction(prompt: string): string {
    const lowercasePrompt = prompt.toLowerCase();
    
    if (lowercasePrompt.includes('insight') || lowercasePrompt.includes('analytic')) {
      return 'insights';
    }
    if (lowercasePrompt.includes('customer') && (lowercasePrompt.includes('summary') || lowercasePrompt.includes('profile'))) {
      return 'customer-summary';
    }
    if (lowercasePrompt.includes('help') || lowercasePrompt.includes('support')) {
      return 'support';
    }
    
    return 'chat';
  }

  private static needsConfirmation(prompt: string): boolean {
    const confirmationKeywords = ['delete', 'remove', 'cancel', 'refund', 'deactivate'];
    return confirmationKeywords.some(keyword => prompt.toLowerCase().includes(keyword));
  }
}