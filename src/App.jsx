
import { useState, useEffect } from 'react'
import AdminLogin from './AdminLogin'
import AdminDashboard from './AdminDashboard'
import UserAuth from './UserAuth'
import UserProfile from './UserProfile'
import './App.css'

function App() {
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('')
  
const [apiJobs, setApiJobs] = useState([])
const [remoteJobs, setRemoteJobs] = useState([])
const [remoteLoading, setRemoteLoading] = useState(true)
const [remoteError, setRemoteError] = useState('')
const [showAdminLogin, setShowAdminLogin] = useState(false)
const [showUserAuth, setShowUserAuth] = useState(false)
const [showUserProfile, setShowUserProfile] = useState(false)
const [menuOpen, setMenuOpen] = useState(false)

const [loggedInUser, setLoggedInUser] = useState(
  JSON.parse(localStorage.getItem('userInfo') || 'null')
)
const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(
  Boolean(localStorage.getItem('adminToken'))
)
useEffect(() => {
  fetch('http://localhost:5000/api/jobs')
    .then((response) => response.json())
    .then((data) => {
      setApiJobs(data)
    })
    .catch((error) => {
      console.error('Error fetching jobs:', error)
    })
}, [])
useEffect(() => {
  const fetchRemoteJobs = async () => {
    try {
      const response = await fetch(
        'https://remotive.com/api/remote-jobs?category=software-dev'
      )
      setRemoteError('')

      if (!response.ok) {
        throw new Error('Failed to load remote jobs')
      }

      const data = await response.json()

      const formattedJobs = data.jobs.map((job) => ({
        id: job.id,
        title: job.title,
        company: job.company_name,
        location: job.candidate_required_location || 'Remote',
        workMode: 'Remote',
        type: job.job_type || 'Remote',
        salary: job.salary || 'Not specified',
        skills: job.tags || [],
        publishedAt: job.publication_date,
        url: job.url,
      }))

      setRemoteJobs(formattedJobs)
      setRemoteLoading(false)
    } 
    catch (error) {
  console.error('Error fetching remote jobs:', error)
  setRemoteError('Unable to load remote jobs. Please try again later.')
  setRemoteLoading(false)
}
  }

  fetchRemoteJobs()
}, [])

useEffect(() => {
  if (!loggedInUser) {
    setApplications([])
    return
  }

  const token = localStorage.getItem('userToken')

  fetch('http://localhost:5000/api/applications', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to fetch applications')
      }

      return response.json()
    })
    .then((data) => {
      setApplications(data)
    })
    .catch((error) => {
      console.error('Error fetching applications:', error)
    })
}, [loggedInUser])
const [loading, setLoading] = useState(false)
const [apiError, setApiError] = useState('')
const [jobType, setJobType] = useState('All')
const [workMode, setWorkMode] = useState('All')
const [showSavedJobs, setShowSavedJobs] = useState(false)
const [savedJobs, setSavedJobs] = useState(() => {
  try {
    return JSON.parse(localStorage.getItem('savedJobs')) || []
  } catch {
    return []
  }
})
const toggleSavedJob = (job) => {
  const isSaved = savedJobs.some(
    (savedJob) => savedJob.id === job.id
  )

  let updatedSavedJobs

  if (isSaved) {
    updatedSavedJobs = savedJobs.filter(
      (savedJob) => savedJob.id !== job.id
    )
  } else {
    updatedSavedJobs = [...savedJobs, job]
  }

  localStorage.setItem(
    'savedJobs',
    JSON.stringify(updatedSavedJobs)
  )

  setSavedJobs(updatedSavedJobs)
}

// useEffect(() => {
//   const fetchJobs = async () => {
//     setLoading(true)
//     setApiError('')

//     try {
//       const response = await fetch(
//         'https://remotive.com/api/remote-jobs?category=software-dev'
//       )

//       if (!response.ok) {
//         throw new Error('Failed to load jobs')
//       }

//       const data = await response.json()

//       const formattedJobs = data.jobs.map((job) => ({
//         id: job.id,
//         title: job.title,
//         company: job.company_name,
//         location: job.candidate_required_location || 'Remote',
//         workMode: 'Remote',
//         type: job.job_type || 'Remote',
//         salary: job.salary || 'Not specified',
//         skills: job.tags || [],
//         publishedAt: job.publication_date,
//         url: job.url,
//       }))

//       setApiJobs(formattedJobs)
//     } catch (error) {
//       setApiError('Jobs load nahi ho paayi. Please try again later.')
//     } finally {
//       setLoading(false)
//     }
//   }

//   fetchJobs()
// }, [])


  const [selectedJob, setSelectedJob] = useState(null)
  const [showApplicationForm, setShowApplicationForm] = useState(false)

  const [applicant, setApplicant] = useState({
    name: '',
    email: '',
    phone: '',
    resume: '',
  })

  const [applicationSubmitted, setApplicationSubmitted] = useState(false)
  
  const [applications, setApplications] = useState([])
  const [showApplications, setShowApplications] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)
  
  
const allJobs = [...apiJobs, ...remoteJobs]





const filteredJobs = allJobs.filter((job) => {
  const searchTerms = search
    .split(',')
    .map((term) => term.trim().toLowerCase())
    .filter((term) => term !== '')

  const matchesSearch = searchTerms.every((term) =>
    job.title.toLowerCase().includes(term) ||
    job.company.toLowerCase().includes(term) ||
    (job.skills || []).some((skill) =>
  skill.toLowerCase().includes(term)
)
    
  )

  const matchesLocation = job.location
    .toLowerCase()
    .includes(location.toLowerCase())
          const normalizeJobType = (value) =>
  (value || '').toLowerCase().replace(/[_\s-]+/g, '')

const matchesJobType =
  jobType === 'All' ||
  normalizeJobType(job.type) === normalizeJobType(jobType)
  const matchesWorkMode =
  workMode === 'All' ||
  normalizeJobType(job.workMode) === normalizeJobType(workMode)
  const matchesSavedJobs =
  !showSavedJobs ||
  savedJobs.some((savedJob) => savedJob.id === job.id)

   
   

          
  return (
  matchesSearch &&
  matchesLocation &&
  matchesJobType &&
  matchesWorkMode &&
  matchesSavedJobs
)
})




  return (
    <div className="app">
      
  {showAdminLogin && !isAdminLoggedIn && (
  <AdminLogin
    onLoginSuccess={() => {
      setIsAdminLoggedIn(true)
      setShowAdminLogin(false)
    }}
  />
)}

{isAdminLoggedIn && (
  <AdminDashboard
    onLogout={() => {
      localStorage.removeItem('adminToken')
      setIsAdminLoggedIn(false)
    }}
  />
)}
{showUserAuth && !loggedInUser && (
  <UserAuth
    onLoginSuccess={(user) => {
      setLoggedInUser(user)
      setShowUserAuth(false)
    }}
  />
)}
{showUserProfile && loggedInUser && (
  <UserProfile
    user={loggedInUser}
    onProfileUpdate={(updatedUser) => {
      setLoggedInUser(updatedUser)

      localStorage.setItem(
        'userInfo',
        JSON.stringify(updatedUser)
      )
    }}
  />
)}
      <nav className="navbar">
        <a href="#" className="brand">
          Job<span>Connect</span>
        </a>
        <button
  className="menu-toggle"
  onClick={() => setMenuOpen(!menuOpen)}
>
  ☰
</button>

          <div className={`nav-links ${menuOpen ? 'active' : ''}`}>
          <a href="#jobs">Find Jobs</a>
          <a href="#about">About</a>
          <a
  href="#admin"
  onClick={(e) => {
    e.preventDefault()
    setShowAdminLogin(true)
  }}
>
  Admin Login
</a>

{!loggedInUser ? (
  <a
    href="#user-auth"
    onClick={(e) => {
      e.preventDefault()
      setShowUserAuth(true)
    }}
  >
    Applicant Login
  </a>
) : (
  <>
    <span>Welcome, {loggedInUser.name}</span>
    <a
  href="#profile"
  onClick={(e) => {
    e.preventDefault()
    setShowUserProfile(true)
    setShowUserAuth(false)
  }}
>
  My Profile
</a>

    <a
      href="#logout"
      onClick={(e) => {
        e.preventDefault()
        localStorage.removeItem('userToken')
        localStorage.removeItem('userInfo')
        setLoggedInUser(null)
      }}
    >
      Logout
    </a>
  </>
)}
          
     <a
      href="#applications"
      onClick={(e) => {
  e.preventDefault()
  
  
  setShowApplications((prev) => !prev)
}}
>
  My Applications
</a>
<button
  className="post-btn"
  onClick={() => setShowAdmin(!showAdmin)}
>
  Admin Panel
</button>

          <a href="#jobs" className="post-btn">Explore Jobs</a>
        </div>
      </nav>

      <header className="hero">
        <p className="tagline">YOUR CAREER, YOUR FUTURE</p>
        <h1>
          Find a job that <br />
          <span>fits your future.</span>
        </h1>
        <p className="subtitle">
          Discover opportunities, connect with companies,
          and take the next step in your career.
        </p>

        <form className="search-box" onSubmit={(e) => {
          e.preventDefault()
          document.getElementById('jobs').scrollIntoView({
            behavior: 'smooth'
          })
        }}>
          <input
            type="text"
            placeholder="Job title (e.g. Java Developer)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <input
            type="text"
            placeholder="Location (e.g. Noida)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
              

       <select
  value={jobType}
  onChange={(e) => setJobType(e.target.value)}
>
  <option value="All">All Job Types</option>
  <option value="full_time">Full Time</option>
  <option value="contract">Contract</option>
  <option value="internship">Internship</option>
  <option value="part_time">Part Time</option>
  <option value="freelance">Freelance</option>
</select>
<select
  value={workMode}
  onChange={(e) => setWorkMode(e.target.value)}
>
  <option value="All">All Work Modes</option>
  <option value="Remote">Remote</option>
  <option value="On-site">On-site</option>
  <option value="Hybrid">Hybrid</option>
</select>


          <button type="submit">Search Jobs</button>
        </form>

        <p className="popular">
          Popular: Frontend Developer · Java Developer · Internship
        </p>
      </header>

      <main id="jobs" className="jobs-section">
        <div className="section-heading">
          <div>
            <p className="tagline">CAREER OPPORTUNITIES</p>
            <h2>Featured Jobs</h2>
            <button
  type="button"
  onClick={() => setShowSavedJobs(!showSavedJobs)}
>
  {showSavedJobs ? 'Show All Jobs' : '❤️ My Saved Jobs'}
</button>
          </div>
          <span>{filteredJobs.length} jobs found</span>
        </div>
        {remoteJobs.length > 0 && (
  <p className="remotive-credit">
    Some jobs are sourced from{' '}
    <a
      href="https://remotive.com"
      target="_blank"
      rel="noopener noreferrer"
    >
      Remotive
    </a>.
  </p>
)}
{remoteLoading && (
  <p>Loading remote jobs...</p>
)}

{remoteError && (
  <p>{remoteError}</p>
)}

        <div className="job-grid">
  {filteredJobs.length === 0 ? (
    <p>
      {showSavedJobs
        ? 'No saved jobs yet!'
        : 'No jobs found. Try changing your filters.'}
    </p>
  ) : (
    filteredJobs.map((job, index) => (
            <article className="job-card" key={`${job.company}-${job.title}-${job.id}`}
>
              <div className="job-top">
                <div className="company-logo">
                  {job.company.charAt(0)}
                </div>
                <span className="job-type">{job.type}</span>
              </div>

              <h3>{job.title}</h3>
              <p className="company">{job.company}</p>
                {job.publishedAt && (
  <p className="job-published">
    📅 Posted: {new Date(job.publishedAt).toLocaleDateString('en-IN')}
  </p>
)}
              <div className="job-details">
                <span>📍 {job.location}</span>
                <span>🏢 {job.workMode || 'Remote'}</span>
                <span>💰 {job.salary}</span>
              </div>
               
              <button
                className="apply-btn"
                onClick={() => {
                  console.log('Clicked job:', job.title)
                  setSelectedJob(job)
                }}
              >
                View Details →
              </button>
              <button
  className="save-job-btn"
  onClick={() => toggleSavedJob(job)}
>
  {savedJobs.some((savedJob) => savedJob.id === job.id)
    ? '❤️ Saved'
    : '🤍 Save Job'}
</button>
              {job.url && (
  <a
    href={job.url}
    target="_blank"
    rel="noopener noreferrer"
    className="original-job-link"
  >
    View Original Job / Apply ↗
  </a>
)}
           
                       </article>
          ))
        )}
        </div>
    </main>

       {showApplications && (
      <section className="applications-section" id="applications">
        <h2>My Applications</h2>
        <p className="applications-subtitle">
          Track the jobs you have applied for.
        </p>

        {applications.length === 0 ? (
          <p className="no-jobs">No applications yet. Apply for a job to see it here.</p>
        ) : (
          <div className="applications-list">
            {applications.map((application) => (
              <article className="application-item" key={application.id}>
                <p>Application ID: {application._id}</p>
                <h3>{application.jobTitle}</h3>
                <p>{application.company}</p>
                <p>Applicant: {application.applicantName}</p>
                <p>Applied: {application.appliedAt}</p>
                <p className="application-status">
  Status: {application.status || 'Applied'}
</p>
                <a
                  href={application.resume}
                  target="_blank"
                  rel="noreferrer"
                >
                  View Resume →
                </a>
                
<button
  className="delete-btn"
  onClick={() => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this application?'
    )

    if (!confirmed) return

    const updatedApplications = applications.filter(
      (item) => item.id !== application.id
    )

    localStorage.setItem(
      'jobApplications',
      JSON.stringify(updatedApplications)
    )

    setApplications(updatedApplications)
  }}
>
  Delete Application
</button>

             
             

              </article>
            ))}
          </div>
        )}
      </section>
      )}
      {showAdmin && (
  <section className="applications-section">
    <h2>Admin Panel</h2>
    <p className="applications-subtitle">
      Manage applicant statuses.
    </p>

    {applications.length === 0 ? (
      <p>No applications found.</p>
    ) : (
      <div className="applications-list">
        {applications.map((application) => (
          <article className="application-item" key={application._id}>
            <h3>{application.jobTitle}</h3>
            <p>Company: {application.company}</p>
            <p>Applicant: {application.applicantName}</p>
            <p>Email: {application.email}</p>
            <p>Current Status: {application.status || 'Applied'}</p>

            <select
              value={application.status || 'Applied'}
              onChange={async (e) => {
                const newStatus = e.target.value

                try {
                  const response = await fetch(
                    `http://localhost:5000/api/applications/${application._id}/status`,
                    {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({ status: newStatus })
                    }
                  )

                  const data = await response.json()

                  if (!response.ok) {
                    throw new Error(data.message)
                  }

                  setApplications((prev) =>
                    prev.map((item) =>
                      item._id === application._id
                        ? data.application
                        : item
                    )
                  )

                  alert('Application status updated successfully!')
                } catch (error) {
                  alert(error.message)
                }
              }}
            >
              <option value="Applied">Applied</option>
              <option value="Under Review">Under Review</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Rejected">Rejected</option>
              <option value="Selected">Selected</option>
            </select>
          </article>
        ))}
      </div>
    )}
  </section>
)}

      
{selectedJob && (
  <section className="details-section">
  <button
      className="back-btn"
      onClick={() => setSelectedJob(null)}
    >
      ← Back to Jobs
    </button>

    <div className="details-card">
      <p className="tagline">JOB DETAILS</p>

      <h2>{selectedJob.title}</h2>

      <p className="company">
        {selectedJob.company} · {selectedJob.location}
      </p>

      <div className="details-info">
        <p><strong>Job Type:</strong> {selectedJob.type}</p>
        <p><strong>Salary:</strong> {selectedJob.salary}</p>
      </div>

      <h3>About the Role</h3>
      <p>{selectedJob.description}</p>

      <h3>Required Skills</h3>
      <div className="skills-list">
        {selectedJob.skills.map((skill) => (
          <span key={skill} className="skill">
            {skill}
          </span>
        ))}
      </div>
       
      {selectedJob.url ? (
  <a
    href={selectedJob.url}
    target="_blank"
    rel="noopener noreferrer"
    className="apply-btn"
  >
    View Original Job / Apply ↗
  </a>
) : (
  <button
    className="apply-btn"
    onClick={() => {
      setShowApplicationForm(true)
      setApplicationSubmitted(false)
    }}
  >
    Apply Now →
  </button>
)}
     </div>
  </section>
)}

{showApplicationForm && selectedJob && (
  <section className="application-section">
    <div className="application-card">
      <button
        type="button"
        className="back-btn"
        onClick={() => setShowApplicationForm(false)}
      >
        ← Back to Job Details
      </button>

      <h2>Apply for {selectedJob.title}</h2>
      <p>{selectedJob.company}</p>

      {applicationSubmitted ? (
        <div className="success-message">
          <h3>Application Form Submitted!</h3>
          <p>
            This is a demo. Your application has not been sent to the company.
          </p>
        </div>
      ) : (
       <form
  className="application-form"
  onSubmit={async (e) => {
    e.preventDefault()

    const newApplication = {
      id: Date.now(),
      jobId: selectedJob._id,
      
      
      jobTitle: selectedJob.title,
      company: selectedJob.company,
      applicantName: applicant.name,
      email: applicant.email,
      phone: applicant.phone,
      resume: applicant.resume,
      appliedAt: new Date().toLocaleString(),
    }
    console.log('Selected Job ID:', selectedJob._id)
    const token = localStorage.getItem('userToken')

try {
  const response = await fetch('http://localhost:5000/api/applications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(newApplication),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Application submission failed')
  }

  const updatedApplications = [...applications, data.application]

  localStorage.setItem(
    'jobApplications',
    JSON.stringify(updatedApplications)
  )

  setApplications(updatedApplications)
  setApplicationSubmitted(true)

} catch (error) {
  console.error('Application submission failed:', error)
  alert(error.message)
}
}}
>
        
          <label>Full Name</label>
          <input
            type="text"
            required
            value={applicant.name}
            onChange={(e) =>
              setApplicant({ ...applicant, name: e.target.value })
            }
            placeholder="Enter your full name"
          />

          <label>Email Address</label>
          <input
            type="email"
            required
            value={applicant.email}
            onChange={(e) =>
              setApplicant({ ...applicant, email: e.target.value })
            }
            placeholder="Enter your email"
          />

          <label>Phone Number</label>
          <input
            type="tel"
            required
            pattern="[0-9]{10}"
            title="Enter a 10-digit phone number"
            value={applicant.phone}
            onChange={(e) =>
              setApplicant({ ...applicant, phone: e.target.value })
            }
            placeholder="10-digit mobile number"
          />

          <label>Resume Link</label>
          <input
            type="url"
            required
            value={applicant.resume}
            onChange={(e) =>
              setApplicant({ ...applicant, resume: e.target.value })
            }
            placeholder="https://..."
          />

          <button type="submit" className="apply-btn">
            Submit Application →
          </button>
        </form>
      )}
    </div>
  </section>
)}
<section id="about" className="about">
        <h2>Your next opportunity starts here.</h2>
        <p>
          JobConnect helps job seekers explore career opportunities
          and find roles that match their skills.
        </p>
      </section>

      <footer>
        <a href="#" className="brand">
          Job<span>Connect</span>
        </a>
        <p>© 2026 JobConnect. Built with React.</p>
      </footer>
    </div>
  )
}

export default App

