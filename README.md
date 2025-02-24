# Capstone-Project-Cognitive-Load-Measurement
Senior design project , Capstone Project Cognitive Load Measurement
# **Cognisense Project**

## **Overview**
Cognisense is a system designed to measure and analyze cognitive load in real-time using EEG data. The project integrates biosensing technology to capture mental workload while users engage in a game application. This enables real-time monitoring of cognitive stress during interactive tasks.

## **Project Vision**
Cognisense envisions a world where individuals and organizations harness real-time cognitive insights to foster healthier, more efficient, and more effective work and learning environments. By capturing EEG signals during gameplay, Cognisense provides valuable insights into cognitive load, empowering users to better understand and manage mental effort.

## **System Components**
1. **CGX Quick 20r v2**: EEG headset used to capture brain activity.
2. **LabStreamingLayer (LSL)**: Middleware to stream EEG data in real-time.
3. **Game Application**: The primary interface where users perform tasks while EEG data is captured.
4. **MATLAB Scripts**: Scripts to capture and analyze EEG data via the LabStreamingLayer.

## **How It Works**
1. The CGX Quick 20r v2 captures EEG signals from the user.
2. LabStreamingLayer streams the EEG data in real-time.
3. MATLAB scripts process and analyze the streamed EEG data.
4. The EEG data is collected while the user interacts with the game application.

## **Functional Requirements**
1. **Data Acquisition**
   - Collect EEG data from the CGX Quick 20r v2.
   - Stream the EEG data using LabStreamingLayer.
2. **Real-Time Monitoring**
   - Capture EEG signals while users play the game application.
   - Ensure data capture with minimal latency during gameplay.

## **Usage Instructions**
1. **Set Up the EEG System**
   - Ensure the CGX Quick 20r v2 headset is properly configured and connected.
   - Start the LabStreamingLayer to initiate EEG data capture.

2. **Run MATLAB Scripts**
   - Open MATLAB and navigate to the directory containing the EEG scripts.
   - Execute the following command in the MATLAB terminal:
     ```matlab
     run('cgxtrial.m')
     ```
   - Ensure the LabStreamingLayer (LSL) is actively streaming EEG data to MATLAB.

3. **Launch the Game Application**
   - Start the game application while the EEG stream is active to monitor cognitive load in real-time.


## **Trying It on Your Own**
To run Cognisense independently, follow these steps:

### **Prerequisites**
- CGX Quick 20r v2 headset (properly connected and calibrated)
- LabStreamingLayer (installed and running)
- MATLAB (for EEG processing scripts)
- Game application (for cognitive load measurement)

### **Step-by-Step Guide**
1. **Connect the EEG System**
   - Ensure the CGX Quick 20r v2 is properly fitted.
   - Verify LabStreamingLayer is started and actively streaming EEG data.

2. **Run the MATLAB Script**
   - Open MATLAB and execute the script:
     ```matlab
     run('cgxtrial.m')
     ```
   - Ensure no errors occur, and the EEG stream is being processed correctly.

3. **Start the Game**
   - Launch the game application and ensure EEG capture streams seamlessly.

4. **Monitor and Validate**
   - Verify that the EEG data is recorded during gameplay.
   - Cross-check MATLAB outputs with the in-game actions.

## **Security and Privacy**
- All EEG data is handled securely and is only used for research purposes.
- Ensure compliance with data privacy standards during data collection and storage.

## **Future Enhancements**
- Improve data accuracy and signal clarity.
- Explore additional biosensors for a more comprehensive analysis.

## **Contributors**
- Carine, Nardos, Hiyan, Kyle

## **Acknowledgments**
Special thanks to ..
