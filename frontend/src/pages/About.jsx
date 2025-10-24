import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Leaf, 
  Users, 
  Target, 
  Heart,
  ArrowRight
} from 'lucide-react';

const About = () => {
  const values = [
    {
      icon: Leaf,
      title: 'Freshness First',
      description: 'We ensure all products are delivered within hours of harvest for maximum freshness.'
    },
    {
      icon: Users,
      title: 'Community Focus',
      description: 'Supporting local farmers and building sustainable food communities.'
    },
    {
      icon: Target,
      title: 'Quality Guarantee',
      description: 'Every product is carefully vetted to meet our high quality standards.'
    },
    {
      icon: Heart,
      title: 'Sustainable Practices',
      description: 'Promoting eco-friendly farming and reducing food waste.'
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-green-900 py-8 sm:py-12 md:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 md:mb-6"
          >
            About FarmToKitchen
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 md:mb-8 max-w-xl md:max-w-2xl mx-auto px-2 sm:px-4"
          >
            Connecting you directly with local farmers for the freshest, most sustainable produce
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link 
              to="/register?role=consumer" 
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-sm sm:text-base md:text-lg"
            >
              <span>Join Now</span>
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 md:mb-6">Our Story</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-3 sm:mb-4 leading-relaxed text-sm sm:text-base md:text-lg">
                FarmToKitchen was born from a simple idea: what if you could get farm-fresh produce 
                delivered directly to your kitchen, just hours after it's harvested?
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 md:mb-8 leading-relaxed text-sm sm:text-base md:text-lg">
                Founded in 2024, we've created a platform that bridges the gap between local farmers 
                and conscious consumers. We believe in supporting sustainable agriculture while 
                providing you with the highest quality fruits, vegetables, and artisanal products.
              </p>
              <Link 
                to="/register?role=consumer" 
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-sm sm:text-base md:text-lg"
              >
                <span>Get Started</span>
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative mt-6 lg:mt-0"
            >
              <img
                src="https://images.unsplash.com/photo-1586773860418-d37222d8fce3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                alt="Farm fresh produce"
                className="rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-xl sm:shadow-2xl w-full h-auto"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 md:mb-4">Our Values</h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-xl md:max-w-2xl mx-auto px-2 sm:px-4">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 text-center group hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 shadow-lg hover:shadow-xl"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-green-100 to-emerald-200 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 md:mb-6 group-hover:from-green-200 group-hover:to-emerald-300 dark:group-hover:from-green-800/50 dark:group-hover:to-emerald-800/50 transition-all duration-300 shadow-md">
                  <value.icon className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 md:mb-4">
                  {value.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm md:text-base leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-r from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700 text-white">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8 text-center">
            {[
              { number: '500+', label: 'Local Farmers' },
              { number: '10K+', label: 'Happy Customers' },
              { number: '50K+', label: 'Orders Delivered' },
              { number: '100%', label: 'Fresh Guarantee' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border border-white/20"
              >
                <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold mb-1 sm:mb-2 drop-shadow-lg">{stat.number}</div>
                <div className="text-green-100 font-medium text-xs sm:text-sm md:text-base drop-shadow-md">{stat.label}</div>
              </motion.div>
            ))}
          </div>
          
          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-8 sm:mt-12 md:mt-16"
          >
            <Link
              to="/register?role=consumer"
              className="inline-flex items-center space-x-2 bg-white text-green-600 hover:bg-gray-100 font-semibold px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 rounded-lg sm:rounded-xl transition-all duration-300 transform hover:-translate-y-1 active:scale-95 shadow-lg hover:shadow-xl"
            >
              <span>Join Today</span>
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;