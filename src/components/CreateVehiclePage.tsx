
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Plus } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const CreateVehiclePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { type } = useParams<{ type: 'car' | 'bike' }>();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    vehicle_model: '',
    vehicle_color: '',
    vehicle_number_plate: '',
    rental_type: '' as 'short_term' | 'long_term' | '',
    rent_price: '',
    max_rental_period: '',
    city: '',
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
        .from('vehicle_listings')
        .insert({
          owner_id: profile.id,
          vehicle_type: type,
          vehicle_model: formData.vehicle_model,
          vehicle_color: formData.vehicle_color,
          vehicle_number_plate: formData.vehicle_number_plate,
          rental_type: formData.rental_type,
          rent_price: parseFloat(formData.rent_price),
          max_rental_period: parseInt(formData.max_rental_period),
          city: formData.city,
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: `${type === 'car' ? 'Car' : 'Bike'} listing created successfully!`,
      });
      
      navigate(`/${type}-rent`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create listing. Please try again.",
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

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => navigate(`/${type}-rent`)} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">List Your {type === 'car' ? 'Car' : 'Bike'}</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              {type === 'car' ? 'Car' : 'Bike'} Details
            </CardTitle>
            <CardDescription>
              Rent out your {type} and earn money when you're not using it
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vehicle_model">{type === 'car' ? 'Car' : 'Bike'} Model</Label>
                  <Input
                    id="vehicle_model"
                    name="vehicle_model"
                    placeholder={type === 'car' ? 'Honda City' : 'Honda Activa'}
                    value={formData.vehicle_model}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicle_color">Color</Label>
                  <Input
                    id="vehicle_color"
                    name="vehicle_color"
                    placeholder="White"
                    value={formData.vehicle_color}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicle_number_plate">Number Plate</Label>
                <Input
                  id="vehicle_number_plate"
                  name="vehicle_number_plate"
                  placeholder="KA01AB1234"
                  value={formData.vehicle_number_plate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  placeholder="Bangalore"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rental_type">Rental Type</Label>
                <Select value={formData.rental_type} onValueChange={(value) => handleSelectChange('rental_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select rental type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short_term">Short Term (Hourly)</SelectItem>
                    <SelectItem value="long_term">Long Term (Daily)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rent_price">
                    Rent Price (₹) per {formData.rental_type === 'short_term' ? 'Hour' : 'Day'}
                  </Label>
                  <Input
                    id="rent_price"
                    name="rent_price"
                    type="number"
                    placeholder={type === 'car' ? '500' : '100'}
                    value={formData.rent_price}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_rental_period">
                    Max Rental Period ({formData.rental_type === 'short_term' ? 'Hours' : 'Days'})
                  </Label>
                  <Input
                    id="max_rental_period"
                    name="max_rental_period"
                    type="number"
                    placeholder={formData.rental_type === 'short_term' ? '12' : '7'}
                    value={formData.max_rental_period}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating...' : `List ${type === 'car' ? 'Car' : 'Bike'}`}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateVehiclePage;
