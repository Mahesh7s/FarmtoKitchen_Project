import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, ShoppingCart, Users, TrendingUp, Star, Truck, Shield, Sparkles } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-emerald-900/20 py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 dark:opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.1)_1px,transparent_0)] bg-[length:40px_40px] dark:bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)]"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 relative">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6 md:mb-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl px-3 py-2 sm:px-4 sm:py-3 shadow-lg border border-green-100 dark:border-green-900/50"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                <Leaf className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
              </div>
              <span className="text-sm sm:text-base md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 dark:from-green-400 dark:to-emerald-500 bg-clip-text text-transparent">
                FarmToKitchen
              </span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 md:mb-6 leading-tight"
            >
              Fresh From
              <span className="block bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-500 bg-clip-text text-transparent mt-1 sm:mt-2">
                Farm To Kitchen
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 md:mb-8 max-w-2xl lg:max-w-3xl mx-auto leading-relaxed px-2 sm:px-4"
            >
              Connect directly with local farmers and get the freshest produce delivered to your doorstep. 
              Join our community of conscious consumers and sustainable farmers building a better food system.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 justify-center items-center px-2 sm:px-4"
            >
              <Link
                to="/register?role=consumer"
                className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-sm sm:text-base md:text-lg font-semibold px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 active:scale-95 text-center"
              >
                Start Shopping Now
              </Link>
              <Link
                to="/register?role=farmer"
                className="w-full sm:w-auto border border-green-500 text-green-600 dark:text-green-400 hover:bg-green-500 hover:text-white dark:hover:text-white text-sm sm:text-base md:text-lg font-semibold px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 rounded-lg sm:rounded-xl transition-all duration-300 transform hover:-translate-y-1 active:scale-95 text-center"
              >
                Sell Your Products
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-6 sm:mt-8 md:mt-10 lg:mt-12 flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 lg:gap-6 text-gray-500 dark:text-gray-400 px-2 sm:px-4"
            >
              {[
                { icon: Truck, text: 'Fast Delivery' },
                { icon: Shield, text: 'Quality Guaranteed' },
                { icon: Star, text: 'Farm Fresh' },
                { icon: Sparkles, text: '100% Natural' }
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-1 sm:space-x-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm px-2 py-1 sm:px-3 sm:py-2 rounded-lg border border-gray-100 dark:border-gray-700">
                  <item.icon className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-green-500" />
                  <span className="text-xs sm:text-sm md:text-base font-medium">{item.text}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-white dark:bg-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 md:mb-4"
            >
              Why Choose FarmToKitchen?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-xl md:max-w-2xl mx-auto px-2 sm:px-4"
            >
              We're revolutionizing the way you buy fresh produce with transparency, quality, and community at our core.
            </motion.p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {[
              {
                icon: ShoppingCart,
                title: 'Direct from Farmers',
                description: 'Buy directly from local farmers without middlemen. Get the freshest produce at fair prices while supporting local agriculture.',
                features: ['No intermediaries', 'Fair pricing', 'Fresh from farm']
              },
              {
                icon: Users,
                title: 'Community Driven',
                description: 'Join a thriving community of conscious consumers and sustainable farmers working together to build a better food system.',
                features: ['Local network', 'Shared values', 'Community support']
              },
              {
                icon: TrendingUp,
                title: 'Sustainable Choice',
                description: 'Reduce food miles, support environmentally friendly farming practices, and make a positive impact on our planet.',
                features: ['Eco-friendly', 'Reduced carbon', 'Sustainable practices']
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-gray-50 dark:bg-gray-700/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 text-center hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-600/50 backdrop-blur-sm"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 md:mb-6 shadow-lg">
                  <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 lg:h-10 lg:w-10 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 md:mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-xs sm:text-sm md:text-base mb-3 sm:mb-4">
                  {feature.description}
                </p>
                <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
                  {feature.features.map((feat, featIndex) => (
                    <span 
                      key={featIndex}
                      className="inline-block bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs px-2 py-1 rounded-full border border-green-200 dark:border-green-800/50"
                    >
                      {feat}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-r from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/4 w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full animate-pulse delay-500"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 relative">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8 text-center">
            {[
              { number: '10K+', label: 'Happy Customers' },
              { number: '500+', label: 'Local Farmers' },
              { number: '50+', label: 'Cities Served' },
              { number: '99%', label: 'Satisfaction Rate' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="text-white bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border border-white/20"
              >
                <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold mb-1 sm:mb-2 drop-shadow-lg">{stat.number}</div>
                <div className="text-green-100 font-medium text-xs sm:text-sm md:text-base drop-shadow-md">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gray-50 dark:bg-gray-900/50 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 shadow-xl border border-gray-100 dark:border-gray-700"
          >
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 md:mb-4"
            >
              Ready to Join Our Community?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 md:mb-8 max-w-xl md:max-w-2xl mx-auto"
            >
              Whether you're looking for fresh produce or want to sell your farm products, 
              we've got you covered. Join thousands of others in building a sustainable future.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 justify-center"
            >
              <Link
                to="/register?role=consumer"
                className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base md:text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 active:scale-95 text-center"
              >
                Join as Consumer
              </Link>
              <Link
                to="/register?role=farmer"
                className="w-full sm:w-auto bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 border border-green-500 hover:bg-green-500 hover:text-white dark:hover:text-white px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base md:text-lg transition-all duration-300 transform hover:-translate-y-1 active:scale-95 text-center"
              >
                Join as Farmer
              </Link>
            </motion.div>
            
            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700"
            >
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2 sm:mb-3">
                Trusted by thousands nationwide
              </p>
              <div className="flex justify-center items-center space-x-2 sm:space-x-3 md:space-x-4 text-gray-400">
                {[Shield, Truck, Star, Leaf].map((Icon, index) => (
                  <Icon key={index} className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;