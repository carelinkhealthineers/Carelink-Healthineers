import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Tv, Plus, Trash2, Edit3, Upload, Film, 
  Save, Loader2, Play, Sparkles, MoveUp, MoveDown, CheckCircle2, AlertCircle
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { VideoItem, getAutoThumbnail } from '../utils/videoUtils';
import { DEFAULT_HOMEPAGE_VIDEOS } from './HomepageVideoShowcase';
import { VideoTheatreModal } from './VideoTheatreModal';

export const AdminVideoManager: React.FC = () => {
  const [videos, setVideos] = useState<VideoItem[]>(DEFAULT_HOMEPAGE_VIDEOS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);

  const [previewVideo, setPreviewVideo] = useState<VideoItem | null>(null);
  const [isTheatreOpen, setIsTheatreOpen] = useState(false);

  // Form state for creating / editing a video
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formVideo, setFormVideo] = useState<VideoItem>({
    title: '',
    badge: 'Clinical Technology',
    video_url: '',
    thumbnail_url: '',
    duration: '',
    details: ''
  });

  useEffect(() => {
    fetchHomepageVideos();
  }, []);

  const fetchHomepageVideos = async () => {
    setIsLoading(true);
    try {
      const { data } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'homepage_videos')
        .single();

      if (data?.value) {
        const parsed = JSON.parse(data.value);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setVideos(parsed);
        }
      }
    } catch (err) {
      console.warn("Could not load homepage videos from DB settings", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToDatabase = async (updatedVideos: VideoItem[]) => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const jsonVal = JSON.stringify(updatedVideos);
      
      // Upsert into settings table
      const { error } = await supabase
        .from('settings')
        .upsert({ 
          key: 'homepage_videos', 
          value: jsonVal, 
          category: 'homepage', 
          description: 'Homepage landscape video theatre registry' 
        }, { onConflict: 'key' });

      if (error) throw error;
      
      setVideos(updatedVideos);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save homepage video registry:", err);
      alert("Error saving video registry to database settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleVideoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingVideo(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `homepage-video-${Date.now()}.${fileExt}`;
      const filePath = `videos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      setFormVideo(prev => ({ ...prev, video_url: publicUrl }));
    } catch (err) {
      console.error('Video upload error:', err);
      alert('Video file upload failed. You can also paste a direct YouTube/MP4 URL.');
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingThumb(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `video-thumb-${Date.now()}.${fileExt}`;
      const filePath = `thumbnails/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      setFormVideo(prev => ({ ...prev, thumbnail_url: publicUrl }));
    } catch (err) {
      console.error('Thumbnail upload error:', err);
      alert('Thumbnail upload failed. You can paste an image URL directly.');
    } finally {
      setUploadingThumb(false);
    }
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formVideo.title || !formVideo.video_url) {
      alert('Please fill in both Video Title and Video URL.');
      return;
    }

    let nextVideos = [...videos];
    if (editingIndex !== null) {
      nextVideos[editingIndex] = formVideo;
    } else {
      nextVideos.push({ ...formVideo, id: `vid-${Date.now()}` });
    }

    handleSaveToDatabase(nextVideos);
    resetForm();
  };

  const resetForm = () => {
    setEditingIndex(null);
    setFormVideo({
      title: '',
      badge: 'Clinical Technology',
      video_url: '',
      thumbnail_url: '',
      duration: '',
      details: ''
    });
  };

  const handleEditClick = (index: number) => {
    setEditingIndex(index);
    setFormVideo(videos[index]);
  };

  const handleDeleteClick = (index: number) => {
    if (confirm('Are you sure you want to remove this video from the homepage theatre?')) {
      const nextVideos = videos.filter((_, i) => i !== index);
      handleSaveToDatabase(nextVideos);
    }
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= videos.length) return;

    const next = [...videos];
    const temp = next[index];
    next[index] = next[targetIndex];
    next[targetIndex] = temp;

    handleSaveToDatabase(next);
  };

  return (
    <div className="space-y-12 text-white font-sans">
      
      {/* Header Banner */}
      <div className="p-8 sm:p-10 bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">
              Admin Control Matrix
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Homepage <span className="text-blue-500 italic font-serif">Video Gallery</span>
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm max-w-xl font-medium">
            Upload new video files or paste YouTube/MP4 URLs to showcase product demos and clinical guides on the homepage.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          {saveSuccess && (
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold">
              <CheckCircle2 size={16} /> Saved to Registry!
            </div>
          )}
          <button
            onClick={() => resetForm()}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-widest rounded-xl flex items-center gap-2 shadow-lg transition-all"
          >
            <Plus size={16} />
            <span>Add New Video</span>
          </button>
        </div>
      </div>

      {/* Video Form Modal/Section */}
      <div className="p-8 sm:p-10 bg-slate-900/90 border border-slate-800 rounded-[2.5rem] shadow-xl space-y-8">
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Film size={20} className="text-blue-500" />
            <h3 className="text-lg font-bold text-white tracking-tight">
              {editingIndex !== null ? `Edit Video #${editingIndex + 1}` : 'Upload & Add New Video'}
            </h3>
          </div>
          {editingIndex !== null && (
            <button
              onClick={resetForm}
              className="text-xs font-bold text-slate-400 hover:text-white uppercase tracking-wider"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmitForm} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Title */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Video Title <span className="text-rose-500">*</span>
              </label>
              <input 
                type="text" 
                required
                placeholder="e.g., Siemens Magnetom 3.0T MRI Operational Demo"
                value={formVideo.title}
                onChange={e => setFormVideo({ ...formVideo, title: e.target.value })}
                className="w-full px-5 py-3.5 bg-black border border-slate-800 rounded-xl text-sm font-semibold text-white outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Category / Badge */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Division / Category Badge
              </label>
              <input 
                type="text" 
                placeholder="e.g., Imaging & Radiology, ICU Care, Dental"
                value={formVideo.badge}
                onChange={e => setFormVideo({ ...formVideo, badge: e.target.value })}
                className="w-full px-5 py-3.5 bg-black border border-slate-800 rounded-xl text-sm font-semibold text-white outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Video File / URL Input */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
            <div className="md:col-span-8 space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center justify-between">
                <span>Video Link (YouTube, Vimeo, Google Drive, MP4, or Website Video) <span className="text-rose-500">*</span></span>
              </label>
              <input 
                type="text" 
                required
                placeholder="Paste link e.g. https://youtube.com/watch?v=... or Vimeo / Google Drive / MP4"
                value={formVideo.video_url}
                onChange={e => {
                  const url = e.target.value;
                  const autoThumb = getAutoThumbnail(url);
                  setFormVideo(prev => ({ 
                    ...prev, 
                    video_url: url,
                    thumbnail_url: prev.thumbnail_url || autoThumb
                  }));
                }}
                className="w-full px-5 py-3.5 bg-black border border-slate-800 rounded-xl text-sm font-semibold text-white outline-none focus:border-blue-500 transition-colors"
              />
              <p className="text-[10px] text-slate-500 font-medium">
                Tip: YouTube & Vimeo links automatically generate cover images and play directly on your site inside our popup player.
              </p>
            </div>

            <div className="md:col-span-4">
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                Or Upload MP4 File
              </label>
              <label className="w-full py-3.5 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors">
                {uploadingVideo ? <Loader2 size={16} className="animate-spin text-blue-400" /> : <Upload size={16} />}
                <span>{uploadingVideo ? 'Uploading...' : 'Browse MP4 File'}</span>
                <input 
                  type="file" 
                  accept="video/*" 
                  className="hidden" 
                  onChange={handleVideoFileUpload}
                  disabled={uploadingVideo}
                />
              </label>
            </div>
          </div>

          {/* Thumbnail File / URL Input */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
            <div className="md:col-span-8 space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Poster Thumbnail Image URL
              </label>
              <input 
                type="text" 
                placeholder="https://images.unsplash.com/... or upload image below"
                value={formVideo.thumbnail_url}
                onChange={e => setFormVideo({ ...formVideo, thumbnail_url: e.target.value })}
                className="w-full px-5 py-3.5 bg-black border border-slate-800 rounded-xl text-sm font-semibold text-white outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="md:col-span-4">
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                Upload Custom Thumbnail
              </label>
              <label className="w-full py-3.5 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors">
                {uploadingThumb ? <Loader2 size={16} className="animate-spin text-blue-400" /> : <Upload size={16} />}
                <span>{uploadingThumb ? 'Uploading...' : 'Browse Cover Image'}</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleThumbnailUpload}
                  disabled={uploadingThumb}
                />
              </label>
            </div>
          </div>

          {/* Duration & Details */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-3 space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Duration Badge
              </label>
              <input 
                type="text" 
                placeholder="e.g. 04:15"
                value={formVideo.duration}
                onChange={e => setFormVideo({ ...formVideo, duration: e.target.value })}
                className="w-full px-5 py-3.5 bg-black border border-slate-800 rounded-xl text-sm font-semibold text-white outline-none focus:border-blue-500 transition-colors font-mono"
              />
            </div>

            <div className="md:col-span-9 space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Why Watch This Video / Clinical Details
              </label>
              <textarea 
                rows={2}
                placeholder="Explain key operational highlights, BioMatrix specs, or installation procedures..."
                value={formVideo.details}
                onChange={e => setFormVideo({ ...formVideo, details: e.target.value })}
                className="w-full px-5 py-3.5 bg-black border border-slate-800 rounded-xl text-sm font-semibold text-white outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-800">
            {editingIndex !== null && (
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3.5 bg-slate-800 text-slate-300 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isSaving}
              className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-widest rounded-xl flex items-center gap-2 shadow-lg transition-all disabled:opacity-50"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              <span>{editingIndex !== null ? 'Update Video Item' : 'Add to Homepage Gallery'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Existing Homepage Videos List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xs font-extrabold uppercase tracking-[0.3em] text-slate-400">
            Active Homepage Landscape Videos ({videos.length})
          </h3>
          <span className="text-[10px] font-mono text-slate-500">SAVED IN DATABASE REGISTRY</span>
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center opacity-40">
            <Loader2 size={32} className="animate-spin text-blue-500 mb-3" />
            <span className="text-xs font-mono uppercase tracking-widest">Loading Video Registry...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {videos.map((vid, idx) => (
              <div 
                key={idx}
                className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 hover:border-slate-700 transition-all shadow-md group"
              >
                <div className="flex items-center gap-6 w-full md:w-auto">
                  <div className="relative w-36 h-24 rounded-xl bg-black overflow-hidden shrink-0 border border-slate-800">
                    {vid.thumbnail_url ? (
                      <img src={vid.thumbnail_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500">
                        <Film size={24} />
                      </div>
                    )}
                    <button
                      onClick={() => {
                        setPreviewVideo(vid);
                        setIsTheatreOpen(true);
                      }}
                      className="absolute inset-0 bg-black/40 hover:bg-black/10 flex items-center justify-center transition-colors group"
                      title="Preview in Theatre Mode"
                    >
                      <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play size={16} className="fill-white ml-0.5" />
                      </div>
                    </button>
                    {vid.duration && (
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 text-[8px] font-mono text-slate-300 rounded">
                        {vid.duration}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-widest rounded">
                        {vid.badge || 'Clinical Video'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">#{idx + 1}</span>
                    </div>
                    <h4 className="text-base font-bold text-white tracking-tight truncate max-w-lg">
                      {vid.title}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-1 max-w-xl font-medium">
                      {vid.details || vid.video_url}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, 'up')}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 disabled:opacity-30 transition-colors"
                    title="Move Up"
                  >
                    <MoveUp size={16} />
                  </button>
                  <button
                    disabled={idx === videos.length - 1}
                    onClick={() => handleMove(idx, 'down')}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 disabled:opacity-30 transition-colors"
                    title="Move Down"
                  >
                    <MoveDown size={16} />
                  </button>
                  <button
                    onClick={() => handleEditClick(idx)}
                    className="p-2 bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-colors"
                    title="Edit Video Details"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(idx)}
                    className="p-2 bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white rounded-xl border border-rose-500/30 transition-colors"
                    title="Delete Video"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Admin Theatre Mode Preview Modal */}
      <VideoTheatreModal 
        isOpen={isTheatreOpen}
        onClose={() => setIsTheatreOpen(false)}
        video={previewVideo}
        playlist={videos}
        onSelectVideo={(v) => setPreviewVideo(v)}
      />
    </div>
  );
};
