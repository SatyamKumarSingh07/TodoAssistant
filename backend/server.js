const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const { CohereClient } = require('cohere-ai');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const cohereClient = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

app.get('/todos', async (req, res) => {
  try {
    const { data, error } = await supabase.from('todosassist').select('*');
    if (error) {
      console.error('Error fetching todos:', error);
      return res.status(500).json({ error: 'Failed to fetch todos', details: error.message });
    }
    res.json(data);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

app.post('/todos', async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    const status = 'pending'; 
    const { data, error } = await supabase
      .from('todosassist')
      .insert([{ title, description, status }])
      .select();
    if (error) {
      console.error('Error adding todo:', error);
      return res.status(500).json({ error: 'Failed to add todo', details: error.message });
    }
    res.status(201).json(data[0]);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

app.put('/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    const { data, error } = await supabase
      .from('todosassist')
      .update({ title, description })
      .eq('id', id)
      .select();
    if (error) {
      console.error('Error updating todo:', error);
      return res.status(500).json({ error: 'Failed to update todo', details: error.message });
    }
    if (!data.length) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.json(data[0]);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

app.delete('/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('todosassist')
      .delete()
      .eq('id', id);
    if (error) {
      console.error('Error deleting todo:', error);
      return res.status(500).json({ error: 'Failed to delete todo', details: error.message });
    }
    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

app.post('/summarize', async (req, res) => {
  try {
    
    const { data: todos, error: fetchError } = await supabase
      .from('todosassist')
      .select('*')
      .eq('status', 'pending');
    if (fetchError) {
      console.error('Error fetching todos for summary:', fetchError);
      return res.status(500).json({ error: 'Failed to fetch todos', details: fetchError.message });
    }

    if (todos.length === 0) {
      return res.status(400).json({ message: 'No pending todos to summarize' });
    }

    // Generate summary with Cohere
    const todoText = todos
      .map((t) => `Title: ${t.title}, Description: ${t.description || 'None'}`)
      .join('\n');
    const response = await cohereClient.generate({
      prompt: `Summarize the following to-do list in a concise paragraph:\n${todoText}`,
      model: 'command', 
      maxTokens: 100,
      temperature: 0.7,
    });
    const summary = response.generations[0].text.trim();

    // Send summary to Slack
    try {
      await axios.post(process.env.SLACK_WEBHOOK_URL, {
        text: `📋 Todo Summary: ${summary}`,
      });
      res.json({ summary, message: 'Summary sent to Slack successfully' });
    } catch (slackError) {
      console.error('Error sending to Slack:', slackError);
      res.status(500).json({ summary, message: 'Failed to send summary to Slack', details: slackError.message });
    }
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});