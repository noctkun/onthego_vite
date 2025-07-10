import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, User, Calendar, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  name: string;
  age: number;
  rating: number;
  total_ratings: number;
  profile_photo_url: string | null;
  user_type: 'new' | 'experienced';
}

interface UserProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
}

const UserProfileDialog = ({ open, onOpenChange, userId, userName }: UserProfileDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [ratings, setRatings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [ratingForm, setRatingForm] = useState({
    rating: 5,
    review: ''
  });
  const [showRatingForm, setShowRatingForm] = useState(false);

  useEffect(() => {
    if (open && userId) {
      fetchProfile();
      fetchRatings();
    }
  }, [open, userId]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchRatings = async () => {
    try {
      const { data, error } = await supabase
        .from('user_ratings')
        .select(`
          id,
          rating,
          review,
          created_at,
          rater_profiles:user_profiles!rater_user_id(name, profile_photo_url)
        `)
        .eq('rated_user_id', userId)
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

  const submitRating = async () => {
    if (!user || !profile) return;

    setLoading(true);

    try {
      // Get current user's profile
      const { data: currentUserProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profileError || !currentUserProfile) {
        toast({
          title: "Error",
          description: "Please complete your profile first.",
          variant: "destructive",
        });
        return;
      }

      // Check if user has already rated this person
      const { data: existingRating } = await supabase
        .from('user_ratings')
        .select('id')
        .eq('rater_user_id', currentUserProfile.id)
        .eq('rated_user_id', userId)
        .single();

      if (existingRating) {
        toast({
          title: "Already Rated",
          description: "You have already rated this user.",
          variant: "destructive",
        });
        return;
      }

      // Submit the rating
      const { error } = await supabase
        .from('user_ratings')
        .insert({
          rater_user_id: currentUserProfile.id,
          rated_user_id: userId,
          rating: ratingForm.rating,
          review: ratingForm.review || null,
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Success!",
        description: "Rating submitted successfully!",
      });

      setShowRatingForm(false);
      setRatingForm({ rating: 5, review: '' });
      
      // Refresh the profile and ratings with retry mechanism
      const refreshData = async (retryCount = 0) => {
        try {
          await fetchProfile();
          await fetchRatings();
          
          // If profile rating hasn't updated after 1 second, retry once
          if (retryCount === 0) {
            setTimeout(() => refreshData(1), 1000);
          }
        } catch (error) {
          console.error('Error refreshing data:', error);
        }
      };
      
      refreshData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit rating. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (!profile) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Profile</DialogTitle>
          <DialogDescription>
            View details and ratings for {profile.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={profile.profile_photo_url || undefined} />
                  <AvatarFallback>
                    <User className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{profile.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Age: {profile.age}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium">{profile.rating.toFixed(1)}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      ({profile.total_ratings} ratings)
                    </span>
                    <Badge variant={profile.user_type === 'experienced' ? 'default' : 'secondary'}>
                      {profile.user_type}
                    </Badge>
                  </div>
                </div>
                {user && (
                  <Button
                    onClick={() => setShowRatingForm(!showRatingForm)}
                    variant="outline"
                    size="sm"
                  >
                    Rate User
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Rating Form */}
          {showRatingForm && (
            <Card>
              <CardHeader>
                <CardTitle>Rate {profile.name}</CardTitle>
                <CardDescription>
                  Share your experience with this user
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Rating</Label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Button
                        key={star}
                        variant="ghost"
                        size="sm"
                        onClick={() => setRatingForm({ ...ratingForm, rating: star })}
                        className={ratingForm.rating >= star ? 'text-yellow-500' : 'text-gray-300'}
                      >
                        <Star className="h-5 w-5" />
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="review">Review (Optional)</Label>
                  <Textarea
                    id="review"
                    placeholder="Share your experience..."
                    value={ratingForm.review}
                    onChange={(e) => setRatingForm({ ...ratingForm, review: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={submitRating}
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? 'Submitting...' : 'Submit Rating'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowRatingForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Ratings List */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Ratings</CardTitle>
              <CardDescription>
                What others are saying about {profile.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ratings.length === 0 ? (
                <p className="text-center text-gray-600 dark:text-gray-300 py-4">
                  No ratings yet. Be the first to rate!
                </p>
              ) : (
                <div className="space-y-4">
                  {ratings.map((rating) => (
                    <div key={rating.id} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={rating.rater_profiles?.profile_photo_url || undefined} />
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{rating.rater_profiles?.name || 'Anonymous'}</span>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-3 w-3 ${rating.rating >= star ? 'text-yellow-500' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-500">
                              {formatDate(rating.created_at)}
                            </span>
                          </div>
                          {rating.review && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                              {rating.review}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileDialog; 