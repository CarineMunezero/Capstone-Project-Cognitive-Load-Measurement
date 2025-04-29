# **Cognisense: Cognitive Load Measurement System**

## **Overview**

Cognisense is a system designed to measure and analyze cognitive load in real-time using EEG data and facial emotion recognition. This project integrates biosensing technology to capture mental workload while users engage in a game application. By combining both quantitative (EEG) and qualitative (facial expressions) data, Cognisense provides a more holistic and accurate cognitive load measurement.

## **Project Vision**

Cognisense envisions a world where individuals and organizations can harness real-time cognitive insights to foster healthier, more efficient, and effective work and learning environments. By capturing EEG signals during gameplay and analyzing facial expressions, Cognisense provides valuable insights into cognitive load, helping users better understand and manage mental effort.

## **Technologies Used**

### **Frontend:**
- **React 18**
- **Next.js**
- **Chart.js**
- **Tailwind CSS**
- **jsPDF**
- **BroadcastChannel API**

### **Backend:**
- **FastAPI**
- **Uvicorn**
- **Python (Threading, AsyncIO, SciPy)**
- **WebSocket**
- **REST API**

### **Data & Hosting:**
- **Firebase** (Hosting, Firestore, Authentication)

### **Other Tools:**
- **LabStreamingLayer (LSL)**
- **Node.js**
- **JavaScript**
- **Face-api.js** (for Facial Emotion Recognition)

## **Why EEG?**

- **Direct Brain Measurement**: Tracks brain signals directly, providing real-time insight into mental effort.
- **Sensitive to Thinking Levels**: Measures how active or relaxed the brain is based on natural brain patterns.
- **Live Feedback**: Shows how a person's mental load changes during a task.
- **Non-Invasive and Portable**: Easy to wear like a headset without surgery or discomfort.
- **Trusted Method**: Used by researchers and healthcare teams worldwide to study brain activity.

## **Subjective Measures**

- **Face Recognition**: Monitors emotional expressions like stress or focus during tasks, providing additional insight into cognitive load alongside EEG data.
- **NASA TLX**: A survey tool that measures how mentally and physically demanding a task felt to the user.

## **Task Implementation**

- **Purpose**: A mini-game to intentionally increase cognitive load during EEG sessions.
- **Task Design**: Rapid math problems, categorization tasks, and memorization tasks.
- **Reason**: To create measurable mental effort that affects brainwaves (alpha, beta, gamma).
- **Goal**: Provide a controlled, repeatable way to study cognitive load.

## **Techniques Used**

### **EEG Measurement (Quantitative)**

- **Device + Streaming**: Real-time streaming of EEG data from CGX Quick 20r v2.
- **Cognitive Load Processing**: Real-time frontend updates based on EEG data.
- **Tab Sync and UI**: Synchronizes real-time data across devices for a seamless experience.

### **Facial Emotion Recognition (Qualitative)**

- **Face-api.js**: Built on top of TensorFlow.js, this API processes facial expressions in real-time.
- **Real-Time Processing**: Captures emotions every second.
- **Data Handling**: Data is saved in Firebase every 10 seconds.
- **Cognitive Load Calculation**: Combines dominant emotions and EEG data for overall cognitive load measurement.

## **Data Storage & Report Page**

- **Storage Solution**: Firebase Firestore for serverless architecture.
- **Data Visualization**: Pulls data from Firestore to generate interactive charts and graphs on the dynamic report page.
- **OpenAI Chatbot**: Provides personalized insights based on stored session data.

## **Required Tools and Setup**

### **Administrator Side Setup**
1. **Backend**: Run `uvicorn main:app --reload` to start/stop EEG with LabStreamingLayer.
2. **LSL Integration**: Stream real-time EEG data to the system.

### **User Side Setup**
1. **Device Requirements**: Webcam and stable Wi-Fi connection.
2. **CGX EEG Device**: Wear the headset to capture EEG data.
3. **Room Setup**: Quiet space with good lighting for facial recognition.

## **Demo**

A live demonstration of the Cognisense system can be found in the documentation and video demo.

## **The Journey: Challenges, Solutions, and Design Iterations**

### **Challenges**:
- Initial EEG data inconsistencies.
- Facial emotion recognition challenges.
- Synchronization of real-time data streams.

### **Solutions**:
- Refined data processing techniques.
- Implemented advanced face-api.js for emotion tracking.
- Optimized backend for smooth data synchronization.

## **Retrospective: Reflections & Learnings**

- **Personal Learnings**: Step out of our comfort zones to work collaboratively and finish our project on time.
- **Teamwork**: Collaborating with teammates and mentors helped develop a better understanding of user's needs and the problem we were solving for.
- **What We Liked**: The integration of multiple technologies to create a full stack cognitive load system.

## **Want to Try It Out?**

Experience Cognisense for yourself! To start using the system, follow these steps:

1. Set up the **CGX Quick 20r v2** EEG headset and connect it to the LabStreamingLayer.
2. Launch the **game application** that integrates real-time EEG monitoring and facial emotion recognition.
3. Monitor your **cognitive load** in real-time and explore how different activities affect your mental workload.

## **Acknowledgments**

- **Mentors**: Dr. Ohu, Dr. Wang
- **Client**: Lockheed Martin
- **Professor**: Dr. Tang

---
Try it here: https://lockheed-cognisense.web.app 
