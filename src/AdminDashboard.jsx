
import { useEffect, useState } from 'react'
import './AdminDashboard.css'

function AdminDashboard({ onLogout }) {
  const [applications, setApplications] = useState([])
  const [jobs, setJobs] = useState([])
const [showJobForm, setShowJobForm] = useState(false)
const [editingJobId, setEditingJobId] = useState(null)

const [newJob, setNewJob] = useState({
  title: '',
  company: '',
  location: '',
  workMode: 'On-site',
  type: 'Full Time',
  salary: '',
  description: '',
  skills: ''
})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const updateStatus = async (applicationId, newStatus) => {
  try {
    const response = await fetch(
      `http://localhost:5000/api/applications/${applicationId}/status`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ status: newStatus })
      }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Status update failed')
    }

    setApplications((prevApplications) =>
      prevApplications.map((application) =>
        application._id === applicationId
          ? { ...application, status: newStatus }
          : application
      )
    )
  } catch (error) {
    alert(error.message)
  }
}
const handleAddJob = async (e) => {
  e.preventDefault()

  try {
    const response = await fetch('http://localhost:5000/api/jobs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('adminToken')}`
      },
      body: JSON.stringify({
        ...newJob,
        skills: newJob.skills
          .split(',')
          .map((skill) => skill.trim())
          .filter((skill) => skill !== '')
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to add job')
    }

    setJobs((prevJobs) => [data.job, ...prevJobs])

    alert('Job added successfully!')

    setNewJob({
      title: '',
      company: '',
      location: '',
      workMode: 'On-site',
      type: 'Full Time',
      salary: '',
      description: '',
      skills: ''
    })

    setShowJobForm(false)
  } catch (error) {
    alert(error.message)
  }
}
const handleEditClick = (job) => {
  setEditingJobId(job._id)

  setNewJob({
    title: job.title,
    company: job.company,
    location: job.location,
    workMode: job.workMode,
    type: job.type,
    salary: job.salary,
    description: job.description,
    skills: Array.isArray(job.skills)
      ? job.skills.join(', ')
      : ''
  })

  setShowJobForm(true)
}
const handleUpdateJob = async () => {
  try {
    const response = await fetch(
      `http://localhost:5000/api/jobs/${editingJobId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          ...newJob,
          skills: newJob.skills
            .split(',')
            .map((skill) => skill.trim())
            .filter((skill) => skill !== '')
        })
      }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update job')
    }

    setJobs((prevJobs) =>
      prevJobs.map((job) =>
        job._id === editingJobId ? data.job : job
      )
    )

    alert('Job updated successfully!')

    setEditingJobId(null)
    setShowJobForm(false)
  } catch (error) {
    alert(error.message)
  }
}
const handleDeleteJob = async (jobId) => {
  const confirmDelete = window.confirm(
    'Are you sure you want to delete this job?'
  )

  if (!confirmDelete) return

  try {
    const response = await fetch(
      `http://localhost:5000/api/jobs/${jobId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        }
      }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete job')
    }

    setJobs((prevJobs) =>
      prevJobs.filter((job) => job._id !== jobId)
    )

    alert('Job deleted successfully!')
  } catch (error) {
    alert(error.message)
  }
}

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await fetch(
          'http://localhost:5000/api/admin/applications',
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('adminToken')}`
            }
          }
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch applications')
        }

        setApplications(data)
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()
  }, [])
  useEffect(() => {
  const fetchJobs = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/jobs')
      const data = await response.json()

      if (!response.ok) {
        throw new Error('Failed to fetch jobs')
      }

      setJobs(data)
    } catch (error) {
      console.error('Error fetching jobs:', error)
    }
  }

  fetchJobs()
}, [])

  if (loading) {

    return <h2>Loading applications...</h2>
  }

  if (error) {
    return <p>{error}</p>
  }

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <button onClick={() => setShowJobForm(!showJobForm)}>
  {showJobForm ? 'Close Form' : 'Add New Job'}
</button>
      <button onClick={onLogout}>Logout</button>
      {showJobForm && (
  <form
  className="job-form"
  onSubmit={(e) => {
    if (editingJobId) {
      e.preventDefault()
      handleUpdateJob()
    } else {
      handleAddJob(e)
    }
  }}
>
    <h2>{editingJobId ? 'Edit Job' : 'Add New Job'}</h2>

    <input
      type="text"
      placeholder="Job Title"
      value={newJob.title}
      onChange={(e) =>
        setNewJob({ ...newJob, title: e.target.value })
      }
      required
    />

    <input
      type="text"
      placeholder="Company"
      value={newJob.company}
      onChange={(e) =>
        setNewJob({ ...newJob, company: e.target.value })
      }
      required
    />

    <input
      type="text"
      placeholder="Location"
      value={newJob.location}
      onChange={(e) =>
        setNewJob({ ...newJob, location: e.target.value })
      }
      required
    />
        

    <select
      value={newJob.workMode}
      onChange={(e) =>
        setNewJob({ ...newJob, workMode: e.target.value })
      }
    >
      <option value="On-site">On-site</option>
      <option value="Remote">Remote</option>
      <option value="Hybrid">Hybrid</option>
    </select>

    <select
      value={newJob.type}
      onChange={(e) =>
        setNewJob({ ...newJob, type: e.target.value })
      }
    >
      <option value="Full Time">Full Time</option>
      <option value="Part Time">Part Time</option>
      <option value="Internship">Internship</option>
    </select>

    <input
      type="text"
      placeholder="Salary (e.g. ₹4-6 LPA)"
      value={newJob.salary}
      onChange={(e) =>
        setNewJob({ ...newJob, salary: e.target.value })
      }
      required
    />
    <textarea
  placeholder="Job Description"
  value={newJob.description}
  onChange={(e) =>
    setNewJob({ ...newJob, description: e.target.value })
  }
  required
/>

<input
  type="text"
  placeholder="Skills (e.g. HTML, CSS, JavaScript)"
  value={newJob.skills}
  onChange={(e) =>
    setNewJob({ ...newJob, skills: e.target.value })
  }
/>
<button type="submit">
  {editingJobId ? 'Update Job' : 'Save Job'}
</button>
<button
  type="button"
  onClick={() => {
    setEditingJobId(null)
    setShowJobForm(false)
    setNewJob({
      title: '',
      company: '',
      location: '',
      workMode: 'On-site',
      type: 'Full Time',
      salary: '',
      description: '',
      skills: ''
    })
  }}
>
  Cancel
</button>
  </form>
)}

      <h3>Total Applications: {applications.length}</h3>
      <h2>Manage Jobs</h2>

<h3>Total Applications: {applications.length}</h3>

{jobs.map((job) => (
  <article key={job._id} className="application-item">
    <h3>{job.title}</h3>
    <p>Company: {job.company}</p>
    <p>Location: {job.location}</p>
    <p>Salary: {job.salary}</p>
    <div>
 <button onClick={() => handleEditClick(job)}>
  Edit
</button>
 

  <button onClick={() => handleDeleteJob(job._id)}>
  Delete
</button>
</div>
  </article>
))}

      {applications.map((application) => (
        <article key={application._id} className="application-item">
          <h3>{application.jobTitle}</h3>
          <p>Company: {application.company}</p>
          <p>Applicant: {application.applicantName}</p>
          <p>Email: {application.email}</p>
          <div>
  <label>Status: </label>

  <select
    value={application.status || 'Applied'}
    onChange={(e) =>
      updateStatus(application._id, e.target.value)
    }
  >
    <option value="Applied">Applied</option>
    <option value="Selected">Selected</option>
    <option value="Rejected">Rejected</option>
  </select>
</div>
          
        </article>
      ))}
    </div>
  )
}

export default AdminDashboard
