import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import './App.css'

const SUPABASE_URL = 'https://ciddpvkcdoevfprlzhtg.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_F10DXS9eoGkfmLuzf5J2lQ_T8jf2oLJ'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

function App() {
  const [activeTab, setActiveTab] = useState('articulos')
  
  // ===== ARTÍCULOS =====
  const [articulos, setArticulos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [mostrarCategorias, setMostrarCategorias] = useState(false)

  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    contenido: '',
    categoria: '',
    foto_url: '',
    activo: true,
  })

  const [fotoPreview, setFotoPreview] = useState(null)
  const [fotoFile, setFotoFile] = useState(null)

  // ===== PROMOCIONES =====
  const [promos, setPromos] = useState([])
  const [promoLoading, setPromoLoading] = useState(true)
  const [editingPromoId, setEditingPromoId] = useState(null)
  const [promoFormData, setPromoFormData] = useState({
    titulo: '',
    descuento: '',
    descripcion: '',
    color: 'sage',
    vence: '',
    emoji: '',
  })

  // ===== CARGAR DATOS AL MONTAR =====
  useEffect(() => {
    cargarArticulos()
    cargarCategorias()
    fetchPromos()
  }, [])

  // ========== FUNCIONES DE ARTÍCULOS ==========
  async function cargarArticulos() {
    try {
      const { data, error } = await supabase
        .from('articulos')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setArticulos(data || [])
    } catch (error) {
      console.error('Error al cargar artículos:', error)
      alert('Error al cargar artículos')
    }
  }

  async function cargarCategorias() {
    try {
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .order('orden', { ascending: true })

      if (error) throw error
      setCategorias(data || [])
      if (data?.length > 0 && !formData.categoria) {
        setFormData(prev => ({ ...prev, categoria: data[0].nombre }))
      }
    } catch (error) {
      console.error('Error al cargar categorías:', error)
    }
  }

  function manejarFoto(e) {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setFotoPreview(reader.result)
    }
    reader.readAsDataURL(file)

    setFotoFile(file)
  }

  async function subirFoto() {
    if (!fotoFile) return null

    try {
      const timestamp = Date.now()
      const nombreArchivo = `${timestamp}_${fotoFile.name}`

      const { data, error } = await supabase.storage
        .from('articulos')
        .upload(`fotos/${nombreArchivo}`, fotoFile)

      if (error) throw error

      const { data: publicUrlData } = supabase.storage
        .from('articulos')
        .getPublicUrl(`fotos/${nombreArchivo}`)

      return publicUrlData.publicUrl
    } catch (error) {
      console.error('Error al subir foto:', error)
      alert('Error al subir foto: ' + error.message)
      return null
    }
  }

  function limpiarFormulario() {
    setFormData({
      titulo: '',
      descripcion: '',
      contenido: '',
      categoria: categorias[0]?.nombre || '',
      foto_url: '',
      activo: true,
    })
    setFotoFile(null)
    setFotoPreview(null)
    setEditingId(null)
  }

  function editarArticulo(articulo) {
    setFormData({
      titulo: articulo.titulo,
      descripcion: articulo.descripcion,
      contenido: articulo.contenido,
      categoria: articulo.categoria,
      foto_url: articulo.foto_url,
      activo: articulo.activo,
    })
    setFotoPreview(articulo.foto_url)
    setEditingId(articulo.id)
  }

  async function guardarArticulo() {
    if (!formData.titulo || !formData.contenido) {
      alert('Por favor completa título y contenido')
      return
    }

    setLoading(true)

    try {
      let fotoUrl = formData.foto_url

      if (fotoFile) {
        fotoUrl = await subirFoto()
        if (!fotoUrl) {
          setLoading(false)
          return
        }
      }

      const datosGuardar = {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        contenido: formData.contenido,
        categoria: formData.categoria,
        foto_url: fotoUrl,
        activo: formData.activo,
      }

      if (editingId) {
        const { error } = await supabase
          .from('articulos')
          .update(datosGuardar)
          .eq('id', editingId)

        if (error) throw error
        alert('Artículo actualizado ✅')
      } else {
        const { error } = await supabase
          .from('articulos')
          .insert([datosGuardar])

        if (error) throw error
        alert('Artículo creado ✅')
      }

      cargarArticulos()
      limpiarFormulario()
    } catch (error) {
      console.error('Error al guardar:', error)
      alert('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  async function eliminarArticulo(id) {
    if (!confirm('¿Estás seguro de que quieres eliminar este artículo?')) return

    try {
      const { error } = await supabase
        .from('articulos')
        .delete()
        .eq('id', id)

      if (error) throw error
      alert('Artículo eliminado ✅')
      cargarArticulos()
    } catch (error) {
      console.error('Error al eliminar:', error)
      alert('Error: ' + error.message)
    }
  }

  // ========== FUNCIONES DE PROMOCIONES ==========
  const fetchPromos = async () => {
    try {
      setPromoLoading(true)
      const { data, error } = await supabase
        .from('promociones')
        .select('*')
        .order('orden', { ascending: true })

      if (error) throw error
      setPromos(data || [])
    } catch (error) {
      console.error('Error cargando promociones:', error)
      alert('Error cargando promociones: ' + error.message)
    } finally {
      setPromoLoading(false)
    }
  }

  const handlePromoInputChange = (e) => {
    const { name, value } = e.target
    setPromoFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePromoSubmit = async (e) => {
    e.preventDefault()

    if (!promoFormData.titulo || !promoFormData.descuento || !promoFormData.descripcion) {
      alert('Por favor completa todos los campos')
      return
    }

    try {
      if (editingPromoId) {
        const { error } = await supabase
          .from('promociones')
          .update({
            ...promoFormData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingPromoId)

        if (error) throw error
        alert('✅ Promoción actualizada')
      } else {
        const { error } = await supabase
          .from('promociones')
          .insert([{
            ...promoFormData,
            orden: promos.length + 1
          }])

        if (error) throw error
        alert('✅ Promoción creada')
      }

      setPromoFormData({
        titulo: '',
        descuento: '',
        descripcion: '',
        color: 'sage',
        vence: '',
        emoji: '',
      })
      setEditingPromoId(null)
      await fetchPromos()
    } catch (error) {
      console.error('Error guardando:', error)
      alert('Error: ' + error.message)
    }
  }

  const handlePromoEdit = (promo) => {
    setEditingPromoId(promo.id)
    setPromoFormData({
      titulo: promo.titulo,
      descuento: promo.descuento,
      descripcion: promo.descripcion,
      color: promo.color,
      vence: promo.vence,
      emoji: promo.emoji,
    })
  }

  const handlePromoDelete = async (id) => {
    if (!confirm('¿Estás segura de que quieres eliminar esta promoción?')) return

    try {
      const { error } = await supabase
        .from('promociones')
        .delete()
        .eq('id', id)

      if (error) throw error
      alert('✅ Promoción eliminada')
      await fetchPromos()
    } catch (error) {
      console.error('Error eliminando:', error)
      alert('Error: ' + error.message)
    }
  }

  const handlePromoCancel = () => {
    setEditingPromoId(null)
    setPromoFormData({
      titulo: '',
      descuento: '',
      descripcion: '',
      color: 'sage',
      vence: '',
      emoji: '',
    })
  }

  const handleToggleActive = async (id, currentActive) => {
    try {
      const { error } = await supabase
        .from('promociones')
        .update({ activa: !currentActive })
        .eq('id', id)

      if (error) throw error
      await fetchPromos()
    } catch (error) {
      console.error('Error:', error)
      alert('Error: ' + error.message)
    }
  }

  // ========== RENDER ==========
  return (
    <div className="app">
      <header className="header">
        <h1>📋 Panel Admin - Keka Terapias</h1>
        <p>Gestiona artículos informativos y promociones</p>
      </header>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'articulos' ? 'active' : ''}`}
          onClick={() => setActiveTab('articulos')}
        >
          📄 Artículos ({articulos.length})
        </button>
        <button
          className={`tab ${activeTab === 'promociones' ? 'active' : ''}`}
          onClick={() => setActiveTab('promociones')}
        >
          ✨ Promociones ({promos.length})
        </button>
      </div>

      {/* ===== PESTAÑA ARTÍCULOS ===== */}
      {activeTab === 'articulos' && (
        <div className="container">
          {/* FORMULARIO ARTÍCULOS */}
          <div className="form-section">
            <h2>{editingId ? '✏️ Editar Artículo' : '➕ Crear Artículo'}</h2>

            <div className="form-group">
              <label>Título *</label>
              <input
                type="text"
                value={formData.titulo}
                onChange={(e) =>
                  setFormData({ ...formData, titulo: e.target.value })
                }
                placeholder="Ej: Cuidado de Pies en Verano"
              />
            </div>

            <div className="form-group">
              <label>Descripción</label>
              <input
                type="text"
                value={formData.descripcion}
                onChange={(e) =>
                  setFormData({ ...formData, descripcion: e.target.value })
                }
                placeholder="Breve descripción del artículo"
              />
            </div>

            <div className="form-group">
              <label>Categoría</label>
              <div className="custom-dropdown">
                <button
                  type="button"
                  className="dropdown-button"
                  onClick={() => setMostrarCategorias(!mostrarCategorias)}
                >
                  {formData.categoria || "Selecciona una categoría"} ▼
                </button>
                {mostrarCategorias && (
                  <div className="dropdown-menu">
                    {categorias.map((cat) => (
                      <div
                        key={cat.id}
                        className="dropdown-item"
                        onClick={() => {
                          setFormData({ ...formData, categoria: cat.nombre })
                          setMostrarCategorias(false)
                        }}
                      >
                        {cat.nombre}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Contenido *</label>
              <textarea
                value={formData.contenido}
                onChange={(e) =>
                  setFormData({ ...formData, contenido: e.target.value })
                }
                placeholder="Escribe aquí el contenido completo del artículo"
                rows="6"
              />
            </div>

            <div className="form-group">
              <label>Foto del artículo</label>
              <input
                type="file"
                accept="image/*"
                onChange={manejarFoto}
              />
              {fotoPreview && (
                <div className="foto-preview">
                  <img src={fotoPreview} alt="Preview" />
                </div>
              )}
            </div>

            <div className="form-group checkbox">
              <input
                type="checkbox"
                id="activo"
                checked={formData.activo}
                onChange={(e) =>
                  setFormData({ ...formData, activo: e.target.checked })
                }
              />
              <label htmlFor="activo">Publicar artículo</label>
            </div>

            <div className="form-buttons">
              <button
                onClick={guardarArticulo}
                disabled={loading}
                className="btn-primary"
              >
                {loading ? '⏳ Guardando...' : '💾 Guardar'}
              </button>
              {editingId && (
                <button
                  onClick={limpiarFormulario}
                  className="btn-secondary"
                >
                  ❌ Cancelar
                </button>
              )}
            </div>
          </div>

          {/* LISTA ARTÍCULOS */}
          <div className="list-section">
            <h2>📚 Artículos Creados</h2>
            {articulos.length === 0 ? (
              <p className="empty">No hay artículos creados aún</p>
            ) : (
              <div className="articulos-list">
                {articulos.map((art) => (
                  <div key={art.id} className="articulo-card">
                    <div className="card-header">
                      <h3>{art.titulo}</h3>
                      <span className="badge">{art.categoria}</span>
                    </div>

                    {art.foto_url && (
                      <img src={art.foto_url} alt={art.titulo} className="card-foto" />
                    )}

                    <p className="descripcion">{art.descripcion}</p>
                    <p className="contenido">{art.contenido.substring(0, 100)}...</p>

                    <div className="card-footer">
                      <span className={`status ${art.activo ? 'activo' : 'inactivo'}`}>
                        {art.activo ? '✅ Publicado' : '🔒 Borrador'}
                      </span>
                      <div className="card-buttons">
                        <button
                          onClick={() => editarArticulo(art)}
                          className="btn-edit"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => eliminarArticulo(art.id)}
                          className="btn-delete"
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== PESTAÑA PROMOCIONES ===== */}
      {activeTab === 'promociones' && (
        <div className="promo-container">
          <div className="promo-form-section">
            <h2 className="promo-title">
              {editingPromoId ? '✏️ Editar Promoción' : '➕ Nueva Promoción'}
            </h2>

            <form onSubmit={handlePromoSubmit} className="promo-form">
              <div className="promo-grid">
                <div>
                  <label>Título *</label>
                  <input
                    type="text"
                    name="titulo"
                    value={promoFormData.titulo}
                    onChange={handlePromoInputChange}
                    placeholder="Ej: Masaje + Manicure"
                  />
                </div>

                <div>
                  <label>Descuento *</label>
                  <input
                    type="text"
                    name="descuento"
                    value={promoFormData.descuento}
                    onChange={handlePromoInputChange}
                    placeholder="Ej: ₡30,000 o 20% OFF"
                  />
                </div>

                <div>
                  <label>Color *</label>
                  <select
                    name="color"
                    value={promoFormData.color}
                    onChange={handlePromoInputChange}
                  >
                    <option value="sage">Verde (Sage)</option>
                    <option value="lavender">Morado (Lavender)</option>
                    <option value="rose">Rosa (Rose)</option>
                  </select>
                </div>

                <div>
                  <label>Emoji *</label>
                  <input
                    type="text"
                    name="emoji"
                    value={promoFormData.emoji}
                    onChange={handlePromoInputChange}
                    placeholder="Ej: 💆‍♀️"
                    maxLength="2"
                  />
                </div>

                <div className="promo-full">
                  <label>Válida hasta *</label>
                  <input
                    type="text"
                    name="vence"
                    value={promoFormData.vence}
                    onChange={handlePromoInputChange}
                    placeholder="Ej: Hasta el 31 de julio"
                  />
                </div>

                <div className="promo-full">
                  <label>Descripción *</label>
                  <textarea
                    name="descripcion"
                    value={promoFormData.descripcion}
                    onChange={handlePromoInputChange}
                    placeholder="Describe la promo en detalle"
                    rows="4"
                  />
                </div>
              </div>

              <div className="promo-buttons">
                <button type="submit" className="btn-promo-primary">
                  {editingPromoId ? '💾 Actualizar' : '✨ Crear Promoción'}
                </button>
                {editingPromoId && (
                  <button
                    type="button"
                    onClick={handlePromoCancel}
                    className="btn-promo-secondary"
                  >
                    ❌ Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="promo-list-section">
            <h2 className="promo-title">
              📋 Promociones Activas ({promos.length})
            </h2>

            {promoLoading ? (
              <div className="promo-loading">
                <p>Cargando...</p>
              </div>
            ) : promos.length === 0 ? (
              <div className="promo-empty">
                <p>No hay promociones. ¡Crea una nueva!</p>
              </div>
            ) : (
              <div className="promo-list">
                {promos.map((promo) => (
                  <div
                    key={promo.id}
                    className={`promo-card ${promo.activa ? 'activa' : 'inactiva'}`}
                  >
                    <div className="promo-card-header">
                      <div className="promo-card-info">
                        <span className="promo-emoji">{promo.emoji}</span>
                        <div>
                          <h3>{promo.titulo}</h3>
                          <p>ID: {promo.id}</p>
                        </div>
                      </div>
                    </div>

                    <div className="promo-card-grid">
                      <div>
                        <p>Descuento</p>
                        <p className="promo-descuento">{promo.descuento}</p>
                      </div>
                      <div>
                        <p>Color</p>
                        <span className={`promo-color promo-color-${promo.color}`}>
                          {promo.color}
                        </span>
                      </div>
                      <div>
                        <p>Válida</p>
                        <p>⏰ {promo.vence}</p>
                      </div>
                    </div>

                    <div className="promo-card-desc">
                      <p>Descripción:</p>
                      <p>{promo.descripcion}</p>
                    </div>

                    <div className="promo-card-buttons">
                      <button
                        onClick={() => handleToggleActive(promo.id, promo.activa)}
                        className={`btn-toggle ${promo.activa ? 'desactivar' : 'activar'}`}
                      >
                        {promo.activa ? '👁️ Desactivar' : '🔒 Activar'}
                      </button>
                      <button
                        onClick={() => handlePromoEdit(promo)}
                        className="btn-edit-promo"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => handlePromoDelete(promo.id)}
                        className="btn-delete-promo"
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default App