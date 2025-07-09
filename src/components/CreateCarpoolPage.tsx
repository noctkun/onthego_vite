
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const CreateCarpoolPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    from_destination: '',
    to_destination: '',
    start_time: '',
    reach_time: '',
    price_per_head: '',
    total_seats: '',
    car_number_plate: '',
    car_model: '',
    car_color: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      // Get user profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) {
        toast({
          title: "Error",
          description: "Profile not found. Please complete your profile first.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('carpool_trips')
        .insert({
          driver_id: profile.id,
          from_destination: formData.from_destination,
          to_destination: formData.to_destination,
          start_time: formData.start_time,
          reach_time: formData.reach_time,
          price_per_head: parseFloat(formData.price_per_head),
          total_seats: parseInt(formData.total_seats),
          available_seats: parseInt(formData.total_seats),
          car_number_plate: formData.car_number_plate,
          car_model: formData.car_model,
          car_color: formData.car_color,
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Carpool trip created successfully!",
      });
      
      navigate('/carpool');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create carpool trip. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => navigate('/carpool')} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Create Carpool Trip</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Trip Details
            </CardTitle>
            <CardDescription>
              Share your ride and split the cost with other passengers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="from_destination">From</Label>
                  <Input
                    id="from_destination"
                    name="from_destination"
                    placeholder="Departure location"
                    value={formData.from_destination}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="to_destination">To</Label>
                  <Input
                    id="to_destination"
                    name="to_destination"
                    placeholder="Destination"
                    value={formData.to_destination}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_time">Departure Time</Label>
                  <Input
                    id="start_time"
                    name="start_time"
                    type="datetime-local"
                    value={formData.start_time}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reach_time">Arrival Time</Label>
                  <Input
                    id="reach_time"
                    name="reach_time"
                    type="datetime-local"
                    value={formData.reach_time}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price_per_head">Price per Person (₹)</Label>
                  <Input
                    id="price_per_head"
                    name="price_per_head"
                    type="number"
                    placeholder="150"
                    value={formData.price_per_head}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="total_seats">Available Seats</Label>
                  <Input
                    id="total_seats"
                    name="total_seats"
                    type="number"
                    placeholder="4"
                    min="1"
                    max="8"
                    value={formData.total_seats}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Car Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="car_model">Car Model</Label>
                    <Input
                      id="car_model"
                      name="car_model"
                      placeholder="Honda City"
                      value={formData.car_model}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="car_color">Car Color</Label>
                    <Input
                      id="car_color"
                      name="car_color"
                      placeholder="White"
                      value={formData.car_color}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="car_number_plate">Number Plate</Label>
                    <Input
                      id="car_number_plate"
                      name="car_number_plate"
                      placeholder="KA01AB1234"
                      value={formData.car_number_plate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating...' : 'Create Trip'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateCarpoolPage;
