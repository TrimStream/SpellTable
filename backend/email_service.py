import resend
import secrets
from auth_config import RESEND_API_KEY

resend.api_key = RESEND_API_KEY

def generate_verification_token() -> str:
    return secrets.token_urlsafe(32)

async def send_verification_email(to_email: str, username: str, token: str, base_url: str) -> bool:
    verify_url = f"{base_url}/verify-email?token={token}"
    try:
        resend.Emails.send({
            "from": "TrainingARK <onboarding@resend.dev>",
            "to": to_email,
            "subject": "Verify your TrainingARK account",
            "html": f"""
                <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0f0f13; color: #e8e0d4;">
                    <h1 style="color: #c9a84c; font-size: 24px; margin-bottom: 8px;">TrainingARK</h1>
                    <p style="color: #9ca3af; margin-bottom: 24px;">cEDH Training Simulator</p>
                    <h2 style="font-size: 18px; margin-bottom: 12px;">Welcome, {username}</h2>
                    <p style="color: #9ca3af; margin-bottom: 24px; line-height: 1.6;">
                        Click the button below to verify your email address and activate your account.
                        This link expires in 24 hours.
                    </p>
                    <a href="{verify_url}"
                       style="display: inline-block; background: #8b6914; color: #f5edda; text-decoration: none;
                              padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 14px;">
                        Verify my email
                    </a>
                    <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">
                        If you did not create a TrainingARK account, ignore this email.
                    </p>
                </div>
            """
        })
        return True
    except Exception:
        return False