import React from 'react';
import { 
  ShoppingCart, 
  CreditCard, 
  CheckCircle, 
  Package,
  Truck,
  Home 
} from 'lucide-react';

const PaymentStatus = ({ status, paymentStatus, order }) => {
  const statusSteps = [
    { id: 'created', label: 'Order Created', icon: ShoppingCart },
    { id: 'processing', label: 'Payment Processing', icon: CreditCard },
    { id: 'paid', label: 'Payment Successful', icon: CheckCircle },
    { id: 'confirmed', label: 'Order Confirmed', icon: Package },
    { id: 'shipped', label: 'Shipped', icon: Truck },
    { id: 'delivered', label: 'Delivered', icon: Home }
  ];

  const getStepStatus = (currentStatus, stepIndex) => {
    const statusIndex = statusSteps.findIndex(step => step.id === currentStatus);
    if (stepIndex < statusIndex) return 'completed';
    if (stepIndex === statusIndex) return 'current';
    return 'pending';
  };

  return (
    <div className="payment-timeline bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Order & Payment Status
      </h3>
      <div className="space-y-4">
        {statusSteps.map((step, index) => {
          const stepStatus = getStepStatus(status, index);
          return (
            <div
              key={step.id}
              className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${
                stepStatus === 'completed'
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                  : stepStatus === 'current'
                  ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                  : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
              }`}
            >
              <div
                className={`p-2 rounded-full ${
                  stepStatus === 'completed'
                    ? 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400'
                    : stepStatus === 'current'
                    ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                }`}
              >
                <step.icon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p
                  className={`font-medium text-sm ${
                    stepStatus === 'completed'
                      ? 'text-green-800 dark:text-green-300'
                      : stepStatus === 'current'
                      ? 'text-blue-800 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {step.label}
                </p>
                {stepStatus === 'current' && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    In progress...
                  </p>
                )}
              </div>
              {stepStatus === 'completed' && (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
            </div>
          );
        })}
      </div>
      
      {/* Payment Status Badge */}
      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Payment Status:
          </span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              paymentStatus === 'paid'
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                : paymentStatus === 'failed'
                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
            }`}
          >
            {paymentStatus?.toUpperCase() || 'PENDING'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatus;