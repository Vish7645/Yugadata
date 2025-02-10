import React, { useState } from "react";
import axios from "axios";
import "./AdmissionForm.css"; // Import the CSS file

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
    <div className="container">
      <div className="form-card">
        <h2 className="form-title">Yoga Class Admission</h2>

        <form onSubmit={handleSubmit}>
          <input type="text" name="name" placeholder="Enter your name" required onChange={handleChange} />
          <input type="number" name="age" placeholder="Enter your age" required onChange={handleChange} />
          <input type="email" name="email" placeholder="Enter your email" required onChange={handleChange} />

          <button type="button" className="check-btn" onClick={checkEnrollment}>
            Check Enrollment
          </button>

          {!isEnrolled && (
            <>
              <input type="text" name="phone" placeholder="Enter your phone number" required onChange={handleChange} />
              <select name="batch" onChange={handleChange}>
                <option>6-7AM</option>
                <option>7-8AM</option>
                <option>8-9AM</option>
                <option>5-6PM</option>
              </select>
              <button type="submit" className="submit-btn">
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
