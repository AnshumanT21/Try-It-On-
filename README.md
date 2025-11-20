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

Upload a person photo + clothing photo

Use AI models through Replicate API (Flux)

Generate realistic, high-quality try-on images

🧊 3D Model Generation

Convert the AI-generated try-on image → 3D mesh using TripoSR

Auto-convert OBJ → GLB

Upload the GLB mesh to Cloudinary

Display the 3D model inside the app viewer

☁️ Cloud Storage + Database

Images + meshes stored securely in Cloudinary

Metadata stored in Supabase (user_uploads, user_models)

📱 Mobile App

Built with React Native + Expo

Modern UI with brand colors

Supports image upload, preview, animations, and navigation

Works on both iOS + Android

🏗 Architecture
User → Mobile App → Flask Backend → AI Models (Replicate/Flux)
                               ↓
                           TripoSR → OBJ
                               ↓
                         OBJ → GLB converter (obj2gltf)
                               ↓
                  Cloudinary (Mesh + Images) → Supabase
Frontend

React Native

Expo Router

Reanimated

Cloudinary upload

Supabase client

3D GLB viewer (react-three or expo-three-viewer)

Backend

Flask

Python

TripoSR (local inferencing)

Cloudinary Python SDK

Supabase Python client

Ngrok (for tunneling local backend to mobile app)

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
