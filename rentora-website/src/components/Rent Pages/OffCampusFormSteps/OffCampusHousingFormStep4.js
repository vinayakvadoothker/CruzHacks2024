import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from "@clerk/clerk-react";
import { db } from "../../config";
import './styles.css';

const OffCampusHousingFormStep4 = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    phone: user?.phoneNumber || '',
  });

  useEffect(() => {
    if (user) {
      db.collection('SurveyResponses').doc(user.id).get()
        .then((doc) => {
          if (doc.exists) {
            setFormData(doc.data());
          }
        })
        .catch((error) => {
          console.error('Error fetching data:', error);
        });
    }
  }, [user]);

  const formatPhoneNumber = (value) => {
    if (!value) return value;

    const phoneNumber = value.replace(/[^\d]/g, '');
    const phoneNumberLength = phoneNumber.length;
    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 7) {
      return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3)}`;
    }
    return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  };

  const handleInputChange = (e) => {
    const formattedPhoneNumber = formatPhoneNumber(e.target.value);
    setFormData((prevData) => ({
      ...prevData,
      phone: formattedPhoneNumber,
    }));
  };

  const handleNext = () => {
    const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
    const isValid = phoneRegex.test(formData.phone);

    if (!isValid) {
      alert("Please enter a valid phone number in the format XXX-XXX-XXXX.");
      return;
    }

    const newFormData = {
      phone: formData.phone !== undefined ? formData.phone : '',
    };

    if (user) {

      db.collection('SurveyResponses').doc(user.id).update(newFormData)
        .then(() => {
          console.log("Document successfully updated!");
        })
        .catch((error) => {
          console.error("Error updating document: ", error);
        });
    } else {
      console.log("User not authenticated");
    }

    navigate('/rent/off-campus/step5');
  };

  return (
    <div className="form-container" >
    <h2 className="step-title">Confirm Phone Number</h2>
      <p className="step-description">Confirm This Is Your Phone Number*</p>

      <input
        type="text"
        placeholder="Phone Number"
        className="input-field"
        value={formData.phone}
        onChange={handleInputChange}
      />

      <Link to="/rent/off-campus/step3">
        <span className="back-button">{'<-'}</span>
      </Link>

      <button className="next-button" onClick={handleNext}>
        Next
      </button>
    </div>
  );
};

export default OffCampusHousingFormStep4;
