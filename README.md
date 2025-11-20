🧥 Try It On! — AI-Powered Virtual Fitting Room

A cross-platform mobile app that lets users upload a photo of themselves, choose clothing, generate realistic AI try-on previews, and instantly create 3D models of the outfit.

📸 Overview

Try It On! is a React Native + Expo application with a Python (Flask) backend.
The app allows users to:

Upload an image of themselves

Upload an image of clothes

Use AI (Flux / Replicate API) to generate a “virtual try-on”

Convert the edited outfit into a 3D model using TripoSR

View + store both the try-on image and 3D model

Automatically store uploads in Cloudinary + metadata in Supabase

This project is fully mobile-ready, cross-platform, and uses modern AI pipelines.

🧠 Features
🎭 Virtual Try-On

1. Upload a person photo + clothing photo

2. Use AI models through Replicate API (Flux)

3. Generate realistic, high-quality try-on images

🧊 3D Model Generation

1. Convert the AI-generated try-on image → 3D mesh using TripoSR

2. Auto-convert OBJ → GLB

3. Upload the GLB mesh to Cloudinary

4. Display the 3D model inside the app viewer

☁️ Cloud Storage + Database

1. Images + meshes stored securely in Cloudinary

2. Metadata stored in Supabase (user_uploads, user_models)

📱 Mobile App

1. Built with React Native + Expo

2. Modern UI with brand colors

3. Supports image upload, preview, animations, and navigation

4. Works on both iOS + Android

🏗 Architecture
User → Mobile App → Flask Backend → AI Models (Replicate/Flux)
                               ↓
                           TripoSR → OBJ
                               ↓
                         OBJ → GLB converter (obj2gltf)
                               ↓
                  Cloudinary (Mesh + Images) → Supabase

Frontend

1. React Native

2. Expo Router

3. Reanimated

4. Cloudinary upload

5. Supabase client

6. 3D GLB viewer (react-three or expo-three-viewer)

Backend

1. Flask

2. Python

3. TripoSR (local inferencing)

4. Cloudinary Python SDK

5. Supabase Python client

6. Ngrok (for tunneling local backend to mobile app)

📁 Project Structure
TryItOn-App
 ├── app
 │   ├── home.tsx
 │   ├── camera.tsx
 │   ├── uploads/
 │   ├── models/
 │   ├── edited/
 │   └── _layout.tsx
 └── assets
     └── images

TryItOn-Backend
 ├── TripoSR/
 │   ├── run.py
 │   ├── tsr/
 │   └── output/  (auto-generated)
 ├── outputs/
 ├── app.py
 ├── .env
 └── requirements.txt
