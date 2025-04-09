import React, { useState, useEffect } from 'react';
import { Search, Filter, UserCircle, RefreshCw, Edit, Trash } from 'lucide-react';
import { withRetry } from '../../lib/supabase';
import { supabase } from '../../lib/supabase';

interface User {
  id: string;
  email: string;
  created_at: string;
  user_metadata?: {
    name?: string;
    avatar_url?: string;
    role?: string;
  };
  last_sign_in_at?: string;
}

export default function UserManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Solo administradores con permisos específicos deberían poder acceder a esta información
      const { data, error } = await withRetry(() => 
        supabase.auth.admin.listUsers()
      );

      if (error) throw error;
      setUsers(data.users || []);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      setError('No se pudieron cargar los usuarios. Verifica tus permisos de administrador.');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' || 
      (user.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
       user.user_metadata?.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = filterRole === '' || 
      user.user_metadata?.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let valueA, valueB;

    if (sortBy === 'email') {
      valueA = a.email?.toLowerCase() || '';
      valueB = b.email?.toLowerCase() || '';
    } else if (sortBy === 'name') {
      valueA = a.user_metadata?.name?.toLowerCase() || '';
      valueB = b.user_metadata?.name?.toLowerCase() || '';
    } else if (sortBy === 'created_at') {
      valueA = a.created_at || '';
      valueB = b.created_at || '';
    } else if (sortBy === 'last_sign_in') {
      valueA = a.last_sign_in_at || '';
      valueB = b.last_sign_in_at || '';
    } else {
      valueA = a[sortBy as keyof User] || '';
      valueB = b[sortBy as keyof User] || '';
    }

    if (sortDirection === 'asc') {
      return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
    } else {
      return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
    }
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-primary">Gestión de Usuarios</h2>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar usuarios..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-md w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <select
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-md appearance-none bg-white"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="">Todos los roles</option>
              <option value="admin">Administrador</option>
              <option value="user">Usuario</option>
              <option value="editor">Editor</option>
            </select>
          </div>
          
          <button 
            onClick={fetchUsers}
            className="flex items-center justify-center gap-2 bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Actualizar</span>
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('email')}
                >
                  <div className="flex items-center gap-2">
                    Email
                    {sortBy === 'email' && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-2">
                    Nombre
                    {sortBy === 'name' && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('created_at')}
                >
                  <div className="flex items-center gap-2">
                    Fecha de Registro
                    {sortBy === 'created_at' && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('last_sign_in')}
                >
                  <div className="flex items-center gap-2">
                    Último Acceso
                    {sortBy === 'last_sign_in' && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedUsers.length > 0 ? (
                sortedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        {user.user_metadata?.avatar_url ? (
                          <img 
                            src={user.user_metadata.avatar_url} 
                            alt="Avatar" 
                            className="h-6 w-6 rounded-full" 
                          />
                        ) : (
                          <UserCircle className="h-6 w-6 text-gray-400" />
                        )}
                        {user.user_metadata?.name || 'Sin nombre'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.last_sign_in_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.user_metadata?.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : user.user_metadata?.role === 'editor'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {user.user_metadata?.role || 'usuario'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button className="text-indigo-600 hover:text-indigo-900">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No se encontraron usuarios con los filtros seleccionados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}