import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Car, MapPin, Clock, Star, ArrowLeft, Plus, Users, User, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import UserProfileDialog from './UserProfileDialog';

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
  status: string;
  created_at: string;
}

interface BookingForm {
  pickup_location: string;
  pickup_time: string;
  phone_number: string;
}

const CarPoolPage = () => {
  const { user } = useAuth();
  const [trips, setTrips] = useState<CarpoolTrip[]>([]);
  const [myTrips, setMyTrips] = useState<CarpoolTrip[]>([]);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<CarpoolTrip | null>(null);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [bookingForm, setBookingForm] = useState<BookingForm>({
    pickup_location: '',
    pickup_time: '',
    phone_number: ''
  });
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedUserName, setSelectedUserName] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchTrips();
    fetchMyTrips();
    fetchMyBookings();
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

  const fetchMyTrips = async () => {
    if (!user) return;

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!profile) return;

    const { data, error } = await supabase
      .from('carpool_trips')
      .select(`
        *,
        driver_profiles:user_profiles!driver_id(name, rating, total_ratings)
      `)
      .eq('driver_id', profile.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching my trips:', error);
    } else {
      setMyTrips(data || []);
    }
  };

  const fetchMyBookings = async () => {
    if (!user) return;

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!profile) return;

    const { data, error } = await supabase
      .from('carpool_bookings')
      .select(`
        *,
        trip:carpool_trips(from_destination, to_destination, start_time, price_per_head)
      `)
      .eq('passenger_id', profile.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching my bookings:', error);
    } else {
      setMyBookings(data || []);
    }
  };

  const searchTrips = async () => {
    if (!searchFrom && !searchTo) {
      fetchTrips();
      return;
    }

    setLoading(true);
    let query = supabase
      .from('carpool_trips')
      .select(`
        *,
        driver_profiles:user_profiles!driver_id(name, rating, total_ratings)
      `)
      .eq('status', 'active')
      .gt('available_seats', 0);

    if (searchFrom) {
      query = query.ilike('from_destination', `%${searchFrom}%`);
    }

    if (searchTo) {
      query = query.ilike('to_destination', `%${searchTo}%`);
    }

    const { data, error } = await query.order('start_time', { ascending: true });

    if (error) {
      console.error('Error searching trips:', error);
    } else {
      setTrips(data || []);
    }
    setLoading(false);
  };

  const handleOpenUserProfile = (userId: string, userName: string) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    setShowUserProfile(true);
  };

  const handleBookTrip = (trip: CarpoolTrip) => {
    setSelectedTrip(trip);
    setShowBookingDialog(true);
    setBookingForm({
      pickup_location: '',
      pickup_time: trip.start_time,
      phone_number: ''
    });
  };

  const bookTrip = async () => {
    if (!user || !selectedTrip) return;

    if (!bookingForm.pickup_location || !bookingForm.pickup_time || !bookingForm.phone_number) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

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
        trip_id: selectedTrip.id,
        passenger_id: profile.id,
        pickup_location: bookingForm.pickup_location,
        pickup_time: bookingForm.pickup_time,
        phone_number: bookingForm.phone_number,
        booking_status: 'confirmed'
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
      setShowBookingDialog(false);
      setBookingForm({
        pickup_location: '',
        pickup_time: '',
        phone_number: ''
      });
      fetchTrips();
      fetchMyBookings();
    }
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-blue-900 dark:via-gray-900 dark:to-purple-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Users className="h-6 w-6 text-blue-600 mr-2" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Car Pool</h1>
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
        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="search">Search Trips</TabsTrigger>
            <TabsTrigger value="my-trips">My Trips</TabsTrigger>
            <TabsTrigger value="my-bookings">My Bookings</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-6">
            {/* Search Section */}
            <Card>
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
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Available Trips ({trips.length})</h2>
              
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-300">Loading trips...</p>
                </div>
              ) : trips.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-300">No trips available at the moment.</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Try adjusting your search criteria or check back later.</p>
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
                            <span className="font-semibold text-gray-900 dark:text-white">{trip.from_destination}</span>
                            <span className="text-gray-400">→</span>
                            <span className="font-semibold text-gray-900 dark:text-white">{trip.to_destination}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
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
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-gray-900 dark:text-white">{trip.driver_profiles?.name}</p>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenUserProfile(trip.driver_id, trip.driver_profiles?.name || 'Driver')}
                                className="h-6 w-6 p-0"
                              >
                                <User className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm text-gray-600 dark:text-gray-300">
                                {trip.driver_profiles?.rating || 0} ({trip.driver_profiles?.total_ratings || 0})
                              </span>
                            </div>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            <p>{trip.car_color} {trip.car_model}</p>
                            <p>{trip.car_number_plate}</p>
                          </div>
                        </div>

                        {/* Booking Info */}
                        <div className="flex flex-col justify-between">
                          <div className="mb-4">
                            <p className="text-2xl font-bold text-blue-600">₹{trip.price_per_head}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">per person</p>
                            <div className="flex items-center gap-1 mt-1">
                              <Users className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-600 dark:text-gray-300">{trip.available_seats} of {trip.total_seats} seats</span>
                            </div>
                          </div>
                          <Button 
                            onClick={() => handleBookTrip(trip)}
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
          </TabsContent>

          <TabsContent value="my-trips" className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Trips I Created ({myTrips.length})</h2>
              
              {myTrips.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-300">You haven't created any trips yet.</p>
                    <Button onClick={() => navigate('/carpool/create')} className="mt-4">
                      Create Your First Trip
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                myTrips.map((trip) => (
                  <Card key={trip.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className="h-4 w-4 text-blue-500" />
                            <span className="font-semibold text-gray-900 dark:text-white">{trip.from_destination}</span>
                            <span className="text-gray-400">→</span>
                            <span className="font-semibold text-gray-900 dark:text-white">{trip.to_destination}</span>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            <p>Departs: {formatDateTime(trip.start_time)}</p>
                            <p>Arrives: {formatDateTime(trip.reach_time)}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-green-600">₹{trip.price_per_head}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">per person</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Users className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-300">{trip.available_seats} of {trip.total_seats} seats</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-end">
                          <Badge className={trip.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {trip.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="my-bookings" className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Bookings ({myBookings.length})</h2>
              
              {myBookings.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-300">You haven't booked any trips yet.</p>
                    <Button onClick={() => navigate('/carpool')} className="mt-4">
                      Find a Trip
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                myBookings.map((booking) => (
                  <Card key={booking.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className="h-4 w-4 text-blue-500" />
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {booking.trip?.from_destination} → {booking.trip?.to_destination}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            <p>Trip Date: {booking.trip?.start_time ? formatDateTime(booking.trip.start_time) : 'N/A'}</p>
                            <p>Booked: {formatDate(booking.created_at)}</p>
                            <p>Pickup: {booking.pickup_location}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-blue-600">₹{booking.trip?.price_per_head}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">per person</p>
                        </div>
                        <div className="flex items-center justify-end">
                          <Badge className={getStatusColor(booking.booking_status)}>
                            {booking.booking_status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Booking Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book Trip</DialogTitle>
            <DialogDescription>
              Please provide your pickup details for the trip to {selectedTrip?.to_destination}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pickup-location">Pickup Location</Label>
              <Input
                id="pickup-location"
                placeholder="Enter pickup location"
                value={bookingForm.pickup_location}
                onChange={(e) => setBookingForm({...bookingForm, pickup_location: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pickup-time">Pickup Time</Label>
              <Input
                id="pickup-time"
                type="datetime-local"
                value={bookingForm.pickup_time}
                onChange={(e) => setBookingForm({...bookingForm, pickup_time: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone-number">Phone Number</Label>
              <Input
                id="phone-number"
                type="tel"
                placeholder="Enter your phone number"
                value={bookingForm.phone_number}
                onChange={(e) => setBookingForm({...bookingForm, phone_number: e.target.value})}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowBookingDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={bookTrip} className="flex-1">
                Confirm Booking
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* User Profile Dialog */}
      <UserProfileDialog
        open={showUserProfile}
        onOpenChange={setShowUserProfile}
        userId={selectedUserId}
        userName={selectedUserName}
      />
    </div>
  );
};

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'confirmed':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default CarPoolPage;
