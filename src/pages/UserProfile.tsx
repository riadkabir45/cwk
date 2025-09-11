import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

interface MessageState {
  text: string;
  type: 'success' | 'error' | null;
}

interface MessageBoxProps {
  message: MessageState;
  setMessage: React.Dispatch<React.SetStateAction<MessageState>>;
}

const MessageBox: React.FC<MessageBoxProps> = ({ message, setMessage }) => {
  useEffect(() => {
    if (message.type) {
      const timer = setTimeout(() => {
        setMessage({ text: '', type: null });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message.type, setMessage]);

  if (!message.type) return null;

  return (
    <div className={`mb-4 p-4 rounded-md ${
      message.type === 'success' 
        ? 'bg-green-100 border border-green-400 text-green-700'
        : 'bg-red-100 border border-red-400 text-red-700'
    }`}>
      {message.text}
    </div>
  );
};

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  profilePicture?: string;
  bio?: string;
  location?: string;
  website?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  twitterUrl?: string;
  company?: string;
  jobTitle?: string;
  skills?: string[];
  interests?: string[];
  joinedDate: string;
  
  // Stats
  totalTasks?: number;
  completedTasks?: number;
  currentStreak?: number;
  totalComments?: number;
  
  // Privacy settings (only for own profile)
  showEmail?: boolean;
  showLocation?: boolean;
  showCompany?: boolean;
  showSocialLinks?: boolean;
  showSkills?: boolean;
  showInterests?: boolean;
  showTaskStats?: boolean;
  isProfilePublic?: boolean;
  
  // Flags
  isOwnProfile: boolean;
  canViewProfile: boolean;
}

const UserProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState<MessageState>({ text: '', type: null });

  useEffect(() => {
    if (userId) {
      loadProfile();
    } else if (user) {
      // If no userId provided, load current user's profile
      loadMyProfile();
    }
  }, [userId, user]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/profiles/${userId}`);
      setProfile(response.data);
    } catch (error: any) {
      if (error.response?.status === 403) {
        setMessage({ text: 'This profile is private', type: 'error' });
      } else if (error.response?.status === 404) {
        setMessage({ text: 'User not found', type: 'error' });
      } else {
        setMessage({ text: 'Failed to load profile', type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  const loadMyProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/profiles/me');
      setProfile(response.data);
    } catch (error: any) {
      setMessage({ text: 'Failed to load profile', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (updatedProfile: Partial<UserProfile>) => {
    try {
      const targetId = userId || user?.id;
      const response = await api.put(`/api/profiles/${targetId}`, updatedProfile);
      setProfile(response.data);
      setEditing(false);
      setMessage({ text: 'Profile updated successfully', type: 'success' });
    } catch (error) {
      setMessage({ text: 'Failed to update profile', type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <MessageBox message={message} setMessage={setMessage} />
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Available</h1>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <MessageBox message={message} setMessage={setMessage} />
      
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32 relative">
          <div className="absolute -bottom-16 left-8">
            <img
              src={profile.profilePicture || '/default-avatar.png'}
              alt="Profile"
              className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
            />
          </div>
          {profile.isOwnProfile && (
            <div className="absolute top-4 right-4">
              <button
                onClick={() => setEditing(!editing)}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg shadow hover:bg-gray-50"
              >
                {editing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
          )}
        </div>

        {/* Profile Content */}
        <div className="pt-20 pb-8 px-8">
          {editing ? (
            <EditProfileForm profile={profile} onSave={handleSave} onCancel={() => setEditing(false)} />
          ) : (
            <ViewProfile profile={profile} />
          )}
        </div>
      </div>
    </div>
  );
};

const ViewProfile: React.FC<{ profile: UserProfile }> = ({ profile }) => {
  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {profile.firstName} {profile.lastName}
        </h1>
        {profile.email && (
          <p className="text-gray-600 mt-1">{profile.email}</p>
        )}
        {profile.jobTitle && profile.company && (
          <p className="text-gray-700 mt-2">
            {profile.jobTitle} at {profile.company}
          </p>
        )}
        {profile.location && (
          <p className="text-gray-600 mt-1 flex items-center">
            <span className="mr-1">📍</span>
            {profile.location}
          </p>
        )}
        <p className="text-gray-500 text-sm mt-2">
          Joined {new Date(profile.joinedDate).toLocaleDateString()}
        </p>
      </div>

      {/* Bio */}
      {profile.bio && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">About</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{profile.bio}</p>
        </div>
      )}

      {/* Stats */}
      {(profile.totalTasks !== undefined) && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Stats</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{profile.totalTasks}</div>
              <div className="text-sm text-gray-600">Total Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{profile.completedTasks}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{profile.currentStreak}</div>
              <div className="text-sm text-gray-600">Current Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{profile.totalComments}</div>
              <div className="text-sm text-gray-600">Comments</div>
            </div>
          </div>
        </div>
      )}

      {/* Skills */}
      {profile.skills && profile.skills.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Interests */}
      {profile.interests && profile.interests.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Interests</h3>
          <div className="flex flex-wrap gap-2">
            {profile.interests.map((interest, index) => (
              <span
                key={index}
                className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Social Links */}
      {(profile.website || profile.linkedinUrl || profile.githubUrl || profile.twitterUrl) && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Links</h3>
          <div className="flex flex-wrap gap-4">
            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 flex items-center"
              >
                🌐 Website
              </a>
            )}
            {profile.linkedinUrl && (
              <a
                href={profile.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 flex items-center"
              >
                💼 LinkedIn
              </a>
            )}
            {profile.githubUrl && (
              <a
                href={profile.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 flex items-center"
              >
                💻 GitHub
              </a>
            )}
            {profile.twitterUrl && (
              <a
                href={profile.twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 flex items-center"
              >
                🐦 Twitter
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const EditProfileForm: React.FC<{
  profile: UserProfile;
  onSave: (profile: Partial<UserProfile>) => void;
  onCancel: () => void;
}> = ({ profile, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    bio: profile.bio || '',
    location: profile.location || '',
    website: profile.website || '',
    linkedinUrl: profile.linkedinUrl || '',
    githubUrl: profile.githubUrl || '',
    twitterUrl: profile.twitterUrl || '',
    company: profile.company || '',
    jobTitle: profile.jobTitle || '',
    skills: profile.skills || [],
    interests: profile.interests || [],
    showEmail: profile.showEmail ?? false,
    showLocation: profile.showLocation ?? true,
    showCompany: profile.showCompany ?? true,
    showSocialLinks: profile.showSocialLinks ?? true,
    showSkills: profile.showSkills ?? true,
    showInterests: profile.showInterests ?? true,
    showTaskStats: profile.showTaskStats ?? true,
    isProfilePublic: profile.isProfilePublic ?? true,
  });

  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(s => s !== skill)
    });
  };

  const addInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData({
        ...formData,
        interests: [...formData.interests, newInterest.trim()]
      });
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setFormData({
      ...formData,
      interests: formData.interests.filter(i => i !== interest)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Edit Profile</h2>
      </div>

      {/* Bio */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
        <textarea
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          rows={4}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Tell us about yourself..."
        />
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
          <input
            type="text"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
          <input
            type="text"
            value={formData.jobTitle}
            onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
          <input
            type="url"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Social Links */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Social Links</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn URL</label>
            <input
              type="url"
              value={formData.linkedinUrl}
              onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">GitHub URL</label>
            <input
              type="url"
              value={formData.githubUrl}
              onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Twitter URL</label>
            <input
              type="url"
              value={formData.twitterUrl}
              onChange={(e) => setFormData({ ...formData, twitterUrl: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Skills */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Skills</h3>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
            placeholder="Add a skill"
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={addSkill}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.skills.map((skill, index) => (
            <span
              key={index}
              className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
            >
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Interests */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Interests</h3>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newInterest}
            onChange={(e) => setNewInterest(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
            placeholder="Add an interest"
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={addInterest}
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.interests.map((interest, index) => (
            <span
              key={index}
              className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
            >
              {interest}
              <button
                type="button"
                onClick={() => removeInterest(interest)}
                className="text-green-600 hover:text-green-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Privacy Settings */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Privacy Settings</h3>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isProfilePublic}
              onChange={(e) => setFormData({ ...formData, isProfilePublic: e.target.checked })}
              className="mr-2"
            />
            Make profile public (visible to all users)
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.showEmail}
              onChange={(e) => setFormData({ ...formData, showEmail: e.target.checked })}
              className="mr-2"
            />
            Show email address
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.showLocation}
              onChange={(e) => setFormData({ ...formData, showLocation: e.target.checked })}
              className="mr-2"
            />
            Show location
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.showCompany}
              onChange={(e) => setFormData({ ...formData, showCompany: e.target.checked })}
              className="mr-2"
            />
            Show company and job title
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.showSocialLinks}
              onChange={(e) => setFormData({ ...formData, showSocialLinks: e.target.checked })}
              className="mr-2"
            />
            Show social links
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.showSkills}
              onChange={(e) => setFormData({ ...formData, showSkills: e.target.checked })}
              className="mr-2"
            />
            Show skills
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.showInterests}
              onChange={(e) => setFormData({ ...formData, showInterests: e.target.checked })}
              className="mr-2"
            />
            Show interests
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.showTaskStats}
              onChange={(e) => setFormData({ ...formData, showTaskStats: e.target.checked })}
              className="mr-2"
            />
            Show activity statistics
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
        >
          Save Changes
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default UserProfile;
