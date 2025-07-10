
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { User, Star, Edit, Camera, Calendar, MapPin, Phone, Mail, Settings, Heart, ThumbsUp, Award } from 'lucide-react';
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

interface UserRating {
  id: string;
  rating: number;
  review: string;
  created_at: string;
  rater_profiles: {
    name: string;
    profile_photo_url: string | null;
  };
}

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [ratings, setRatings] = useState<UserRating[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', age: 0 });
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [selectedRating, setSelectedRating] = useState<UserRating | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchBookings();
      fetchRatings();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      let profileData = profile;

      // If profile doesn't exist, create it
      if (!profile && profileError) {
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: user.id,
            name: user.user_metadata?.name || 'User',
            age: user.user_metadata?.age || 18,
            user_type: 'new',
            rating: 0,
            total_ratings: 0,
          })
          .select('*')
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
          toast({
            title: "Error",
            description: "Failed to create user profile. Please try again.",
            variant: "destructive",
          });
          return;
        }

        profileData = newProfile;
      }

      if (profileData) {
        setProfile(profileData);
        setEditForm({ name: profileData.name, age: profileData.age });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchBookings = async () => {
    if (!user) return;

    try {
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      let profileId = profile?.id;

      // If profile doesn't exist, create it
      if (!profile && profileError) {
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: user.id,
            name: user.user_metadata?.name || 'User',
            age: user.user_metadata?.age || 18,
            user_type: 'new',
            rating: 0,
            total_ratings: 0,
          })
          .select('id')
          .single();

        if (createError) {
          console.error('Error creating profile for bookings:', createError);
          return;
        }

        profileId = newProfile.id;
      }

      if (!profileId) return;

      // Fetch carpool bookings
      const { data: carpoolBookings } = await supabase
        .from('carpool_bookings')
        .select(`
          id,
          created_at,
          booking_status,
          trip:carpool_trips(from_destination, to_destination, start_time)
        `)
        .eq('passenger_id', profileId);

      // Fetch vehicle bookings
      const { data: vehicleBookings } = await supabase
        .from('vehicle_bookings')
        .select(`
          id,
          created_at,
          booking_status,
          total_price,
          listing:vehicle_listings(vehicle_model, vehicle_color, city)
        `)
        .eq('renter_id', profileId);

      const allBookings = [
        ...(carpoolBookings || []).map(b => ({ ...b, type: 'carpool' })),
        ...(vehicleBookings || []).map(b => ({ ...b, type: 'vehicle' }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setBookings(allBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const fetchRatings = async () => {
    if (!user) return;

    try {
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      let profileId = profile?.id;

      // If profile doesn't exist, create it
      if (!profile && profileError) {
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: user.id,
            name: user.user_metadata?.name || 'User',
            age: user.user_metadata?.age || 18,
            user_type: 'new',
            rating: 0,
            total_ratings: 0,
          })
          .select('id')
          .single();

        if (createError) {
          console.error('Error creating profile for ratings:', createError);
          return;
        }

        profileId = newProfile.id;
      }

      if (!profileId) return;

      const { data, error } = await supabase
        .from('user_ratings')
        .select(`
          id,
          rating,
          review,
          created_at,
          rater_profiles:user_profiles!rater_user_id(name, profile_photo_url)
        `)
        .eq('rated_user_id', profileId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching ratings:', error);
      } else {
        setRatings(data || []);
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
    }
  };

  const updateProfile = async () => {
    if (!user || !profile) return;

    if (!editForm.name || editForm.age < 1) {
      toast({
        title: "Error",
        description: "Please fill in all fields correctly.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('user_profiles')
      .update({
        name: editForm.name,
        age: editForm.age,
        updated_at: new Date().toISOString()
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
      setEditing(false);
      fetchProfile();
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploadingPhoto(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `profile-photos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) {
      toast({
        title: "Error",
        description: "Failed to upload photo. Please try again.",
        variant: "destructive",
      });
      setUploadingPhoto(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ profile_photo_url: publicUrl })
      .eq('user_id', user.id);

    if (updateError) {
      toast({
        title: "Error",
        description: "Failed to update profile photo. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success!",
        description: "Profile photo updated successfully!",
      });
      fetchProfile();
    }
    setUploadingPhoto(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
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

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-blue-900 dark:via-gray-900 dark:to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-blue-900 dark:via-gray-900 dark:to-purple-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="ratings">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            {/* Profile Header */}
            <Card>
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                  {/* Profile Photo */}
                  <div className="relative">
                    <Avatar className="h-32 w-32">
                      <AvatarImage src={profile.profile_photo_url || undefined} />
                      <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        {profile.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <label className="absolute bottom-0 right-0 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg cursor-pointer hover:shadow-xl transition-shadow">
                      <Camera className="h-4 w-4 text-gray-600" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        disabled={uploadingPhoto}
                      />
                    </label>
                  </div>

                  {/* Profile Info */}
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{profile.name}</h1>
                      <Badge variant="secondary" className="text-sm">
                        {profile.user_type}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-center md:justify-start gap-1 mb-4">
                      {renderStars(profile.rating)}
                      <span className="text-sm text-gray-600 dark:text-gray-300 ml-2">
                        {profile.rating.toFixed(1)} ({profile.total_ratings} reviews)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>Age: {profile.age} years</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Member since {formatDate(profile.created_at || '')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Edit Button */}
                  <Button
                    onClick={() => setEditing(!editing)}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    {editing ? 'Cancel' : 'Edit Profile'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Edit Profile Form */}
            {editing && (
              <Card>
                <CardHeader>
                  <CardTitle>Edit Profile</CardTitle>
                  <CardDescription>Update your profile information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        placeholder="Enter your name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        type="number"
                        value={editForm.age}
                        onChange={(e) => setEditForm({ ...editForm, age: parseInt(e.target.value) || 0 })}
                        placeholder="Enter your age"
                        min="1"
                        max="120"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={updateProfile} disabled={loading}>
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button variant="outline" onClick={() => setEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Calendar className="h-8 w-8 text-blue-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{bookings.length}</h3>
                  <p className="text-gray-600 dark:text-gray-300">Total Bookings</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Star className="h-8 w-8 text-yellow-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{profile.rating.toFixed(1)}</h3>
                  <p className="text-gray-600 dark:text-gray-300">Average Rating</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Award className="h-8 w-8 text-purple-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{profile.total_ratings}</h3>
                  <p className="text-gray-600 dark:text-gray-300">Reviews Received</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Booking History ({bookings.length})</h2>
              
              {bookings.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-300">No bookings yet.</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Start by booking a ride or renting a vehicle!</p>
                  </CardContent>
                </Card>
              ) : (
                bookings.map((booking) => (
                  <Card key={booking.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {booking.type === 'carpool' ? 'Carpool Trip' : 'Vehicle Rental'}
                          </h3>
                          {booking.type === 'carpool' && booking.trip && (
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {booking.trip.from_destination} → {booking.trip.to_destination}
                            </p>
                          )}
                          {booking.type === 'vehicle' && booking.listing && (
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {booking.listing.vehicle_color} {booking.listing.vehicle_model}
                            </p>
                          )}
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Booked on {formatDate(booking.created_at)}
                          </p>
                        </div>
                        <div>
                          {booking.total_price && (
                            <p className="text-2xl font-bold text-blue-600">₹{booking.total_price}</p>
                          )}
                          <p className="text-sm text-gray-600 dark:text-gray-300">Total Cost</p>
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

          <TabsContent value="ratings" className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reviews ({ratings.length})</h2>
              
              {ratings.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-300">No reviews yet.</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Reviews will appear here once others rate you.</p>
                  </CardContent>
                </Card>
              ) : (
                ratings.map((rating) => (
                  <Card key={rating.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={rating.rater_profiles?.profile_photo_url || undefined} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                            {rating.rater_profiles?.name?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {rating.rater_profiles?.name || 'Anonymous'}
                            </h4>
                            <div className="flex items-center gap-1">
                              {renderStars(rating.rating)}
                            </div>
                          </div>
                          {rating.review && (
                            <p className="text-gray-600 dark:text-gray-300 mb-2">{rating.review}</p>
                          )}
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(rating.created_at)}
                          </p>
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
    </div>
  );
};

export default ProfilePage;
