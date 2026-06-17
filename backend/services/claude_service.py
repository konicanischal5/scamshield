import anthropic
import os
import json
import re

def analyze_scam(message_text: str, similar_count: int = 0) -> dict:
    client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

    system_prompt = """You are ScamShield, India's most advanced scam detection AI. 
You analyze messages, emails, SMS, WhatsApp messages, and call transcripts for scam patterns.

You must respond ONLY with a valid JSON object, no other text. The JSON must have exactly these fields:
{
  "scam_probability": <integer 0-100>,
  "danger_level": <"HIGH" or "MEDIUM" or "LOW" or "SAFE">,
  "scam_type": <string like "KYC Fraud", "Lottery Scam", "Job Fraud", "Bank Fraud", "CBI Scam", "OTP Scam", "Investment Fraud", "Not a Scam">,
  "explanation": <string: 2-3 sentences explaining why this is or isn't a scam>,
  "trick_used": <string: explain the psychological trick they're using, or "None" if safe>,
  "what_to_do": <string: specific action steps for the user>,
  "red_flags": <array of strings: list of specific red flags found>,
  "safe_to_ignore": <boolean>
}

Common Indian scam patterns to detect:
- Fake KYC updates from banks (SBI, HDFC, etc.)
- Lottery/prize winning messages
- CBI/police/court fake notices  
- Job offer frauds with advance payment
- OTP sharing requests
- Investment schemes with guaranteed returns
- Fake electricity/gas bill disconnection
- WhatsApp prize messages
- Phishing links disguised as official sites"""

    user_message = f"""Analyze this message for scam indicators:

---
{message_text}
---

Community data: {similar_count} people have already reported similar messages.

Respond with ONLY the JSON object."""

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1000,
        system=system_prompt,
        messages=[{"role": "user", "content": user_message}]
    )

    raw = message.content[0].text.strip()
    raw = re.sub(r"```json|```", "", raw).strip()
    result = json.loads(raw)
    result["similar_reports"] = similar_count
    return result
