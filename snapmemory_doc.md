# SnapMemory

**SnapMemory** is a mobile-first, AI-powered photo-sharing application designed to simplify the post-trip or event photo distribution experience. Built with React Native, Python, and Node.js, it automates photo sorting and personalized sharing based on facial recognition.

---

## 📅 Use Case

After every college trip, wedding, or event, there's always one person who has all the photos. Sharing them manually to each participant, sorting group and solo pictures, compressing for WhatsApp or uploading on Drive becomes a nightmare.

**SnapMemory solves this.**

---

## 🌟 Key Features

- **Trip Creation**

  - Add trip name, date, and location.
  - Upload a single group selfie with all participants.

- **Smart Face Detection & Labeling**

  - Automatically detects all faces from the group image using YOLOv8.
  - Prompt user to label each detected face with a name and WhatsApp number.
  - Contacts can be imported for faster labeling.

- **One-Time Face Embedding Generation**

  - Uses FaceNet to create a 512-d embedding vector per face with augmentations.
  - Stored using class-specific `.pkl` files for further recognition.

- **Photo Upload & Processing**

  - Upload multiple images.
  - The app detects who appears in which photo.
  - Sorts them into solo and group shots for each participant.

- **Auto WhatsApp Distribution**

  - Generates a unique personalized link for each participant.
  - Sends the link directly to the participant's WhatsApp.
  - The user can preview and download only their own photos.

- **Privacy by Design**

  - Each user receives a private access-only link.
  - No central gallery; no mass-sharing.

---

## 🚀 Tech Stack

- **Frontend:** React Native (Expo), ReactJS (for shared photo viewer)
- **Backend:** Node.js (Express)
- **Face Detection:** YOLOv8 (via Ultralytics)
- **Face Recognition:** FaceNet (512-d embeddings)
- **Database:** MongoDB
- **Image Processing:** OpenCV, PIL (Python)
- **Messaging:** WhatsApp Cloud API (planned)

---

## 🌚 Flow Overview

1. **Professor/User creates a Trip**
2. Uploads a group selfie with all participants
3. App auto-detects faces → user adds names & WhatsApp numbers
4. Backend saves and generates embedding vectors
5. Upload event/trip photos
6. App analyzes each photo → maps faces to known embeddings
7. Sorts photos per user
8. User hits “Send” → Link sent to WhatsApp
9. Participant opens link → Sees solo & group photos only
10. Can download in original quality (no compression, no watermark)

---

## 🔄 Current Limitations & Roadmap

### Limitations:

- Only supports single-image face registration (currently)
- Limited to 33 users per trip in current test model
- Backend model retraining is triggered manually

### Coming Soon:

- Live photo upload previews
- WhatsApp auto-messaging fully integrated
- Training on multiple selfies per user
- In-app progress bar during upload & processing
- S3/Cloudinary support for optimized hosting

---

## 📖 Why SnapMemory?

Because memories are meant to be shared —
not stuck in someone else’s gallery.

> “Yaadein sabki hoti hain,
> toh un tak bina kahe pahuchni bhi chahiye.”

---

