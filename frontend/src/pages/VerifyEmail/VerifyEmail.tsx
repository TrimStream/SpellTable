import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { TarkLogo } from '../../components/TarkLogo/TarkLogo';

export function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const apiUrl = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const token = searchParams.get('token');
        if (!token) {
            setStatus('error');
            return;
        }
        fetch(`${apiUrl}/auth/verify-email?token=${token}`)
            .then(res => {
                if (res.ok) setStatus('success');
                else setStatus('error');
            })
            .catch(() => setStatus('error'));
    }, []);

    return (
        <div style={{
            minHeight: '60vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.5rem',
            padding: '2rem',
            textAlign: 'center'
        }}>
            <TarkLogo size="hero" />

            {status === 'loading' && (
                <p style={{ color: 'var(--text-muted)' }}>Verifying your email...</p>
            )}

            {status === 'success' && (
                <>
                    <h1 style={{ color: 'var(--text)', fontSize: '1.5rem', margin: 0 }}>
                        Email verified!
                    </h1>
                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                        Your account is now fully activated.
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        style={{
                            background: 'var(--gold-dark)',
                            color: '#f5edda',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '10px 24px',
                            fontSize: '0.95rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        Go to home
                    </button>
                </>
            )}

            {status === 'error' && (
                <>
                    <h1 style={{ color: 'var(--diff-expert)', fontSize: '1.5rem', margin: 0 }}>
                        Invalid or expired link
                    </h1>
                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                        This verification link is invalid or has already been used.
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        style={{
                            background: 'var(--gold-dark)',
                            color: '#f5edda',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '10px 24px',
                            fontSize: '0.95rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        Back to home
                    </button>
                </>
            )}
        </div>
    );
}