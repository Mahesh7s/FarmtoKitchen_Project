import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useToast } from '../hooks/useToast';
import { contactAPI } from '../services/api';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Clock,
  MessageCircle,
  User,
  CheckCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const Contact = () => {
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const { showSuccess, showError } = useToast();
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      console.log('📨 Sending contact form:', data);
      const response = await contactAPI.sendMessage(data);
      console.log('✅ Contact form submitted successfully:', response.data);
      showSuccess("Message sent successfully! We'll get back to you soon.");
      reset();
    } catch (error) {
      console.error('❌ Contact form error:', error);
      showError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleFaq = (index) => {
    setOpenFaq((prev) => (prev === index ? null : index));
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      details: 'hello@farmtokitchen.com',
      description: 'Send us an email anytime',
    },
    {
      icon: Phone,
      title: 'Call Us',
      details: '+1 (555) 123-4567',
      description: 'Mon to Fri 9am to 6pm',
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      details: '123 Farm Street, Agriculture City, Anantapur, Andhra Pradesh 515001',
      description: 'Visit our headquarters',
    },
    {
      icon: Clock,
      title: 'Business Hours',
      details: 'Monday - Friday: 9:00 AM - 6:00 PM',
      description: 'Saturday: 10:00 AM - 4:00 PM',
    },
  ];

  const faqs = [
    {
      question: 'How do I become a farmer partner?',
      answer:
        "Visit our registration page and select 'Farmer' role. We'll review your application and get back to you within 2-3 business days.",
    },
    {
      question: 'What areas do you deliver to?',
      answer:
        'We currently deliver to major metropolitan areas in Andhra Pradesh and surrounding regions. Check your zip code during checkout to see if we deliver to your location.',
    },
    {
      question: 'Are all products organic?',
      answer:
        'We offer both organic and conventional products. Look for the organic badge on product pages to identify certified organic items.',
    },
    {
      question: 'How fresh are the products?',
      answer:
        'All products are harvested within 24 hours of delivery and delivered directly from local farms to ensure maximum freshness.',
    },
    {
      question: 'What payment methods do you accept?',
      answer:
        'We accept all major credit cards, debit cards, PayPal, UPI, and mobile payment options for your convenience.',
    },
    {
      question: 'Can I schedule deliveries?',
      answer:
        'Yes! You can schedule deliveries for specific dates and times that work best for your schedule.',
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300 py-6 sm:py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-12 md:mb-16"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 md:mb-4">
            Get In Touch
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-xl md:max-w-2xl mx-auto px-2 sm:px-4">
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 p-4 sm:p-6 md:p-8 h-full">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 md:mb-6">
                Contact Information
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 md:mb-8 text-sm sm:text-base md:text-lg">
                Reach out to us through any of these channels. We're here to help you with any questions about our farm-fresh products.
              </p>

              <div className="space-y-3 sm:space-y-4 md:space-y-6">
                {contactInfo.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-start space-x-2 sm:space-x-3 md:space-x-4 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-green-100 to-emerald-200 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                      <item.icon className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 lg:h-6 lg:w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm sm:text-base md:text-lg">
                        {item.title}
                      </h3>
                      <p className="text-green-600 dark:text-green-400 font-medium mb-1 text-xs sm:text-sm md:text-base">
                        {item.details}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">{item.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-4 sm:mt-6 md:mt-8 p-3 sm:p-4 md:p-6 bg-green-50 dark:bg-green-900/20 rounded-lg sm:rounded-xl border border-green-100 dark:border-green-800/50">
                <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2 sm:mb-3 flex items-center text-sm sm:text-base md:text-lg">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
                  Why Choose FarmToKitchen?
                </h4>
                <ul className="text-xs sm:text-sm md:text-base text-green-700 dark:text-green-300 space-y-1 sm:space-y-2">
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 sm:mr-3 flex-shrink-0"></div>
                    Direct from local Andhra Pradesh farms
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 sm:mr-3 flex-shrink-0"></div>
                    100% fresh guarantee
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 sm:mr-3 flex-shrink-0"></div>
                    Sustainable farming practices
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 sm:mr-3 flex-shrink-0"></div>
                    Support local agriculture
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 p-4 sm:p-6 md:p-8">
              <div className="flex items-center mb-4 sm:mb-6">
                <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400 mr-2 sm:mr-3" />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Send us a Message</h2>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                      First Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                      <input
                        {...register('firstName', { required: 'First name is required' })}
                        type="text"
                        className="w-full px-2 sm:px-3 md:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white pl-8 sm:pl-10 md:pl-12 text-sm sm:text-base"
                        placeholder="Your first name"
                      />
                    </div>
                    {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">Last Name</label>
                    <input
                      {...register('lastName', { required: 'Last name is required' })}
                      type="text"
                      className="w-full px-2 sm:px-3 md:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white text-sm sm:text-base"
                      placeholder="Your last name"
                    />
                    {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                    <input
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^\S+@\S+$/i,
                          message: 'Invalid email address',
                        },
                      })}
                      type="email"
                      className="w-full px-2 sm:px-3 md:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white pl-8 sm:pl-10 md:pl-12 text-sm sm:text-base"
                      placeholder="your.email@example.com"
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">Subject</label>
                  <select
                    {...register('subject', { required: 'Please select a subject' })}
                    className="w-full px-2 sm:px-3 md:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white text-sm sm:text-base"
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="products">Product Questions</option>
                    <option value="farmers">Farmer Partnership</option>
                    <option value="delivery">Delivery Issues</option>
                    <option value="technical">Technical Support</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>}
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">Message</label>
                  <textarea
                    {...register('message', {
                      required: 'Message is required',
                      minLength: {
                        value: 10,
                        message: 'Message must be at least 10 characters',
                      },
                    })}
                    rows={4}
                    className="w-full px-2 sm:px-3 md:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white resize-none text-sm sm:text-base"
                    placeholder="Tell us how we can help you..."
                  />
                  {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-2.5 sm:py-3 md:py-4 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2 text-sm sm:text-base"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Sending Message...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-3 sm:mt-4 text-center">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">We typically respond within 24 hours</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 sm:mt-12 md:mt-16"
        >
          <div className="text-center mb-6 sm:mb-8 md:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 md:mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-xl md:max-w-2xl mx-auto">
              Quick answers to common questions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                >
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base md:text-lg pr-3 sm:pr-4">
                    {faq.question}
                  </h3>
                  {openFaq === index ? (
                    <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>

                <AnimatePresence initial={false}>
                  {openFaq === index && (
                    <motion.div
                      key={index}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-5">
                        <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm md:text-base leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;