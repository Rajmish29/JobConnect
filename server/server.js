require('dotenv').config()
const mongoose = require('mongoose')

const express = require('express')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const applicationSchema = new mongoose.Schema({
  id: Number,
  userId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User'
},
jobId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Job',
  required: true
},
  jobTitle: String,
  company: String,
  applicantName: String,
  email: String,
  phone: String,
  resume: String,
  appliedAt: String,
  status: {
  type: String,
  enum: ['Applied', 'Under Review', 'Shortlisted', 'Rejected', 'Selected'],
  default: 'Applied'
},
}, { timestamps: true })

const Application = mongoose.model('Application', applicationSchema)
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  }
}, { timestamps: true })

const User = mongoose.model('User', userSchema)
const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    company: {
      type: String,
      required: true
    },
    location: {
      type: String,
      required: true
    },
    workMode: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    salary: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    skills: {
      type: [String],
      default: []
    }
  },
  { timestamps: true }
)

const Job = mongoose.model('Job', jobSchema)

const app = express()
app.use(cors())
app.use(express.json())
const PORT = 5000

app.get('/', (req, res) => {
  res.send('JobConnect Backend is running!')
})
app.get('/api/jobs', async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 })

    res.status(200).json(jobs)
  } catch (error) {
    console.error('Get jobs error:', error)

    res.status(500).json({
      message: 'Failed to fetch jobs'
    })
  }
})
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (
      email !== process.env.ADMIN_EMAIL ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      return res.status(401).json({
        message: 'Invalid email or password'
      })
    }

    const token = jwt.sign(
      { role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    )

    res.status(200).json({
      message: 'Admin login successful',
      token
    })
  } catch (error) {
    console.error('Admin login error:', error)

    res.status(500).json({
      message: 'Login failed'
    })
  }
})

app.post('/api/user/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'All fields are required'
      })
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters'
      })
    }

    const normalizedEmail = email.trim().toLowerCase()

    const existingUser = await User.findOne({
      email: normalizedEmail
    })

    if (existingUser) {
      return res.status(409).json({
        message: 'Email already registered'
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword
    })

    const token = jwt.sign(
      {
        userId: user._id,
        role: 'user'
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    )

    res.status(201).json({
      message: 'Signup successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    })
  } catch (error) {
    console.error('Signup error:', error)

    res.status(500).json({
      message: 'Signup failed'
    })
  }
})

app.post('/api/user/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required'
      })
    }

    const normalizedEmail = email.trim().toLowerCase()

    const user = await User.findOne({
      email: normalizedEmail
    })

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password'
      })
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    )

    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid email or password'
      })
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: 'user'
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    )

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    })
  } catch (error) {
    console.error('User login error:', error)

    res.status(500).json({
      message: 'Login failed'
    })
  }
})


const verifyAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Access denied. Please login first.'
      })
    }

    const token = authHeader.split(' ')[1]

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    if (decoded.role !== 'admin') {
      return res.status(403).json({
        message: 'Admin access required'
      })
    }

    req.admin = decoded
    next()
  } catch (error) {
    return res.status(401).json({
      message: 'Invalid or expired token'
    })
  }
}
app.post('/api/jobs', verifyAdmin, async (req, res) => {
  try {
    const {
      title,
      company,
      location,
      workMode,
      type,
      salary,
      description,
      skills
    } = req.body

    if (
      !title || !company || !location ||
      !workMode || !type || !salary || !description
    ) {
      return res.status(400).json({
        message: 'All required fields must be filled'
      })
    }

    const newJob = await Job.create({
      title,
      company,
      location,
      workMode,
      type,
      salary,
      description,
      skills: Array.isArray(skills) ? skills : []
    })

    res.status(201).json({
      message: 'Job created successfully',
      job: newJob
    })
  } catch (error) {
    console.error('Add job error:', error)

    res.status(500).json({
      message: 'Failed to create job'
    })
  }
})
app.put('/api/jobs/:id', verifyAdmin, async (req, res) => {
  try {
    const {
      title,
      company,
      location,
      workMode,
      type,
      salary,
      description,
      skills
    } = req.body

    if (
      !title || !company || !location ||
      !workMode || !type || !salary || !description
    ) {
      return res.status(400).json({
        message: 'All required fields must be filled'
      })
    }

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      {
        title,
        company,
        location,
        workMode,
        type,
        salary,
        description,
        skills: Array.isArray(skills) ? skills : []
      },
      { returnDocument: 'after', runValidators: true }
    )

    if (!updatedJob) {
      return res.status(404).json({
        message: 'Job not found'
      })
    }

    res.status(200).json({
      message: 'Job updated successfully',
      job: updatedJob
    })
  } catch (error) {
    console.error('Update job error:', error)

    res.status(500).json({
      message: 'Failed to update job'
    })
  }
})
app.delete('/api/jobs/:id', verifyAdmin, async (req, res) => {
  try {
    const deletedJob = await Job.findByIdAndDelete(req.params.id)

    if (!deletedJob) {
      return res.status(404).json({
        message: 'Job not found'
      })
    }

    res.status(200).json({
      message: 'Job deleted successfully'
    })
  } catch (error) {
    console.error('Delete job error:', error)

    res.status(500).json({
      message: 'Failed to delete job'
    })
  }
})

const verifyUser = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Please login first'
      })
    }

    const token = authHeader.split(' ')[1]

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    if (decoded.role !== 'user') {
      return res.status(403).json({
        message: 'User access required'
      })
    }

    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({
      message: 'Invalid or expired token'
    })
  }
}
app.put('/api/user/profile', verifyUser, async (req, res) => {
  try {
    const { name } = req.body

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: 'Name is required'
      })
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { name: name.trim() },
     
     { returnDocument: 'after', runValidators: true } 
    ).select('-password')

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      })
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    })
  } catch (error) {
    console.error('Profile update error:', error)

    res.status(500).json({
      message: 'Profile update failed'
    })
  }
})




app.get('/api/applications', verifyUser, async (req, res) => {
  try {
    const applications = await Application.find({
      userId: req.user.userId
    }).sort({ createdAt: -1 })

    res.status(200).json(applications)

  } catch (error) {
    console.error('Error fetching applications:', error)

    res.status(500).json({
      message: 'Failed to fetch applications'
    })
  }
})
app.get('/api/admin/applications', verifyAdmin, async (req, res) => {
  try {
    const applications = await Application.find().sort({ createdAt: -1 })

    res.status(200).json(applications)
  } catch (error) {
    console.error('Error fetching admin applications:', error)

    res.status(500).json({
      message: 'Failed to fetch applications'
    })
  }
})

app.post('/api/applications', verifyUser, async (req, res) => {
  try {
    const {
      jobId,
      jobTitle,
      company,
      applicantName,
      email,
      phone,
      resume,
      appliedAt
    } = req.body
    console.log('POST APPLICATION ROUTE HIT')
console.log('Logged-in user:', req.user.userId)
console.log('Received jobId:', jobId)
    
    const existingApplication = await Application.findOne({
      

  userId: req.user.userId,
  $or: [
    { jobId: jobId },
    {
      jobId: { $exists: false },
      jobTitle: jobTitle,
      company: company
    }
  ]
})
console.log('Logged-in user:', req.user.userId)
console.log('Received jobId:', jobId)
console.log('Existing application:', existingApplication)

if (existingApplication) {
  return res.status(409).json({
    message: 'You have already applied for this job!'
  })
}

    const savedApplication = await Application.create({
      jobId,
      jobTitle,
      company,
      applicantName,
      email,
      phone,
      resume,
      appliedAt,
      userId: req.user.userId
    })

    console.log('New Application saved:', savedApplication._id)

    res.status(201).json({
      message: 'Application saved successfully!',
      application: savedApplication
    })
  } catch (error) {
    console.error('Error saving application:', error)

    res.status(500).json({
      message: 'Failed to save application'
    })
  }
})
app.put('/api/applications/:id/status', verifyAdmin, async (req, res) => {
  try {
    const { status } = req.body

    const allowedStatuses = [
      'Applied',
      'Under Review',
      'Shortlisted',
      'Rejected',
      'Selected'
    ]

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid application status'
      })
    }

    const updatedApplication = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { returnDocument: 'after', runValidators: true }
    )

    if (!updatedApplication) {
      return res.status(404).json({
        message: 'Application not found'
      })
    }

    res.status(200).json({
      message: 'Application status updated successfully',
      application: updatedApplication
    })
  } catch (error) {
    console.error('Error updating application status:', error)

    res.status(500).json({
      message: 'Failed to update application status'
    })
  }
})
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully')

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`)
    })
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error.message)
  })


