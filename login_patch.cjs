const fs = require('fs');
let code = fs.readFileSync('src/pages/LoginPage.tsx', 'utf8');

// We add isForgotPassword state and its UI
code = code.replace(
  '  const [isLoginMode, setIsLoginMode] = useState(true);',
  '  const [isLoginMode, setIsLoginMode] = useState(true);\n  const [isForgotPassword, setIsForgotPassword] = useState(false);\n  const [forgotEmail, setForgotEmail] = useState("");'
);

// We need to add the forgot password form rendering
const forgotForm = `
            {isForgotPassword ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-slate-800">Reset Password</h2>
                  <p className="text-slate-500 text-sm">
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
                  
                  <Button
                    type="submit"
                    fullWidth
                    loading={isLoading}
                    className="bg-[#0F4C81] hover:bg-[#0B3A66] text-white h-11"
                  >
                    Send Reset Link
                  </Button>
                  
                  <div className="text-center mt-4">
                    <button 
                      type="button" 
                      onClick={() => setIsForgotPassword(false)} 
                      className="text-sm font-semibold text-blue-600 hover:underline"
                    >
                      Back to Login
                    </button>
                  </div>
                </form>
              </div>
            ) : isLoginMode ? (
`;

code = code.replace('{isLoginMode ? (', forgotForm);

// Need to add Forgot Password link below password input
const forgotLink = `
                      </div>
                      <div className="flex justify-end mt-1">
                        <button type="button" onClick={() => setIsForgotPassword(true)} className="text-xs text-blue-600 hover:underline">Forgot password?</button>
                      </div>
`;
code = code.replace(
  'onChange={(e) => setLoginPassword(e.currentTarget.value)}\n                      error={loginErrors.password}\n                    />',
  'onChange={(e) => setLoginPassword(e.currentTarget.value)}\n                      error={loginErrors.password}\n                    />' + forgotLink
);


fs.writeFileSync('src/pages/LoginPage.tsx', code);
