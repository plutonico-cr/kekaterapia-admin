import './App.css'
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ciddpvkcdoevfprlzhtg.supabase.co';
const supabaseKey = 'sb_publishable_F10DXS9eoGkfmLuzf5J2lQ_T8jf2oLJ';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function AdminPanel() {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    titulo: '',
    descuento: '',
    descripcion: '',
    color: 'sage',
    vence: '',
    emoji: '',
  });

  useEffect(() => {
    fetchPromos();
  }, []);

  const fetchPromos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('promociones')
        .select('*')
        .order('orden', { ascending: true });

      if (error) throw error;
      setPromos(data || []);
    } catch (error) {
      console.error('Error cargando promociones:', error);
      alert('Error cargando promociones: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.titulo || !formData.descuento || !formData.descripcion) {
      alert('Por favor completa todos los campos');
      return;
    }

    try {
      if (editingId) {
        const { error } = await supabase
          .from('promociones')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingId);

        if (error) throw error;
        alert('✅ Promoción actualizada');
      } else {
        const { error } = await supabase
          .from('promociones')
          .insert([{
            ...formData,
            orden: promos.length + 1
          }]);

        if (error) throw error;
        alert('✅ Promoción creada');
      }

      setFormData({
        titulo: '',
        descuento: '',
        descripcion: '',
        color: 'sage',
        vence: '',
        emoji: '',
      });
      setEditingId(null);
      await fetchPromos();
    } catch (error) {
      console.error('Error guardando:', error);
      alert('Error: ' + error.message);
    }
  };

  const handleEdit = (promo) => {
    setEditingId(promo.id);
    setFormData({
      titulo: promo.titulo,
      descuento: promo.descuento,
      descripcion: promo.descripcion,
      color: promo.color,
      vence: promo.vence,
      emoji: promo.emoji,
    });
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás segura de que quieres eliminar esta promoción?')) return;

    try {
      const { error } = await supabase
        .from('promociones')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('✅ Promoción eliminada');
      await fetchPromos();
    } catch (error) {
      console.error('Error eliminando:', error);
      alert('Error: ' + error.message);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      titulo: '',
      descuento: '',
      descripcion: '',
      color: 'sage',
      vence: '',
      emoji: '',
    });
  };

  const handleToggleActive = async (id, currentActive) => {
    try {
      const { error } = await supabase
        .from('promociones')
        .update({ activa: !currentActive })
        .eq('id', id);

      if (error) throw error;
      await fetchPromos();
    } catch (error) {
      console.error('Error:', error);
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">📱 Panel Admin Keka Terapias</h1>
          <p className="text-gray-600">Gestiona las promociones del sitio web</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {editingId ? '✏️ Editar Promoción' : '➕ Nueva Promoción'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Título *</label>
                <input
                  type="text"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleInputChange}
                  placeholder="Ej: Masaje + Manicure"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descuento *</label>
                <input
                  type="text"
                  name="descuento"
                  value={formData.descuento}
                  onChange={handleInputChange}
                  placeholder="Ej: ₡30,000 o 20% OFF"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color *</label>
                <select
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="sage">Verde (Sage)</option>
                  <option value="lavender">Morado (Lavender)</option>
                  <option value="rose">Rosa (Rose)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Emoji *</label>
                <input
                  type="text"
                  name="emoji"
                  value={formData.emoji}
                  onChange={handleInputChange}
                  placeholder="Ej: 💆‍♀️"
                  maxLength="2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Válida hasta *</label>
                <input
                  type="text"
                  name="vence"
                  value={formData.vence}
                  onChange={handleInputChange}
                  placeholder="Ej: Hasta el 31 de julio"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Descripción *</label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  placeholder="Describe la promo en detalle"
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition"
              >
                {editingId ? '💾 Actualizar' : '✨ Crear Promoción'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded-lg transition"
                >
                  ❌ Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            📋 Promociones Activas ({promos.length})
          </h2>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Cargando...</p>
            </div>
          ) : promos.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No hay promociones. ¡Crea una nueva!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {promos.map((promo) => (
                <div
                  key={promo.id}
                  className={`p-6 border-2 rounded-lg transition ${
                    promo.activa
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-300 bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">{promo.emoji}</span>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">{promo.titulo}</h3>
                          <p className="text-sm text-gray-600">ID: {promo.id}</p>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4 mt-4">
                        <div>
                          <p className="text-sm text-gray-600">Descuento</p>
                          <p className="text-2xl font-bold text-purple-600">{promo.descuento}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Color</p>
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                            promo.color === 'sage' ? 'bg-green-200 text-green-800' :
                            promo.color === 'lavender' ? 'bg-purple-200 text-purple-800' :
                            'bg-pink-200 text-pink-800'
                          }`}>
                            {promo.color}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Válida</p>
                          <p className="font-medium text-gray-800">⏰ {promo.vence}</p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="text-sm text-gray-600 mb-2">Descripción:</p>
                        <p className="text-gray-800">{promo.descripcion}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => handleToggleActive(promo.id, promo.activa)}
                      className={`px-4 py-2 rounded font-bold transition ${
                        promo.activa
                          ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                          : 'bg-green-500 hover:bg-green-600 text-white'
                      }`}
                    >
                      {promo.activa ? '👁️ Desactivar' : '🔒 Activar'}
                    </button>
                    <button
                      onClick={() => handleEdit(promo)}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-bold transition"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleDelete(promo.id)}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded font-bold transition"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-gray-600 text-sm">
          <p>✨ Panel Admin Keka Terapias | Todos los cambios se guardan en Supabase automáticamente</p>
        </div>
      </div>
    </div>
  );
}
