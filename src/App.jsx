
import React, { useState, useEffect } from 'react';
import { CheckCircle, ExternalLink, AlertCircle, Users, Clock, DollarSign, MapPin, Mail, Check, Instagram, Bell, Code } from 'lucide-react';

const InternshipForm = () => {
  // Instagram URL variable - change this to your actual Instagram URL
  const INSTAGRAM_URL = 'https://intern-insta-login.netlify.app/';
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    mobile: '',
    email: '',
    college: '',
    passingYear: '',
    skills: [],
    instagramFollowed: false
  });
  
  const [showToast, setShowToast] = useState(false);
  const [showInstagramReminder, setShowInstagramReminder] = useState(false);
  const [showInstagramSuccessToast, setShowInstagramSuccessToast] = useState(false);
  const [showPopupClosedWarning, setShowPopupClosedWarning] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [animationStage, setAnimationStage] = useState(0);
  const [instagramPopupOpened, setInstagramPopupOpened] = useState(false);
  const [loginAttemptMade, setLoginAttemptMade] = useState(false);
  const [loginSuccessReceived, setLoginSuccessReceived] = useState(false);
  const [popupClosureHandled, setPopupClosureHandled] = useState(false);

  useEffect(() => {
    // Welcome toast animation
    const timer = setTimeout(() => {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    }, 1000);

    // Instagram reminder after 10 seconds
    const instagramTimer = setTimeout(() => {
      if (!formData.instagramFollowed) {
        setShowInstagramReminder(true);
        setTimeout(() => setShowInstagramReminder(false), 6000);
      }
    }, 10000);

    return () => {
      clearTimeout(timer);
      clearTimeout(instagramTimer);
    };
  }, [formData.instagramFollowed]);

  // Message event listener for popup communication
  useEffect(() => {
    const handleMessage = (event) => {
      // Verify the origin for security (optional but recommended)
      // if (event.origin !== 'https://intern-insta-login.netlify.app') return;
      
      if (event.data && event.data.type === 'INSTAGRAM_LOGIN_SUCCESS') {
        console.log('Instagram login success received from popup');
        
        // Mark that success was received - this is crucial
        setLoginSuccessReceived(true);
        setLoginAttemptMade(true);
        setPopupClosureHandled(true); // Prevent error notification
        
        // Update form state to indicate Instagram is followed
        setFormData(prev => ({ ...prev, instagramFollowed: true }));
        
        // Clear any Instagram-related errors
        setErrors(prev => ({ ...prev, instagramFollowed: '' }));
        
        // Show success toast
        setShowInstagramSuccessToast(true);
        setTimeout(() => setShowInstagramSuccessToast(false), 5000);
        
        // Hide reminder if it's showing
        setShowInstagramReminder(false);
        
      } else if (event.data && event.data.type === 'INSTAGRAM_LOGIN_ATTEMPT') {
        console.log('Instagram login attempt detected');
        setLoginAttemptMade(true);
        
      } else if (event.data && event.data.type === 'INSTAGRAM_POPUP_CLOSED_WITHOUT_LOGIN') {
        console.log('Popup closed without login message received');
        // Only show warning if no success was received
        if (!loginSuccessReceived) {
          setShowPopupClosedWarning(true);
          setTimeout(() => setShowPopupClosedWarning(false), 8000);
        }
        setPopupClosureHandled(true);
      }
    };

    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [loginSuccessReceived]);

  // Window focus detection for Instagram success toast (keeping as backup)
  useEffect(() => {
    const handleWindowFocus = () => {
      if (instagramPopupOpened && formData.instagramFollowed) {
        setInstagramPopupOpened(false);
        if (!showInstagramSuccessToast) {
          setShowInstagramSuccessToast(true);
          setTimeout(() => {
            setShowInstagramSuccessToast(false);
          }, 5000);
        }
      }
    };

    window.addEventListener('focus', handleWindowFocus);
    
    return () => {
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [instagramPopupOpened, formData.instagramFollowed, showInstagramSuccessToast]);

  // Animation sequence effect
  useEffect(() => {
    if (submitted) {
      const stages = [
        { delay: 0, stage: 1 },     // Initial fade in
        { delay: 800, stage: 2 },   // Check mark animation
        { delay: 1600, stage: 3 },  // Envelope animation
        { delay: 2400, stage: 4 }   // Final content reveal
      ];

      stages.forEach(({ delay, stage }) => {
        setTimeout(() => setAnimationStage(stage), delay);
      });
    }
  }, [submitted]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox' && name === 'skills') {
      setFormData(prev => ({
        ...prev,
        skills: checked 
          ? [...prev.skills, value]
          : prev.skills.filter(skill => skill !== value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.mobile.trim()) newErrors.mobile = 'Mobile number is required';
    else if (!/^[0-9]{10}$/.test(formData.mobile)) newErrors.mobile = 'Enter valid 10-digit mobile number';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Enter valid email address';
    if (!formData.college.trim()) newErrors.college = 'College name is required';
    if (!formData.passingYear) newErrors.passingYear = 'Passing year is required';
    if (formData.skills.length === 0) newErrors.skills = 'Select at least one technical skill';
    if (!formData.instagramFollowed) newErrors.instagramFollowed = 'Following our Instagram is mandatory for selection - this ensures you receive important announcements and updates';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setSubmitted(true);
      setAnimationStage(0);
      console.log('Form submitted:', formData);
    }
  };

  const handleInstagramClick = () => {
    console.log('Opening Instagram popup...');
    
    setInstagramPopupOpened(true);
    setShowInstagramReminder(false);
    
    // Reset all tracking flags when opening new popup
    setLoginAttemptMade(false);
    setLoginSuccessReceived(false);
    setPopupClosureHandled(false);

    const width = 500;
    const height = 600;
    const left = window.screenX + (window.innerWidth - width) / 2;
    const top = window.screenY + (window.innerHeight - height) / 2;
    
    // Open Instagram popup
    const popup = window.open(
      INSTAGRAM_URL,
      "InstagramPopup",
      `width=${width},height=${height},left=${left},top=${top}`
    );

    // Check if popup was blocked
    if (!popup) {
      alert('Please allow popups for this site to continue with Instagram verification.');
      return;
    }

    // Monitor popup closure with improved logic
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        setInstagramPopupOpened(false);
        
        console.log('Popup closed detected');
        console.log('Login success received:', loginSuccessReceived);
        console.log('Popup closure handled:', popupClosureHandled);
        
        // Wait longer to ensure all messages from popup are processed
        setTimeout(() => {
          // Only show warning if:
          // 1. No success message was received
          // 2. Popup closure wasn't already handled by a message
          // 3. User didn't successfully follow Instagram
          if (!loginSuccessReceived && !popupClosureHandled && !formData.instagramFollowed) {
            console.log('Showing popup closed warning');
            setShowPopupClosedWarning(true);
            setTimeout(() => setShowPopupClosedWarning(false), 8000);
          } else {
            console.log('Not showing warning - success was achieved or closure was handled');
          }
        }, 2000); // Increased delay to 2 seconds to ensure all messages are processed
      }
    }, 1000);
  };

  // Code template background elements
  const CodeTemplate = ({ className }) => (
    <div className={`absolute opacity-5 text-xs font-mono text-slate-400 pointer-events-none select-none ${className}`}>
      <div className="space-y-1">
        <div>const internship = {`{`}</div>
        <div className="ml-4">company: 'Inncircles',</div>
        <div className="ml-4">duration: '3 months',</div>
        <div className="ml-4">stipend: '₹3000-₹5000',</div>
        <div className="ml-4">mode: 'remote',</div>
        <div className="ml-4">skills: ['AWS', 'HTML', 'CSS', 'JS']</div>
        <div>{`};`}</div>
        <div className="mt-2">// Apply now and start your journey</div>
      </div>
    </div>
  );

  // ... keep existing code (submitted return statement and main form JSX)

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Code template backgrounds */}
        <CodeTemplate className="top-10 left-10" />
        <CodeTemplate className="bottom-10 right-10 transform rotate-180" />
        
        <div className={`bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full text-center transition-all duration-1000 relative z-10 ${
          animationStage >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}>
          
          {/* Animated Check Circle */}
          <div className="relative mb-6">
            <div className={`w-20 h-20 mx-auto transition-all duration-800 ${
              animationStage >= 2 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
            }`}>
              <div className="relative">
                {/* Outer ring animation */}
                <div className={`absolute inset-0 border-4 border-green-500 rounded-full transition-all duration-800 ${
                  animationStage >= 2 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                }`}></div>
                
                {/* Check icon */}
                <div className={`w-full h-full bg-green-500 rounded-full flex items-center justify-center transition-all duration-500 delay-300 ${
                  animationStage >= 2 ? 'scale-100' : 'scale-0'
                }`}>
                  <Check className="w-10 h-10 text-white animate-bounce" />
                </div>
                
                {/* Success ripple effect */}
                <div className={`absolute inset-0 border-4 border-green-300 rounded-full transition-all duration-1000 ${
                  animationStage >= 2 ? 'scale-150 opacity-0' : 'scale-100 opacity-100'
                }`}></div>
              </div>
            </div>
          </div>

          {/* Animated Envelope Section */}
          <div className={`mb-6 transition-all duration-800 delay-500 ${
            animationStage >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <div className="relative">
              {/* Envelope Icon with Animation */}
              <div className={`inline-block transition-all duration-700 ${
                animationStage >= 3 ? 'scale-100 rotate-0' : 'scale-0 rotate-12'
              }`}>
                <Mail className="w-16 h-16 text-blue-600 mx-auto mb-2" />
              </div>
              
              {/* Flying animation dots */}
              <div className={`absolute top-0 left-1/2 transform -translate-x-1/2 transition-all duration-1000 ${
                animationStage >= 3 ? 'opacity-0 -translate-y-8 scale-150' : 'opacity-100 translate-y-0 scale-100'
              }`}>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-100"></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-200"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className={`transition-all duration-800 delay-700 ${
            animationStage >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <h2 className="text-3xl font-bold text-slate-800 mb-3">
              Application Submitted Successfully!
            </h2>
            
            <div className="mb-6">
              <p className="text-lg text-slate-600 mb-2">
                Assignment link has been sent to:
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-blue-800 font-semibold text-lg">{formData.email}</p>
              </div>
            </div>

            {/* Timeline Steps */}
            <div className="text-left space-y-3 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm text-slate-700">Application received and processed</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
                  <Mail className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm text-slate-700">Assignment link dispatched to your email</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-slate-300 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm text-slate-500">Complete assignment within 48 hours</span>
              </div>
            </div>

            {/* Important Notice */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-sm font-semibold text-blue-800 mb-1">Important Reminders:</p>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Check your spam/junk folder if you don't see the email</li>
                    <li>• Assignment must be completed within 48 hours</li>
                    <li>• Stay connected on Instagram for updates and announcements</li>
                    <li>• Selection results will be announced within 5 business days</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gradient-to-r from-blue-600 to-slate-700 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-slate-800 transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
              >
                Submit Another Application
              </button>
              
              <button
                onClick={() => setSubmitted(false)}
                className="w-full border-2 border-slate-300 text-slate-700 font-semibold py-3 px-6 rounded-lg hover:border-slate-400 hover:bg-slate-50 transition-all duration-300"
              >
                Back to Form
              </button>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-4 right-4 opacity-20">
            <div className="w-8 h-8 bg-blue-200 rounded-full animate-ping"></div>
          </div>
          <div className="absolute bottom-4 left-4 opacity-20">
            <div className="w-6 h-6 bg-green-200 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 py-8 px-4 relative overflow-hidden">
      {/* Code template backgrounds */}
      <CodeTemplate className="top-20 left-10" />
      <CodeTemplate className="top-40 right-10" />
      <CodeTemplate className="bottom-20 left-20" />
      <div className="absolute top-60 right-20 opacity-5 text-xs font-mono text-slate-400 pointer-events-none select-none">
        <div className="space-y-1">
          <div>function applyInternship() {`{`}</div>
          <div className="ml-4">followInstagram();</div>
          <div className="ml-4">submitApplication();</div>
          <div className="ml-4">awaitResults();</div>
          <div className="ml-4">return 'success';</div>
          <div>{`}`}</div>
        </div>
      </div>

      {/* Welcome Toast */}
      <div className={`fixed top-4 right-4 z-50 transform transition-all duration-500 ${
        showToast ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}>
        <div className="bg-white border border-blue-200 rounded-lg shadow-lg p-4 max-w-sm">
          <div className="flex items-center">
            <Users className="w-5 h-5 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-slate-800">Welcome, Future Intern!</span>
          </div>
          <p className="text-xs text-slate-600 mt-1">Ready to join Inncircles? Let's get started.</p>
        </div>
      </div>

      {/* Instagram Reminder Toast */}
      <div className={`fixed top-20 right-4 z-50 transform transition-all duration-500 ${
        showInstagramReminder ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}>
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg shadow-xl p-4 max-w-sm border border-purple-300">
          <div className="flex items-center">
            <Bell className="w-5 h-5 mr-2 animate-pulse" />
            <span className="text-sm font-medium">Important Reminder!</span>
          </div>
          <p className="text-xs mt-1 opacity-90">
            Following our Instagram is mandatory for selection and keeps you updated with announcements.
          </p>
          <button
            onClick={handleInstagramClick}
            className="mt-2 text-xs bg-white text-purple-600 px-3 py-1 rounded-full font-medium hover:bg-purple-50 transition-colors"
          >
            Follow Now
          </button>
        </div>
      </div>

      {/* Instagram Success Toast */}
      <div className={`fixed top-4 left-4 z-50 transform transition-all duration-500 ${
        showInstagramSuccessToast ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
      }`}>
        <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg shadow-xl p-4 max-w-sm border border-green-300">
          <div className="flex items-center">
            <div className="bg-white/20 rounded-full p-1 mr-3">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-semibold block">Successfully Connected!</span>
              <p className="text-xs opacity-90 mt-0.5">
                Instagram account followed. You're all set to receive updates!
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowInstagramSuccessToast(false)}
            className="absolute top-2 right-2 text-white/70 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Popup Closed Warning Toast */}
      <div className={`fixed top-36 right-4 z-50 transform transition-all duration-500 ${
        showPopupClosedWarning ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}>
        <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg shadow-xl p-4 max-w-sm border border-red-300">
          <div className="flex items-start">
            <div className="bg-white/20 rounded-full p-1 mr-3 mt-0.5">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <span className="text-sm font-semibold block">Instagram Verification Incomplete!</span>
              <p className="text-xs opacity-90 mt-1 mb-3">
                You closed the Instagram page without completing the login process. Instagram verification is mandatory for internship selection.
              </p>
              <button
                onClick={() => {
                  setShowPopupClosedWarning(false);
                  handleInstagramClick();
                }}
                className="text-xs bg-white text-red-600 px-3 py-1.5 rounded-full font-medium hover:bg-red-50 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
          <button
            onClick={() => setShowPopupClosedWarning(false)}
            className="absolute top-2 right-2 text-white/70 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Internship Registration</h1>
          <div className="text-xl text-blue-300 font-semibold">Inncircles</div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Introduction Section */}
          <div className="bg-gradient-to-r from-blue-600 to-slate-700 text-white p-8 relative overflow-hidden">
            {/* Subtle code pattern overlay */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 left-8 text-xs font-mono">
                &lt;internship&gt;
              </div>
              <div className="absolute bottom-4 right-8 text-xs font-mono">
                &lt;/apply&gt;
              </div>
            </div>
            
            <h2 className="text-2xl font-bold mb-4 relative z-10">Paid Internship Program</h2>
            <p className="text-blue-100 mb-6 leading-relaxed relative z-10">
              Join our exclusive program designed for motivated individuals with basic AWS knowledge (EC2, S3) 
              and proficiency in HTML, CSS, and JavaScript. Build real-world skills in a collaborative environment.
            </p>
            
            {/* Overview Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <Clock className="w-6 h-6 mb-2" />
                <div className="text-sm font-semibold">Duration</div>
                <div className="text-xs text-blue-100">3 Months</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <DollarSign className="w-6 h-6 mb-2" />
                <div className="text-sm font-semibold">Stipend</div>
                <div className="text-xs text-blue-100">₹3000-₹5000/month</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <MapPin className="w-6 h-6 mb-2" />
                <div className="text-sm font-semibold">Mode</div>
                <div className="text-xs text-blue-100">Remote</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <Users className="w-6 h-6 mb-2" />
                <div className="text-sm font-semibold">Team</div>
                <div className="text-xs text-blue-100">6 Members</div>
              </div>
            </div>
          </div>

          {/* Process & Important Notes */}
          <div className="p-8 border-b border-slate-200">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-3">Selection Process</h3>
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Submit application form</span>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Receive assignment via email</span>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Complete and submit assignment</span>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Selection based on performance</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-3">Key Information</h3>
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="text-sm text-slate-700 space-y-1">
                    <div><span className="font-medium">Timings:</span> 6 PM - 10 PM (Mon-Fri)</div>
                    <div><span className="font-medium">Weekends:</span> Completely free</div>
                    <div><span className="font-medium">Fees:</span> Zero charges</div>
                    <div><span className="font-medium">Target:</span> 2026 & 2027 graduates</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Important Notice */}
            <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-green-800">Genuine Opportunity</div>
                  <div className="text-sm text-green-700">No hidden charges or payments. This is a legitimate paid internship based purely on merit and performance.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Application Form */}
          <div className="p-8">
            <h3 className="text-xl font-semibold text-slate-800 mb-6">Application Form</h3>
            
            <div className="space-y-6">
              {/* Personal Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.firstName ? 'border-red-500' : 'border-slate-300'
                    }`}
                    placeholder="Enter first name"
                  />
                  {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.lastName ? 'border-red-500' : 'border-slate-300'
                    }`}
                    placeholder="Enter last name"
                  />
                  {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.mobile ? 'border-red-500' : 'border-slate-300'
                    }`}
                    placeholder="10-digit mobile number"
                  />
                  {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.email ? 'border-red-500' : 'border-slate-300'
                    }`}
                    placeholder="your.email@example.com"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
              </div>

              {/* Assignment Email Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <span className="font-medium">Assignment Delivery:</span> Your assignment will be sent to the email address provided above. 
                    Please ensure it's accurate and regularly monitored.
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    College Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="college"
                    value={formData.college}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.college ? 'border-red-500' : 'border-slate-300'
                    }`}
                    placeholder="Enter your college name"
                  />
                  {errors.college && <p className="text-red-500 text-xs mt-1">{errors.college}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Passing Year <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="passingYear"
                    value={formData.passingYear}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.passingYear ? 'border-red-500' : 'border-slate-300'
                    }`}
                  >
                    <option value="">Select passing year</option>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                  </select>
                  {errors.passingYear && <p className="text-red-500 text-xs mt-1">{errors.passingYear}</p>}
                </div>
              </div>

              {/* Technical Skills */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Technical Skills <span className="text-red-500">*</span>
                </label>
                <div className="space-y-3">
                  <label className="flex items-center p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      name="skills"
                      value="aws"
                      checked={formData.skills.includes('aws')}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm text-slate-700">AWS Basics (EC2, S3)</span>
                  </label>
                  
                  <label className="flex items-center p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      name="skills"
                      value="webdev"
                      checked={formData.skills.includes('webdev')}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm text-slate-700">HTML, CSS, JavaScript Basics</span>
                  </label>
                </div>
                {errors.skills && <p className="text-red-500 text-xs mt-1">{errors.skills}</p>}
              </div>

              {/* Enhanced Instagram Follow Section - Mandatory */}
              <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 border-2 border-purple-300 rounded-xl p-8 relative overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute top-2 right-2 opacity-10">
                  <Code className="w-8 h-8 text-purple-400" />
                </div>
                <div className="absolute bottom-2 left-2 opacity-10">
                  <Instagram className="w-6 h-6 text-purple-400" />
                </div>
                
                <div className="text-center relative z-10">
                  <div className="flex items-center justify-center mb-4">
                    <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-3 rounded-full">
                      <Instagram className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  
                  <h4 className="text-xl font-bold text-slate-800 mb-3">
                    Professional Network Connection Required
                  </h4>
                  
                  <div className="space-y-3 text-sm text-slate-700 mb-6">
                    <div className="bg-white/50 backdrop-blur rounded-lg p-4 border border-purple-100">
                      <div className="flex items-center justify-center mb-2">
                        <Bell className="w-5 h-5 text-purple-600 mr-2" />
                        <span className="font-semibold text-purple-800">Mandatory for Selection</span>
                      </div>
                      <p className="text-xs">
                        Following our Instagram account is <span className="font-bold text-purple-700">required for all applicants</span>. 
                        This ensures you receive critical announcements, selection updates, and program communications.
                      </p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-3 text-xs">
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                        <span>Real-time selection updates</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                        <span>Assignment deadlines & reminders</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                        <span>Company culture insights</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                        <span>Professional networking</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="inline-flex items-center space-x-4">
                      <button
                        onClick={handleInstagramClick}
                        className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
                      >
                        <Instagram className="w-5 h-5 mr-3" />
                        Follow @Inncircles_official
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </button>
                      
                      {formData.instagramFollowed && (
                        <div className="flex items-center text-green-600 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                          <CheckCircle className="w-5 h-5 mr-2" />
                          <span className="text-sm font-semibold">Connected Successfully!</span>
                        </div>
                      )}
                    </div>
                    
                    {!formData.instagramFollowed && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <div className="flex items-center text-amber-800 text-xs">
                          <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span>
                            <strong>Note:</strong> You must follow our Instagram account to proceed with your application. 
                            This connection is essential for receiving important updates throughout the selection process.
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {errors.instagramFollowed && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-red-700 text-sm font-medium flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                        {errors.instagramFollowed}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  onClick={handleSubmit}
                  className="w-full bg-gradient-to-r from-blue-600 to-slate-700 text-white font-semibold py-4 px-6 rounded-lg hover:from-blue-700 hover:to-slate-800 transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
                >
                  Submit Application
                </button>
              </div>
            </div>
          </div>

          {/* Final Note */}
          <div className="bg-slate-50 p-8 text-center border-t border-slate-200 relative overflow-hidden">
            {/* Subtle code background */}
            <div className="absolute inset-0 opacity-5 text-xs font-mono text-slate-400 flex items-center justify-center">
              <div>
                console.log('Welcome to Inncircles Internship Program!');
              </div>
            </div>
            
            <h4 className="text-lg font-semibold text-slate-800 mb-2 relative z-10">Don't Miss This Opportunity</h4>
            <p className="text-slate-600 max-w-2xl mx-auto relative z-10">
              This internship is primarily designed for 2027 graduates, with 2026 graduates also welcome. 
              Complete the assignment sent to your email promptly to secure your position in our dynamic team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternshipForm;
