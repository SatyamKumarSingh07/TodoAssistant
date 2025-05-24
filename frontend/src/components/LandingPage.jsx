import  { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const LandingPage = () => {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');

  
  console.log('API_URL:', API_URL);


  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      if (!API_URL) throw new Error('API_URL is not defined');
      const response = await axios.get(`${API_URL}/todos`);
      setTodos(response.data);
      setMessage(''); 
    } catch (error) {
      setMessage('Failed to fetch todos: ' + (error.response?.data?.details || error.response?.data?.error || error.message));
    }
  };

  const handleAddOrEditTodo = async (e) => {
    e.preventDefault();
    try {
      if (!API_URL) throw new Error('API_URL is not defined');
      if (editingId) {
        await axios.put(`${API_URL}/todos/${editingId}`, { title, description });
        setMessage('Todo updated successfully');
      } else {
        await axios.post(`${API_URL}/todos`, { title, description });
        setMessage('Todo added successfully');
      }
      setTitle('');
      setDescription('');
      setEditingId(null);
      await fetchTodos();
    } catch (error) {
      setMessage('Failed to save todo: ' + (error.response?.data?.details || error.response?.data?.error || error.message));
    }
  };

  const handleEdit = (todo) => {
    setTitle(todo.title);
    setDescription(todo.description || '');
    setEditingId(todo.id);
  };

  const handleDelete = async (id) => {
    try {
      if (!API_URL) throw new Error('API_URL is not defined');
      await axios.delete(`${API_URL}/todos/${id}`);
      setMessage('Todo deleted successfully');

      await fetchTodos();
    } catch (error) {
      setMessage('Failed to delete todo: ' + (error.response?.data?.details || error.response?.data?.error || error.message));
    }
  };

  const handleSummarize = async () => {
    try {
      if (!API_URL) throw new Error('API_URL is not defined');
      const response = await axios.post(`${API_URL}/summarize`);
      setMessage(response.data.message);
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message === 'No pending todos to summarize') {
        setMessage('No pending todos to summarize. Add some pending todos first!');
      } else {
        setMessage('Failed to summarize or send to Slack: ' + (error.response?.data?.details || error.response?.data?.error || error.message));
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-3xl bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl p-6 sm:p-8 transition-all duration-500">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600 mb-8">
          Todo Summary Assistant
        </h1>

        <form onSubmit={handleAddOrEditTodo} className="mb-8 space-y-4">
          <div>
            <label className="block text-lg font-semibold text-gray-800 mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300 bg-gray-50/50"
              placeholder="Enter todo title"
              required
            />
          </div>
          <div>
            <label className="block text-lg font-semibold text-gray-800 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300 bg-gray-50/50"
              placeholder="Enter todo description"
              rows="4"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-600 to-blue-500 text-white p-3 rounded-lg hover:from-indigo-700 hover:to-blue-600 transition-all duration-300 transform hover:scale-105"
          >
            {editingId ? 'Update Todo' : 'Add Todo'}
          </button>
        </form>

        <div className="space-y-4">
          {todos.length === 0 ? (
            <p className="text-center text-gray-500 text-lg animate-pulse">No todos yet. Add one!</p>
          ) : (
            todos.map((todo, index) => (
              <div
                key={todo.id}
                className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-fadeIn"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">{todo.title}</h3>
                    <p className="text-gray-600 mt-1">{todo.description || 'No description'}</p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleEdit(todo)}
                      className="text-indigo-500 hover:text-indigo-700 font-medium transition-colors duration-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(todo.id)}
                      className="text-red-500 hover:text-red-700 font-medium transition-colors duration-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <button
          onClick={handleSummarize}
          className="mt-8 w-full bg-gradient-to-r from-green-500 to-teal-500 text-white p-3 rounded-lg hover:from-green-600 hover:to-teal-600 transition-all duration-300 transform hover:scale-105"
        >
          Summarize & Send to Slack
        </button>

     
        {message && (
          <p
            className={`mt-6 text-center text-lg font-medium animate-slideIn ${
              message.includes('Failed') || message.includes('No pending') ? 'text-red-500' : 'text-green-500'
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default LandingPage;