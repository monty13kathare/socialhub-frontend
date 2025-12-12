import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCommunity } from "../api/community";
import { BANNER_COLORS, mainCategories } from "../content/data";
import type { Community } from "../types/types";

interface FormError {
  field: string;
  message: string;
}

export default function CreateCommunity() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<FormError[]>([]);
  const [isColorDropdownOpen, setIsColorDropdownOpen] = useState(false);

  const [formData, setFormData] = useState<Community>({
    name: "",
    description: "",
    category: "",
    privacy: "public",
    tags: [],
    rules: [],
    bannerColor: "from-blue-500 to-cyan-500",
    allowImage: true,
    allowCode: true,
    allowPoll: true,
    allowAchievement: true,
    allowLink: true,
    requireApproval: false,
  });

  const [tagInput, setTagInput] = useState("");
  const [ruleInput, setRuleInput] = useState("");

  console.log("formData", formData);

  const handleBannerColorSelect = (colorValue: string) => {
    handleInputChange("bannerColor", colorValue);
    setIsColorDropdownOpen(false);
  };

  const getSelectedColorName = () => {
    const selectedColor = BANNER_COLORS.find(
      (color) => color.value === formData.bannerColor
    );
    return selectedColor?.name || "Custom Color";
  };

  const validateStep = (step: number): boolean => {
    const newErrors: FormError[] = [];

    if (step === 1) {
      if (!formData.name.trim()) {
        newErrors.push({
          field: "name",
          message: "Community name is required",
        });
      } else if (formData.name.length < 3) {
        newErrors.push({
          field: "name",
          message: "Community name must be at least 3 characters",
        });
      } else if (formData.name.length > 50) {
        newErrors.push({
          field: "name",
          message: "Community name must be less than 50 characters",
        });
      }

      if (!formData.description.trim()) {
        newErrors.push({
          field: "description",
          message: "Description is required",
        });
      } else if (formData.description.length < 10) {
        newErrors.push({
          field: "description",
          message: "Description must be at least 10 characters",
        });
      } else if (formData.description.length > 500) {
        newErrors.push({
          field: "description",
          message: "Description must be less than 500 characters",
        });
      }

      if (!formData.category) {
        newErrors.push({
          field: "category",
          message: "Please select a category",
        });
      }
    }

    if (step === 2) {
      if (formData.tags.length === 0) {
        newErrors.push({ field: "tags", message: "Add at least one tag" });
      } else if (formData.tags.length > 5) {
        newErrors.push({ field: "tags", message: "Maximum 5 tags allowed" });
      }

      if (formData.rules.length === 0) {
        newErrors.push({
          field: "rules",
          message: "Add at least one community rule",
        });
      } else if (formData.rules.length > 10) {
        newErrors.push({ field: "rules", message: "Maximum 10 rules allowed" });
      }
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(Math.min(currentStep + 1, 3));
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep(Math.max(currentStep - 1, 1));
  };

  const handleInputChange = (field: keyof Community, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear errors for this field when user starts typing
    setErrors((prev) => prev.filter((error) => error.field !== field));
  };

  const handleAddTag = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (tagInput.trim() && formData.tags.length < 5) {
      const newTag = tagInput.trim().toLowerCase();
      if (!formData.tags.includes(newTag)) {
        handleInputChange("tags", [...formData.tags, newTag]);
        setTagInput("");
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    handleInputChange(
      "tags",
      formData.tags.filter((tag) => tag !== tagToRemove)
    );
  };

  const handleAddRule = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (ruleInput.trim() && formData.rules.length < 10) {
      handleInputChange("rules", [...formData.rules, ruleInput.trim()]);
      setRuleInput("");
    }
  };

  const handleRemoveRule = (indexToRemove: number) => {
    handleInputChange(
      "rules",
      formData.rules.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRuleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddRule();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Agar final step nahi hai, toh next step pe jao
    if (currentStep < 3) {
      handleNextStep();
      return;
    }

    // Final step validation
    if (!validateStep(3)) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await createCommunity(formData);

      console.log("Community created:", response);
      navigate(-1);
    } catch (error) {
      console.error("Error creating community:", error);
      // Handle error state here
    } finally {
      setIsSubmitting(false);
    }
  };

  const getError = (field: string) => {
    return errors.find((error) => error.field === field)?.message;
  };

  const steps = [
    {
      number: 1,
      title: "Basic Info",
      description: "Community name and description",
    },
    { number: 2, title: "Settings", description: "Tags, rules, and privacy" },
    { number: 3, title: "Appearance", description: "Customize look and feel" },
  ];

  return (
    <div className="min-h-screen bg-slate-900 py-8">
      <div className="max-w-4xl mx-auto  sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Create Community
          </h1>
          <p className="text-slate-400">
            Build your own space and connect with like-minded people
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                    currentStep >= step.number
                      ? "bg-purple-600 border-purple-600 text-white"
                      : "border-slate-600 text-slate-400"
                  }`}
                >
                  {currentStep > step.number ? "✓" : step.number}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-16 h-1 transition-all duration-300 ${
                      currentStep > step.number
                        ? "bg-purple-600"
                        : "bg-slate-600"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Labels */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-8">
            {steps.map((step) => (
              <div
                key={step.number}
                className={`text-center transition-all duration-300 ${
                  currentStep === step.number ? "text-white" : "text-slate-400"
                }`}
              >
                <div className="text-sm font-semibold">{step.title}</div>
                <div className="text-xs text-slate-500">{step.description}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-3xl border border-slate-700/50 p-6 md:p-8">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Basic Information
                  </h2>
                  <p className="text-slate-400">Tell us about your community</p>
                </div>

                {/* Community Name */}
                <div>
                  <label
                    htmlFor="community-name"
                    className="block text-white font-medium mb-2"
                  >
                    Community Name *
                  </label>
                  <input
                    id="community-name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter community name (e.g., React Developers)"
                    className={`w-full bg-slate-800/50 border rounded-xl py-3 px-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                      getError("name")
                        ? "border-red-500 focus:ring-red-500/30"
                        : "border-slate-700/50 focus:ring-purple-500/30 focus:border-transparent"
                    }`}
                    maxLength={50}
                  />
                  {getError("name") && (
                    <p className="text-red-400 text-sm mt-2">
                      {getError("name")}
                    </p>
                  )}
                  <p className="text-slate-400 text-sm mt-2">
                    {formData.name.length}/50 characters
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label
                    htmlFor="community-description"
                    className="block text-white font-medium mb-2"
                  >
                    Description *
                  </label>
                  <textarea
                    id="community-description"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="Describe what your community is about..."
                    rows={4}
                    className={`w-full bg-slate-800/50 border rounded-xl py-3 px-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all duration-200 resize-none ${
                      getError("description")
                        ? "border-red-500 focus:ring-red-500/30"
                        : "border-slate-700/50 focus:ring-purple-500/30 focus:border-transparent"
                    }`}
                    maxLength={500}
                  />
                  {getError("description") && (
                    <p className="text-red-400 text-sm mt-2">
                      {getError("description")}
                    </p>
                  )}
                  <p className="text-slate-400 text-sm mt-2">
                    {formData.description.length}/500 characters
                  </p>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-white font-medium mb-2">
                    Category *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 h-80 overflow-y-scroll custom-scrollbar p-4">
                    {mainCategories.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() =>
                          handleInputChange("category", category.id)
                        }
                        className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                          formData.category === category.id
                            ? "border-purple-500 bg-purple-600/20"
                            : "border-slate-700/50 bg-slate-800/30 hover:border-slate-600"
                        }`}
                      >
                        <div className="text-2xl mb-2">{category.icon}</div>
                        <div className="text-white font-medium text-sm">
                          {category.name}
                        </div>
                      </button>
                    ))}
                  </div>
                  {getError("category") && (
                    <p className="text-red-400 text-sm mt-2">
                      {getError("category")}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Community Settings */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Community Settings
                  </h2>
                  <p className="text-slate-400">
                    Configure rules and privacy settings
                  </p>
                </div>

                {/* Privacy Settings */}
                <div>
                  <label className="block text-white font-medium mb-4">
                    Privacy Settings
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      {
                        value: "public",
                        title: "Public",
                        description: "Anyone can join and view content",
                        icon: "🌐",
                      },
                      {
                        value: "restricted",
                        title: "Restricted",
                        description:
                          "Anyone can view, but only approved members can post",
                        icon: "🔒",
                      },
                      {
                        value: "private",
                        title: "Private",
                        description: "Only approved members can view and post",
                        icon: "🚫",
                      },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          handleInputChange("privacy", option.value as any)
                        }
                        className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                          formData.privacy === option.value
                            ? "border-purple-500 bg-purple-600/20"
                            : "border-slate-700/50 bg-slate-800/30 hover:border-slate-600"
                        }`}
                      >
                        <div className="text-2xl mb-2">{option.icon}</div>
                        <div className="text-white font-medium mb-1">
                          {option.title}
                        </div>
                        <div className="text-slate-400 text-xs">
                          {option.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-white font-medium mb-2">
                    Tags *
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center space-x-1 bg-purple-600/20 text-purple-300 px-3 py-1 rounded-full text-sm border border-purple-500/30"
                      >
                        <span>#{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-purple-300 hover:text-white ml-1 text-lg leading-none"
                          aria-label={`Remove tag ${tag}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={handleTagKeyPress}
                      placeholder="Add a tag (e.g., programming)"
                      className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-xl py-2 px-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-transparent transition-all duration-200"
                      maxLength={20}
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      disabled={!tagInput.trim() || formData.tags.length >= 5}
                      className="px-4 py-2 bg-slate-700 text-slate-300 rounded-xl hover:bg-slate-600 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add
                    </button>
                  </div>
                  {getError("tags") && (
                    <p className="text-red-400 text-sm mt-2">
                      {getError("tags")}
                    </p>
                  )}
                  <p className="text-slate-400 text-sm mt-2">
                    {formData.tags.length}/5 tags • Tags help people discover
                    your community
                  </p>
                </div>

                {/* Community Rules */}
                <div>
                  <label className="block text-white font-medium mb-2">
                    Community Rules *
                  </label>
                  <div className="space-y-2 mb-3">
                    {formData.rules.map((rule, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-slate-800/30 p-3 rounded-xl border border-slate-700/50"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-slate-400 text-sm">
                            {index + 1}.
                          </span>
                          <span className="text-white text-sm">{rule}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveRule(index)}
                          className="text-slate-400 hover:text-red-400 transition-colors duration-200 text-lg leading-none"
                          aria-label={`Remove rule ${index + 1}`}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={ruleInput}
                      onChange={(e) => setRuleInput(e.target.value)}
                      onKeyPress={handleRuleKeyPress}
                      placeholder="Add a community rule..."
                      className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-xl py-2 px-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-transparent transition-all duration-200"
                      maxLength={200}
                    />
                    <button
                      type="button"
                      onClick={handleAddRule}
                      disabled={
                        !ruleInput.trim() || formData.rules.length >= 10
                      }
                      className="px-4 py-2 bg-slate-700 text-slate-300 rounded-xl hover:bg-slate-600 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add
                    </button>
                  </div>
                  {getError("rules") && (
                    <p className="text-red-400 text-sm mt-2">
                      {getError("rules")}
                    </p>
                  )}
                  <p className="text-slate-400 text-sm mt-2">
                    {formData.rules.length}/10 rules • Clear rules help maintain
                    a healthy community
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Appearance & Permissions */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Appearance & Permissions
                  </h2>
                  <p className="text-slate-400">
                    Customize how your community looks and works
                  </p>
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
                      onClick={() =>
                        setIsColorDropdownOpen(!isColorDropdownOpen)
                      }
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
                                  onClick={() =>
                                    handleBannerColorSelect(color.value)
                                  }
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

                {/* Content Permissions */}
                <div>
                  <label className="block text-white font-medium mb-4">
                    Content Permissions
                  </label>
                  <div className="space-y-3">
                    {[
                      {
                        key: "allowImage" as const,
                        label: "Allow image posts",
                        description: "Members can share images",
                      },
                      {
                        key: "allowCode" as const,
                        label: "Allow Code posts",
                        description: "Members can share Codes",
                      },
                      {
                        key: "allowPoll" as const,
                        label: "Allow Poll posts",
                        description: "Members can share Polls",
                      },
                      {
                        key: "allowAchievement" as const,
                        label: "Allow Achievement posts",
                        description: "Members can share Achievement",
                      },
                      {
                        key: "allowLink" as const,
                        label: "Allow link posts",
                        description: "Members can share external links",
                      },
                    ].map((permission) => (
                      <label
                        key={permission.key}
                        className="flex items-center justify-between p-4 rounded-xl border border-slate-700/50 bg-slate-800/30 hover:border-slate-600 transition-all duration-200 cursor-pointer"
                      >
                        <div>
                          <div className="text-white font-medium">
                            {permission.label}
                          </div>
                          <div className="text-slate-400 text-sm">
                            {permission.description}
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={formData[permission.key]}
                          onChange={(e) =>
                            handleInputChange(permission.key, e.target.checked)
                          }
                          className="w-5 h-5 text-purple-600 bg-slate-700 border-slate-600 rounded focus:ring-purple-500 focus:ring-2"
                        />
                      </label>
                    ))}
                  </div>
                </div>

                {/* Post Approval */}
                <div>
                  <label className="flex items-center justify-between p-4 rounded-xl border border-slate-700/50 bg-slate-800/30 hover:border-slate-600 transition-all duration-200 cursor-pointer">
                    <div>
                      <div className="text-white font-medium">
                        Require post approval
                      </div>
                      <div className="text-slate-400 text-sm">
                        All posts must be approved by moderators before
                        appearing
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.requireApproval}
                      onChange={(e) =>
                        handleInputChange("requireApproval", e.target.checked)
                      }
                      className="w-5 h-5 text-purple-600 bg-slate-700 border-slate-600 rounded focus:ring-purple-500 focus:ring-2"
                    />
                  </label>
                </div>

                {/* Community Preview */}
                <div>
                  <label className="block text-white font-medium mb-4">
                    Community Preview
                  </label>
                  <div className="bg-slate-800/30 rounded-2xl border border-slate-700/50 overflow-hidden">
                    <div className={`h-20 ${formData.bannerColor}`} />
                    <div className="p-6">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-16 h-16 bg-linear-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-2xl">
                          {formData.name.charAt(0).toUpperCase() || "C"}
                        </div>
                        <div>
                          <h3 className="text-white font-bold text-xl">
                            {formData.name || "Community Name"}
                          </h3>
                          <p className="text-slate-400 text-sm">
                            {formData.privacy === "public"
                              ? "Public Community"
                              : formData.privacy === "restricted"
                              ? "Restricted Community"
                              : "Private Community"}
                          </p>
                        </div>
                      </div>
                      <p className="text-slate-300 text-sm">
                        {formData.description ||
                          "Community description will appear here..."}
                      </p>
                      {formData.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {formData.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-slate-700/50 text-slate-300 text-xs rounded"
                            >
                              #{tag}
                            </span>
                          ))}
                          {formData.tags.length > 3 && (
                            <span className="px-2 py-1 bg-slate-700/50 text-slate-300 text-xs rounded">
                              +{formData.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex flex-col md:flex-row justify-between pt-8 border-t border-slate-700/50 mt-8">
              <button
                type="button"
                onClick={handlePreviousStep}
                disabled={currentStep === 1}
                className="px-6 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {currentStep < 3 ? (
                <button
                  type="submit"
                  // onClick={handleNextStep}
                  className="px-6 py-3 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-500 hover:to-pink-500 transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
                >
                  Next Step
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-500 hover:to-pink-500 transition-all duration-200 shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Creating Community...</span>
                    </div>
                  ) : (
                    "Create Community"
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
