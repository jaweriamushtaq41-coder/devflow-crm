import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { verifyEmail } from '../features/auth/authSlice';

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const dispatch = useDispatch();
  const [status, setStatus] = useState('verifying'); // verifying | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const email = params.get('email');
    const token = params.get('token');
    if (!email || !token) {
      setStatus('error');
      setMessage('This verification link is missing required information.');
      return;
    }

    dispatch(verifyEmail({ email, token })).then((result) => {
      if (verifyEmail.fulfilled.match(result)) {
        setStatus('success');
        setMessage('Your email has been verified. You can now log in.');
      } else {
        setStatus('error');
        setMessage(result.payload || 'Verification failed. The link may have expired.');
      }
    });
  }, [dispatch, params]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="card p-8 max-w-md w-full text-center">
        <span className="material-symbols-outlined text-4xl mb-3 block text-brand-600">
          {status === 'success' ? 'mark_email_read' : status === 'error' ? 'error' : 'hourglass_top'}
        </span>
        <h1 className="text-xl font-semibold mb-2">
          {status === 'verifying' ? 'Verifying your email…' : status === 'success' ? 'Email verified!' : 'Verification failed'}
        </h1>
        <p className="text-slate-500 text-sm mb-6">{message}</p>
        <Link to="/login" className="btn-primary">Go to login</Link>
      </div>
    </div>
  );
}
