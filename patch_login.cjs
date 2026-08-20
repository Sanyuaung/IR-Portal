const fs = require('fs');
let code = fs.readFileSync('src/pages/LoginPage.tsx', 'utf8');

// 1. Update state type
code = code.replace(
  "const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');",
  "const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'forgot'>('signin');\n  const [forgotEmail, setForgotEmail] = useState('');"
);

// 2. Add 'forgot' authMode conditional rendering
const forgotForm = `
              {authMode === 'forgot' ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-[#0F4C81]">Reset Password</h2>
                    <p className="text-[#6e7191] text-sm">
                      Enter your email address and we'll send you a link to reset your password.
                    </p>
                  </div>
                  
                  <form 
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!forgotEmail) {
                        notifications.show({ title: 'Error', message: 'Please enter your email', color: 'red' });
                        return;
                      }
                      setIsLoading(true);
                      try {
                        const res = await fetch('/api/auth/forgot-password', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ email: forgotEmail })
                        });
                        const data = await res.json();
                        if (data.success) {
                          notifications.show({ title: 'Email Sent', message: 'Check your email for the reset link.', color: 'green' });
                          console.log('Demo Reset Link:', data.resetLink);
                          // For demo purposes, we automatically redirect after 2s
                          setTimeout(() => {
                             window.location.href = data.resetLink;
                          }, 2000);
                        } else {
                          notifications.show({ title: 'Error', message: data.error || 'Failed to send link', color: 'red' });
                        }
                      } catch (err) {
                        notifications.show({ title: 'Error', message: 'Network error', color: 'red' });
                      } finally {
                        setIsLoading(false);
                      }
                    }} 
                    className="space-y-4"
                  >
                    <TextInput
                      label="Email Address"
                      placeholder="Enter your email address"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.currentTarget.value)}
                      required
                    />
                    
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-2.5 px-4 bg-[#0F4C81] hover:bg-[#0A365D] font-semibold text-white text-sm rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isLoading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                    
                    <div className="text-center mt-4">
                      <button 
                        type="button" 
                        onClick={() => setAuthMode('signin')} 
                        className="text-sm font-semibold text-[#0F4C81] hover:underline"
                      >
                        Back to Login
                      </button>
                    </div>
                  </form>
                </div>
              ) : authMode === 'signin' ? (
`;

code = code.replace("{authMode === 'signin' ? (", forgotForm);

// 3. Update the "Forgot password?" link handler
code = code.replace(
  /onClick=\{\(e\) => \{\s*e\.preventDefault\(\);\s*notifications\.show\(\{[\s\S]*?\}\);\s*\}\}/g,
  "onClick={(e) => { e.preventDefault(); setAuthMode('forgot'); }}"
);

fs.writeFileSync('src/pages/LoginPage.tsx', code);
