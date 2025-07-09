import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Bike, MapPin, Clock, Star, ArrowLeft, Plus, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface BikeListing {
  id: string;
  vehicle_model: string;
  vehicle_color: string;
  vehicle_number_plate: string;
  rental_type: 'short_term' | 'long_term';
  rent_price: number;
  max_rental_period: number;
  city: string;
  photos: string[] | null;
  owner_profiles: {
    name: string;
    rating: number;
    total_ratings: number;
  };
}

const BikeRentPage = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState<BikeListing[]>([]);
  const [searchCity, setSearchCity] = useState('');
  const [rentalType, setRentalType] = useState<'short_term' | 'long_term' | ''>('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('vehicle_listings')
      .select(`
        *,
        owner_profiles:user_profiles!owner_id(name, rating, total_ratings)
      `)
      .eq('vehicle_type', 'bike')
      .eq('is_available', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching listings:', error);
    } else {
      setListings(data || []);
    }
    setLoading(false);
  };

  const searchListings = async () => {
    setLoading(true);
    let query = supabase
      .from('vehicle_listings')
      .select(`
        *,
        owner_profiles:user_profiles!owner_id(name, rating, total_ratings)
      `)
      .eq('vehicle_type', 'bike')
      .eq('is_available', true);

    if (searchCity) {
      query = query.ilike('city', `%${searchCity}%`);
    }

    if (rentalType) {
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

  const bookVehicle = async (listingId: string) => {
    if (!user) return;

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

    // For demo purposes, we'll book for the next day
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);

    const { error } = await supabase
      .from('vehicle_bookings')
      .insert({
        listing_id: listingId,
        renter_id: profile.id,
        renter_name: profile.name,
        from_date: tomorrow.toISOString().split('T')[0],
        to_date: dayAfter.toISOString().split('T')[0],
        from_time: '09:00:00',
        to_time: '18:00:00',
        total_price: 200, // In a real app, this would be calculated
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to book bike. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success!",
        description: "Bike booked successfully!",
      });
      fetchListings(); // Refresh the list
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Bike className="h-6 w-6 text-green-600 mr-2" />
            <h1 className="text-xl font-bold">Bike Rental</h1>
            <div className="ml-auto">
              <Button onClick={() => navigate('/create-vehicle/bike')}>
                <Plus className="h-4 w-4 mr-2" />
                List Your Bike
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Find a Bike</CardTitle>
            <CardDescription>Search for available bikes to rent</CardDescription>
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
                <Select value={rentalType} onValueChange={setRentalType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select rental type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    <SelectItem value="short_term">Short Term (Hourly)</SelectItem>
                    <SelectItem value="long_term">Long Term (Daily)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={searchListings} className="w-full" disabled={loading}>
                  {loading ? 'Searching...' : 'Search Bikes'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Listings */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Available Bikes ({listings.length})</h2>
          
          {loading ? (
            <div className="text-center py-8">
              <p>Loading bikes...</p>
            </div>
          ) : listings.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Bike className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No bikes available at the moment.</p>
                <p className="text-sm text-gray-500">Try adjusting your search criteria or check back later.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <Card key={listing.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    {/* Bike Image Placeholder */}
                    <div className="h-48 bg-gradient-to-br from-green-100 to-blue-100 rounded-t-lg flex items-center justify-center">
                      <Bike className="h-16 w-16 text-green-400" />
                    </div>
                    
                    <div className="p-6">
                      {/* Bike Details */}
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold">{listing.vehicle_color} {listing.vehicle_model}</h3>
                        <p className="text-sm text-gray-600">{listing.vehicle_number_plate}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">{listing.city}</span>
                        </div>
                      </div>

                      {/* Owner Info */}
                      <div className="mb-4">
                        <p className="font-medium">{listing.owner_profiles?.name}</p>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm">
                            {listing.owner_profiles?.rating || 0} ({listing.owner_profiles?.total_ratings || 0})
                          </span>
                        </div>
                      </div>

                      {/* Pricing */}
                      <div className="mb-4">
                        <p className="text-2xl font-bold text-green-600">₹{listing.rent_price}</p>
                        <p className="text-sm text-gray-600">
                          per {listing.rental_type === 'short_term' ? 'hour' : 'day'}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">Max {listing.max_rental_period} {listing.rental_type === 'short_term' ? 'hours' : 'days'}</span>
                        </div>
                      </div>

                      <Button onClick={() => bookVehicle(listing.id)} className="w-full">
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
      </div>
    </div>
  );
};

export default BikeRentPage;
