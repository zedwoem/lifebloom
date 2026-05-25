import asyncio
import sys
import json
from google.antigravity import Agent, LocalAgentConfig

async def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No query provided"}))
        return
        
    query = sys.argv[1]
    
    # In a real scenario, we would equip the agent with MCP tools for PubMed or OpenAlex
    # For now, we simulate a research query
    config = LocalAgentConfig(
        system_instruction="You are a medical research assistant. Provide detailed summaries of scientific literature."
    )
    
    try:
        async with Agent(config) as agent:
            response = await agent.chat(f"Search for recent journals regarding: {query}")
            text_response = await response.text()
            print(json.dumps({"status": "success", "data": text_response}))
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    asyncio.run(main())
