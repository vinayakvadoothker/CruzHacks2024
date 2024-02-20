import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SignUp from './SignUp';
import SignIn from './SignIn';
import './OnboardingPage.css';
import logo_with_background from './images/Rentora_Logo-With_Background.png';
import axios from 'axios';


/* IMAGES IMPORTS */

// Vin
import vin_image from './images/team-pictures/vin/vin.jpeg'
import vin_school_logo from './images/team-pictures/vin/vin-school.png'
import vin_company_logo from './images/team-pictures/vin/vin-work.png'

// Ashwin
import ashwin_image from './images/team-pictures/ashwin/ashwin.jpeg'
import ashwin_school_logo from './images/team-pictures/ashwin/ashwin-school.png'
import ashwin_company_logo from './images/team-pictures/ashwin/ashwin-work.png'

// Saumit
import saumit_image from './images/team-pictures/saumit/saumit.jpeg'
import saumit_school_logo from './images/team-pictures/saumit/saumit-school.png'
import saumit_company_logo from './images/team-pictures/saumit/saumit-work.png'

// Sasank
import sasank_image from './images/team-pictures/sasank/sasank.jpeg'
import sasank_school_logo from './images/team-pictures/sasank/sasank-school.png'
import sasank_company_logo from './images/team-pictures/sasank/sasank-work.png'

// Raghav
import raghav_image from './images/team-pictures/raghav/raghav.jpeg'
import raghav_school_logo from './images/team-pictures/raghav/raghav-school.png'
import raghav_company_logo from './images/team-pictures/raghav/raghav-work.png'

/* END IMAGES IMPORTS */


const OnboardingPage = () => {
  const [isSignUpPopupOpen, setSignUpPopupOpen] = useState(false);
  const [isSignInPopupOpen, setSignInPopupOpen] = useState(false);
  const [showAboutUs, setShowAboutUs] = useState(false); // State to control the display of About Us section
  const navigate = useNavigate();

  const handleSignUpClick = () => {
    setSignUpPopupOpen(true);
    setSignInPopupOpen(false);
  };

  const handleSignInClick = () => {
    setSignInPopupOpen(true);
    setSignUpPopupOpen(false);
  };

  const handleClosePopup = () => {
    setSignUpPopupOpen(false);
    setSignInPopupOpen(false);
    navigate('/onboarding');
  };

  const handleLearnMoreClick = () => {
    setShowAboutUs(true); // Show the About Us section and hide the hero content
  };


  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, message } = formData;

    try {
      const response = await axios.post('http://localhost:3001/send-email', {
        to: 'rentora.ai@gmail.com', // Your receiving email address
        subject: `Contact Form Message from ${name}`,
        html: `<p>Name: ${name}</p><p>Email: ${email}</p><p>Message: ${message}</p>`,
      });

      if (response.status === 200) {
        alert('Your message has been sent successfully!');
        setFormData({ name: '', email: '', message: '' }); // Clear the form
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('An error occurred while sending your message. Please try again.');
    }
  };


  
  return (
    <div className="onboarding-page">
      <nav className="top-nav">
        <a href="http://www.rentora.net" rel="noopener noreferrer">
          <img src={logo_with_background} alt="Rentora Logo" className="logo" />
        </a>
        <div className="nav-links">
          <Link to="#" className="sign-up-btn" onClick={handleSignUpClick}>
            Sign Up
          </Link>
          <Link to="#" className="sign-in-btn" onClick={handleSignInClick}>
            Sign In
          </Link>
        </div>
      </nav>
      {!showAboutUs && ( // Conditionally render hero content
        <div className="hero-content">
          <div className='Rentora-Title'>Rentora</div>
          <p className="tagline">Renting Made Easy</p>
          <div className="cta-buttons">
            <button className="learn-more-btn" onClick={handleLearnMoreClick}>
              Learn More
            </button>
          </div>
        </div>
      )}
      {showAboutUs && (
        <div className="container">
          <section className="our-mission">
            <h3>Our Mission</h3>
            <p>
              Rentora is committed to empowering students on their journey to finding the perfect home. This process can be daunting, especially for those navigating it for the first time. That's why we've crafted a comprehensive solution that guides you.
            </p>
          </section>
          <section className="about-us">
            <h2>About Rentora</h2>
            <p>
              At Rentora, we are driven by a singular mission – to simplify the
              process of finding off-campus housing for students. Recognizing the
              challenges that students face in securing suitable homes near their
              universities, we set out to create a platform that tackles these challenges.
            </p>
          </section>
          <section className="how-it-works">
            <h3>How it Works</h3>
            <ol>
              <li><strong>Sign Up or Log In:</strong>&nbsp;Create an account or log in to Rentora</li>
              <li><strong>Build Your Profile: </strong>&nbsp;Complete your user profile by filling out an easy-to-use form</li>
              <li><strong>AI Matching: </strong>&nbsp;Our AI matches you with suitable off-campus housing options</li>
              <li><strong>Rental Application: </strong>&nbsp;Rentora generates your Rental Application Packet</li>
              <li><strong>Submit with Confidence: </strong>&nbsp;Send your rental applications directly through Rentora</li>
            </ol>
          </section>
          <section class="faqs">
            <h3>FAQs</h3>
            <ul>
              <li>
                <details>
                  <summary >How does Rentora's AI matching work?</summary>
                  <p>Rentora's AI analyzes your profile, preferences, and requirements to suggest off-campus housing options that best match your criteria.</p>
                </details>
              </li>
              <li>
                <details>
                  <summary >Is Rentora only for students?</summary>
                  <p>While Rentora is designed with students in mind, anyone searching for housing can benefit from our platform.</p>
                </details>
              </li>
              <li>
                <details>
                  <summary >How do I create a Rentora account?</summary>
                  <p>Visit our homepage and click on the "Sign Up" button. Follow the prompts to create your account.</p>
                </details>
              </li>
              <li>
                <details>
                  <summary >What information should I include in my profile?</summary>
                  <p>Include details such as your budget, preferred location, housing requirements, and any specific preferences. The more information you provide, the more accurate your rental profile will be.</p>
                </details>
              </li>
              <li>
                <details>
                  <summary >How do I use the Rental Application Builder?</summary>
                  <p>Once you make an account, click on the Rent and Off-Campus buttons. Follow the prompts to create a comprehensive rental application that highlights your strengths.</p>
                </details>
              </li>
              <li>
                <details>
                  <summary >What happens after I submit my rental application?</summary>
                  <p>You'll be able to apply for listings! You'll also stay informed about landlord responses, property availability, and any other relevant information.</p>
                </details>
              </li>
              <li>
                <details>
                  <summary >Can I edit my profile or application after submission?</summary>
                  <p>Yes, you can edit your profile and applications at any time through your Rentora account.</p>
                </details>
              </li>
              <li>
                <details>
                  <summary >Are there any fees for using Rentora?</summary>
                  <p>Rentora charges a $30 per application fee. However, landlords may have their own rental application fees or other associated costs.</p>
                </details>
              </li>
              <li>
                <details>
                  <summary >How do I contact Rentora's support team?</summary>
                  <p>You can reach our support team by visiting the "Contact Us" page at the bottom of our website or this page.</p>
                </details>
              </li>
              <li>
                <details>
                  <summary >Do you have resources for first-time renters?</summary>
                  <p>Yes, our Rental Application Builder is a valuable hub for rental-related information. Whether you're a first-time renter or experienced tenant, we will assist you.</p>
                </details>
              </li>
              <li>
                <details>
                  <summary >How do I deactivate my Rentora account?</summary>
                  <p>You can deactivate your account by contacting our support team through the contact form. Keep in mind that deactivating your account will remove all your data, including applications and preferences.</p>
                </details>
              </li>
            </ul>
          </section>
          <section className="team">
            <h3>Team</h3>
            <div class="team-members">

              <div class="team-member">
                <a href="https://linkedin.com/in/vinayakvadoothker" target="_blank" rel="noopener noreferrer">
                  <img src={vin_image} alt="Member Name" class="member-photo" />
                </a>

                <h4 class="member-name">Vin Vadoothker</h4>
                
                <p class="member-title">Founder and Chief Executive Officer</p>
                
                <div class="logos">

                <a href="https://www.ucsc.edu/" target="_blank" rel="noopener noreferrer">
                  <img src={vin_school_logo} alt="College Name" class="college-logo" />
                  </a>

                  <a href="https://www.cisco.com/" target="_blank" rel="noopener noreferrer">
                  <img src={vin_company_logo} alt="Company Name" class="company-logo" />
                  </a>

                </div>
              </div>

              <div class="team-member">
                <a href="https://www.linkedin.com/in/ashwin-marichetty/" target="_blank" rel="noopener noreferrer">
                  <img src={ashwin_image} alt="Member Name" class="member-photo" />
                </a>

                <h4 class="member-name">Ashwin Marichetty</h4>
                
                <p class="member-title">Chief Design Officer</p>
                
                <div class="logos">

                <a href="https://www.ucsc.edu/" target="_blank" rel="noopener noreferrer">
                  <img src={ashwin_school_logo} alt="College Name" class="college-logo" />
                  </a>

                  <a href="https://www.ucsc.edu/" target="_blank" rel="noopener noreferrer">
                  <img src={ashwin_company_logo} alt="Company Name" class="company-logo" />
                  </a>

                </div>
              </div>

              <div class="team-member">
                <a href="https://www.linkedin.com/in/saumit-vedula/" target="_blank" rel="noopener noreferrer">
                  <img src={saumit_image} alt="Member Name" class="member-photo" />
                </a>

                <h4 class="member-name">Saumit Vedula</h4>
                
                <p class="member-title">Chief Architect</p>
                
                <div class="logos">

                <a href="https://www.ucsc.edu/" target="_blank" rel="noopener noreferrer">
                  <img src={saumit_school_logo} alt="College Name" class="college-logo" />
                  </a>

                  <a href="https://www.eminds.ai/" target="_blank" rel="noopener noreferrer">
                  <img src={saumit_company_logo} alt="Company Name" class="company-logo" />
                  </a>

                </div>
              </div>

              <div class="team-member">
                <a href="https://www.linkedin.com/in/sasankgamini/" target="_blank" rel="noopener noreferrer">
                  <img src={sasank_image} alt="Member Name" class="member-photo" />
                </a>

                <h4 class="member-name">Sasank Gamini</h4>
                
                <p class="member-title">Chief Product Officer</p>
                
                <div class="logos">

                <a href="https://www.ucsc.edu/" target="_blank" rel="noopener noreferrer">
                  <img src={sasank_school_logo} alt="College Name" class="college-logo" />
                  </a>

                  <a href="https://www.eminds.ai/" target="_blank" rel="noopener noreferrer">
                  <img src={sasank_company_logo} alt="Company Name" class="company-logo" />
                  </a>

                </div>
              </div>

              <div class="team-member">
                <a href="https://www.linkedin.com/in/raghav-dewangan//" target="_blank" rel="noopener noreferrer">
                  <img src={raghav_image} alt="Member Name" class="member-photo" />
                </a>

                <h4 class="member-name">Raghav Dewangan</h4>
                
                <p class="member-title">VP, Engineering</p>
                
                <div class="logos">

                <a href="https://www.ucsc.edu/" target="_blank" rel="noopener noreferrer">
                  <img src={raghav_school_logo} alt="College Name" class="college-logo" />
                  </a>

                  <a href="https://www.ucsc.edu/" target="_blank" rel="noopener noreferrer">
                  <img src={raghav_company_logo} alt="Company Name" class="company-logo" />
                  </a>

                </div>
              </div>


            </div>
          </section>
          <section className="contact-us">
  <h3>Contact Us</h3>
  <form onSubmit={handleSubmit}>
    <input
      type="text"
      name="name"
      placeholder="Your Name"
      required
      value={formData.name}
      onChange={handleChange}
    />
    <input
      type="email"
      name="email"
      placeholder="Your Email"
      required
      value={formData.email}
      onChange={handleChange}
    />
    <textarea
      name="message"
      placeholder="Your Message"
      required
      value={formData.message}
      onChange={handleChange}
    ></textarea>
    <button type="submit">Send</button>
  </form>
</section>

        </div>
      )}


      {(isSignUpPopupOpen || isSignInPopupOpen) && (
        <div className="popup-overlay">
          {isSignUpPopupOpen && <SignUp onClose={handleClosePopup} />}
          {isSignInPopupOpen && <SignIn onClose={handleClosePopup} />}
        </div>
      )}
    </div>
  );
};

export default OnboardingPage;
