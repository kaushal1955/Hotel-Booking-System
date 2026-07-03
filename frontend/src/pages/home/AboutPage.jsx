import React from 'react';
import { motion } from 'framer-motion';
import { FiShield, FiUsers, FiGlobe, FiAward } from 'react-icons/fi';

const AboutPage = () => {
  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="bg-gradient-to-r from-primary-900 to-primary-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            About StayEase
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-primary-100 max-w-3xl mx-auto"
          >
            We're on a mission to make hotel booking simple, affordable, and
            delightful for everyone.
          </motion.p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                At StayEase, we believe everyone deserves a perfect stay. Our
                platform connects travelers with the best hotels, ensuring
                comfort, value, and unforgettable experiences.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Trusted by thousands of travelers, we've made it easy to find
                and book comfortable stays across hundreds of destinations.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="grid grid-cols-2 gap-4"
            >
              {[
                { number: "10K+", label: "Hotels Listed" },
                { number: "50K+", label: "Happy Customers" },
                { number: "100+", label: "Destinations" },
                { number: "4.8", label: "Average Rating" },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="bg-primary-50 p-6 rounded-2xl text-center"
                >
                  <div className="text-3xl font-bold text-primary-600">
                    {stat.number}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                icon: FiShield,
                title: "Trust",
                desc: "We prioritize secure transactions and honest listings.",
              },
              {
                icon: FiUsers,
                title: "Community",
                desc: "Building a community of travelers and hoteliers.",
              },
              {
                icon: FiGlobe,
                title: "Accessibility",
                desc: "Making travel accessible to everyone, everywhere.",
              },
              {
                icon: FiAward,
                title: "Excellence",
                desc: "Committed to providing the best user experience.",
              },
            ].map((v, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="bg-white p-6 rounded-2xl shadow-sm text-center"
              >
                <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <v.icon className="text-primary-600" size={24} />
                </div>
                <h3 className="font-semibold mb-2">{v.title}</h3>
                <p className="text-sm text-gray-600">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;