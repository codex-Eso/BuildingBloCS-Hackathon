import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../SupaBase';
import { useAuth } from '../auth/useAuth';
import '../css/ProfilePage.css';

export default function ProfilePage() {
    const navigate = useNavigate();
    const { signOut } = useAuth();
    const fileInputRef = useRef(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [userId, setUserId] = useState(null);
    const [userPoints, setUserPoints] = useState(0);
    const [profile, setProfile] = useState({
        username: '',
        name: '',
        bio: '',
        profile_picture: null,
        points: 0,
        quest_completed: 0,
        total_points_earned: 0,
        total_points_donated: 0,
        created_at: null
    });
    const [originalProfile, setOriginalProfile] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/login');
                return;
            }

            const { data: userData, error } = await supabase
                .from('user_details')
                .select('*')
                .eq('auth_id', user.id)
                .single();

            if (error) throw error;

            setUserId(userData.user_id);
            setUserPoints(userData.points || 0);
            const profileData = {
                username: userData.username || '',
                name: userData.name || '',
                bio: userData.bio || '',
                profile_picture: userData.profile_picture || null,
                points: userData.points || 0,
                quest_completed: userData.quest_completed || 0,
                total_points_earned: userData.total_points_earned || 0,
                total_points_donated: userData.total_points_donated || 0,
                created_at: userData.created_at
            };
            setProfile(profileData);
            setOriginalProfile(profileData);
        } catch (error) {
            console.error('Error fetching profile:', error);
            setMessage({ type: 'error', text: 'Failed to load profile' });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setMessage({ type: 'error', text: 'Please select an image file' });
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setMessage({ type: 'error', text: 'Image must be less than 5MB' });
            return;
        }

        setUploading(true);
        setMessage({ type: '', text: '' });

        try {
            // Create unique filename
            const fileExt = file.name.split('.').pop();
            const fileName = `${userId}_${Date.now()}.${fileExt}`;
            const filePath = `profiles/${fileName}`;

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('quest-images')
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('quest-images')
                .getPublicUrl(filePath);

            // Update profile picture in state
            setProfile(prev => ({ ...prev, profile_picture: publicUrl }));
            setMessage({ type: 'success', text: 'Image uploaded! Click Save to confirm changes.' });
        } catch (error) {
            console.error('Error uploading image:', error);
            setMessage({ type: 'error', text: 'Failed to upload image' });
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            // Validate username
            if (!profile.username.trim()) {
                setMessage({ type: 'error', text: 'Username is required' });
                setSaving(false);
                return;
            }

            // Check if username is taken (if changed)
            if (profile.username !== originalProfile.username) {
                const { data: existingUser } = await supabase
                    .from('user_details')
                    .select('user_id')
                    .eq('username', profile.username)
                    .neq('user_id', userId)
                    .single();

                if (existingUser) {
                    setMessage({ type: 'error', text: 'Username is already taken' });
                    setSaving(false);
                    return;
                }
            }

            // Update profile
            const { error } = await supabase
                .from('user_details')
                .update({
                    username: profile.username.trim(),
                    name: profile.name.trim(),
                    bio: profile.bio.trim(),
                    profile_picture: profile.profile_picture
                })
                .eq('user_id', userId);

            if (error) throw error;

            setOriginalProfile(profile);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error) {
            console.error('Error saving profile:', error);
            setMessage({ type: 'error', text: 'Failed to save profile' });
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setProfile(originalProfile);
        setMessage({ type: '', text: '' });
    };

    const hasChanges = JSON.stringify(profile) !== JSON.stringify(originalProfile);

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="ecoquest-container">
                <div className="loading-state">Loading profile...</div>
            </div>
        );
    }

    const tabs = [
        { id: 'quests', label: 'Quests', icon: 'trophy', path: '/app' },
        { id: 'community', label: 'Community', icon: 'people', path: '/community' },
        { id: 'redeem', label: 'Redeem', icon: 'gift', path: '/redeem' },
        { id: 'profile', label: 'Profile', icon: 'person', path: '/profile' }
    ];

    const renderTabIcon = (iconType) => {
        switch (iconType) {
            case 'trophy':
                return (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                        <path d="M4 22h16" />
                        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                    </svg>
                );
            case 'people':
                return (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                );
            case 'gift':
                return (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="8" width="18" height="4" rx="1" />
                        <path d="M12 8v13" />
                        <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
                        <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
                    </svg>
                );
            case 'person':
                return (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="8" r="5" />
                        <path d="M20 21a8 8 0 0 0-16 0" />
                    </svg>
                );
            default:
                return null;
        }
    };

    return (
        <div className="ecoquest-container">
            {/* Header */}
            <header className="ecoquest-header">
                <div className="logo">
                    <div className="logo-icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c1.5 0 3-.3 4.3-.9" stroke="#22C55E" strokeWidth="2" strokeLinecap="round"/>
                            <path d="M17 8c-4 0-6 3-6 6s3 6 6 6 6-3 6-6" stroke="#22C55E" strokeWidth="2" strokeLinecap="round"/>
                            <path d="M20 5l-3 3" stroke="#22C55E" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    </div>
                    <span className="logo-text">EcoQuest</span>
                </div>
                <div className="header-right">
                    <div className="points-badge">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2">
                            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                            <path d="M4 22h16" />
                            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                        </svg>
                        <span>{userPoints} pts</span>
                    </div>
                    <button className="logout-btn" onClick={handleLogout}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                            <polyline points="16 17 21 12 16 7"/>
                            <line x1="21" y1="12" x2="9" y2="12"/>
                        </svg>
                        Logout
                    </button>
                </div>
            </header>

            {/* Navigation Tabs */}
            <nav className="nav-tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`nav-tab ${tab.id === 'profile' ? 'active' : ''}`}
                        onClick={() => navigate(tab.path)}
                    >
                        {renderTabIcon(tab.icon)}
                        <span>{tab.label}</span>
                    </button>
                ))}
            </nav>

            {/* Main Content */}
            <main className="main-content">
                <div className="profile-container">
                    {/* Profile Header */}
                    <div className="profile-header-section">
                        <div className="profile-avatar-container" onClick={handleImageClick}>
                            {profile.profile_picture ? (
                                <img 
                                    src={profile.profile_picture} 
                                    alt="Profile" 
                                    className="profile-avatar-img"
                                />
                            ) : (
                                <div className="profile-avatar-placeholder">
                                    {profile.name ? profile.name.charAt(0).toUpperCase() : '?'}
                                </div>
                            )}
                            <div className="avatar-overlay">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                                    <circle cx="12" cy="13" r="4"/>
                                </svg>
                                <span>{uploading ? 'Uploading...' : 'Change Photo'}</span>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                        </div>
                        <div className="profile-header-info">
                            <h1 className="profile-name">{profile.name || profile.username || 'User'}</h1>
                            <p className="profile-username">@{profile.username || 'username'}</p>
                            <p className="profile-joined">Joined {formatDate(profile.created_at)}</p>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="profile-stats">
                        <div className="stat-card">
                            <div className="stat-icon quests-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                                    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                                    <path d="M4 22h16" />
                                    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                                    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                                    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                                </svg>
                            </div>
                            <div className="stat-info">
                                <span className="stat-value">{profile.quest_completed || 0}</span>
                                <span className="stat-label">Quests Done</span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon points-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                </svg>
                            </div>
                            <div className="stat-info">
                                <span className="stat-value">{profile.points || 0}</span>
                                <span className="stat-label">Current Points</span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon earned-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="12" y1="20" x2="12" y2="10" />
                                    <line x1="18" y1="20" x2="18" y2="4" />
                                    <line x1="6" y1="20" x2="6" y2="16" />
                                </svg>
                            </div>
                            <div className="stat-info">
                                <span className="stat-value">{profile.total_points_earned || 0}</span>
                                <span className="stat-label">Total Earned</span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon donated-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                                </svg>
                            </div>
                            <div className="stat-info">
                                <span className="stat-value">{profile.total_points_donated || 0}</span>
                                <span className="stat-label">Points Donated</span>
                            </div>
                        </div>
                    </div>

                    {/* Message */}
                    {message.text && (
                        <div className={`profile-message ${message.type}`}>
                            {message.text}
                        </div>
                    )}

                    {/* Edit Form */}
                    <div className="profile-form-section">
                        <h2 className="section-title">Edit Profile</h2>
                        
                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={profile.username}
                                onChange={handleInputChange}
                                placeholder="Enter username"
                                maxLength={30}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="name">Display Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={profile.name}
                                onChange={handleInputChange}
                                placeholder="Enter your name"
                                maxLength={50}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="bio">Bio</label>
                            <textarea
                                id="bio"
                                name="bio"
                                value={profile.bio}
                                onChange={handleInputChange}
                                placeholder="Tell us about yourself..."
                                rows={4}
                                maxLength={200}
                            />
                            <span className="char-count">{profile.bio.length}/200</span>
                        </div>

                        <div className="form-actions">
                            <button 
                                className="cancel-btn" 
                                onClick={handleCancel}
                                disabled={!hasChanges || saving}
                            >
                                Cancel
                            </button>
                            <button 
                                className="save-btn" 
                                onClick={handleSave}
                                disabled={!hasChanges || saving}
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
