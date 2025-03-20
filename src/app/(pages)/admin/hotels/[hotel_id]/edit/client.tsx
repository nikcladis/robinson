"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { HotelController } from "@/controllers/hotel.controller";
import { 
  updateHotelSchema, 
  initialUpdateHotelData,
  validateFormData
} from "@/validations/hotel.validation";

// Define a type from the Zod schema
type HotelFormData = z.infer<typeof updateHotelSchema>;

interface EditHotelFormProps {
  hotelId: string;
}

export default function EditHotelForm({ hotelId }: EditHotelFormProps) {
  const router = useRouter();
  
  const [formData, setFormData] = useState<HotelFormData>(initialUpdateHotelData);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [amenityInput, setAmenityInput] = useState("");

  // Fetch hotel data
  useEffect(() => {
    if (!hotelId) return;

    async function fetchHotel() {
      try {
        setIsLoading(true);
        setError(null);
    
        // Get hotel data from the controller
        const responseData = await HotelController.getHotelById(hotelId);
        
        // Handle response format (API returns {success: true, data: hotel} or direct hotel object)
        // Need to use type assertion since the response format varies
        const hotel = (responseData as any).data || responseData;
        
        console.log('Received hotel data:', hotel);
        
        if (!hotel) {
          throw new Error('No hotel data returned from server');
        }
        
        setFormData({
          name: hotel.name || "",
          description: hotel.description || "",
          address: hotel.address || "",
          city: hotel.city || "",
          country: hotel.country || "",
          postalCode: hotel.postalCode || "",
          starRating: hotel.starRating || 0,
          amenities: hotel.amenities || [],
          imageUrl: hotel.imageUrl || "",
        });
      } catch (err) {
        console.error('Error fetching hotel:', err);
        setError(err instanceof Error ? err.message : "An error occurred while fetching hotel data");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchHotel();
  }, [hotelId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Clear validation error when field is edited
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: name === "starRating" ? Number(value) : value,
    }));
  };

  const addAmenity = () => {
    if (amenityInput.trim() !== "") {
      setFormData((prev) => ({
        ...prev,
        amenities: [...(prev.amenities || []), amenityInput.trim()]
      }));
      setAmenityInput("");
    }
  };

  const removeAmenity = (index: number) => {
    if (!formData.amenities) return;
    
    const updatedAmenities = [...formData.amenities];
    updatedAmenities.splice(index, 1);
    setFormData((prev) => ({
      ...prev,
      amenities: updatedAmenities
    }));
  };

  const validateForm = (): boolean => {
    const result = validateFormData(updateHotelSchema, formData);
    setValidationErrors(result.errors);
    return result.isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError("Please fix the validation errors");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Create a clean object with all necessary properties explicitly set
      const hotelData = {
        name: formData.name,
        description: formData.description,
        address: formData.address,
        city: formData.city,
        country: formData.country,
        postalCode: formData.postalCode,
        starRating: formData.starRating,
        amenities: formData.amenities || [],
        imageUrl: formData.imageUrl || ""
      };
      
      const updatedHotel = await HotelController.updateHotel(hotelId, hotelData);
      router.push("/admin/hotels");
      router.refresh();
    } catch (err) {
      console.error('Error updating hotel:', err);
      setError(err instanceof Error ? err.message : "An error occurred while updating the hotel");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center p-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-md text-red-600 mb-6">
          {error}
        </div>
      )}

      <div className="bg-white shadow-sm rounded-lg p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Hotel Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border ${validationErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              />
              {validationErrors.name && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="starRating" className="block text-sm font-medium text-gray-700 mb-1">
                Star Rating *
              </label>
              <select
                id="starRating"
                name="starRating"
                value={formData.starRating}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border ${validationErrors.starRating ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              >
                <option value="0">Select rating</option>
                <option value="1">1 Star</option>
                <option value="2">2 Stars</option>
                <option value="3">3 Stars</option>
                <option value="4">4 Stars</option>
                <option value="5">5 Stars</option>
              </select>
              {validationErrors.starRating && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.starRating}</p>
              )}
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className={`w-full px-3 py-2 border ${validationErrors.description ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            ></textarea>
            {validationErrors.description && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Address *
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border ${validationErrors.address ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              />
              {validationErrors.address && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.address}</p>
              )}
            </div>

            <div>
              <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                Postal Code *
              </label>
              <input
                type="text"
                id="postalCode"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border ${validationErrors.postalCode ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              />
              {validationErrors.postalCode && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.postalCode}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                City *
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border ${validationErrors.city ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              />
              {validationErrors.city && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.city}</p>
              )}
            </div>

            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                Country *
              </label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border ${validationErrors.country ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              />
              {validationErrors.country && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.country}</p>
              )}
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Image URL
            </label>
            <input
              type="text"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl || ""}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${validationErrors.imageUrl ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              placeholder="https://example.com/image.jpg"
            />
            {validationErrors.imageUrl && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.imageUrl}</p>
            )}
            {formData.imageUrl && (
              <div className="mt-2">
                <img 
                  src={formData.imageUrl} 
                  alt="Hotel preview" 
                  className="h-32 w-auto object-cover rounded-md"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://via.placeholder.com/300x200?text=Invalid+Image+URL";
                  }}
                />
              </div>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amenities
            </label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={amenityInput}
                onChange={(e) => setAmenityInput(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add amenity (e.g. WiFi, Pool, Gym)"
              />
              <button
                type="button"
                onClick={addAmenity}
                className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.amenities && formData.amenities.map((amenity, index) => (
                <div key={index} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full flex items-center">
                  <span>{amenity}</span>
                  <button
                    type="button"
                    onClick={() => removeAmenity(index)}
                    className="ml-2 text-blue-500 hover:text-blue-700"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
            {validationErrors.amenities && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.amenities}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.push('/admin/hotels')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
} 