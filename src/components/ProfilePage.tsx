
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { User, Star, Calendar, Car, Bike, ArrowLeft, Edit, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  name: string;
  age: number;
  rating: number;
  total_ratings: number;
  user_type: string;
  profile_photo_url: string | null;
}

interface Booking {
  id: string;
  created_at: string;
  booking_status: string;
  total_price?: number;
  trip?: {
    from_destination: string;
    to_destination: string;
    start_time: string;
  };
  listing?: {
    vehicle_model: string;
    vehicle_color: string;
    city: string;
  };
}

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [carpoolBookings, setCarpoolBookings] = useState<Booking[]>([]);
  const [vehicleBookings, setVehicleBookings] = useState<Booking[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAge, setEditAge] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchBookings();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
    } else if (data) {
      setProfile(data);
      setEditName(data.name);
      setEditAge(data.age.toString());
    }
  };

  const fetchBookings = async () => {
    if (!user) return;

    // Fetch carpool bookings
    const { data: carpoolData } = await supabase
      .from('carpool_bookings')
      .select(`
        *,
        trip:carpool_trips(from_destination, to_destination, start_time)
      `)
      .eq('passenger_id', profile?.id)
      .order('created_at', { ascending: false });

    // Fetch vehicle bookings
    const { data: vehicleData } = await supabase
      .from('vehicle_bookings')
      .select(`
        *,
        listing:vehicle_listings(vehicle_model, vehicle_color, city)
      `)
      .eq('renter_id', profile?.id)
      .order('created_at', { ascending: false });

    setCarpoolBookings(carpoolData || []);
    setVehicleBookings(vehicleData || []);
  };

  const updateProfile = async () => {
    if (!user || !profile) return;

    setLoading(true);
    const { error } = await supabase
      .from('user_profiles')
      .update({
        name: editName,
        age: parseInt(editAge),
      })
      .eq('user_id', user.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success!",
        description: "Profile updated successfully!",
      });
      setIsEditing(false);
      fetchProfile();
    }
    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button variant="ghost" onClick={() => navigate('/home')} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <User className="h-6 w-6 text-blue-600 mr-2" />
            <h1 className="text-xl font-bold">My Profile</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Info */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {profile.name.charAt(0)}
                </div>
                <div>
                  <CardTitle className="text-2xl">{profile.name}</CardTitle>
                  <CardDescription className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      {profile.rating} ({profile.total_ratings} reviews)
                    </span>
                    <span className="capitalize">{profile.user_type} user</span>
                    <span>{profile.age} years old</span>
                  </CardDescription>
                </div>
              </div>
              <Button
                onClick={() => isEditing ? updateProfile() : setIsEditing(true)}
                disabled={loading}
              >
                {isEditing ? (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Saving...' : 'Save'}
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          {isEditing && (
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    min="18"
                    max="100"
                    value={editAge}
                    onChange={(e) => setEditAge(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Bookings */}
        <Tabs defaultValue="carpool" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="carpool">
              <Car className="h-4 w-4 mr-2" />
              Carpool Bookings
            </TabsTrigger>
            <TabsTrigger value="vehicle">
              <Bike className="h-4 w-4 mr-2" />
              Vehicle Rentals
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="carpool" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>My Carpool Bookings</CardTitle>
                <CardDescription>Your recent carpool trip bookings</CardDescription>
              </CardHeader>
              <CardContent>
                {carpoolBookings.length === 0 ? (
                  <p className="text-center text-gray-600 py-8">No carpool bookings yet.</p>
                ) : (
                  <div className="space-y-4">
                    {carpoolBookings.map((booking) => (
                      <div key={booking.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">
                              {booking.trip?.from_destination} → {booking.trip?.to_destination}
                            </p>
                            <p className="text-sm text-gray-600">
                              Trip Date: {booking.trip?.start_time ? formatDate(booking.trip.start_time) : 'N/A'}
                            </p>
                            <p className="text-sm text-gray-600">
                              Booked: {formatDate(booking.created_at)}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              booking.booking_status === 'confirmed' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {booking.booking_status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="vehicle" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>My Vehicle Rentals</CardTitle>
                <CardDescription>Your recent vehicle rental bookings</CardDescription>
              </CardHeader>
              <CardContent>
                {vehicleBookings.length === 0 ? (
                  <p className="text-center text-gray-600 py-8">No vehicle rentals yet.</p>
                ) : (
                  <div className="space-y-4">
                    {vehicleBookings.map((booking) => (
                      <div key={booking.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">
                              {booking.listing?.vehicle_color} {booking.listing?.vehicle_model}
                            </p>
                            <p className="text-sm text-gray-600">
                              Location: {booking.listing?.city}
                            </p>
                            <p className="text-sm text-gray-600">
                              Booked: {formatDate(booking.created_at)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">₹{booking.total_price}</p>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              booking.booking_status === 'confirmed' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {booking.booking_status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfilePage;
