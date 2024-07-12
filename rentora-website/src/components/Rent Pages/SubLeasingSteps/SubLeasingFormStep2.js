import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { db } from "../../config";
import { useUser } from "@clerk/clerk-react";

const SubleasingFormStep2 = () => {
    const { user } = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is authenticated
        if (!user) {
            console.log("User not authenticated");
            navigate('/login'); // Redirect to login page if not authenticated
        }
    }, [user, navigate]);

    const handleSubmit = async (event) => {
        event.preventDefault(); // Prevent default form submission

        try {
            // Generate PDF
            const response = await axios.get(`https://cruz-hacks2024.vercel.app/api/generate-pdf/${user.id}`, {
                responseType: 'blob',
            });

            if (response.data) {
                // Create a URL for the PDF blob
                const url = window.URL.createObjectURL(new Blob([response.data]));
                // Create a link to download the file
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'file.pdf'); // Set the default download file name
                document.body.appendChild(link);
                link.click(); // Trigger the download
                link.parentNode.removeChild(link);
            }
        } catch (error) {
            console.error("Error during PDF generation:", error);
            alert('Error generating PDF. Please try again.');
        }
    };

    return (
        <div className="form-container">
            <h2 className="step-title">Generate Your Document</h2>
            <form onSubmit={handleSubmit}>
                <button className="submit-button" type="submit">Generate PDF</button>
            </form>
        </div>
    );
};

export default SubleasingFormStep2;
