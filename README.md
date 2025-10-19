# 🚀 Nebula AI

A sophisticated full-stack application that leverages AI agents to provide real-time space mission data analysis and interactive visualizations. The system combines a FastAPI backend with LangGraph-powered AI agents and a modern React frontend featuring 3D visualizations.

## 🌟 Features

### Backend (FastAPI + LangGraph)
- **Dual AI Agent System**: Two specialized agents working in sequence
  - **Agent 1**: Web Search Agent - Fetches real-time space mission data using Perplexity API
  - **Agent 2**: Visualization Generator - Creates dynamic data visualizations from research data
- **LangGraph Workflow**: Orchestrates agent interactions with state management
- **Real-time Data**: Live space mission information from multiple agencies (NASA, ISRO, SpaceX, etc.)
- **RESTful API**: Clean endpoints for query processing and health monitoring
- **Error Handling**: Robust error management with fallback responses

### Frontend (React + 3D Visualizations)
- **Interactive 3D Globe**: Three.js-powered Earth visualization with space agency locations
- **Dynamic Charts**: Multiple visualization types (Bar, Line, Pie, Scatter, Timeline)
- **Modern UI**: Tailwind CSS with space-themed design
- **Real-time Analytics**: Live data processing and visualization generation
- **Responsive Design**: Mobile-friendly interface

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  React Frontend │    │ FastAPI Backend │    │   AI Agents     │
│                 │    │                 │    │                 │
│ • 3D Globe      │◄──►│ • LangGraph     │◄──►│ • Web Search    │
│ • Charts        │    │ • REST API      │    │ • Visualization │
│ • Tailwind CSS  │    │ • CORS Support  │    │ • Perplexity    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Technology Stack

### Backend
- **FastAPI**: Modern Python web framework
- **LangGraph**: Agent workflow orchestration
- **LangChain**: AI agent framework
- **Perplexity API**: Real-time web search
- **Pydantic**: Data validation
- **Uvicorn**: ASGI server

### Frontend
- **React 18**: Modern React with hooks
- **Three.js**: 3D graphics and globe visualization
- **Recharts**: Data visualization library
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library

## 📦 Installation

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/PranavJa1n/Nebula_AI
   cd Mumbai
   ```

2. **Create virtual environment**
   ```bash
   python -m venv .venv
   On linux or Mac: source .venv/bin/activate
   On Windows: .venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirments.txt
   ```

4. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   PERPLEXITY_API_KEY=your-perplexity-api-key-here
   ```

5. **Run the backend**
   ```bash
   python main.py
   ```
   The API will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd space-mission-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```
   The frontend will be available at `http://localhost:3000`

## 🚀 Usage

### API Endpoints

#### `GET /`
- **Description**: System status and configuration
- **Response**: System information and agent status

#### `POST /query`
- **Description**: Process space mission queries
- **Body**: `{"query": "your space mission question"}`
- **Response**: AI insights and visualizations

#### `GET /health`
- **Description**: Health check endpoint
- **Response**: System health status

### Example Queries

```
"Show me SpaceX launches in 2024"
"Compare ISRO and NASA mission success rates"
"Give me 5 graphs about space agency budgets"
"Analyze recent Mars missions"
"Show timeline of space exploration milestones"
```

### Frontend Features

1. **3D Globe**: Interactive Earth showing space agency locations
2. **Query Interface**: Natural language input for space mission questions
3. **Dynamic Visualizations**: Auto-generated charts based on query results
4. **Real-time Processing**: Live data analysis and visualization

## 🔧 Configuration

### Backend Configuration

The system supports two modes:

1. **Production Mode** (with API key):
   - Set `PERPLEXITY_API_KEY` in `.env` file
   - Real-time data from Perplexity API
   - Full AI agent functionality

2. **Mock Mode** (without API key):
   - Uses mock data for demonstration
   - No external API calls
   - Suitable for development/testing

### Frontend Configuration

- **Backend URL**: Configured in `SpaceApp.jsx` (default: `http://localhost:8000`)
- **Styling**: Tailwind CSS with custom space theme
- **3D Globe**: Configurable space agency markers and locations

## 📊 Data Flow

1. **User Query**: Natural language input via frontend
2. **Agent 1 Processing**: Web search for real-time space data
3. **Agent 2 Processing**: Visualization generation from research data
4. **Response Formatting**: Structured JSON with insights and charts
5. **Frontend Rendering**: Dynamic visualization display

## 🎨 Visualization Types

- **Bar Charts**: Comparative data (budgets, launches, etc.)
- **Line Charts**: Time-series data (mission timelines)
- **Pie Charts**: Distribution data (agency market share)
- **Scatter Plots**: Correlation analysis
- **Timeline Charts**: Chronological mission data

## 🔍 Development

### Backend Development
```bash
# Install development dependencies
pip install -r requirments.txt

# Run with auto-reload
python main.py
```

### Frontend Development
```bash
cd space-mission-frontend
npm start # or npm run dev
```

### API Documentation
Visit `http://localhost:8000/docs` for interactive API documentation.

## 🚀 Deployment

### Backend Deployment
1. Set up production environment variables
2. Configure CORS for production domain
3. Use production ASGI server (Gunicorn with Uvicorn workers)

### Frontend Deployment
1. Build production bundle: `npm run build`
2. Deploy to static hosting (Vercel, Netlify, etc.)
3. Update backend URL in production build


## 🙏 Acknowledgments

- **LangChain**: AI agent framework
- **Perplexity**: Real-time web search API
- **Three.js**: 3D graphics library
- **Recharts**: Data visualization components
- **FastAPI**: Modern Python web framework

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation at `/docs`
- Review the health endpoint at `/health`

---

**Built with ❤️ for space exploration and AI innovation**
