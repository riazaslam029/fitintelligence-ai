# 💪 FitIntelligence AI

**AI Biomechanics Coach & Secure Gym Check-In System**

FitIntelligence AI is a web-based application that automates two common fitness challenges: ensuring correct exercise form and tracking gym attendance. It combines browser-based computer vision with AWS cloud services to provide real-time feedback and secure check-ins.

---

## 🚀 Live Demo

🔗 http://fitintelligence-app-2026-prod.s3-website.ap-south-1.amazonaws.com

---

## 📌 Features

* 🏋️ **Exercise Form Analysis**
  Detects body joints via webcam and calculates angles (e.g., knee flexion, elbow alignment, posture).

* 🤖 **AI Feedback (Amazon Bedrock)**
  Sends structured joint data to Bedrock (Nova models) and returns actionable form corrections.

* 🛡️ **Secure Gym Check-In**

  * Face verification using Amazon Rekognition
  * GPS validation using AWS Lambda (geofencing)

* 📊 **Workout Tracking**
  Stores reps, timestamps, and form scores in DynamoDB.

---

## 🧠 How It Works

1. Webcam captures user movement
2. Joint keypoints are detected and processed in the browser
3. Angle data is generated using vector math
4. Data is sent to Amazon Bedrock → returns feedback
5. Check-in triggers:

   * Rekognition → face verification
   * Lambda → GPS validation
6. Results stored in DynamoDB and optionally S3

---

## 🏗️ Architecture Overview

```
[ Browser (Webcam + GPS) ]
        │
        ├──> Amazon Bedrock → AI Feedback
        ├──> Amazon Rekognition → Face Verification
        ├──> AWS Lambda → Geofence Validation
        └──> DynamoDB → Data Storage
                     │
                     └──> Amazon S3 → Media Storage
```

---

## 🛠️ Tech Stack

**Frontend**

* React + TypeScript (Vite)
* HTML5 Canvas (real-time rendering)

**Backend / Cloud**

* Amazon Bedrock (Nova models)
* Amazon Rekognition
* AWS Lambda
* Amazon DynamoDB
* Amazon S3
* AWS Amplify / S3 Hosting

---

## ⚙️ Setup Instructions

### 1. Clone Repository

```bash
git clone https://github.com/riazaslam029/fitintelligence-ai.git
cd fitintelligence-ai
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Locally

```bash
npm run dev
```

### 4. Configure AWS

* Add your AWS credentials
* Enable:

  * Bedrock access
  * Rekognition permissions
  * Lambda endpoint
* Update environment variables accordingly

---

## ⚠️ Notes

* Webcam and location permissions are required
* AWS services must be properly configured for full functionality
* A basic fallback/demo mode may run without live AWS credentials

---

## 📚 What I Learned

* Integrating real-time browser-based computer vision with cloud AI
* Using Amazon Bedrock for structured input and feedback generation
* Designing multi-factor verification using Rekognition + Lambda
* Optimizing performance using Canvas instead of React rendering

---

## 📎 Related Links

* 📝 Article:
  https://builder.aws.com/content/3HJqvY6JuGLUhqJOBN040jhL8CO/weekend-annoying-task-challenge-fitintelligence-ai-biomechanics-coach-and-secure-gym-check-in

* 💻 GitHub Repo:
  https://github.com/riazaslam029/fitintelligence-ai

---

## 🏁 Challenge

Built for the **AWS Weekend Annoying Task Challenge (2026)** — focused on turning small, repetitive problems into practical applications using AWS.

---

## 👤 Author

**Riaz Aslam**
Software Engineering Student

---

## 📄 License

This project is for educational and demonstration purposes.
