
import axios from 'axios';
import { NodeHtmlMarkdown } from "node-html-markdown";
import zlib from 'zlib';

// Utility function for retry logic with exponential backoff
async function retryWithBackoff<T>(fn: () => Promise<T>, maxRetries = 3, baseDelay = 1000): Promise<T> {
    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error: any) {
            lastError = error;

            if (attempt === maxRetries) {
                break;
            }

            // Check if error is retryable
            const isRetryable = error.code === 'ECONNABORTED' ||
                error.code === 'ENOTFOUND' ||
                error.code === 'ECONNREFUSED' ||
                error.code === 'ETIMEDOUT' ||
                (error.response && error.response.status >= 500);

            if (!isRetryable) {
                throw error;
            }

            const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
            console.log(`[Reader] Attempt ${attempt + 1} failed, retrying in ${Math.round(delay)}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    throw lastError;
}

// Decode response data properly based on content-type charset
function decodeResponseData(data: any, contentType: string | undefined): string {
    if (Buffer.isBuffer(data)) {
        try {
            if (data.length > 2 && data[0] === 0x1f && data[1] === 0x8b) {
                const decompressed = zlib.gunzipSync(data);
                return decompressed.toString('utf-8');
            } else if (data.length > 0) {
                try {
                    const decompressed = zlib.inflateSync(data);
                    return decompressed.toString('utf-8');
                } catch {
                    return data.toString('utf-8');
                }
            }
        } catch (error: any) {
            console.warn('[Reader] Decompression failed:', error.message);
            return data.toString('utf-8');
        }
    }

    if (typeof data === 'string') {
        const charsetMatch = contentType?.match(/charset=([^;]+)/i);
        const charset = charsetMatch ? charsetMatch[1].toLowerCase() : 'utf-8';

        if (charset !== 'utf-8' && charset !== 'utf8') {
            try {
                const buffer = Buffer.from(data, 'binary');
                return buffer.toString(charset as any);
            } catch (error: any) {
                console.warn(`[Reader] Failed to decode charset ${charset}:`, error.message);
                return data;
            }
        }
    }

    return data;
}

function processContent(content: string, contentType: string | undefined, returnRaw = false): string {
    if (returnRaw) return content;

    const isHtml = contentType?.includes('text/html') ||
        content.toLowerCase().includes('<html') ||
        content.toLowerCase().includes('<!doctype html');

    if (isHtml) {
        try {
            return NodeHtmlMarkdown.translate(content);
        } catch (error: any) {
            console.warn('[Reader] HTML conversion failed:', error.message);
            return content;
        }
    }

    return content;
}

interface ReaderOptions {
    returnRaw?: boolean;
    maxRetries?: number;
    timeoutMs?: number;
}

export async function readUrlContent(
    url: string,
    options: ReaderOptions = {}
): Promise<string> {
    const {
        returnRaw = false,
        maxRetries = 2,
        timeoutMs = 10000
    } = options;

    const startTime = Date.now();

    try {
        const fetchContent = async () => {
            const response = await axios.get(url, {
                timeout: timeoutMs,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'DNT': '1',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1',
                    'Cache-Control': 'no-cache'
                },
                maxRedirects: 5,
                responseType: 'arraybuffer', // Get raw buffer to handle encoding properly
                validateStatus: (status) => status < 500
            });

            if (response.status >= 400) {
                throw new Error(`HTTP ${response.status}`);
            }

            const contentType = response.headers['content-type'] as string;
            const content = decodeResponseData(response.data, contentType);

            if (!content || content.trim().length === 0) {
                throw new Error("Empty response");
            }

            return processContent(content, contentType, returnRaw);
        };

        const content = await retryWithBackoff(fetchContent, maxRetries);
        const duration = Date.now() - startTime;
        console.log(`[Reader] Success: ${url} (${content.length} chars, ${duration}ms)`);
        return content;

    } catch (error: any) {
        console.error(`[Reader] Failed: ${url} - ${error.message}`);
        throw error;
    }
}
