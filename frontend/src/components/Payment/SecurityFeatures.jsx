import React from 'react';
import { Shield, Lock, CreditCard, CheckCircle } from 'lucide-react';

const SecurityFeatures = () => {
  const features = [
    {
      icon: Shield,
      title: 'SSL Encrypted',
      description: '256-bit SSL encryption for secure transactions'
    },
    {
      icon: Lock,
      title: 'PCI Compliant',
      description: 'Meets Payment Card Industry Data Security Standards'
    },
    {
      icon: CreditCard,
      title: '3D Secure',
      description: 'Additional security layer for card payments'
    },
    {
      icon: CheckCircle,
      title: 'Money Back Guarantee',
      description: '30-day refund policy on all purchases'
    }
  ];

  return (
    <div className="security-features bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
        <Shield className="h-4 w-4 text-green-500 mr-2" />
        Secure Payment
      </h4>
      <div className="grid grid-cols-2 gap-3">
        {features.map((feature, index) => (
          <div key={index} className="flex items-start space-x-2">
            <div className="p-1 bg-green-100 dark:bg-green-900/30 rounded-full mt-0.5">
              <feature.icon className="h-3 w-3 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-900 dark:text-white">
                {feature.title}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SecurityFeatures;