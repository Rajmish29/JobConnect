import { useState } from 'react'

function UserProfile({ user, onProfileUpdate }) {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(user.name)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleUpdate = async (e) => {
    e.preventDefault()

    try {
      setLoading(true)
      setMessage('')

      const response = await fetch(
        'http://localhost:5000/api/user/profile',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('userToken')}`
          },
          body: JSON.stringify({ name })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Profile update failed')
      }

      onProfileUpdate(data.user)
      setName(data.user.name)
      setIsEditing(false)
      setMessage('Profile updated successfully!')
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="user-profile">
      <h2>My Profile</h2>

      {isEditing ? (
        <form onSubmit={handleUpdate}>
          <label>Name:</label>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <p>Email: {user.email}</p>

          <button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsEditing(false)
              setName(user.name)
            }}
          >
            Cancel
          </button>
        </form>
      ) : (
        <>
          <div className="profile-details">
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
          </div>

          <button onClick={() => setIsEditing(true)}>
            Edit Profile
          </button>
        </>
      )}

      {message && <p>{message}</p>}
    </div>
  )
}

export default UserProfile
