# TodoAssistant
This project is a Todo Summary Assistant that allows users to manage todos, summarize pending todos using an LLM (Cohere), and send the summaries to a Slack channel. The app demonstrates working integrations with Supabase (database), Cohere (LLM), and Slack (notifications).

## Project Structure
- `frontend/`: React app (built with Vite) for the user interface.
- `backend/`: Express.js server for API endpoints, database interactions, LLM summarization, and Slack integration.

## Deliverables
- **Source Code**: Included in this repository (`frontend/` and `backend/` directories).
- **Environment Variables**: See `.env.example` files in `frontend/` and `backend/` for required variables.
- **README**: This file contains setup instructions, integration guidance, and design decisions.
- **Deployed URL**: Not Deployed but can be done.

## Setup Instructions

### Prerequisites
- **Node.js**: v18 or higher.
- **npm**: Comes with Node.js.
- **Supabase Account**: For the database.
- **Cohere Account**: For LLM summarization.
- **Slack Workspace**: For sending summaries.

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend


### Supabase Table Setup
- **todosassist**
Create a todosassist table with the following columns:
- **id**: int8, primary key, identity (auto-increment).
- **title**: text, not null.
- **description**: text, nullable.
- **status**: text, default 'pending'.
Then you have to setup the polices for anon for seprate Operations Select, Update , Insert, Delete.

### For help
1. Go to Supabase dashboard
2. Go to SQL Editor 
3. Run this below query: -
- **Table creation**
CREATE TABLE todosassist (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending'
);

- **Enable RLS**
ALTER TABLE todosassist ENABLE ROW LEVEL SECURITY;

- **RLS Policies**
CREATE POLICY "Allow SELECT for anon on todosassist"
ON "public"."todosassist"
FOR SELECT
TO anon
USING (true);

CREATE POLICY "Allow INSERT for anon on todosassist"
ON "public"."todosassist"
FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Allow UPDATE for anon on todosassist"
ON "public"."todosassist"
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow DELETE for anon on todosassist"
ON "public"."todosassist"
FOR DELETE
TO anon
USING (true);

This structure will work as per the uploaded assignment
# Thanks for the Assginment.. :)