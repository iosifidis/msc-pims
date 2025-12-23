import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    username: "",
    password: "",
    role: "SECRETARY" // Default role
  });
  
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      // Prepare payload matching backend DTO
      const payload = {
        firstname: formData.firstname,
        lastname: formData.lastname,
        email: formData.email,
        username: formData.username,
        password: formData.password,
        role: formData.role
      };
      
      console.log("Sending registration payload:", payload);
      await register(payload);
      navigate("/login");
    } catch (err) {
      console.error("Registration error:", err);
      console.error("Error response data:", err.response?.data);
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-12">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">PIMS</h1>
          <p className="text-gray-600 text-sm">Create Your Account</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded mb-4 text-sm text-center">
            {error}
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* First Name */}
          <div>
            <label 
              htmlFor="firstname" 
              className="block text-sm font-medium text-gray-700"
            >
              First Name
            </label>
            <input
              type="text"
              id="firstname"
              name="firstname"
              value={formData.firstname}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your first name"
              required
            />
          </div>

          {/* Last Name */}
          <div>
            <label 
              htmlFor="lastname" 
              className="block text-sm font-medium text-gray-700"
            >
              Last Name
            </label>
            <input
              type="text"
              id="lastname"
              name="lastname"
              value={formData.lastname}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your last name"
              required
            />
          </div>

          {/* Username */}
          <div>
            <label 
              htmlFor="username" 
              className="block text-sm font-medium text-gray-700"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Choose a username"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label 
              htmlFor="email" 
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your.email@example.com"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label 
              htmlFor="password" 
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Create a strong password"
              required
            />
          </div>

          {/* Role Select */}
          <div>
            <label 
              htmlFor="role" 
              className="block text-sm font-medium text-gray-700"
            >
              Role
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="SECRETARY">Secretary</option>
              <option value="VET">Veterinarian</option>
              <option value="ADMIN">Administrator</option>
            </select>
          </div>

          {/* Register Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded mt-4 hover:bg-blue-700 font-medium transition-colors"
          >
            Create Account
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 hover:underline font-medium">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
