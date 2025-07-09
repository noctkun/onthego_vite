
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Car, Users, Bike, Star, Shield, Clock, MapPin, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Car className="h-12 w-12 text-blue-500" />,
      title: "Car Pooling",
      description: "Share rides, split costs, and make new connections on your daily commute."
    },
    {
      icon: <Car className="h-12 w-12 text-purple-500" />,
      title: "Car Rental",
      description: "Rent cars by the hour or day from trusted local owners."
    },
    {
      icon: <Bike className="h-12 w-12 text-green-500" />,
      title: "Bike Rental",
      description: "Eco-friendly bike rentals for short trips around the city."
    },
    {
      icon: <Users className="h-12 w-12 text-orange-500" />,
      title: "Bike Pooling",
      description: "Coming Soon - Share bike rides for sustainable urban mobility."
    }
  ];

  const whyChooseUs = [
    {
      icon: <Shield className="h-8 w-8 text-blue-500" />,
      title: "Safe & Secure",
      description: "Verified users and secure payment system"
    },
    {
      icon: <Clock className="h-8 w-8 text-green-500" />,
      title: "24/7 Available",
      description: "Book rides and rentals anytime, anywhere"
    },
    {
      icon: <Star className="h-8 w-8 text-yellow-500" />,
      title: "Rated Community",
      description: "User ratings and reviews for trust"
    },
    {
      icon: <Zap className="h-8 w-8 text-purple-500" />,
      title: "Instant Booking",
      description: "Quick and easy booking process"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative px-4 py-20 overflow-hidden">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-8">
            <div className="animate-slide-up">
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                OnTheGo
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mt-4 max-w-3xl mx-auto">
                Your Ultimate Mobility Platform - Carpool, Rent, Ride, Repeat
              </p>
            </div>
            
            <div className="animate-fade-in delay-300">
              <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8">
                Join thousands of users who are revolutionizing urban transportation with our 
                comprehensive platform for carpooling and vehicle rentals.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="gradient-primary text-white border-0 hover:opacity-90 transition-opacity"
                  onClick={() => navigate('/auth')}
                >
                  Get Started Today
                </Button>
                <Button variant="outline" size="lg" className="border-2 border-purple-200 hover:bg-purple-50">
                  Learn More
                </Button>
              </div>
            </div>
          </div>
          
          {/* Floating Animation Elements */}
          <div className="absolute top-20 left-10 animate-float">
            <Car className="h-16 w-16 text-blue-200" />
          </div>
          <div className="absolute top-40 right-10 animate-float" style={{animationDelay: '2s'}}>
            <Bike className="h-12 w-12 text-green-200" />
          </div>
          <div className="absolute bottom-20 left-1/4 animate-float" style={{animationDelay: '4s'}}>
            <Users className="h-14 w-14 text-purple-200" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Our Services</h2>
            <p className="text-xl text-gray-600">Everything you need for seamless urban mobility</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg">
                <CardContent className="p-8 text-center space-y-4">
                  <div className="flex justify-center group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose OnTheGo?</h2>
            <p className="text-xl opacity-90">We're not just another mobility app - we're your trusted travel companion</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyChooseUs.map((item, index) => (
              <div key={index} className="text-center space-y-4 group">
                <div className="flex justify-center group-hover:scale-110 transition-transform duration-300">
                  <div className="p-4 bg-white/10 rounded-full backdrop-blur-sm">
                    {item.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="opacity-90">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-blue-600">10K+</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-purple-600">25K+</div>
              <div className="text-gray-600">Rides Completed</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-green-600">50+</div>
              <div className="text-gray-600">Cities Covered</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-orange-600">4.8★</div>
              <div className="text-gray-600">User Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Commute?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join our community and start saving money while making new connections
          </p>
          <Button 
            size="lg" 
            className="bg-white text-purple-600 hover:bg-gray-100 font-semibold"
            onClick={() => navigate('/auth')}
          >
            <MapPin className="mr-2 h-5 w-5" />
            Start Your Journey
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">OnTheGo</h3>
              <p className="text-gray-400">Revolutionizing urban mobility one ride at a time.</p>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Services</h4>
              <div className="space-y-2 text-gray-400">
                <div>Car Pooling</div>
                <div>Car Rental</div>
                <div>Bike Rental</div>
                <div>Bike Pooling</div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Company</h4>
              <div className="space-y-2 text-gray-400">
                <div>About Us</div>
                <div>Contact</div>
                <div>Careers</div>
                <div>Privacy Policy</div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Support</h4>
              <div className="space-y-2 text-gray-400">
                <div>Help Center</div>
                <div>Safety</div>
                <div>Terms of Service</div>
                <div>Community</div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 OnTheGo. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
