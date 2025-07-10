
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Car, Bike, Users, MapPin, Clock, TrendingUp, Calendar, Star, DollarSign, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface RecentActivity {
  id: string;
  type: 'booking' | 'trip' | 'listing' | 'rental';
  title: string;
  description: string;
  amount?: number;
  status: string;
  date: string;
  icon: React.ReactNode;
  color: string;
}

const HomePage = () => {
  const { user } = useAuth();
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchRecentActivity();
    }
  }, [user]);

  const fetchRecentActivity = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get user profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      const activities: RecentActivity[] = [];

      // Fetch carpool bookings
      const { data: carpoolBookings } = await supabase
        .from('carpool_bookings')
        .select(`
          *,
          trip:carpool_trips(from_destination, to_destination, start_time, price_per_head)
        `)
        .eq('passenger_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(5);

      carpoolBookings?.forEach(booking => {
        activities.push({
          id: booking.id,
          type: 'booking',
          title: `Carpool to ${booking.trip?.to_destination}`,
          description: `${booking.trip?.from_destination} → ${booking.trip?.to_destination}`,
          amount: booking.trip?.price_per_head,
          status: booking.booking_status || 'pending',
          date: booking.created_at || '',
          icon: <Users className="h-5 w-5" />,
          color: 'bg-blue-500'
        });
      });

      // Fetch trips created by user
      const { data: tripsCreated } = await supabase
        .from('carpool_trips')
        .select(`
          *,
          bookings:carpool_bookings(count)
        `)
        .eq('driver_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(5);

      tripsCreated?.forEach(trip => {
        activities.push({
          id: trip.id,
          type: 'trip',
          title: `Trip to ${trip.to_destination}`,
          description: `${trip.from_destination} → ${trip.to_destination}`,
          amount: (trip.bookings?.length || 0) * trip.price_per_head,
          status: trip.status || 'active',
          date: trip.created_at || '',
          icon: <Car className="h-5 w-5" />,
          color: 'bg-green-500'
        });
      });

      // Fetch vehicle listings
      const { data: vehicleListings } = await supabase
        .from('vehicle_listings')
        .select(`
          *,
          bookings:vehicle_bookings(count)
        `)
        .eq('owner_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(5);

      vehicleListings?.forEach(listing => {
        activities.push({
          id: listing.id,
          type: 'listing',
          title: `${listing.vehicle_color} ${listing.vehicle_model}`,
          description: `Listed in ${listing.city}`,
          amount: listing.rent_price * (listing.bookings?.length || 0),
          status: listing.is_available ? 'available' : 'rented',
          date: listing.created_at || '',
          icon: listing.vehicle_type === 'car' ? <Car className="h-5 w-5" /> : <Bike className="h-5 w-5" />,
          color: listing.vehicle_type === 'car' ? 'bg-purple-500' : 'bg-green-500'
        });
      });

      // Fetch vehicle rentals
      const { data: vehicleRentals } = await supabase
        .from('vehicle_bookings')
        .select(`
          *,
          listing:vehicle_listings(vehicle_model, vehicle_color, city, rent_price)
        `)
        .eq('renter_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(5);

      vehicleRentals?.forEach(rental => {
        activities.push({
          id: rental.id,
          type: 'rental',
          title: `Rented ${rental.listing?.vehicle_color} ${rental.listing?.vehicle_model}`,
          description: `From ${rental.from_date} to ${rental.to_date}`,
          amount: rental.total_price,
          status: rental.booking_status || 'confirmed',
          date: rental.created_at || '',
          icon: rental.listing?.vehicle_model?.includes('Bike') ? <Bike className="h-5 w-5" /> : <Car className="h-5 w-5" />,
          color: rental.listing?.vehicle_model?.includes('Bike') ? 'bg-green-500' : 'bg-purple-500'
        });
      });

      // Sort by date and take the most recent 10
      activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRecentActivities(activities.slice(0, 10));
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'active':
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
      case 'rented':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-blue-900 dark:via-gray-900 dark:to-purple-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome back to OnTheGo
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Your one-stop solution for carpooling, car rentals, and bike rentals. 
            Travel smart, save money, and connect with your community.
          </p>
        </div>

        {/* Recent Activity */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Activity</h2>
            <Button variant="outline" onClick={() => navigate('/profile')}>
              View All
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">Loading recent activity...</p>
            </div>
          ) : recentActivities.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300">No recent activity</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Start by booking a ride or listing your vehicle</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentActivities.map((activity) => (
                <Card key={activity.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-10 h-10 rounded-lg ${activity.color} flex items-center justify-center text-white`}>
                        {activity.icon}
                      </div>
                      <Badge className={getStatusColor(activity.status)}>
                        {activity.status}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {activity.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                      {activity.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(activity.date)}
                      </span>
                      {activity.amount && (
                        <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                          ₹{activity.amount}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
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
                <CardDescription className="text-gray-600 dark:text-gray-300">
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
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-16">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-white">Platform Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="flex justify-center mb-2">
                  <stat.icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">{stat.label}</div>
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
