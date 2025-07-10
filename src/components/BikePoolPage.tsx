import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bike, Users, MapPin, Clock, Star, Zap, Leaf, TrendingUp, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BikePoolPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Leaf className="h-8 w-8 text-green-500" />,
      title: "Eco-Friendly",
      description: "Reduce carbon footprint with sustainable motorcycle sharing"
    },
    {
      icon: <Zap className="h-8 w-8 text-yellow-500" />,
      title: "Quick & Efficient",
      description: "Perfect for urban commutes with traffic navigation"
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-blue-500" />,
      title: "Cost Effective",
      description: "Save money on fuel and parking costs"
    },
    {
      icon: <Users className="h-8 w-8 text-purple-500" />,
      title: "Community Building",
      description: "Connect with fellow riders in your area"
    }
  ];

  const benefits = [
    {
      title: "Traffic Navigation",
      description: "Easily navigate through traffic jams",
      icon: "🏍️"
    },
    {
      title: "Fuel Efficient",
      description: "Lower fuel consumption per person",
      icon: "⛽"
    },
    {
      title: "Easy Parking",
      description: "Find parking spots easily",
      icon: "🅿️"
    },
    {
      title: "Flexible Routes",
      description: "Choose optimal routes for your journey",
      icon: "🗺️"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-green-900 dark:via-gray-900 dark:to-blue-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Bike className="h-6 w-6 text-green-600 mr-2" />
            <h1 className="text-xl font-bold">Motorcycle Pooling</h1>
            <Badge variant="secondary" className="ml-4">
              Coming Soon
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <Bike className="h-20 w-20 text-green-500 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Motorcycle Pooling is Coming Soon!
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Join the revolution in sustainable urban mobility. Share motorcycle rides, reduce costs, 
              and make new connections while helping the environment and beating traffic.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button 
              size="lg" 
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => navigate('/carpool')}
            >
              Try Car Pooling Instead
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/bike-rent')}
            >
              Rent a Motorcycle Now
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow border-0 shadow-lg dark:bg-gray-800">
              <CardContent className="p-6 text-center space-y-4">
                <div className="flex justify-center group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            Why Choose Motorcycle Pooling?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center space-y-3">
                <div className="text-4xl mb-2">{benefit.icon}</div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{benefit.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white text-center mb-16">
          <h2 className="text-3xl font-bold mb-8">Expected Impact</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <div className="text-4xl font-bold">40%</div>
              <div className="text-green-100">Reduction in Carbon Emissions</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold">35%</div>
              <div className="text-green-100">Cost Savings on Commute</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold">20min</div>
              <div className="text-green-100">Average Time Saved</div>
            </div>
          </div>
        </div>

        {/* Notification Signup */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Get Notified When We Launch</CardTitle>
            <CardDescription>
              Be the first to know when motorcycle pooling becomes available in your area
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <Button className="bg-green-600 hover:bg-green-700">
                <Bell className="h-4 w-4 mr-2" />
                Notify Me
              </Button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              We'll send you an email when motorcycle pooling launches in your city
            </p>
          </CardContent>
        </Card>

        {/* Alternative Services */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            Try Our Other Services While You Wait
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/carpool')}>
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <h4 className="text-lg font-semibold mb-2">Car Pooling</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Share rides and split costs with fellow travelers
                </p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/car-rent')}>
              <CardContent className="p-6 text-center">
                <Card className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                <h4 className="text-lg font-semibold mb-2">Car Rental</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Rent cars by the hour or day for your convenience
                </p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/bike-rent')}>
              <CardContent className="p-6 text-center">
                <Bike className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h4 className="text-lg font-semibold mb-2">Motorcycle Rental</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Quick and efficient motorcycle rentals for short trips
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BikePoolPage; 