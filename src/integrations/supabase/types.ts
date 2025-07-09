export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      carpool_bookings: {
        Row: {
          booking_status: string | null
          created_at: string | null
          id: string
          passenger_id: string | null
          phone_number: string
          pickup_location: string
          pickup_time: string
          trip_id: string | null
        }
        Insert: {
          booking_status?: string | null
          created_at?: string | null
          id?: string
          passenger_id?: string | null
          phone_number: string
          pickup_location: string
          pickup_time: string
          trip_id?: string | null
        }
        Update: {
          booking_status?: string | null
          created_at?: string | null
          id?: string
          passenger_id?: string | null
          phone_number?: string
          pickup_location?: string
          pickup_time?: string
          trip_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "carpool_bookings_passenger_id_fkey"
            columns: ["passenger_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carpool_bookings_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "carpool_trips"
            referencedColumns: ["id"]
          },
        ]
      }
      carpool_trips: {
        Row: {
          available_seats: number
          car_color: string
          car_model: string
          car_number_plate: string
          created_at: string | null
          driver_id: string | null
          from_destination: string
          id: string
          price_per_head: number
          reach_time: string
          start_time: string
          status: Database["public"]["Enums"]["trip_status"] | null
          to_destination: string
          total_seats: number
          updated_at: string | null
        }
        Insert: {
          available_seats: number
          car_color: string
          car_model: string
          car_number_plate: string
          created_at?: string | null
          driver_id?: string | null
          from_destination: string
          id?: string
          price_per_head: number
          reach_time: string
          start_time: string
          status?: Database["public"]["Enums"]["trip_status"] | null
          to_destination: string
          total_seats: number
          updated_at?: string | null
        }
        Update: {
          available_seats?: number
          car_color?: string
          car_model?: string
          car_number_plate?: string
          created_at?: string | null
          driver_id?: string | null
          from_destination?: string
          id?: string
          price_per_head?: number
          reach_time?: string
          start_time?: string
          status?: Database["public"]["Enums"]["trip_status"] | null
          to_destination?: string
          total_seats?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "carpool_trips_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_stops: {
        Row: {
          created_at: string | null
          id: string
          stop_location: string
          stop_order: number
          stop_time: string
          trip_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          stop_location: string
          stop_order: number
          stop_time: string
          trip_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          stop_location?: string
          stop_order?: number
          stop_time?: string
          trip_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trip_stops_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "carpool_trips"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          age: number
          created_at: string | null
          id: string
          name: string
          profile_photo_url: string | null
          rating: number | null
          total_ratings: number | null
          updated_at: string | null
          user_id: string
          user_type: Database["public"]["Enums"]["user_type"] | null
        }
        Insert: {
          age: number
          created_at?: string | null
          id?: string
          name: string
          profile_photo_url?: string | null
          rating?: number | null
          total_ratings?: number | null
          updated_at?: string | null
          user_id: string
          user_type?: Database["public"]["Enums"]["user_type"] | null
        }
        Update: {
          age?: number
          created_at?: string | null
          id?: string
          name?: string
          profile_photo_url?: string | null
          rating?: number | null
          total_ratings?: number | null
          updated_at?: string | null
          user_id?: string
          user_type?: Database["public"]["Enums"]["user_type"] | null
        }
        Relationships: []
      }
      user_ratings: {
        Row: {
          created_at: string | null
          id: string
          rated_user_id: string | null
          rater_user_id: string | null
          rating: number
          review: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          rated_user_id?: string | null
          rater_user_id?: string | null
          rating: number
          review?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          rated_user_id?: string | null
          rater_user_id?: string | null
          rating?: number
          review?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_ratings_rated_user_id_fkey"
            columns: ["rated_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_ratings_rater_user_id_fkey"
            columns: ["rater_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_bookings: {
        Row: {
          booking_status: string | null
          created_at: string | null
          from_date: string
          from_time: string
          id: string
          listing_id: string | null
          renter_id: string | null
          renter_name: string
          to_date: string
          to_time: string
          total_price: number
        }
        Insert: {
          booking_status?: string | null
          created_at?: string | null
          from_date: string
          from_time: string
          id?: string
          listing_id?: string | null
          renter_id?: string | null
          renter_name: string
          to_date: string
          to_time: string
          total_price: number
        }
        Update: {
          booking_status?: string | null
          created_at?: string | null
          from_date?: string
          from_time?: string
          id?: string
          listing_id?: string | null
          renter_id?: string | null
          renter_name?: string
          to_date?: string
          to_time?: string
          total_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_bookings_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "vehicle_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_bookings_renter_id_fkey"
            columns: ["renter_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_listings: {
        Row: {
          city: string
          created_at: string | null
          id: string
          is_available: boolean | null
          latitude: number | null
          longitude: number | null
          max_rental_period: number
          owner_id: string | null
          photos: string[] | null
          rent_price: number
          rental_type: Database["public"]["Enums"]["rental_type"]
          updated_at: string | null
          vehicle_color: string
          vehicle_model: string
          vehicle_number_plate: string
          vehicle_type: Database["public"]["Enums"]["vehicle_type"]
        }
        Insert: {
          city: string
          created_at?: string | null
          id?: string
          is_available?: boolean | null
          latitude?: number | null
          longitude?: number | null
          max_rental_period: number
          owner_id?: string | null
          photos?: string[] | null
          rent_price: number
          rental_type: Database["public"]["Enums"]["rental_type"]
          updated_at?: string | null
          vehicle_color: string
          vehicle_model: string
          vehicle_number_plate: string
          vehicle_type: Database["public"]["Enums"]["vehicle_type"]
        }
        Update: {
          city?: string
          created_at?: string | null
          id?: string
          is_available?: boolean | null
          latitude?: number | null
          longitude?: number | null
          max_rental_period?: number
          owner_id?: string | null
          photos?: string[] | null
          rent_price?: number
          rental_type?: Database["public"]["Enums"]["rental_type"]
          updated_at?: string | null
          vehicle_color?: string
          vehicle_model?: string
          vehicle_number_plate?: string
          vehicle_type?: Database["public"]["Enums"]["vehicle_type"]
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_listings_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      rental_type: "short_term" | "long_term"
      trip_status: "active" | "completed" | "cancelled"
      user_type: "new" | "experienced"
      vehicle_type: "car" | "bike"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      rental_type: ["short_term", "long_term"],
      trip_status: ["active", "completed", "cancelled"],
      user_type: ["new", "experienced"],
      vehicle_type: ["car", "bike"],
    },
  },
} as const
