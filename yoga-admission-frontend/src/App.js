import React, { useState } from "react";
import axios from "axios";

const AdmissionForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    email: "",
    phone: "",
    batch: "6-7AM",
  });
  const [isEnrolled, setIsEnrolled] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const checkEnrollment = async () => {
    if (!formData.email) {
      alert("Please enter an email to check enrollment.");
      return;
    }

    try {
      const response = await axios.get(`http://localhost:5000/check-enrollment/${formData.email}`);
      if (response.data.enrolled) {
        setIsEnrolled(true);
        alert(`You are already enrolled in batch ${response.data.user.batch_id} for this month.`);
      } else {
        setIsEnrolled(false);
        alert("You are not enrolled yet.");
      }
    } catch (error) {
      alert("Error checking enrollment. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.age < 18 || formData.age > 65) {
      alert("Age must be between 18 and 65.");
      return;
    }

    if (isEnrolled) {
      alert("You have already enrolled for this month.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/enroll", formData);
      alert(response.data.message);
    } catch (error) {
      alert(error.response?.data?.message || "Payment failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-300 to-blue-400 p-6">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">Yoga Class Admission</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" name="name" placeholder="Enter your name" required onChange={handleChange} className="w-full p-2 border rounded" />
          <input type="number" name="age" placeholder="Enter your age" required onChange={handleChange} className="w-full p-2 border rounded" />
          <input type="email" name="email" placeholder="Enter your email" required onChange={handleChange} className="w-full p-2 border rounded" />
          
          <button type="button" onClick={checkEnrollment} className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600">
            Check Enrollment
          </button>

          {!isEnrolled && (
            <>
              <input type="text" name="phone" placeholder="Enter your phone number" required onChange={handleChange} className="w-full p-2 border rounded" />
              <select name="batch" onChange={handleChange} className="w-full p-2 border rounded">
                <option>6-7AM</option>
                <option>7-8AM</option>
                <option>8-9AM</option>
                <option>5-6PM</option>
              </select>
              <button type="submit" className="w-full bg-green-500 text-white p-3 rounded hover:bg-green-600">
                Enroll & Pay ₹500
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default AdmissionForm;
