import 'dotenv/config';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function evaluateWithAI(resumeText, jobDescription) {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().toLocaleString('default', { month: 'short' });
    const prompt = `
        You are an expert technical recruiter and ATS engine.
        Today's reference date is ${currentMonth} ${currentYear}.
        
        TASK:
        Analyze the provided <RESUME> against the <JOB_DESCRIPTION>. Compute a balanced score out of 100 using the following strict breakdown:
        
        SCORING WEIGHT DISTRIBUTION (Total: 100 points):
        1. CORE TECHNICAL SKILLS (40 Points):
        - Evaluate primary languages, core frameworks, and runtime environments required by the role.
        2. SECONDARY TOOLS & METHODOLOGIES (20 Points):
        - Evaluate databases, cloud services, CI/CD, Git, testing, and agile practices.
        3. EXPERIENCE DURATION & DATES (25 Points):
        - Sum the duration across all employment positions using explicit start and end dates (treat "Present" as ${currentMonth} ${currentYear}).
        - Full points if the candidate meets or exceeds the required years; deduct proportionally if there is a gap.
        4. ROLE & SENIORITY ALIGNMENT (15 Points):
        - Assess domain relevance, depth of project responsibilities, and quantified impact.
        
        DATE & EXPERIENCE RULES:
        - Calculate total experience accurately from documented roles.
        - If employment dates are missing, overlapping without clarification, or formatted in a non-standard way, set "detected_experience" to "Unclear" and explain the exact issue in "improvements".
        
        EVALUATION OUTPUT CRITERIA:
        - strengths: 1 to 3 short sentences highlighting exact qualifications that directly align with the core JD requirements.
        - missing_keywords: all the specific tools or frameworks explicitly required in the JD that do not appear anywhere in the resume.
        - improvements: 1 to 3 actionable points (e.g., date formatting issues, missing core tools, or tips to quantify accomplishments).
        
        <JOB_DESCRIPTION>
        ${jobDescription}
        </JOB_DESCRIPTION>
        
        <RESUME>
        ${resumeText}
        </RESUME>
        
        Respond strictly in valid JSON format:
        {
        "score": <integer between 0 and 100>,
        "detected_experience": "<e.g., '3.2 years' or 'Unclear'>",
        "strengths": ["<strength 1>", "<strength 2>"],
        "missing_keywords": ["<missing tool>"],
        "improvements": ["<actionable recommendation>"]
        }
        
        You MUST output valid JSON exactly matching this structure:
        {
        "score": <number 0-100 based on a strict combination of skills and experience match>,
        "detected_experience": "<string, e.g. '3.5 years' or 'Unclear'>",
        "strengths": ["<qualitative alignment>"],
        "missing_keywords": ["<keyword 1>", "<keyword 2>"],
        "improvements": ["<actionable tip>"]
        }
    `;

    const response = await groq.chat.completions.create({
        messages: [
          { role: "user", content: prompt }
        ],
        model: "openai/gpt-oss-120b",
        temperature: 0.1, 
        reasoning_effort: "medium",
        response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);

}