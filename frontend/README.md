# Academic Control System - Frontend Client

This is the frontend client for the School Academic Control System, built with **Next.js** (App Router), **React**, and **Tailwind CSS**. It provides a light-themed administrative dashboard utilizing a soft pastel green color palette.

---

## 🎨 Theme & UI Design
* **Design system**: Clean light mode.
* **Palette**: Soft emerald and pastel green tones (`bg-emerald-50/40`, `text-emerald-950`, `border-emerald-150`).
* **Visual cues**: Responsive grid layout, interactive drawers/tabs for transitioning between Students and Subjects, and custom green/rose badges indicating passing or failing GPAs.

---

## 📂 Code Structure
* **`app/page.tsx`**: Main component housing the state logic, API fetch requests, validation feedback, and forms.
* **`app/layout.tsx`**: Sets up global document metadata, viewport, and HTML structure.
* **`app/globals.css`**: Configures Tailwind CSS imports.

---

## ⚡ Main Features

1. **Matricula & Subject Management Tabs**:
   * Switch between the **Students** enrollment table and the list of **Subjects** instantly.
2. **Academic Drawer**:
   * Selecting a student opens a dedicated panel showing their current course load, grade values, and a form to register new marks.
3. **Safety Modal Deletions**:
   * When deleting a subject, if the backend indicates that registered grades exist, the frontend prompts the user with a confirmation warning before sending the force delete request.
4. **Form validations**:
   * Client-side validation ensuring numeric inputs (age and grades) adhere to business logic boundaries before hitting the server.

---

## ⚙️ How to Run
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the local Next.js Turbopack development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:3000` to view the application.
