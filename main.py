from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import os
from datetime import datetime
import json

# LangChain imports
from langchain_core.messages import HumanMessage
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, END
from typing_extensions import TypedDict
from dotenv import load_dotenv

load_dotenv()
app = FastAPI(title="Space Mission AI Agent System")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class QueryRequest(BaseModel):
    query: str

class VisualizationData(BaseModel):
    type: str
    data: List[Dict[str, Any]]
    title: str
    description: str

class AgentResponse(BaseModel):
    query: str
    insights: str
    visualizations: List[VisualizationData]
    timestamp: str

# State definition for LangGraph - Two Agent System
class AgentState(TypedDict):
    query: str
    agent1_response: Optional[str]
    agent1_failed: bool
    final_output: Optional[Dict[str, Any]]

# Initialize Perplexity LLM clients
print("\n" + "="*80)
print("INITIALIZING PERPLEXITY LLM CLIENT")
print("="*80)

# Check for API key
PERPLEXITY_API_KEY = os.getenv("PERPLEXITY_API_KEY", "")

if not PERPLEXITY_API_KEY or PERPLEXITY_API_KEY == "your-api-key-here":
    print("⚠️  WARNING: PERPLEXITY_API_KEY not set!")
    print("Please set your API key in .env file")
    print("Example: PERPLEXITY_API_KEY=pplx-xxxxxxxxxxxx")
    USE_MOCK = True
else:
    USE_MOCK = False
    print(f"✓ API Key found: {PERPLEXITY_API_KEY[:10]}...")

# Agent 1: Web Search LLM (temperature 0.5)
web_search_llm = ChatOpenAI(
    model="sonar-pro",
    # model="gemini-2.5-pro",
    temperature=0.5,
    api_key=PERPLEXITY_API_KEY,
    base_url="https://api.perplexity.ai"
    # base_url=r"https://generativelanguage.googleapis.com/v1beta/openai/"
)

# Agent 2: Visualization Generator LLM (temperature 1.5)
visualization_llm = ChatOpenAI(
    model="sonar-pro",
    # model="gemini-2.5-pro",
    temperature=1.5,
    api_key=PERPLEXITY_API_KEY,
    base_url="https://api.perplexity.ai"
    # base_url=r"https://generativelanguage.googleapis.com/v1beta/openai/"
)

print("✓ Web Search Agent LLM initialized (temperature: 0.5)")
print("✓ Visualization Agent LLM initialized (temperature: 1.5)")

# Mock response function for when API key is missing
def get_mock_response(query: str) -> str:
    """Generate mock responses when API key is not available"""
    return f"""Mock data for: {query}
    
Example Space Mission Information:
- Recent launches and missions
- Agency comparisons and statistics
- Budget and success rate data
- Timeline of key events

Please add your Perplexity API key for real-time data."""

# Agent 1: Web Search Agent
def agent1_web_search(state: AgentState) -> AgentState:
    """Agent 1: Searches the web for real-time space mission information"""
    print("\n" + "="*80)
    print("AGENT 1: WEB SEARCH AGENT - STARTED")
    print("="*80)
    print(f"Input Query: {state['query']}")
    
    try:
        if USE_MOCK:
            print("\n⚠️  Using MOCK response (API key not configured)")
            response_content = get_mock_response(state['query'])
        else:
            prompt = f"""You are a space mission research expert with access to real-time data. 

Query: {state['query']}

Search and provide comprehensive, detailed information about this query including:
1. Mission details (agency, date, objectives, status)
2. Key statistics and numerical data
3. Notable achievements or challenges
4. Comparative data if multiple agencies/missions are mentioned
5. Recent updates and current status

Be thorough and provide as much factual data as possible. Include specific numbers, dates, and metrics."""

            print("\nSending request to Perplexity (Web Search)...")
            response = web_search_llm.invoke([HumanMessage(content=prompt)])
            response_content = response.content
        
        state['agent1_response'] = response_content
        state['agent1_failed'] = False
        
        print("\n--- AGENT 1 OUTPUT (Full Response) ---")
        print(response_content)
        print("\n✓ Agent 1 completed successfully")
        
    except Exception as e:
        print(f"\n✗ AGENT 1 FAILED: {str(e)}")
        state['agent1_response'] = None
        state['agent1_failed'] = True
    
    return state

# Agent 2: Visualization Generator Agent
def agent2_visualization_generator(state: AgentState) -> AgentState:
    """Agent 2: Takes data from Agent 1 and creates visualization specifications"""
    print("\n" + "="*80)
    print("AGENT 2: VISUALIZATION GENERATOR - STARTED")
    print("="*80)
    
    # Check if Agent 1 failed
    if state['agent1_failed'] or not state['agent1_response']:
        print("⚠️ Agent 1 failed or no data available. Cannot generate visualizations.")
        state['final_output'] = {
            "insights": "Unable to fetch data. Please try again.",
            "visualizations": []
        }
        return state
    
    agent1_data = state['agent1_response']
    query = state['query']
    
    print(f"Processing data from Agent 1...")
    print(f"Query: {query}")
    
    try:
        # Check how many visualizations are requested
        # num_graphs = 3  # Default
        # query_lower = query.lower()
        
        # # Extract number if specified in query
        # if "5 graphs" in query_lower or "five graphs" in query_lower:
        #     num_graphs = 5
        # elif "4 graphs" in query_lower or "four graphs" in query_lower:
        #     num_graphs = 4
        # elif "3 graphs" in query_lower or "three graphs" in query_lower:
        #     num_graphs = 3
        # elif "2 graphs" in query_lower or "two graphs" in query_lower:
        #     num_graphs = 2
        # elif "1 graph" in query_lower or "one graph" in query_lower:
        #     num_graphs = 1
        
        # print(f"Generating {num_graphs} visualizations...")
        
        # Create the prompt with strict JSON format
        viz_prompt = f"""You are a data visualization expert. Based on the following information, analyze the Original Query: {query} and create the specified number of different visualizations.

Data from Research:
{agent1_data}

CRITICAL INSTRUCTIONS:
1. Create Exactly the asked number of visualization in the Original Query: {query} based on the data above
2. Use ONLY data mentioned in the research above - DO NOT make up data
3. Each visualization must have actual data points with realistic values from the research
4. Return ONLY valid JSON, no other text

Available visualization types: "bar", "line", "pie", "scatter", "timeline"

Return STRICTLY in this JSON format:
{{
  "insights": "2-3 sentence summary of the key findings from the data",
  "visualizations": [
    {{
      "type": "bar",
      "title": "Clear descriptive title",
      "description": "What this visualization shows",
      "data": [
        {{"label": "Item 1", "value": 100}},
        {{"label": "Item 2", "value": 150}},
        {{"label": "Item 3", "value": 200}}
      ]
    }},
    {{
      "type": "line",
      "title": "Another visualization title",
      "description": "What this shows",
      "data": [
        {{"label": "2020", "value": 50}},
        {{"label": "2021", "value": 75}},
        {{"label": "2022", "value": 100}}
      ]
    }}
  ]
}}

IMPORTANT:
- For "bar" and "line": Use format {{"label": "name", "value": number}}
- For "pie": Use format {{"label": "category", "value": percentage}}
- For "timeline": Use format {{"label": "event", "value": year, "date": "YYYY-MM-DD"}}
- Each visualization should have 3-8 data points
- Use actual numbers from the research data
- Make insights meaningful and data-driven

Create Exactly the asked number of visualization in the Original Query: {query} now."""

        print("\nSending request to Perplexity (Visualization Generator)...")
        response = visualization_llm.invoke([HumanMessage(content=viz_prompt)])
        
        print("\n--- AGENT 2 RAW OUTPUT ---")
        print(response.content)
        
        # Parse JSON response
        try:
            content = response.content.strip()
            
            # Extract JSON from markdown code blocks if present
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
            
            # Remove any leading/trailing whitespace
            content = content.strip()
            
            viz_data = json.loads(content)
            
            # Validate the structure
            if "visualizations" not in viz_data or "insights" not in viz_data:
                raise ValueError("Invalid JSON structure: missing 'visualizations' or 'insights'")
            
            state['final_output'] = viz_data
            print(f"\n✓ Agent 2 completed successfully - {len(viz_data['visualizations'])} visualizations generated")
            
        except json.JSONDecodeError as e:
            print(f"\n✗ JSON parsing failed: {e}")
            print("Attempting to extract insights manually...")
            
            # Fallback: Create a basic response
            state['final_output'] = {
                "insights": "Unable to parse visualization data properly. The system encountered a formatting issue.",
                "visualizations": [
                    {
                        "type": "bar",
                        "title": "Data Processing Error",
                        "description": "Please try rephrasing your query",
                        "data": [{"label": "Error", "value": 1}]
                    }
                ]
            }
        except Exception as e:
            print(f"\n✗ Validation failed: {e}")
            state['final_output'] = {
                "insights": "Data validation error occurred.",
                "visualizations": []
            }
            
    except Exception as e:
        print(f"\n✗ AGENT 2 VISUALIZATION GENERATION FAILED: {str(e)}")
        import traceback
        traceback.print_exc()
        state['final_output'] = {
            "insights": "Unable to generate visualizations due to an error.",
            "visualizations": []
        }
    
    return state

# Build the LangGraph workflow - Two Agent Sequential System
print("\n" + "="*80)
print("BUILDING LANGGRAPH WORKFLOW")
print("="*80)

workflow = StateGraph(AgentState)

# Add nodes
workflow.add_node("agent1", agent1_web_search)
workflow.add_node("agent2", agent2_visualization_generator)

# Sequential execution: Agent 1 -> Agent 2
workflow.set_entry_point("agent1")
workflow.add_edge("agent1", "agent2")
workflow.add_edge("agent2", END)

# Compile the graph
app_graph = workflow.compile()

print("✓ Workflow compiled with 2-agent sequential execution")
print("  - Agent 1 (Web Search) fetches real-time data")
print("  - Agent 2 (Visualization Generator) creates dynamic visualizations")
print("  - NO hardcoded data - everything is generated from Agent 1's research")

# API Endpoints
@app.get("/")
async def root():
    return {
        "message": "Space Mission AI Agent System",
        "status": "operational",
        "api_key_configured": not USE_MOCK,
        "agents": ["Web Search Agent", "Visualization Generator Agent"]
    }

@app.post("/query", response_model=AgentResponse)
async def process_query(request: QueryRequest):
    """Main endpoint to process space mission queries"""
    print("\n" + "="*80)
    print("NEW QUERY RECEIVED")
    print("="*80)
    print(f"Query: {request.query}")
    print(f"Timestamp: {datetime.now().isoformat()}")
    
    # Check for ambiguous query
    if len(request.query.strip()) < 5:
        print("\n⚠️ AMBIGUOUS QUERY DETECTED")
        raise HTTPException(
            status_code=400,
            detail="Please provide a clear and specific query about space missions. Example: 'Show me ISRO launches in 2024' or 'Give me 5 graphs about ISRO missions'"
        )
    
    try:
        # Initialize state
        initial_state = {
            "query": request.query,
            "agent1_response": None,
            "agent1_failed": False,
            "final_output": None
        }
        
        # Run the workflow
        print("\nStarting agent workflow...")
        final_state = app_graph.invoke(initial_state)
        
        print("\n" + "="*80)
        print("WORKFLOW COMPLETED")
        print("="*80)
        
        # Format response
        result = AgentResponse(
            query=request.query,
            insights=final_state['final_output'].get('insights', 'No insights available'),
            visualizations=[
                VisualizationData(**viz) for viz in final_state['final_output'].get('visualizations', [])
            ],
            timestamp=datetime.now().isoformat()
        )
        
        print("\n--- FINAL API RESPONSE ---")
        print(json.dumps(result.model_dump(), indent=2))
        print("\n✓ Response sent to frontend")
        
        return result
        
    except Exception as e:
        print(f"\n✗ ERROR IN QUERY PROCESSING: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "api_configured": not USE_MOCK
    }

if __name__ == "__main__":
    import uvicorn
    print("\n" + "="*80)
    print("STARTING FASTAPI SERVER")
    print("="*80)
    print("Server will run on http://localhost:8000")
    print("API Documentation: http://localhost:8000/docs")
    print("\n⚠️  IMPORTANT: Set PERPLEXITY_API_KEY in .env file for real data")
    print("="*80)
    uvicorn.run(app, host="0.0.0.0", port=8000)