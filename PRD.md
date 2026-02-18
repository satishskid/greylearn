# Product Requirements Document (PRD): MedAI Smart-LMS

**Version:** 1.0
**Date:** May 2024
**Product Owner:** [Your Name]
**Tech Stack:** Next.js, Firebase (Auth, Firestore, Functions, Hosting), Gemini API, Groq API.

---

## 1. Executive Summary
We are building a web-native educational platform for advanced medical topics. Unlike traditional LMS platforms (which act as file repositories), this platform uses **Generative AI** to turn static text into an interactive, guided learning experience.

**Core Value Proposition:**
1.  **For the Admin (Doctor):** Rapid course generation using AI, seamless student management, and automated certification.
2.  **For the Student:** A "Smart Manuscript" that allows them to chat with the textbook, visualize concepts dynamically, and receive personalized feedback on complex assignments (Reinforcement Learning loop).

---

## 2. User Personas

### A. The Administrator (You)
*   **Goal:** Create high-depth courses quickly.
*   **Needs:** To view student progress, approve enrollments (Whitelisting), and ensure AI stays "grounded" to the provided medical facts.

### B. The Learner (Student Doctors)
*   **Goal:** Master advanced topics without sitting through timed webinars.
*   **Needs:** Instant clarification on complex text, visual aids, and constructive feedback on subjective assignments.

---

## 3. Functional Requirements

### Module A: Authentication & Enrollment (The Gatekeeper)
*   **R1. Sign Up/Login:** Users sign in using Google Auth (Firebase Authentication).
*   **R2. The Whitelist Logic:**
    *   Default State: When a user registers, their account status is `pending`. They see a "Waiting for Approval" screen.
    *   Admin Action: Admin views a list of emails in a "Waitlist" dashboard and toggles status to `approved`.
    *   Notification: Once approved, a system email is sent: *"You have been whitelisted for [Course Name]. Login now."*
*   **R3. Course Enrollment:** Admin can assign specific courses to specific emails, or make a course "Public to Whitelisted Users."

### Module B: The "Smart Manuscript" Interface (The Classroom)
*   **R4. Web-Native Content:** Content is rendered in Markdown. No PDFs.
*   **R5. AI Tutor Sidebar:**
    *   A chat window persists on the right side.
    *   **Context Window:** The AI automatically has access to the text currently on the screen.
    *   **Grounding:** The AI is prompted to answer *only* based on the course material.
*   **R6. Dynamic Mind Maps:**
    *   The page renders Mermaid.js code blocks as interactive diagrams (Flowcharts/Graphs) embedded in the text.
*   **R7. Inline Tools:** Student can highlight text -> Click "Simplify" -> Pop-up explanation via Groq (Low latency).

### Module C: Assessment & RL Feedback
*   **R8. The "Judge" Model:**
    *   Assignments are open-ended (e.g., "Describe the treatment plan for Patient X").
    *   Student submits text.
    *   **Backend Logic:** The system sends [Student Answer] + [Rubric] + [Course Data] to Gemini 1.5 Pro.
    *   **Feedback:** The AI provides critique, NOT just a score. If the student fails, they must iterate and resubmit until the AI "Judge" marks it as Passed.

### Module D: Analytics & Certification
*   **R9. Progress Tracking:**
    *   Track "Scroll Depth" (Did they read the whole page?).
    *   Track Assignment Status (Pending, Iterating, Passed).
*   **R10. Completion Logic:**
    *   Course is marked `Complete` when: Scroll Depth = 100% AND Assignment = Passed.
*   **R11. Auto-Certification:**
    *   Trigger: Upon `Complete` status.
    *   Action: System generates a PDF Certificate (with Name, Date, Course Title).
    *   Delivery: Emailed automatically via SendGrid/Firebase Mail Extension.

---

## 4. Technical Architecture & Data Model

### Database Schema (Firestore)

**1. `users` Collection**
```json
{
  "uid": "xyz123",
  "email": "doctor@hospital.com",
  "displayName": "Dr. Smith",
  "role": "student", // or 'admin'
  "status": "approved", // or 'pending'
  "enrolled_courses": ["course_id_1"]
}
```

**2. `courses` Collection**
```json
{
  "course_id": "immunotherapy_101",
  "title": "Advanced Immunotherapy",
  "content_markdown": "## Introduction...", // The full text
  "system_prompt": "You are a tutor for Immunotherapy...",
  "mind_map_code": "graph TD; A-->B...",
  "assignment_rubric": "Student must mention IL-6 and hypotension..."
}
```

**3. `progress` Collection**
```json
{
  "uid": "xyz123",
  "course_id": "immunotherapy_101",
  "read_percentage": 85,
  "assignment_status": "passed",
  "last_active_timestamp": "2024-05-20T10:00:00Z",
  "completion_date": "2024-05-21"
}
```

---

## 5. Development Roadmap (MVP)

### Phase 1: The Foundation (Days 1-3)
*   Setup Next.js project.
*   Configure Firebase Auth (Google Sign-in).
*   Build the Admin Dashboard table (List users -> Toggle Approve/Ban).

### Phase 2: The Content Engine (Days 4-7)
*   Build the "Course Viewer" page (Markdown renderer).
*   Integrate Mermaid.js for diagrams.
*   **Admin Tool:** Create a form where you paste your raw research, and a button "Generate Course Structure" uses Gemini API to format it into Markdown + Mermaid code.

### Phase 3: The Intelligence (Days 8-10)
*   **Chat Interface:** Build the sidebar.
*   **API Hookup:** Connect the chat input to Groq (for speed) or Gemini.
    *   *System Instruction:* "Use the provided markdown content as your knowledge base."
*   **Assignment Logic:** Build the "Submit -> Analyze -> Feedback" loop using Gemini 1.5 Pro.

### Phase 4: Logistics (Days 11-14)
*   **Analytics Dashboard:** A simple view for you to see who has logged in recently and who has passed.
*   **Certificate Gen:** Use a library like `jspdf` to generate the certificate on the fly and email it.

---

## 6. Security & Cost Optimization

*   **Auth Rules:** Ensure only `whitelisted` users can read `course` documents.
*   **BYOK (Bring Your Own Key):**
    *   In the Admin Settings, you can input your master API Key (Gemini/Groq).
    *   *Option:* You can allow students to input their own key if you want to zero out your costs completely, though for a premium course, it is better if you proxy the calls so students don't have to deal with tech setup.
*   **Token Management:** Use Gemini Flash for simple queries (cheaper) and Pro only for complex assignment grading.

---

## 7. Next Steps for Developer

1.  **Initialize Firebase Project:** Enable Auth, Firestore, and Functions.
2.  **Clone Starter Kit:** Use `create-next-app` with Tailwind CSS.
3.  **API Keys:** Get API keys from Google AI Studio and Groq Cloud.

This PRD provides a clear blueprint. If you give this to a developer, they will know exactly what to build, how the data should flow, and how the AI integrates into the learning process.
