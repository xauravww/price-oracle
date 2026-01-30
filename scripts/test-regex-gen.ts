
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

// Re-implementing the function logic purely for testing to avoid Next.js server action constraints
async function generateRegexPattern(description: string): Promise<{ success: boolean; pattern?: string; error?: string }> {
    try {
        const apiUrl = process.env.AI_SERVICE_URL || "https://api.openai.com/v1/chat/completions";
        const apiKey = process.env.AI_CLIENT_API_KEY;

        if (!apiKey) {
            return { success: false, error: "AI service not configured" };
        }

        const systemPrompt = `You are a Regex Expert.
Goal: Convert natural language descriptions into Javascript-compatible Regular Expressions.

Rules:
1. Return ONLY the regex pattern string. No slashes unless part of the pattern logic (e.g. don't wrap in /.../).
2. Do not include flags (like 'g', 'i') in the output pattern string itself.
3. If the user asks for a domain, create a pattern that matches the domain and its subdomains safely.
4. If the request is vague, create a safe, non-greedy match.
5. Handle URL parameters correctly. '?' must be escaped as '\\?' when matching a literal question mark.

Examples:
Input: "All pages from amazon.in"
Output: ".*amazon\\.in.*"

Input: "Any URL with the word 'fakedata'"
Output: ".*fakedata.*"

Input: "URLs ending in .pdf"
Output: ".*\\.pdf$"

Input: "Block s?k type url starting with amazon"
Output: ".*amazon.*\\/s\\?k=.*"

Input: "URLs containing /search?q="
Output: ".*\\/search\\?q=.*"

CRITICAL: Return ONLY a valid JSON object.
Format: { "pattern": "..." }`;

        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: description }
                ],
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            throw new Error("AI Service returned error");
        }

        const data = await response.json() as any;
        const content = data.choices[0]?.message?.content || "";

        let pattern = "";
        try {
            const parsed = JSON.parse(content);
            pattern = parsed.pattern;
        } catch (e) {
            const match = content.match(/"pattern":\s*"([^"]+)"/);
            if (match) pattern = match[1];
        }

        return { success: true, pattern: pattern };
    } catch (error) {
        console.error("Regex Generation Error:", error);
        return { success: false, error: "Failed to generate pattern. Please try again." };
    }
}


async function testRegexGen() {
    console.log("🧪 Testing AI Regex Generator...\n");

    const testCases = [
        "All pages from amazon.in",
        "URLs containing the word 'promo'",
        "URLs ending in .pdf or .docx",
        "Subdomains of blog.mysite.org",
        "Block s?k type url starting with amazon"
    ];

    for (const description of testCases) {
        console.log(`📝 Description: "${description}"`);
        try {
            const result = await generateRegexPattern(description);
            if (result.success) {
                console.log(`✅ Generated Pattern: ${result.pattern}`);

                // Basic Validation
                try {
                    new RegExp(result.pattern!);
                    console.log("   (Valid Regex Syntax)");
                } catch (e) {
                    console.error("   ❌ INVALID REGEX SYNTAX");
                }
            } else {
                console.error(`❌ Error: ${result.error}`);
            }
        } catch (e) {
            console.error("💥 Exception:", e);
        }
        console.log("-".repeat(40));
    }
}

testRegexGen();
