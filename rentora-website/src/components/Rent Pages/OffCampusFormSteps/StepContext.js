import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from "../../config"; 
import { useUser } from "@clerk/clerk-react"; 

const StepContext = createContext();

export const useSteps = () => useContext(StepContext);

export const StepProvider = ({ children }) => {
    const stepTitles = [
      "Select Your School",
      "Name and Date of Birth",
      "Email",
      "Phone Number",
      "Cover Picture",
      "Profile Builder",
      "ID #",
      "State/Country of Residence",
      "Major/Area of Study",
      "Dates of Enrollment",
      "Employment History",
      "Extracurricular Activities",
      "Tenant History",
      "Monthly Income",
      "Current Bank Accounts",
      "Current Credit Cards",
      "Reference Contacts",
      "Photo ID",
      "Letter of Reference",
      "Rental Certificate",
      "Letter of Guarantor",
      "Vehicle Information",
      "Final Review"
    ];

    const [steps, setSteps] = useState(Array.from({ length: 23 }, (_, i) => ({
      title: stepTitles[i],
      completed: false,
    })));

    const { user } = useUser(); // Get the currently logged-in user

    // Function to update the completion status in the local state and Firebase
    const completeStep = (index) => {
        const newSteps = [...steps];
        newSteps[index].completed = true;
        setSteps(newSteps); // Update local state

        // Update Firebase if the user is logged in
        if (user) {
            db.collection('StepsCompleted').doc(user.id).set({
                [index]: true
            }, { merge: true });
        }
    };

    useEffect(() => {
        if (user) {
          const unsubscribe = db.collection('StepsCompleted').doc(user.id).onSnapshot(doc => {
            if (doc.exists) {
              const data = doc.data();
              setSteps(prevSteps => // Use a function to get the previous state
                prevSteps.map((step, index) => ({
                  ...step,
                  completed: data[index] === true
                }))
              );
            }
          });
      
          // Clean up the listener when the component unmounts or the user changes
          return () => unsubscribe();
        }
      }, [user]); 

return (
    <StepContext.Provider value={{ steps, completeStep }}>
        {children}
    </StepContext.Provider>
);
};