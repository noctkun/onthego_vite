
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, Bike, Users, MapPin, Clock, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const services = [
    {
      title: 'Car Pool',
      description: 'Share rides and split costs with fellow travelers',
      icon: Users,
      color: 'bg-gradient-to-r from-blue-500 to-purple-600',
      route: '/carpool'
    },
    {
      title: 'Car Rental',
      description: 'Rent cars by the hour or day for your convenience',
      icon: Car,
      color: 'bg-gradient-to-r from-purple-500 to-pink-600',
      route: '/car-rent'
    },
    {
      title: 'Bike Rental',
      description: 'Quick and eco-friendly bike rentals for short trips',
      icon: Bike,
      color: 'bg-gradient-to-r from-green-500 to-teal-600',
      route: '/bike-rent'
    }
  ];

  const stats = [
    { label: 'Active Users', value: '10K+', icon: Users },
    { label: 'Cities Covered', value: '50+', icon: MapPin },
    { label: 'Trips Completed', value: '1M+', icon: TrendingUp },
    { label: 'Hours Saved', value: '5M+', icon: Clock },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to OnTheGo
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your one-stop solution for carpooling, car rentals, and bike rentals. 
            Travel smart, save money, and connect with your community.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {services.map((service) => (
            <Card key={service.title} className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader>
                <div className={`w-16 h-16 rounded-lg ${service.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <service.icon className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">{service.title}</CardTitle>
                <CardDescription className="text-gray-600">
                  {service.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => navigate(service.route)}
                  className="w-full"
                  variant="outline"
                >
                  Explore {service.title}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Platform Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="flex justify-center mb-2">
                  <stat.icon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-blue-100 mb-6">
            Choose your preferred mode of transportation and start your journey today!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              onClick={() => navigate('/carpool')} 
              variant="secondary"
              size="lg"
            >
              Find a Carpool
            </Button>
            <Button 
              onClick={() => navigate('/car-rent')} 
              variant="secondary"
              size="lg"
            >
              Rent a Car
            </Button>
            <Button 
              onClick={() => navigate('/bike-rent')} 
              variant="secondary"
              size="lg"
            >
              Rent a Bike
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
