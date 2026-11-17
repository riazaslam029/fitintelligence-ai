# 💪 FitIntelligence AI

### AI-powered biomechanics coaching and secure gym check-ins

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20App-2563eb?style=for-the-badge&logo=amazonaws&logoColor=white)](http://fitintelligence-app-2026-prod.s3-website.ap-south-1.amazonaws.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=20232A)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5%2B-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![AWS](https://img.shields.io/badge/AWS-Cloud%20Services-FF9900?style=flat-square&logo=amazonaws&logoColor=white)](https://aws.amazon.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-22c55e?style=flat-square)](LICENSE)

FitIntelligence AI is a web application that combines browser-based computer vision with AWS services to help users improve exercise form and manage secure gym attendance. It provides real-time movement analysis, AI-generated coaching feedback, biometric verification, geofenced check-ins, and workout tracking.

> **Project status:** Educational prototype and demonstration project. AWS credentials, permissions, and backend endpoints must be configured before production use.

## ✨ Highlights

- 🏋️ **Biomechanics analysis** — Detects body keypoints from a webcam and calculates movement angles such as knee flexion, elbow alignment, and posture.
- 🤖 **AI coaching feedback** — Sends structured movement data to Amazon Bedrock Nova models for actionable form guidance.
- 🛡️ **Secure check-ins** — Combines Amazon Rekognition face verification with AWS Lambda geofencing.
- 📈 **Workout tracking** — Stores repetitions, timestamps, and form scores in Amazon DynamoDB.
- ⚡ **Responsive browser experience** — Uses HTML5 Canvas for real-time visual rendering without unnecessary React re-renders.

## 🧭 How It Works

1. The browser requests webcam and location permissions.
2. Movement keypoints are detected and processed locally.
3. Vector mathematics converts keypoints into exercise angles and form metrics.
4. Structured metrics are sent to Amazon Bedrock for coaching feedback.
5. Gym check-ins use Rekognition for face verification and Lambda for GPS validation.
6. Workout and check-in results can be persisted in DynamoDB and media can be stored in S3.

## 🏗️ Architecture

```text
┌──────────────────────────────┐
│ Browser                      │
│ Webcam + GPS + Canvas        │
└──────────────┬───────────────┘
               │
      ┌────────┼─────────┬──────────────┐
      ▼        ▼         ▼              ▼
  Bedrock  Rekognition  Lambda       DynamoDB
  Coaching Face check   Geofence     Tracking
                                           │
                                           ▼
                                          S3
                                     Media storage
```

## 🧰 Technology Stack

| Area | Technologies |
| --- | --- |
| Frontend | React, TypeScript, Vite |
| Visualization | HTML5 Canvas, Lucide React |
| AI | Amazon Bedrock (Nova models) |
| Identity and validation | Amazon Rekognition, AWS Lambda |
| Storage and hosting | Amazon DynamoDB, Amazon S3, AWS Amplify/S3 hosting |

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or later
- npm
- An AWS account with the required service access

### Installation

```bash
git clone https://github.com/riazaslam029/fitintelligence-ai.git
cd fitintelligence-ai
npm install
```

### Run locally

```bash
npm run dev
```

Then open the local URL printed by Vite.

### Validate the project

```bash
npm run lint
npm run build
```

### AWS configuration

Configure the project’s AWS endpoints and environment variables for:

- Amazon Bedrock model access
- Amazon Rekognition permissions
- AWS Lambda geofencing
- Amazon DynamoDB persistence
- Optional Amazon S3 media storage

Never commit AWS credentials or other secrets. Use environment variables, IAM least-privilege policies, and a managed secrets solution for deployments.

## 🔐 Privacy and Responsible Use

This project processes camera, location, and biometric-related data. Use it only with informed user consent, clear retention policies, appropriate access controls, and compliance with applicable privacy laws. It is not a medical device and should not replace professional medical or fitness advice.

## 🗺️ Roadmap

- [ ] Add automated tests for biomechanics calculations
- [ ] Add production-ready authentication and authorization
- [ ] Add configurable workout and gym profiles
- [ ] Add observability, error reporting, and secure API integration
- [ ] Document deployment and infrastructure configuration

## 📚 Related Links

- 📝 [AWS Builder article](https://builder.aws.com/content/3HJqvY6JuGLUhqJOBN040jhL8CO/weekend-annoying-task-challenge-fitintelligence-ai-biomechanics-coach-and-secure-gym-check-in)
- 💻 [GitHub repository](https://github.com/riazaslam029/fitintelligence-ai)

## 🏆 Challenge

Built for the **AWS Weekend Annoying Task Challenge (2026)**, focused on turning small, repetitive problems into practical applications using AWS.

## 👤 Author

**Riaz Aslam** · Software Engineering Student

## 📄 License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for details.
