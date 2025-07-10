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
import { Car, MapPin, Clock, Star, ArrowLeft, Plus, Calendar, DollarSign, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import UserProfileDialog from './UserProfileDialog';

interface CarListing {
  id: string;
  vehicle_model: string;
  vehicle_color: string;
  vehicle_number_plate: string;
  rental_type: 'short_term' | 'long_term';
  rent_price: number;
  max_rental_period: number;
  city: string;
  photos: string[] | null;
  owner_id: string;
  owner_profiles: {
    name: string;
    rating: number;
    total_ratings: number;
  };
  is_available: boolean;
}

interface BookingForm {
  from_date: string;
  to_date: string;
  from_time: string;
  to_time: string;
  total_price: number;
}

const CarRentPage = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState<CarListing[]>([]);
  const [myListings, setMyListings] = useState<CarListing[]>([]);
  const [myRentals, setMyRentals] = useState<any[]>([]);
  const [searchCity, setSearchCity] = useState('');
  const [rentalType, setRentalType] = useState<'short_term' | 'long_term' | 'all'>('all');
  const [loading, setLoading] = useState(false);
  const [selectedListing, setSelectedListing] = useState<CarListing | null>(null);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [bookingForm, setBookingForm] = useState<BookingForm>({
    from_date: '',
    to_date: '',
    from_time: '',
    to_time: '',
    total_price: 0
  });
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedUserName, setSelectedUserName] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleOpenUserProfile = (userId: string, userName: string) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    setShowUserProfile(true);
  };

  useEffect(() => {
    fetchListings();
    fetchMyListings();
    fetchMyRentals();
  }, []);

  const fetchListings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('vehicle_listings')
      .select(`
        *,
        owner_profiles:user_profiles!owner_id(name, rating, total_ratings)
      `)
      .eq('vehicle_type', 'car')
      .eq('is_available', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching listings:', error);
    } else {
      setListings(data || []);
    }
    setLoading(false);
  };

  const fetchMyListings = async () => {
    if (!user) return;

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!profile) return;

    const { data, error } = await supabase
      .from('vehicle_listings')
      .select(`
        *,
        owner_profiles:user_profiles!owner_id(name, rating, total_ratings)
      `)
      .eq('vehicle_type', 'car')
      .eq('owner_id', profile.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching my listings:', error);
    } else {
      setMyListings(data || []);
    }
  };

  const fetchMyRentals = async () => {
    if (!user) return;

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!profile) return;

    const { data, error } = await supabase
      .from('vehicle_bookings')
      .select(`
        *,
        listing:vehicle_listings(vehicle_model, vehicle_color, city, rent_price, rental_type)
      `)
      .eq('renter_id', profile.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching my rentals:', error);
    } else {
      setMyRentals(data || []);
    }
  };

  const searchListings = async () => {
    setLoading(true);
    let query = supabase
      .from('vehicle_listings')
      .select(`
        *,
        owner_profiles:user_profiles!owner_id(name, rating, total_ratings)
      `)
      .eq('vehicle_type', 'car')
      .eq('is_available', true);

    if (searchCity) {
      query = query.ilike('city', `%${searchCity}%`);
    }

    if (rentalType && rentalType !== 'all') {
      query = query.eq('rental_type', rentalType);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching listings:', error);
    } else {
      setListings(data || []);
    }
    setLoading(false);
  };

  const handleBookVehicle = (listing: CarListing) => {
    setSelectedListing(listing);
    setShowBookingDialog(true);
    // Set default dates (tomorrow and day after)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);
    
    setBookingForm({
      from_date: tomorrow.toISOString().split('T')[0],
      to_date: dayAfter.toISOString().split('T')[0],
      from_time: '09:00',
      to_time: '18:00',
      total_price: calculatePrice(listing, tomorrow, dayAfter)
    });
  };

  const calculatePrice = (listing: CarListing, fromDate: Date, toDate: Date) => {
    const days = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
    return listing.rental_type === 'short_term' ? listing.rent_price * 9 : listing.rent_price * days;
  };

  const bookVehicle = async () => {
    if (!user || !selectedListing) return;

    if (!bookingForm.from_date || !bookingForm.to_date || !bookingForm.from_time || !bookingForm.to_time) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('id, name')
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
      .from('vehicle_bookings')
      .insert({
        listing_id: selectedListing.id,
        renter_id: profile.id,
        renter_name: profile.name,
        from_date: bookingForm.from_date,
        to_date: bookingForm.to_date,
        from_time: bookingForm.from_time,
        to_time: bookingForm.to_time,
        total_price: bookingForm.total_price,
        booking_status: 'confirmed'
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to book vehicle. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success!",
        description: "Vehicle booked successfully!",
      });
      setShowBookingDialog(false);
      fetchListings();
      fetchMyRentals();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-purple-900 dark:via-gray-900 dark:to-blue-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Car className="h-6 w-6 text-purple-600 mr-2" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Car Rental</h1>
            <div className="ml-auto">
              <Button onClick={() => navigate('/create-vehicle/car')}>
                <Plus className="h-4 w-4 mr-2" />
                List Your Car
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="search">Search Cars</TabsTrigger>
            <TabsTrigger value="my-listings">My Listings</TabsTrigger>
            <TabsTrigger value="my-rentals">My Rentals</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-6">
            {/* Search Section */}
            <Card>
              <CardHeader>
                <CardTitle>Find a Car</CardTitle>
                <CardDescription>Search for available cars to rent</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      placeholder="Enter city"
                      value={searchCity}
                      onChange={(e) => setSearchCity(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rental-type">Rental Type</Label>
                    <Select value={rentalType} onValueChange={(value) => setRentalType(value as 'short_term' | 'long_term' | 'all')}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select rental type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="short_term">Short Term (Hourly)</SelectItem>
                        <SelectItem value="long_term">Long Term (Daily)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={searchListings} className="w-full" disabled={loading}>
                      {loading ? 'Searching...' : 'Search Cars'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Listings */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Available Cars ({listings.length})</h2>
              
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-300">Loading cars...</p>
                </div>
              ) : listings.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-300">No cars available at the moment.</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Try adjusting your search criteria or check back later.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listings.map((listing) => (
                    <Card key={listing.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-0">
                        {/* Car Image Placeholder */}
                        <div className="h-48 bg-gradient-to-br from-purple-100 to-blue-100 rounded-t-lg flex items-center justify-center">
                          <Car className="h-16 w-16 text-purple-400" />
                        </div>
                        
                        <div className="p-6">
                          {/* Car Details */}
                          <div className="mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{listing.vehicle_color} {listing.vehicle_model}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{listing.vehicle_number_plate}</p>
                            <div className="flex items-center gap-1 mt-1">
                              <MapPin className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-600 dark:text-gray-300">{listing.city}</span>
                            </div>
                          </div>

                          {/* Owner Info */}
                          <div className="mb-4">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900 dark:text-white">{listing.owner_profiles?.name}</p>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenUserProfile(listing.owner_id, listing.owner_profiles?.name || 'Owner')}
                                className="h-6 w-6 p-0"
                              >
                                <User className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm text-gray-600 dark:text-gray-300">
                                {listing.owner_profiles?.rating || 0} ({listing.owner_profiles?.total_ratings || 0})
                              </span>
                            </div>
                          </div>

                          {/* Pricing */}
                          <div className="mb-4">
                            <p className="text-2xl font-bold text-purple-600">₹{listing.rent_price}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              per {listing.rental_type === 'short_term' ? 'hour' : 'day'}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              <Clock className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-600 dark:text-gray-300">Max {listing.max_rental_period} {listing.rental_type === 'short_term' ? 'hours' : 'days'}</span>
                            </div>
                          </div>

                          <Button onClick={() => handleBookVehicle(listing)} className="w-full">
                            <Calendar className="h-4 w-4 mr-2" />
                            Book Now
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="my-listings" className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Car Listings ({myListings.length})</h2>
              
              {myListings.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-300">You haven't listed any cars yet.</p>
                    <Button onClick={() => navigate('/create-vehicle/car')} className="mt-4">
                      List Your First Car
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                myListings.map((listing) => (
                  <Card key={listing.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{listing.vehicle_color} {listing.vehicle_model}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{listing.vehicle_number_plate}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-300">{listing.city}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-purple-600">₹{listing.rent_price}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            per {listing.rental_type === 'short_term' ? 'hour' : 'day'}
                          </p>
                        </div>
                        <div className="flex items-center justify-end">
                          <Badge className={listing.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {listing.is_available ? 'Available' : 'Rented'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="my-rentals" className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Car Rentals ({myRentals.length})</h2>
              
              {myRentals.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-300">You haven't rented any cars yet.</p>
                    <Button onClick={() => navigate('/car-rent')} className="mt-4">
                      Find a Car
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                myRentals.map((rental) => (
                  <Card key={rental.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {rental.listing?.vehicle_color} {rental.listing?.vehicle_model}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            From {formatDate(rental.from_date)} to {formatDate(rental.to_date)}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Location: {rental.listing?.city}
                          </p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-purple-600">₹{rental.total_price}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Total Cost</p>
                        </div>
                        <div className="flex items-center justify-end">
                          <Badge className={getStatusColor(rental.booking_status)}>
                            {rental.booking_status}
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
            <DialogTitle>Book Car</DialogTitle>
            <DialogDescription>
              Please provide your rental details for the {selectedListing?.vehicle_color} {selectedListing?.vehicle_model}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="from-date">From Date</Label>
                <Input
                  id="from-date"
                  type="date"
                  value={bookingForm.from_date}
                  onChange={(e) => {
                    const fromDate = new Date(e.target.value);
                    const toDate = new Date(bookingForm.to_date);
                    setBookingForm({
                      ...bookingForm,
                      from_date: e.target.value,
                      total_price: selectedListing ? calculatePrice(selectedListing, fromDate, toDate) : 0
                    });
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="to-date">To Date</Label>
                <Input
                  id="to-date"
                  type="date"
                  value={bookingForm.to_date}
                  onChange={(e) => {
                    const fromDate = new Date(bookingForm.from_date);
                    const toDate = new Date(e.target.value);
                    setBookingForm({
                      ...bookingForm,
                      to_date: e.target.value,
                      total_price: selectedListing ? calculatePrice(selectedListing, fromDate, toDate) : 0
                    });
                  }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="from-time">From Time</Label>
                <Input
                  id="from-time"
                  type="time"
                  value={bookingForm.from_time}
                  onChange={(e) => setBookingForm({...bookingForm, from_time: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="to-time">To Time</Label>
                <Input
                  id="to-time"
                  type="time"
                  value={bookingForm.to_time}
                  onChange={(e) => setBookingForm({...bookingForm, to_time: e.target.value})}
                />
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-900 dark:text-white">Total Price:</span>
                <span className="text-2xl font-bold text-purple-600">₹{bookingForm.total_price}</span>
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowBookingDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={bookVehicle} className="flex-1">
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

export default CarRentPage;
