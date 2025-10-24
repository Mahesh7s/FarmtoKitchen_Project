import React from 'react';
import { Download, Printer, Mail } from 'lucide-react';

const PaymentReceipt = ({ order, payment, onPrint, onDownload }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const generateReceiptText = () => {
    return `
PAYMENT RECEIPT
=======================
Order #: ${order.orderNumber}
Date: ${formatDate(order.createdAt)}
Transaction ID: ${payment.transactionId}
Payment Method: ${payment.method?.toUpperCase()}
Status: ${payment.status?.toUpperCase()}

ITEMS:
${order.items?.map(item => 
  `${item.product?.name} - ${item.quantity} x $${item.price} = $${(item.quantity * item.price).toFixed(2)}`
).join('\n')}

SUBTOTAL: $${order.totalAmount?.toFixed(2)}
TAX: $${(order.totalAmount * 0.1).toFixed(2)}
TOTAL: $${(order.totalAmount * 1.1).toFixed(2)}

Thank you for your purchase!
=======================
    `.trim();
  };

  const handlePrint = () => {
    const receiptContent = generateReceiptText();
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - Order ${order.orderNumber}</title>
          <style>
            body { font-family: monospace; margin: 20px; line-height: 1.4; }
            .receipt { max-width: 400px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 20px; }
            .divider { border-top: 1px dashed #000; margin: 10px 0; }
            .text-right { text-align: right; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <h2>PAYMENT RECEIPT</h2>
              <p>Order #: ${order.orderNumber}</p>
              <p>Date: ${formatDate(order.createdAt)}</p>
            </div>
            <div class="divider"></div>
            <pre>${receiptContent}</pre>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleDownload = () => {
    const receiptContent = generateReceiptText();
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${order.orderNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="payment-receipt bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Payment Receipt
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Printer className="h-4 w-4" />
            <span>Print</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center space-x-2 px-3 py-2 text-sm bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Download</span>
          </button>
        </div>
      </div>

      <div className="space-y-3 text-sm">
        <div className="grid grid-cols-2 gap-4 py-2 border-b border-gray-200 dark:border-gray-700">
          <span className="font-medium text-gray-600 dark:text-gray-400">Order Number:</span>
          <span className="text-gray-900 dark:text-white">{order.orderNumber}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-4 py-2 border-b border-gray-200 dark:border-gray-700">
          <span className="font-medium text-gray-600 dark:text-gray-400">Date:</span>
          <span className="text-gray-900 dark:text-white">{formatDate(order.createdAt)}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-4 py-2 border-b border-gray-200 dark:border-gray-700">
          <span className="font-medium text-gray-600 dark:text-gray-400">Payment Method:</span>
          <span className="text-gray-900 dark:text-white capitalize">{payment.method}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-4 py-2 border-b border-gray-200 dark:border-gray-700">
          <span className="font-medium text-gray-600 dark:text-gray-400">Transaction ID:</span>
          <span className="text-gray-900 dark:text-white font-mono">{payment.transactionId}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-4 py-2 border-b border-gray-200 dark:border-gray-700">
          <span className="font-medium text-gray-600 dark:text-gray-400">Status:</span>
          <span className={`font-medium ${
            payment.status === 'paid' 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-yellow-600 dark:text-yellow-400'
          }`}>
            {payment.status?.toUpperCase()}
          </span>
        </div>

        {/* Order Items */}
        <div className="mt-4">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Order Items:</h4>
          {order.items?.map((item, index) => (
            <div key={index} className="flex justify-between py-1 text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {item.quantity} × {item.product?.name}
              </span>
              <span className="text-gray-900 dark:text-white">
                ${(item.quantity * item.price).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
          <div className="flex justify-between py-1">
            <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
            <span className="text-gray-900 dark:text-white">${order.totalAmount?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-gray-600 dark:text-gray-400">Tax (10%):</span>
            <span className="text-gray-900 dark:text-white">${(order.totalAmount * 0.1).toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-1 font-semibold border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
            <span className="text-gray-900 dark:text-white">Total:</span>
            <span className="text-primary-600 dark:text-primary-400">
              ${(order.totalAmount * 1.1).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentReceipt;