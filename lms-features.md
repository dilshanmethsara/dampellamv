# Dampella Full LMS: Comprehensive Feature Specification

This document provides a detailed list of all features and functional modules within the Dampella LMS ecosystem. This specification covers the Student Portal, Teacher Portal, Administrative Suite, and the integrated AI and Communication layers.

## 1. Advanced Authentication & Security
- **Multi-Role Gateway**: Separate authentication logic and UI contexts for Students, Teachers, and Administrators.
- **Student Signup Flow (3-Step Verification)**:
    - **Step 1: Contact Verification**: Real-time delivery and verification of a 6-digit OTP via WhatsApp.
    - **Step 2: Institutional Identity**: 4-digit Student ID validation against the school's master whitelist (includes fuzzy name-matching and grade-consistency checks).
    - **Step 3: Profile Setup**: Grade selection (6-11), password creation, and secure account binding.
- **Teacher Signup Flow**:
    - **Step 1: Contact Verification**: Mandatory WhatsApp OTP verification.
    - **Step 2: Professional Profile**: Selection of taught subjects and submission of Teacher ID.
    - **Step 3: Administrative Staging**: Accounts enter a "Pending" state requiring manual approval from the Principal/Admin before portal activation.
- **Secure Sign-In**: Institutional-grade login using email and encrypted passwords.
- **Account Recovery**: 
    - **Forgot Password**: Request secure reset links via email.
    - **Reset Password**: Secure token-based password update flow.
- **Session Integrity**: Client-side form persistence (Session Storage) to prevent data loss during registration.

## 2. Artificial Intelligence Integration
- **AI Quiz Generator**:
    - **PDF-to-Quiz**: Automatically generate high-quality Multiple Choice Questions (MCQs) from uploaded PDF lessons.
    - **Multi-Model Fallback**: Uses Gemini 2.5 Flash with an automated fallback to Groq (LLaMA 3) to ensure high availability.
    - **Contextual Awareness**: Generates questions specifically tailored to Grade, Subject, and Language.
- **Student AI Tutor**: A dedicated AI chatbot within the portal to provide real-time assistance and explanations for academic topics.

## 3. Communication & Automation (WhatsApp Bot)
- **WhatsApp Secure Delivery**: Automated delivery of security codes (OTPs) directly to students' WhatsApp numbers.
- **Broadcasting Engine**: Automated group notifications triggered whenever new content is published:
    - **New Announcements** (📢)
    - **New Assignments** (📝)
    - **New Quizzes** (🧠)
- **Status Sync**: Real-time monitoring of Firestore collections to ensure the WhatsApp community is always in sync with the portal.

## 4. Academic Delivery & Interactive Learning
- **Assignment Lifecycle**:
    - **Teachers**: Creation, distribution, and management of tasks for specific grades/subjects.
    - **Students**: Digital submission portal for text responses and external link attachments.
    - **Grading Engine**: Interface for teachers to review live work, award numerical marks (0-100), and provide qualitative academic feedback.
- **Performance Analytics**:
    - **Student "My Marks"**: Personal gradebook with automated letter grade calculation (A+ through F).
    - **Teacher Ledger**: A searchable history of all submitted marks, filterable by Grade, Subject, and Term.
- **Immersive Learning**:
    - **Virtual 3D Science Lab**: Integrated viewer for interactive science experiments and 3D models.
    - **Past Paper Repository**: Comprehensive library of previous exams categorized by Grade, Subject, and Term (1, 2, 3).

## 5. Administrative & School Management Suite
- **Student Information Management**:
    - **Whitelist Control**: Maintaining the database of authorized student identifiers.
    - **Grade Promotion**: Automated system for bulk-advancing students to the next academic level.
- **Website Content Management (CMS)**:
    - **News & Announcements**: Publishing system with featured/priority tagging.
    - **School Events**: Scheduler for managing dates, locations, and highlights of school activities.
    - **Dynamic Gallery**: Visual media management for school events and achievements.
- **Inquiry Handling**: Centralized system for viewing and managing messages sent to the school administration.
- **Global Settings**: Management of core school info, vision, mission, and principal's message.

## 6. Global System Utilities
- **Bilingual Interface**: Full UI localization for **English** and **Sinhala (සිංහල)**.
- **Aesthetic Controls**: Seamless Switching between **Light and Dark Mode**.
- **Notification Hub**: Real-time app-wide notifications (bell icon) for grading updates and content alerts.
- **Responsive Architecture**: Role-based sidebar navigation optimized for all device sizes.
