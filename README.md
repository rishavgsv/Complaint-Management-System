<h1 align="center">🚀 Resolve</h1>
<h3 align="center">Complaint Management System</h3>

<p align="center">
  A full-stack platform to streamline complaint reporting, tracking, and resolution.
</p>

<p align="center">
  <a href="https://complaint-management-system-6rfnq83sx-rishav-dev1.vercel.app/" target="_blank">
    🌐 Live Demo
  </a>
  &nbsp;•&nbsp;
  <a href="https://complaint-management-system-2qp9.onrender.com" target="_blank">
    🔗 Backend API
  </a>
</p>

<hr/>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React-blue?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Backend-Node.js-green?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Database-MongoDB-brightgreen?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Deployment-Vercel%20%7C%20Render-black?style=for-the-badge"/>
</p>

<hr/>

<h2>📌 Overview</h2>
<p>
  <b>Resolve</b> is designed to solve real-world complaint management inefficiencies in institutional environments.
  It enables users to submit complaints, track progress, and ensures efficient resolution through worker assignment and admin monitoring.
</p>

<hr/>

<h2>✨ Features</h2>

<h3>👨‍🎓 User</h3>
<ul>
  <li>Submit complaints with detailed description</li>
  <li>Upload image evidence (optional)</li>
  <li>Receive unique complaint ID</li>
  <li>Track complaint status</li>
  <li>Reopen complaints</li>
  <li>Provide feedback</li>
</ul>

<h3>🛠️ Worker</h3>
<ul>
  <li>View assigned complaints</li>
  <li>Update complaint status</li>
  <li>Mark work as completed</li>
  <li>Add comments</li>
</ul>

<h3>👨‍💼 Admin</h3>
<ul>
  <li>View all complaints</li>
  <li>Assign complaints to workers</li>
  <li>Verify completion</li>
  <li>Monitor performance</li>
</ul>

<hr/>

<h2>⚡ Key Highlights</h2>
<ul>
  <li>🔐 JWT-based authentication</li>
  <li>📧 Email notifications using Resend API</li>
  <li>🖼️ Image compression using Sharp</li>
  <li>🚀 Rate limiting for security</li>
  <li>📊 Scalable REST API architecture</li>
</ul>

<hr/>

<h2>🏗️ Tech Stack</h2>

<table>
  <tr>
    <th>Layer</th>
    <th>Technology</th>
  </tr>
  <tr>
    <td>Frontend</td>
    <td>React, Tailwind CSS</td>
  </tr>
  <tr>
    <td>Backend</td>
    <td>Node.js, Express</td>
  </tr>
  <tr>
    <td>Database</td>
    <td>MongoDB Atlas</td>
  </tr>
  <tr>
    <td>Email</td>
    <td>Resend API</td>
  </tr>
  <tr>
    <td>Deployment</td>
    <td>Vercel, Render</td>
  </tr>
</table>

<hr/>

<h2>🌐 Live Links</h2>
<ul>
  <li><b>Frontend:</b> <a href="https://complaint-management-system-6rfnq83sx-rishav-dev1.vercel.app/">Visit</a></li>
  <li><b>Backend:</b> <a href="https://complaint-management-system-2qp9.onrender.com">API</a></li>
</ul>

<hr/>

<h2>⚙️ Environment Variables</h2>

<p>Create a <code>.env</code> file inside the backend folder:</p>

<pre>
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
RESEND_API_KEY=your_resend_api_key
</pre>

<p><b>⚠️ Never commit your .env file to GitHub.</b></p>

<hr/>

<h2>🚀 Installation & Setup</h2>

<h3>1️⃣ Clone Repository</h3>
<pre>
git clone https://github.com/rishavgsv/Complaint-Management-System.git
cd Complaint-Management-System
</pre>

<h3>2️⃣ Backend Setup</h3>
<pre>
cd backend
npm install
npm run dev
</pre>

<h3>3️⃣ Frontend Setup</h3>
<pre>
cd frontend
npm install
npm run dev
</pre>

<hr/>

<h2>🔐 Security Notes</h2>
<ul>
  <li>All secrets are stored in environment variables</li>
  <li>.env is excluded using .gitignore</li>
  <li>No sensitive data is exposed in the repository</li>
</ul>

<hr/>

<h2>🧠 Learnings</h2>
<ul>
  <li>Built scalable REST APIs</li>
  <li>Implemented role-based authentication</li>
  <li>Integrated third-party services (Resend)</li>
  <li>Handled real-world deployment issues</li>
</ul>

<hr/>

<h2>🚧 Challenges</h2>
<ul>
  <li>Email delivery issues with SMTP (resolved using Resend)</li>
  <li>MongoDB connection handling</li>
  <li>Optimizing async operations</li>
</ul>

<hr/>

<h2>🔮 Future Improvements</h2>
<ul>
  <li>Real-time updates (WebSockets)</li>
  <li>Push notifications</li>
  <li>AI-based complaint classification</li>
  <li>Advanced analytics dashboard</li>
</ul>

<hr/>

<h2>👨‍💻 Author</h2>
<p>
  <b>Rishav Kumar</b><br/>
  📧 rishavkumar.jeh@gmail.com<br/>
  🔗 <a href="https://www.linkedin.com/in/rishav-kumar-2399241ab/">LinkedIn</a>
</p>

<hr/>

<p align="center">
  ⭐ If you like this project, give it a star!
</p>
