import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Car, MapPin, Clock, Users, Star, ArrowLeft, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface CarpoolTrip {
  id: string;
  from_destination: string;
  to_destination: string;
  start_time: string;
  reach_time: string;
  price_per_head: number;
  available_seats: number;
  total_seats: number;
  car_model: string;
  car_color: string;
  car_number_plate: string;
  driver_profiles: {
    name: string;
    rating: number;
    total_ratings: number;
  };
}

const CarPoolPage = () => {
  const { user } = useAuth();
  const [trips, setTrips] = useState<CarpoolTrip[]>([]);
  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('carpool_trips')
      .select(`
        *,
        driver_profiles:user_profiles!driver_id(name, rating, total_ratings)
      `)
      .eq('status', 'active')
      .gt('available_seats', 0)
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Error fetching trips:', error);
    } else {
      setTrips(data || []);
    }
    setLoading(false);
  };

  const searchTrips = async () => {
    if (!searchFrom || !searchTo) {
      fetchTrips();
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('carpool_trips')
      .select(`
        *,
        driver_profiles:user_profiles!driver_id(name, rating, total_ratings)
      `)
      .eq('status', 'active')
      .gt('available_seats', 0)
      .ilike('from_destination', `%${searchFrom}%`)
      .ilike('to_destination', `%${searchTo}%`)
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Error searching trips:', error);
    } else {
      setTrips(data || []);
    }
    setLoading(false);
  };

  const bookTrip = async (tripId: string) => {
    if (!user) return;

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      toast({
        title: "Error",
        description: "Profile not found. Please try again.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('carpool_bookings')
      .insert({
        trip_id: tripId,
        passenger_id: profile.id,
        pickup_location: 'Starting point', // In a real app, this would be user input
        pickup_time: new Date().toISOString(),
        phone_number: '+1234567890', // In a real app, this would be from user profile
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to book trip. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success!",
        description: "Trip booked successfully!",
      });
      fetchTrips(); // Refresh the list
    }
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Users className="h-6 w-6 text-blue-600 mr-2" />
            <h1 className="text-xl font-bold">Car Pool</h1>
            <div className="ml-auto">
              <Button onClick={() => navigate('/carpool/create')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Trip
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Find a Ride</CardTitle>
            <CardDescription>Search for available carpool trips</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="from">From</Label>
                <Input
                  id="from"
                  placeholder="Starting location"
                  value={searchFrom}
                  onChange={(e) => setSearchFrom(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="to">To</Label>
                <Input
                  id="to"
                  placeholder="Destination"
                  value={searchTo}
                  onChange={(e) => setSearchTo(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={searchTrips} className="w-full" disabled={loading}>
                  {loading ? 'Searching...' : 'Search Trips'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trips List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Available Trips ({trips.length})</h2>
          
          {loading ? (
            <div className="text-center py-8">
              <p>Loading trips...</p>
            </div>
          ) : trips.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No trips available at the moment.</p>
                <p className="text-sm text-gray-500">Try adjusting your search criteria or check back later.</p>
              </CardContent>
            </Card>
          ) : (
            trips.map((trip) => (
              <Card key={trip.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Route Info */}
                    <div className="lg:col-span-2">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-4 w-4 text-blue-500" />
                        <span className="font-semibold">{trip.from_destination}</span>
                        <span className="text-gray-400">→</span>
                        <span className="font-semibold">{trip.to_destination}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>Departs: {formatDateTime(trip.start_time)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>Arrives: {formatDateTime(trip.reach_time)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Driver & Vehicle Info */}
                    <div>
                      <div className="mb-2">
                        <p className="font-semibold">{trip.driver_profiles?.name}</p>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm">
                            {trip.driver_profiles?.rating || 0} ({trip.driver_profiles?.total_ratings || 0})
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>{trip.car_color} {trip.car_model}</p>
                        <p>{trip.car_number_plate}</p>
                      </div>
                    </div>

                    {/* Booking Info */}
                    <div className="flex flex-col justify-between">
                      <div className="mb-4">
                        <p className="text-2xl font-bold text-blue-600">₹{trip.price_per_head}</p>
                        <p className="text-sm text-gray-600">per person</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{trip.available_seats} of {trip.total_seats} seats</span>
                        </div>
                      </div>
                      <Button 
                        onClick={() => bookTrip(trip.id)}
                        disabled={trip.available_seats === 0}
                        className="w-full"
                      >
                        {trip.available_seats === 0 ? 'Fully Booked' : 'Book Now'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CarPoolPage;
