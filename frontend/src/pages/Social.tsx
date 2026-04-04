import React, { useEffect, useState } from 'react';
import api from '../api';
import { PlusCircle } from 'lucide-react';

interface Post {
  _id: string;
  idea: string;
  platform: string;
  status: string;
}

const Social: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const [idea, setIdea] = useState('');
  const [platform, setPlatform] = useState('Instagram');

  const fetchPosts = async () => {
    try {
      const res = await api.get('/posts');
      setPosts(res.data);
    } catch (error) {
      console.error("Error fetching posts", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea) return;
    try {
      await api.post('/posts', { idea, platform });
      setIdea('');
      fetchPosts();
    } catch (error) {
      console.error("Error creating post", error);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Social Content</h1>
        <p className="page-subtitle">Brainstorm ideas and manage your social media pipeline.</p>
      </div>

      <div className="grid-cards" style={{ gridTemplateColumns: '1fr 2fr' }}>
        <div className="card">
          <h2 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>New Idea</h2>
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label className="form-label">Content Idea</label>
              <textarea 
                value={idea} 
                onChange={e => setIdea(e.target.value)} 
                placeholder="e.g. Video tour of the new living room setup" 
                rows={4}
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Platform</label>
              <select value={platform} onChange={e => setPlatform(e.target.value)}>
                <option value="Instagram">Instagram</option>
                <option value="TikTok">TikTok</option>
                <option value="Facebook">Facebook</option>
                <option value="Blog">Blog</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              <PlusCircle size={18} /> Add to Pipeline
            </button>
          </form>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Content Pipeline</h2>
          {loading ? <p>Loading...</p> : (
            <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
              {posts.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No content ideas yet.</p> : null}
              {posts.map(post => (
                <div key={post._id} style={{
                  padding: '16px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  backgroundColor: '#fff',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="badge badge-primary">{post.platform}</span>
                    <span className={`badge badge-${post.status === 'published' ? 'success' : 'neutral'}`}>{post.status}</span>
                  </div>
                  <p style={{ fontWeight: 500 }}>{post.idea}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Social;
