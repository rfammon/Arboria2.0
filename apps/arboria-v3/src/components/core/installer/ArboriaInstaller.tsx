import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ArboriaInstaller = () => {
  const [currentStep, setCurrentStep] = useState<'welcome' | 'license' | 'destination' | 'installing' | 'completed'>('welcome');
  const [destinationPath, setDestinationPath] = useState<string>('C:\\Program Files\\Arboria');
  const [progress, setProgress] = useState<number>(0);
  const [agreedToLicense, setAgreedToLicense] = useState<boolean>(false);

  const steps = [
    { id: 'welcome', title: 'Welcome', icon: '🏠' },
    { id: 'license', title: 'License', icon: '📜' },
    { id: 'destination', title: 'Destination', icon: '📁' },
    { id: 'installing', title: 'Installing', icon: '📦' },
    { id: 'completed', title: 'Completed', icon: '✅' }
  ];

  const handleNext = () => {
    if (currentStep === 'welcome') {
      setCurrentStep('license');
    } else if (currentStep === 'license') {
      if (agreedToLicense) {
        setCurrentStep('destination');
      }
    } else if (currentStep === 'destination') {
      setCurrentStep('installing');
      // Simulate installation progress
      simulateInstallation();
    }
  };

  const simulateInstallation = () => {
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 15;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        setTimeout(() => {
          setCurrentStep('completed');
        }, 500);
      }
      setProgress(currentProgress);
    }, 300);
  };

  const handleInstallAgain = () => {
    setCurrentStep('welcome');
    setProgress(0);
  };

  const StepIndicator = () => (
    <div className="flex justify-center mb-8">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <motion.div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              steps.findIndex(s => s.id === currentStep) >= index 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {step.icon}
          </motion.div>
          {index < steps.length - 1 && (
            <div className={`w-16 h-1 mx-1 ${
              steps.findIndex(s => s.id === currentStep) > index 
                ? 'bg-blue-600' 
                : 'bg-gray-200 dark:bg-gray-700'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-emerald-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-800/30 backdrop-blur-lg rounded-2xl border border-gray-700 shadow-2xl overflow-hidden">
        {/* Header with brand identity */}
        <div className="bg-gradient-to-r from-blue-700 to-emerald-700 p-6 text-center relative">
          <motion.div 
            className="flex items-center justify-center mb-4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Arboria Installer</h1>
              <p className="text-blue-200 text-sm">Version 1.1.63</p>
            </div>
          </motion.div>
          <div className="absolute top-4 right-4 text-blue-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
            </svg>
          </div>
        </div>

        <div className="p-6">
          <StepIndicator />

          <AnimatePresence mode="wait">
            {currentStep === 'welcome' && (
              <motion.div
                key="welcome"
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="text-center"
              >
                <h2 className="text-xl font-bold text-white mb-4">Welcome to Arboria</h2>
                <p className="text-gray-300 mb-6">
                  Thank you for choosing Arboria, the forestry management solution designed for professionals.
                </p>
                <div className="bg-gray-700/50 p-4 rounded-lg mb-6 text-left">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-400">Product:</div>
                    <div className="text-white">Arboria Forest Management</div>
                    
                    <div className="text-gray-400">Version:</div>
                    <div className="text-white">1.1.63</div>
                    
                    <div className="text-gray-400">Size:</div>
                    <div className="text-white">~125 MB</div>
                    
                    <div className="text-gray-400">Type:</div>
                    <div className="text-white">Full Installation</div>
                  </div>
                </div>
                <button
                  onClick={handleNext}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                  Install Now
                </button>
              </motion.div>
            )}

            {currentStep === 'license' && (
              <motion.div
                key="license"
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <h2 className="text-xl font-bold text-white mb-4">License Agreement</h2>
                <div className="bg-gray-700/30 rounded-lg p-4 h-64 overflow-y-auto mb-4 border border-gray-600">
                  <p className="text-gray-300 text-sm leading-relaxed">
                    END-USER LICENSE AGREEMENT ("Agreement")<br/><br/>
                    
                    Arboria Forest Management Software<br/>
                    Copyright © {new Date().getFullYear()} Arboria Solutions. All rights reserved.<br/><br/>

                    PLEASE READ THIS AGREEMENT CAREFULLY BEFORE INSTALLING OR USING THE SOFTWARE. BY INSTALLING OR USING THE SOFTWARE, YOU AGREE TO BE BOUND BY THE TERMS OF THIS AGREEMENT. IF YOU DO NOT AGREE TO THESE TERMS, DO NOT INSTALL OR USE THE SOFTWARE.<br/><br/>

                    1. GRANT OF LICENSE. Arboria grants you a limited, non-exclusive, non-transferable license to use the software for internal business purposes only.<br/><br/>

                    2. RESTRICTIONS. You may not reverse engineer, decompile, disassemble, or attempt to derive the source code of the software. You may not distribute, sublicense, or resell the software.<br/><br/>

                    3. PROPRIETARY RIGHTS. The software is protected by copyright laws and international treaties. All rights not expressly granted herein are reserved by Arboria Solutions.<br/><br/>

                    4. DISCLAIMER. THE SOFTWARE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND. ARBORIA SOLUTIONS DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.<br/><br/>

                    5. LIMITATION OF LIABILITY. IN NO EVENT SHALL ARBORIA SOLUTIONS BE LIABLE FOR ANY SPECIAL, INCIDENTAL, INDIRECT, OR CONSEQUENTIAL DAMAGES WHATSOEVER ARISING OUT OF THE USE OF OR INABILITY TO USE THE SOFTWARE.<br/><br/>

                    6. TERMINATION. This agreement terminates automatically if you breach any of its terms. Upon termination, you must cease all use of the software and destroy all copies.
                  </p>
                </div>
                <div className="flex items-center mb-6">
                  <input
                    type="checkbox"
                    id="agree"
                    checked={agreedToLicense}
                    onChange={(e) => setAgreedToLicense(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <label htmlFor="agree" className="ml-2 text-sm font-medium text-gray-300">
                    I accept the terms of this license agreement
                  </label>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setCurrentStep('welcome')}
                    className="flex-1 py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-300"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={!agreedToLicense}
                    className={`flex-1 py-2 px-4 font-medium rounded-lg transition-colors duration-300 ${
                      agreedToLicense 
                        ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </motion.div>
            )}

            {currentStep === 'destination' && (
              <motion.div
                key="destination"
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <h2 className="text-xl font-bold text-white mb-4">Choose Install Location</h2>
                <p className="text-gray-300 mb-4">
                  Select the folder where you want to install Arboria. We recommend using the default location.
                </p>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-400 mb-2">Install location:</label>
                  <div className="flex">
                    <input
                      type="text"
                      value={destinationPath}
                      onChange={(e) => setDestinationPath(e.target.value)}
                      className="flex-1 py-2 px-3 bg-gray-700 border border-gray-600 rounded-l-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button className="py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-r-lg transition-colors duration-300">
                      Browse
                    </button>
                  </div>
                </div>
                <div className="bg-gray-700/30 p-4 rounded-lg mb-6">
                  <h3 className="font-medium text-white mb-2">Additional Options</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="desktop"
                        defaultChecked
                        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <label htmlFor="desktop" className="ml-2 text-sm font-medium text-gray-300">
                        Create desktop shortcut
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="menu"
                        defaultChecked
                        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <label htmlFor="menu" className="ml-2 text-sm font-medium text-gray-300">
                        Add to Start menu
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="updates"
                        defaultChecked
                        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <label htmlFor="updates" className="ml-2 text-sm font-medium text-gray-300">
                        Check for updates automatically
                      </label>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setCurrentStep('license')}
                    className="flex-1 py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-300"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleNext}
                    className="flex-1 py-2 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-[1.02]"
                  >
                    Install
                  </button>
                </div>
              </motion.div>
            )}

            {currentStep === 'installing' && (
              <motion.div
                key="installing"
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="text-center"
              >
                <div className="flex justify-center mb-6">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
                  />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Installing Arboria</h2>
                <p className="text-gray-300 mb-6">Please wait while the installation completes...</p>
                
                <div className="mb-6">
                  <div className="w-full bg-gray-700 rounded-full h-2.5 mb-2">
                    <motion.div 
                      className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2.5 rounded-full"
                      initial={{ width: '0%' }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <p className="text-sm text-gray-400">{Math.round(progress)}% Complete</p>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm text-left mb-4">
                  <div className="flex items-center">
                    <span className={`inline-block w-3 h-3 rounded-full mr-2 ${progress > 10 ? 'bg-green-500' : 'bg-gray-600'}`}></span>
                    <span className="text-gray-400">Extracting files</span>
                  </div>
                  <div className="flex items-center">
                    <span className={`inline-block w-3 h-3 rounded-full mr-2 ${progress > 40 ? 'bg-green-500' : 'bg-gray-600'}`}></span>
                    <span className="text-gray-400">Creating shortcuts</span>
                  </div>
                  <div className="flex items-center">
                    <span className={`inline-block w-3 h-3 rounded-full mr-2 ${progress > 70 ? 'bg-green-500' : 'bg-gray-600'}`}></span>
                    <span className="text-gray-400">Registering components</span>
                  </div>
                  <div className="flex items-center">
                    <span className={`inline-block w-3 h-3 rounded-full mr-2 ${progress >= 100 ? 'bg-green-500' : 'bg-gray-600'}`}></span>
                    <span className="text-gray-400">Finishing...</span>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 'completed' && (
              <motion.div
                key="completed"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="text-center"
              >
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Installation Complete!</h2>
                <p className="text-gray-300 mb-6">
                  Arboria has been successfully installed on your computer.
                </p>
                
                <div className="bg-gray-700/30 rounded-lg p-4 mb-6 text-left">
                  <div className="flex items-start mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-400 mt-0.5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-green-400 text-sm">Successfully installed Arboria Forest Management</span>
                  </div>
                  <div className="flex items-start mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-400 mt-0.5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-green-400 text-sm">Created desktop and start menu shortcuts</span>
                  </div>
                  <div className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-400 mt-0.5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-green-400 text-sm">Automatic updates enabled</span>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={handleInstallAgain}
                    className="flex-1 py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-300"
                  >
                    Install Again
                  </button>
                  <button
                    onClick={() => window.close()}
                    className="flex-1 py-2 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-[1.02]"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="bg-gray-900/80 p-4 text-center border-t border-gray-700">
          <p className="text-xs text-gray-500">© {new Date().getFullYear()} Arboria Solutions. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default ArboriaInstaller;