import { useState, useEffect } from 'react'
import { API_BASE_URL } from '../api'

export default function AdminProductsPage() {
  const [products, setProducts] = useState([])
  const [editing, setEditing] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState({
    name: '',
    price: 0,
    original_price: 0,
    category: 'nutrition',
    pet_type: ['dog', 'cat'],
    summary: '',
    description: '',
    images: ['/images/pett-bag.webp'],
    stock: 10
  })

  const headers = () => ({
    'Authorization': `Bearer ${localStorage.getItem('pett_token')}`,
    'Content-Type': 'application/json'
  })

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/products`, { headers: headers() })
      if (res.ok) {
        const data = await res.json()
        // Loại bỏ các gói định kỳ khỏi danh sách sản phẩm
        setProducts(data.filter(p => p.category !== 'subscription' && !p.id.startsWith('plan-')))
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchProducts() }, [])

  const formatVnd = (v) => (v || 0).toLocaleString('vi-VN') + '₫'

  const startEdit = (p) => {
    setEditing(p.id)
    setEditForm({ ...p })
  }

  const saveEdit = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
        method: 'PUT', headers: headers(),
        body: JSON.stringify(editForm)
      })
      if (res.ok) {
        setEditing(null)
        fetchProducts()
      }
    } catch (e) { console.error(e) }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(`${API_BASE_URL}/admin/products`, {
        method: 'POST', headers: headers(),
        body: JSON.stringify(createForm)
      })
      if (res.ok) {
        setShowCreate(false)
        setCreateForm({
          name: '', price: 0, original_price: 0, category: 'nutrition',
          pet_type: ['dog', 'cat'], summary: '', description: '',
          images: ['/images/pett-bag.webp'], stock: 10
        })
        fetchProducts()
      } else {
        const err = await res.json()
        alert('Lỗi: ' + (err.detail || 'Không thể tạo sản phẩm'))
      }
    } catch (e) { console.error(e) }
  }

  const deleteProduct = async (id, name) => {
    if (!confirm(`Xóa sản phẩm "${name}"?`)) return
    try {
      const res = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
        method: 'DELETE', headers: headers()
      })
      if (res.ok) fetchProducts()
    } catch (e) { console.error(e) }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><span className="text-on-surface-variant font-bold animate-pulse">Đang tải...</span></div>

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-black text-on-surface tracking-tight">Quản lý Sản phẩm</h1>
          <p className="text-on-surface-variant font-medium mt-1">{products.length} sản phẩm đang hoạt động</p>
        </div>
        <button 
          onClick={() => setShowCreate(!showCreate)}
          className="px-8 py-3 bg-teal-600 text-white text-xs font-black rounded-2xl uppercase tracking-widest shadow-lg shadow-teal-600/20 hover:scale-[1.02] transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">{showCreate ? 'close' : 'add'}</span>
          {showCreate ? 'Đóng' : 'Thêm sản phẩm'}
        </button>
      </div>

      {showCreate && (
        <div className="bg-white p-10 rounded-[3rem] border border-stone-200 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
          <h2 className="text-xl font-black mb-8">Tạo sản phẩm mới</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Tên sản phẩm</label>
                <input required value={createForm.name} onChange={e => setCreateForm({...createForm, name: e.target.value})}
                  className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl font-bold focus:ring-2 focus:ring-teal-600/10 outline-none" placeholder="VD: Hạt cho mèo PETT Premium" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Giá bán (₫)</label>
                  <input type="number" required value={createForm.price} onChange={e => setCreateForm({...createForm, price: Number(e.target.value)})}
                    className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl font-bold focus:ring-2 focus:ring-teal-600/10 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Số lượng tồn</label>
                  <input type="number" required value={createForm.stock} onChange={e => setCreateForm({...createForm, stock: Number(e.target.value)})}
                    className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl font-bold focus:ring-2 focus:ring-teal-600/10 outline-none" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Danh mục</label>
                <select value={createForm.category} onChange={e => setCreateForm({...createForm, category: e.target.value})}
                  className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl font-bold focus:ring-2 focus:ring-teal-600/10 outline-none appearance-none">
                  <option value="nutrition">Dinh dưỡng</option>
                  <option value="accessories">Phụ kiện</option>
                  <option value="toys">Đồ chơi & Chuồng</option>
                </select>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Mô tả ngắn</label>
                <input required value={createForm.summary} onChange={e => setCreateForm({...createForm, summary: e.target.value})}
                  className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl font-bold focus:ring-2 focus:ring-teal-600/10 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Mô tả chi tiết</label>
                <textarea rows="4" required value={createForm.description} onChange={e => setCreateForm({...createForm, description: e.target.value})}
                  className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl font-medium focus:ring-2 focus:ring-teal-600/10 outline-none resize-none"></textarea>
              </div>
              <div className="flex justify-end pt-4">
                <button type="submit" className="px-10 py-4 bg-teal-600 text-white font-black rounded-2xl uppercase tracking-[0.15em] shadow-xl shadow-teal-600/20 hover:bg-teal-700 transition-all">Lưu sản phẩm</button>
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-[3rem] border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-stone-100">
                <th className="p-8 text-[10px] font-black text-stone-400 uppercase tracking-widest">Sản phẩm</th>
                <th className="p-8 text-[10px] font-black text-stone-400 uppercase tracking-widest">Phân loại</th>
                <th className="p-8 text-[10px] font-black text-stone-400 uppercase tracking-widest text-right">Giá niêm yết</th>
                <th className="p-8 text-[10px] font-black text-stone-400 uppercase tracking-widest text-right">Tồn kho</th>
                <th className="p-8 text-[10px] font-black text-stone-400 uppercase tracking-widest text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {products.map((p) => (
                <tr key={p.id} className="group hover:bg-teal-50/30 transition-colors">
                  {editing === p.id ? (
                    <>
                      <td className="p-6">
                        <input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})}
                          className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-teal-600/10 outline-none" />
                      </td>
                      <td className="p-6">
                        <input value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})}
                          className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-teal-600/10 outline-none" />
                      </td>
                      <td className="p-6">
                        <input type="number" value={editForm.price} onChange={e => setEditForm({...editForm, price: Number(e.target.value)})}
                          className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-xl text-sm font-bold text-right focus:ring-2 focus:ring-teal-600/10 outline-none" />
                      </td>
                      <td className="p-6">
                        <input type="number" value={editForm.stock} onChange={e => setEditForm({...editForm, stock: Number(e.target.value)})}
                          className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-xl text-sm font-bold text-right focus:ring-2 focus:ring-teal-600/10 outline-none" />
                      </td>
                      <td className="p-6 text-right space-x-2">
                        <button onClick={() => saveEdit(p.id)} className="px-5 py-2 bg-teal-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-md">Lưu</button>
                        <button onClick={() => setEditing(null)} className="px-5 py-2 bg-stone-100 text-stone-400 text-[10px] font-black rounded-full uppercase tracking-widest hover:bg-red-50 hover:text-red-600 transition-all">Hủy</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="p-8">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 bg-stone-100 rounded-2xl overflow-hidden shrink-0 border border-stone-200">
                            <img src={p.images?.[0] || '/images/pett-bag.webp'} className="w-full h-full object-cover" alt="" />
                          </div>
                          <div>
                            <p className="font-black text-stone-800 text-sm leading-tight">{p.name}</p>
                            <p className="text-[10px] text-stone-400 font-bold mt-1 uppercase tracking-tighter">{p.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-8">
                        <span className="px-3 py-1.5 bg-teal-50 text-teal-600 text-[10px] font-black rounded-full uppercase tracking-widest">{p.category}</span>
                      </td>
                      <td className="p-8 text-right font-black text-sm text-stone-800">{formatVnd(p.price)}</td>
                      <td className="p-8 text-right">
                        <span className={`px-3 py-1 text-xs font-black rounded-full ${p.stock < 5 ? 'bg-red-50 text-red-500' : 'bg-stone-50 text-stone-600'}`}>
                          {p.stock} <span className="text-[8px] uppercase tracking-widest ml-0.5">món</span>
                        </span>
                      </td>
                      <td className="p-8 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => startEdit(p)} 
                            className="w-10 h-10 bg-white border border-stone-200 text-stone-600 rounded-xl hover:border-teal-600 hover:text-teal-600 hover:shadow-lg hover:shadow-teal-600/10 transition-all duration-300 inline-flex items-center justify-center group"
                            title="Chỉnh sửa"
                          >
                            <span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform">edit</span>
                          </button>
                          <button 
                            onClick={() => deleteProduct(p.id, p.name)} 
                            className="w-10 h-10 bg-white border border-stone-200 text-stone-400 rounded-xl hover:border-red-500 hover:text-red-500 hover:shadow-lg hover:shadow-red-500/10 transition-all duration-300 inline-flex items-center justify-center group"
                            title="Xóa sản phẩm"
                          >
                            <span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform">delete</span>
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && (
            <div className="p-20 text-center text-stone-400 font-bold uppercase tracking-widest">Danh sách trống</div>
          )}
        </div>
      </div>
    </div>
  )
}
