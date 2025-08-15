import { useMemo } from "react";
import { calculatePasswordStrength } from "@shared/validation";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface PasswordStrengthIndicatorProps {
  password: string;
  showDetails?: boolean;
}

export function PasswordStrengthIndicator({ password, showDetails = true }: PasswordStrengthIndicatorProps) {
  const strength = useMemo(() => calculatePasswordStrength(password), [password]);

  if (!password) return null;

  const getStrengthColor = () => {
    switch (strength.label) {
      case 'Very Weak':
      case 'Weak':
        return 'bg-red-500';
      case 'Fair':
        return 'bg-yellow-500';
      case 'Good':
        return 'bg-blue-500';
      case 'Strong':
      case 'Very Strong':
        return 'bg-green-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getTextColor = () => {
    switch (strength.label) {
      case 'Very Weak':
      case 'Weak':
        return 'text-red-600';
      case 'Fair':
        return 'text-yellow-600';
      case 'Good':
        return 'text-blue-600';
      case 'Strong':
      case 'Very Strong':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const progressWidth = Math.min((strength.score / 8) * 100, 100);

  return (
    <div className="space-y-2 mt-2">
      {/* Strength Bar */}
      <div className="flex items-center space-x-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${getStrengthColor()}`}
            style={{ width: `${progressWidth}%` }}
          />
        </div>
        <span className={`text-xs font-medium ${getTextColor()}`}>
          {strength.label}
        </span>
      </div>

      {/* Detailed Feedback */}
      {showDetails && strength.feedback.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs text-amber-700 font-medium">Password requirements:</p>
          <ul className="space-y-1">
            {[
              "At least 8 characters",
              "One uppercase letter",
              "One lowercase letter", 
              "One number",
              "One special character"
            ].map((requirement, index) => {
              const isMet = !strength.feedback.some(feedback => 
                feedback.toLowerCase().includes(requirement.toLowerCase().split(' ')[1] || requirement.toLowerCase())
              );
              
              return (
                <li key={index} className="flex items-center space-x-2 text-xs">
                  {isMet ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : (
                    <XCircle className="h-3 w-3 text-red-500" />
                  )}
                  <span className={isMet ? "text-green-600" : "text-red-600"}>
                    {requirement}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Security Tips */}
      {strength.score >= 6 && (
        <div className="flex items-start space-x-2 p-2 bg-green-50 rounded-lg">
          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-green-700">
            <p className="font-medium">Strong password!</p>
            <p>Keep your password secure and don't share it with anyone.</p>
          </div>
        </div>
      )}

      {strength.score < 4 && (
        <div className="flex items-start space-x-2 p-2 bg-amber-50 rounded-lg">
          <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-amber-700">
            <p className="font-medium">Consider a stronger password</p>
            <p>Use a mix of letters, numbers, and symbols for better security.</p>
          </div>
        </div>
      )}
    </div>
  );
}