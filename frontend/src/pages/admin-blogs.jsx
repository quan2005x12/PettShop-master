import { useState, useEffect } from 'react'
import { API_BASE_URL } from '../api'

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState({
    id: '',
    title: '',
    category: 'Cẩm nang',
    excerpt: '',
    content: '',
    image_url: '/images/blog-placeholder.webp',
    read_time: 5,
    author: 'Admin'
  })

  const headers = () => ({
    'Authorization': `Bearer ${localStorage.getItem('pett_token')}`,
    'Content-Type': 'application/json'
  })

  const fetchBlogs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/blogs`, { headers: headers() })
      if (res.ok) setBlogs(await res.json())
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchBlogs() }, [])

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'

  const startEdit = (b) => {
    setEditing(b.id)
    setEditForm({ ...b })
  }

  const saveEdit = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/blogs/${id}`, {
        method: 'PUT', headers: headers(),
        body: JSON.stringify(editForm)
      })
      if (res.ok) {
        setEditing(null)
        fetchBlogs()
      }
    } catch (e) { console.error(e) }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      // Auto-generate ID if empty
      const blogData = { ...createForm }
      if (!blogData.id) {
        blogData.id = createForm.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
      }

      const res = await fetch(`${API_BASE_URL}/admin/blogs`, {
        method: 'POST', headers: headers(),
        body: JSON.stringify(blogData)
      })
      if (res.ok) {
        setShowCreate(false)
        setCreateForm({
          id: '', title: '', category: 'Cẩm nang', excerpt: '', content: '',
          image_url: '/images/blog-placeholder.webp', read_time: 5, author: 'Admin'
        })
        fetchBlogs()
      } else {
        const err = await res.json()
        alert('Lỗi: ' + (err.detail || 'Không thể tạo bài viết'))
      }
    } catch (e) { console.error(e) }
  }

  const deleteBlog = async (id, title) => {
    if (!confirm(`Xóa bài viết "${title}"?`)) return
    try {
      const res = await fetch(`${API_BASE_URL}/admin/blogs/${id}`, {
        method: 'DELETE', headers: headers()
      })
      if (res.ok) fetchBlogs()
    } catch (e) { console.error(e) }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><span className="text-stone-400 font-bold animate-pulse uppercase tracking-widest">Đang tải...</span></div>

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-stone-800 tracking-tight">Quản lý Blog</h1>
          <p className="text-stone-400 font-medium mt-1">{blogs.length} bài viết đã đăng</p>
        </div>
        <button 
          onClick={() => setShowCreate(!showCreate)}
          className="px-8 py-3 bg-teal-600 text-white text-xs font-black rounded-2xl uppercase tracking-widest shadow-lg shadow-teal-600/20 hover:scale-[1.02] transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">{showCreate ? 'close' : 'add'}</span>
          {showCreate ? 'Đóng' : 'Viết bài mới'}
        </button>
      </div>

      {showCreate && (
        <div className="bg-white p-10 rounded-[3rem] border border-stone-200 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
          <h2 className="text-xl font-black mb-8">Tạo bài viết mới</h2>
          <form onSubmit={handleCreate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Tiêu đề bài viết</label>
                  <input required value={createForm.title} onChange={e => setCreateForm({...createForm, title: e.target.value})}
                    className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl font-bold focus:ring-2 focus:ring-teal-600/10 outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Danh mục</label>
                    <input required value={createForm.category} onChange={e => setCreateForm({...createForm, category: e.target.value})}
                      className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl font-bold focus:ring-2 focus:ring-teal-600/10 outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Phút đọc</label>
                    <input type="number" required value={createForm.read_time} onChange={e => setCreateForm({...createForm, read_time: Number(e.target.value)})}
                      className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl font-bold focus:ring-2 focus:ring-teal-600/10 outline-none" />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Mô tả ngắn (Excerpt)</label>
                  <textarea rows="3" required value={createForm.excerpt} onChange={e => setCreateForm({...createForm, excerpt: e.target.value})}
                    className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl font-medium focus:ring-2 focus:ring-teal-600/10 outline-none resize-none"></textarea>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Đường dẫn hình ảnh (URL)</label>
                  <input required value={createForm.image_url} onChange={e => setCreateForm({...createForm, image_url: e.target.value})}
                    placeholder="/images/blog/..." className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl font-bold focus:ring-2 focus:ring-teal-600/10 outline-none" />
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Nội dung bài viết (Markdown hoặc Text)</label>
              <textarea rows="8" required value={createForm.content} onChange={e => setCreateForm({...createForm, content: e.target.value})}
                className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl font-medium focus:ring-2 focus:ring-teal-600/10 outline-none resize-none"></textarea>
            </div>
            <div className="flex justify-end pt-4">
              <button type="submit" className="px-10 py-4 bg-teal-600 text-white font-black rounded-2xl uppercase tracking-[0.15em] shadow-xl shadow-teal-600/20 hover:bg-teal-700 transition-all">Xuất bản bài viết</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-6">
        {blogs.map((b) => (
          <div key={b.id} className="bg-white rounded-[3rem] border border-stone-200 shadow-sm overflow-hidden hover:shadow-md transition-all group">
            {editing === b.id ? (
              <div className="p-10 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <input value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})}
                      className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl font-bold focus:ring-2 focus:ring-teal-600/10 outline-none" />
                    <div className="flex gap-4">
                      <input value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})}
                        className="flex-1 px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl font-bold focus:ring-2 focus:ring-teal-600/10 outline-none" />
                      <input type="number" value={editForm.read_time} onChange={e => setEditForm({...editForm, read_time: Number(e.target.value)})}
                        className="w-24 px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl font-bold focus:ring-2 focus:ring-teal-600/10 outline-none" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <textarea value={editForm.excerpt} onChange={e => setEditForm({...editForm, excerpt: e.target.value})} rows={3}
                      className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl font-medium focus:ring-2 focus:ring-teal-600/10 outline-none resize-none" />
                    <input value={editForm.image_url} onChange={e => setEditForm({...editForm, image_url: e.target.value})}
                      placeholder="Image URL" className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl font-bold focus:ring-2 focus:ring-teal-600/10 outline-none" />
                  </div>
                </div>
                <div className="flex gap-3 justify-end">
                  <button onClick={() => saveEdit(b.id)} className="px-8 py-3 bg-teal-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg shadow-teal-600/20 hover:bg-teal-700 transition-all">Lưu thay đổi</button>
                  <button onClick={() => setEditing(null)} className="px-8 py-3 bg-stone-100 text-stone-400 text-[10px] font-black rounded-full uppercase tracking-widest hover:bg-red-50 hover:text-red-600 transition-all">Hủy</button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row items-center gap-8 p-8">
                <div className="w-24 h-24 bg-stone-100 rounded-3xl overflow-hidden shrink-0 border border-stone-200">
                  <img src={b.image_url || '/images/blog-placeholder.webp'} className="w-full h-full object-cover" alt="" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-4 mb-2">
                    <span className="px-3 py-1 bg-teal-50 text-teal-600 text-[10px] font-black rounded-full uppercase tracking-widest">{b.category}</span>
                    <span className="text-[10px] font-bold text-stone-300 uppercase tracking-widest">{formatDate(b.created_at)} • {b.read_time} phút đọc</span>
                  </div>
                  <h3 className="font-black text-xl text-stone-800 truncate mb-2">{b.title}</h3>
                  <p className="text-sm text-stone-400 font-medium line-clamp-1">{b.excerpt}</p>
                </div>
                <div className="flex gap-3 shrink-0">
                  <button onClick={() => startEdit(b)} className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl hover:bg-teal-600 hover:text-white transition-all inline-flex items-center justify-center">
                    <span className="material-symbols-outlined">edit</span>
                  </button>
                  <button onClick={() => deleteBlog(b.id, b.title)} className="w-12 h-12 bg-red-50 text-red-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all inline-flex items-center justify-center">
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {blogs.length === 0 && (
          <div className="bg-white rounded-[3rem] border border-stone-200 shadow-sm p-20 text-center text-stone-400 font-bold uppercase tracking-widest">
            Chưa có bài viết nào
          </div>
        )}
      </div>
    </div>
  )
}
