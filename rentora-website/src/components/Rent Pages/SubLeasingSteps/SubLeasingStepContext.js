import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from "../../config"; 
import { useUser } from "@clerk/clerk-react"; 

const SubLeasingStepContext = createContext();

export const useSubLeasingSteps = () => useContext(SubLeasingStepContext);

export const SubLeasingStepProvider = ({ children }) => {
    const stepTitles = [
      "Step 1: Basic Information",
      "Step 2: Detailed Information",
      "Step 3: Submit"
    ];

    const [steps, setSteps] = useState(Array.from({ length: stepTitles.length }, (_, i) => ({
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
            db.collection('StepsCompletedSubleasing').doc(user.id).set({
                [index]: true
            }, { merge: true });
        }
    };

    useEffect(() => {
        if (user) {
          const unsubscribe = db.collection('StepsCompletedSubleasing').doc(user.id).onSnapshot(doc => {
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
    <SubLeasingStepContext.Provider value={{ steps, completeStep }}>
      {children}
    </SubLeasingStepContext.Provider>
  );
};