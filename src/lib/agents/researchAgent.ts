import { exec } from 'child_process';
import path from 'path';
import util from 'util';

const execPromise = util.promisify(exec);

export async function runResearchAgent(query: string): Promise<string> {
  const pythonScript = path.join(process.cwd(), 'src/lib/agents/research_agent.py');
  
  try {
    // Attempt to run the Python script via python3
    // Note: the environment running this Next.js app needs python3 and the google-antigravity-sdk installed.
    const { stdout, stderr } = await execPromise(`python3 ${pythonScript} "${query.replace(/"/g, '\\"')}"`);
    
    if (stderr) {
      console.warn("Python Agent Stderr:", stderr);
    }
    
    try {
      const result = JSON.parse(stdout);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data || "No data found.";
    } catch (parseError) {
      console.error("Failed to parse agent output:", stdout);
      throw new Error("Invalid output from research agent.");
    }
  } catch (error) {
    console.error("Research Agent Execution Failed:", error);
    throw error;
  }
}
