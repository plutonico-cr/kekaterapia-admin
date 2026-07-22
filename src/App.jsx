import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import './App.css'

export default function App() {
  const [promociones, setPromociones] = useState([])
  const [loading, setLoading] = useState(false)
  const [newPromo, setNewPromo] = useState({
    titulo: '',
    descuento: '',
    descripcion: '',
    color: 'sage',
    vence: '',
    emoji: '✨'
  })

  useEffect(() => {
    fetchPromociones()
  }, [])

  async function fetchPromociones() {
    setLoading(true)
    const { data, error } = await supabase
      .from('promociones')
      .select('*')
      .order('orden', { ascending: true })
    
    if (error) {
      console.error('Error:', error)
    } else {
      setPromociones(data || [])
    }
    setLoading(false)
  }

  async function handleAddPromo() {
    if (!newPromo.titulo || !newPromo.descuento) {
      alert('Por favor completa Título y Descuento')
      return
    }

    const { error } = await supabase
      .from('promociones')
      .insert([newPromo])

    if (error) {
      alert('Error: ' + error.message)
      return
    }

    alert('✅ ¡Promoción agregada!')
    setNewPromo({
      titulo: '',
      descuento: '',
      descripcion: '',
      color: 'sage',
      vence: '',
      emoji: '✨'
    })
    fetchPromociones()
  }

  async function handleDelete(id) {
    if (!confirm('¿Estás seguro?')) return

    const { error } = await supabase
      .from('promociones')
      .delete()
      .eq('id', id)

    if (error) {
      alert('Error: ' + error.message)
      return
    }

    alert('✅ Eliminado')
    fetchPromociones()
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', padding: '20px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        <div style={{ marginBottom: '30px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '32px', marginBottom: '10px', color: '#333' }}>
            Panel Admin - Keka Terapias
          </h1>
          <p style={{ color: '#666', fontSize: '16px' }}>
            Administra las promociones del spa
          </p>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '30px'
        }}>
          <h2 style={{ fontSize: '22px', marginBottom: '20px', color: '#333' }}>
            ➕ Agregar Nueva Promoción
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input
              type="text"
              placeholder="Título"
              value={newPromo.titulo}
              onChange={(e) => setNewPromo({...newPromo, titulo: e.target.value})}
              style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }}
            />
            
            <input
              type="text"
              placeholder="Descuento"
              value={newPromo.descuento}
              onChange={(e) => setNewPromo({...newPromo, descuento: e.target.value})}
              style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }}
            />

            <input
              type="text"
              placeholder="Emoji"
              maxLength="2"
              value={newPromo.emoji}
              onChange={(e) => setNewPromo({...newPromo, emoji: e.target.value})}
              style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }}
            />

            <textarea
              placeholder="Descripción"
              value={newPromo.descripcion}
              onChange={(e) => setNewPromo({...newPromo, descripcion: e.target.value})}
              style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', minHeight: '80px' }}
            />

            <input
              type="text"
              placeholder="Válido hasta"
              value={newPromo.vence}
              onChange={(e) => setNewPromo({...newPromo, vence: e.target.value})}
              style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }}
            />
          </div>

          <button
            onClick={handleAddPromo}
            style={{
              width: '100%',
              marginTop: '20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              padding: '15px',
              fontSize: '16px',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            ✨ Agregar
          </button>
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <div style={{ backgroundColor: '#333', color: 'white', padding: '20px', fontSize: '18px', fontWeight: 'bold' }}>
            📋 Promociones ({promociones.length})
          </div>

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>⏳ Cargando...</div>
          ) : promociones.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>Sin promociones. ¡Agrega una!</div>
          ) : (
            <div>
              {promociones.map((promo) => (
                <div key={promo.id} style={{ padding: '20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#333' }}>
                      {promo.emoji} {promo.titulo}
                    </h3>
                    <p style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 'bold', color: '#4CAF50' }}>
                      {promo.descuento}
                    </p>
                    <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '14px' }}>
                      {promo.descripcion}
                    </p>
                    <p style={{ margin: '0', color: '#999', fontSize: '12px' }}>
                      ⏰ {promo.vence}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => handleDelete(promo.id)}
                    style={{ backgroundColor: '#f44336', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}