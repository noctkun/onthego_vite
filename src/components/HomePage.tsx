
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Car, Users, Bike, MapPin, Clock, Star, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
  name: string;
  rating: number;
  total_ratings: number;
  user_type: string;
}

const HomePage = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState({
    activeTrips: 0,
    availableCars: 0,
    availableBikes: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
    fetchStats();
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('user_profiles')
      .select('name, rating, total_ratings, user_type')
      .eq('user_id', user.id)
      .single();
    
    if (data) setProfile(data);
  };

  const fetchStats = async () => {
    const [tripsResult, carsResult, bikesResult] = await Promise.all([
      supabase.from('carpool_trips').select('id', { count: 'exact' }).eq('status', 'active'),
      supabase.from('vehicle_listings').select('id', { count: 'exact' }).eq('vehicle_type', 'car').eq('is_available', true),
      supabase.from('vehicle_listings').select('id', { count: 'exact' }).eq('vehicle_type', 'bike').eq('is_available', true),
    ]);

    setStats({
      activeTrips: tripsResult.count || 0,
      availableCars: carsResult.count || 0,
      availableBikes: bikesResult.count || 0,
    });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const services = [
    {
      icon: <Car className="h-8 w-8 text-blue-500" />,
      title: "Car Pooling",
      description: "Share rides and split costs",
      count: stats.activeTrips,
      route: "/carpool"
    },
    {
      icon: <Car className="h-8 w-8 text-purple-500" />,
      title: "Car Rental",
      description: "Rent cars by hour or day",
      count: stats.availableCars,
      route: "/car-rent"
    },
    {
      icon: <Bike className="h-8 w-8 text-green-500" />,
      title: "Bike Rental",
      description: "Eco-friendly bike rentals",
      count: stats.availableBikes,
      route: "/bike-rent"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Car className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                OnTheGo
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {profile?.name?.charAt(0) || 'U'}
                </div>
                <span className="hidden sm:inline">{profile?.name || 'User'}</span>
              </Button>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {profile?.name || 'User'}!
          </h2>
          <div className="flex items-center gap-4 text-gray-600">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500" />
              <span>{profile?.rating || 0} ({profile?.total_ratings || 0} reviews)</span>
            </div>
            <div className="flex items-center gap-1 capitalize">
              <Users className="h-4 w-4" />
              <span>{profile?.user_type || 'new'} user</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="flex items-center p-6">
              <MapPin className="h-8 w-8 text-blue-500 mr-4" />
              <div>
                <p className="text-2xl font-bold">{stats.activeTrips}</p>
                <p className="text-gray-600">Active Trips</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center p-6">
              <Car className="h-8 w-8 text-purple-500 mr-4" />
              <div>
                <p className="text-2xl font-bold">{stats.availableCars}</p>
                <p className="text-gray-600">Available Cars</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center p-6">
              <Bike className="h-8 w-8 text-green-500 mr-4" />
              <div>
                <p className="text-2xl font-bold">{stats.availableBikes}</p>
                <p className="text-gray-600">Available Bikes</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Services */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Our Services</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 cursor-pointer"
                onClick={() => navigate(service.route)}>
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    {service.icon}
                  </div>
                  <CardTitle>{service.title}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-lg font-semibold text-blue-600 mb-4">
                    {service.count} available
                  </p>
                  <Button className="w-full">
                    Explore
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-center py-8">
              No recent activity. Start by booking a ride or renting a vehicle!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HomePage;
