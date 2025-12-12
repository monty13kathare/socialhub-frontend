import { useState, useEffect } from "react";
// import { BANNER_COLORS } from "../content/data";
import { getInitials } from "../utils/helper";
import { COUNTRIES_DATA } from "../content/locationData";
import type { Country, LocationData, State } from "../types/location";
import { BANNER_COLORS } from "../content/bannerColorData";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onSave: (updatedUser: any) => void;
  isLoading: boolean;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onSave,
  isLoading,
}) => {
  const [formData, setFormData] = useState({
    name: user.name,
    username: user.username,
    bio: user.bio,
    avatar: user.avatar,
    bannerColor:
      user.bannerColor || "bg-gradient-to-br from-purple-900 via-pink-700 to-orange-500",
    location: user.location || { country: "", state: "", city: "" },
  });

  const [avatarPreview, setAvatarPreview] = useState(user.avatar);
  const [isColorDropdownOpen, setIsColorDropdownOpen] = useState(false);

  // Location state
  const [countries] = useState<Country[]>(COUNTRIES_DATA);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);

  // Initialize location data when component mounts or user location changes
  useEffect(() => {
    if (formData.location?.country) {
      const selectedCountry = countries.find(
        (c) => c.name === formData.location.country
      );
      if (selectedCountry) {
        setStates(selectedCountry.states);

        if (formData.location?.state) {
          const selectedState = selectedCountry.states.find(
            (s) => s.name === formData.location.state
          );
          if (selectedState) {
            setCities(selectedState.cities);
          }
        }
      }
    }
  }, [formData.location, countries]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLocationChange = (field: keyof LocationData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value,
        // Reset dependent fields when parent field changes
        ...(field === "country" && { state: "", city: "" }),
        ...(field === "state" && { city: "" }),
      },
    }));

    // Update states and cities when country or state changes
    if (field === "country") {
      const selectedCountry = countries.find((c) => c.name === value);
      setStates(selectedCountry?.states || []);
      setCities([]);
    } else if (field === "state") {
      const selectedCountry = countries.find(
        (c) => c.name === formData.location.country
      );
      const selectedState = selectedCountry?.states.find(
        (s) => s.name === value
      );
      setCities(selectedState?.cities || []);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // setSelectedFile(file);

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);

      // Update formData with the file object for actual upload
      setFormData((prev) => ({
        ...prev,
        avatar: file, // Store the file object instead of data URL for upload
      }));
    }
  };

  const handleBannerColorSelect = (colorValue: string) => {
    setFormData((prev) => ({
      ...prev,
      bannerColor: colorValue,
    }));
    setIsColorDropdownOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // onSave(formData);
    const { country, state, city } = formData.location;

    const updatedData = {
      ...formData,
      location: { country, state, city },
    };

    onSave(updatedData);
    onClose();
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview("");
    // setSelectedFile(null);
    setFormData((prev) => ({
      ...prev,
      avatar: "",
    }));
  };

  const getSelectedColorName = () => {
    const selectedColor = BANNER_COLORS.find(
      (color) => color.value === formData.bannerColor
    );
    return selectedColor?.name || "Custom Color";
  };

  const getDisplayLocation = () => {
    const { country, state, city } = formData.location;
    if (!country) return "Select Location";

    let display = country;
    if (state) display += `, ${state}`;
    if (city) display += `, ${city}`;

    return display;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-800 rounded-2xl w-full max-w-2xl border border-slate-700/50 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-700/50 shrink-0">
          <h2 className="text-lg md:text-xl font-bold text-white">
            Edit Profile
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <svg
              className="w-5 h-5 md:w-6 md:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-4 md:p-6 overflow-y-auto flex-1 custom-scrollbar"
        >
          {/* Avatar Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Profile Picture
            </label>
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-linear-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-base sm:text-lg font-bold overflow-hidden shrink-0">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  getInitials(formData.name)
                )}
              </div>

              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="avatar-upload"
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="inline-block px-4 py-2 bg-slate-700/50 text-white rounded-xl hover:bg-slate-600/50 transition-all cursor-pointer text-sm text-center"
                  >
                    Upload Photo
                  </label>

                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="px-4 py-2 bg-rose-600/20 text-rose-400 rounded-xl hover:bg-rose-600/30 transition-all text-sm text-center"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <p className="text-slate-400 text-xs mt-2">
                  JPG, PNG or GIF. Max 5MB.
                </p>
              </div>
            </div>
          </div>
          {/* Banner Color Select */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Banner Color
            </label>

            {/* Banner Color Preview */}
            <div
              className={`h-16 md:h-20 rounded-xl mb-4 ${formData.bannerColor}`}
            ></div>

            {/* Dropdown Select */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsColorDropdownOpen(!isColorDropdownOpen)}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white text-left focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-6 h-6 rounded-md ${formData.bannerColor} border border-slate-400/30`}
                  ></div>
                  <span className="text-sm md:text-base">
                    {getSelectedColorName()}
                  </span>
                </div>
                <svg
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                    isColorDropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isColorDropdownOpen && (
                <>
                  {/* Backdrop for mobile */}
                  <div
                    className="fixed inset-0 z-40 md:hidden"
                    onClick={() => setIsColorDropdownOpen(false)}
                  />

                  <div className="absolute z-50 w-full mt-2 bg-slate-700 border border-slate-600/50 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    <div className="p-2">
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                        {BANNER_COLORS.map((color) => (
                          <button
                            key={color.name}
                            type="button"
                            onClick={() => handleBannerColorSelect(color.value)}
                            className={`p-3 rounded-lg text-left hover:bg-slate-600/50 transition-all ${
                              formData.bannerColor === color.value
                                ? "bg-slate-600 ring-2 ring-purple-500"
                                : "bg-slate-700/50"
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div
                                className={`w-8 h-8 rounded-md ${color.value} border border-slate-400/30 shrink-0`}
                              ></div>
                              <div className="min-w-0 flex-1">
                                <div className="text-white text-sm font-medium truncate">
                                  {color.name}
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Location Dropdown */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Location
            </label>

            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setIsLocationDropdownOpen(!isLocationDropdownOpen)
                }
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white text-left focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent flex items-center justify-between"
              >
                <span className="text-sm md:text-base truncate">
                  {getDisplayLocation()}
                </span>
                <svg
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                    isLocationDropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Location Dropdown Menu */}
              {isLocationDropdownOpen && (
                <>
                  {/* Backdrop for mobile */}
                  <div
                    className="fixed inset-0 z-40 md:hidden"
                    onClick={() => setIsLocationDropdownOpen(false)}
                  />

                  <div className="absolute z-50 w-full mt-2 bg-slate-700 border border-slate-600/50 rounded-xl shadow-lg max-h-80 overflow-y-auto">
                    <div className="p-4 space-y-4">
                      {/* Country Select */}
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Country
                        </label>
                        <select
                          value={formData.location.country}
                          onChange={(e) =>
                            handleLocationChange("country", e.target.value)
                          }
                          className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        >
                          <option value="">Select Country</option>
                          {countries.map((country) => (
                            <option key={country.code} value={country.name}>
                              {country.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* State Select */}
                      {formData.location.country && (
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            State/Province
                          </label>
                          <select
                            value={formData.location.state}
                            onChange={(e) =>
                              handleLocationChange("state", e.target.value)
                            }
                            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                          >
                            <option value="">Select State</option>
                            {states.map((state) => (
                              <option key={state.code} value={state.name}>
                                {state.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* City Select */}
                      {formData.location.state && (
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            City
                          </label>
                          <select
                            value={formData.location.city}
                            onChange={(e) =>
                              handleLocationChange("city", e.target.value)
                            }
                            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                          >
                            <option value="">Select City</option>
                            {cities.map((city) => (
                              <option key={city} value={city}>
                                {city}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex space-x-3 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              location: { country: "", state: "", city: "" },
                            }));
                            setStates([]);
                            setCities([]);
                          }}
                          className="flex-1 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-all text-sm"
                        >
                          Clear
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsLocationDropdownOpen(false)}
                          className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all text-sm"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Name */}
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-slate-300 mb-2"
            >
              Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm md:text-base"
              placeholder="Enter your name"
            />
          </div>

          {/* Username */}
          <div className="mb-4">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-slate-300 mb-2"
            >
              Username *
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm md:text-base"
              placeholder="Enter your username"
            />
          </div>

          {/* Bio */}
          <div className="mb-6">
            <label
              htmlFor="bio"
              className="block text-sm font-medium text-slate-300 mb-2"
            >
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm md:text-base"
              placeholder="Tell everyone about yourself..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t border-slate-700/50">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-slate-700/50 text-white rounded-xl hover:bg-slate-600/50 transition-all font-semibold text-sm md:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-1 px-6 py-3 bg-linear-to-r ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              } from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-semibold text-sm md:text-base`}
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
