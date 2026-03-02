import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { brokerPortalService } from "@/services/brokerPortalService";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff } from "lucide-react";
import "@/styles/login-animations.css";

export function BrokerLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await brokerPortalService.login(email, password);
            toast({
                title: "Success",
                description: "Logged in successfully to Broker Portal.",
            });
            navigate("/broker-portal");
        } catch (error: any) {
            toast({
                title: "Login Failed",
                description: error.message || "Invalid credentials.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center overflow-hidden relative px-4 bg-gray-50">
            {/* Animated Gradient Blobs Background */}
            <div className="blob blob-1"></div>
            <div className="blob blob-2"></div>
            <div className="blob blob-3"></div>

            {/* Glassmorphic Login Container */}
            <div className="w-full max-w-md relative z-10">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Broker Portal</h1>
                    <p className="text-gray-600">Sign in to manage your leads and commissions</p>
                </div>

                {/* Glassmorphic Login Form */}
                <div className="glass-card rounded-2xl p-8 backdrop-blur-xl bg-white/70 border border-gray-200 shadow-2xl">
                    <form onSubmit={handleLogin} className="space-y-6">
                        {/* Email Field */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-gray-900 font-medium">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="broker@agency.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                                className="w-full bg-white/50 border-gray-300 text-gray-900 placeholder:text-gray-400 backdrop-blur-sm focus:bg-white/70 focus:border-gray-400"
                                autoComplete="email"
                            />
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-gray-900 font-medium">Password</Label>
                                <Link to="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                    className="w-full bg-white/50 border-gray-300 text-gray-900 placeholder:text-gray-400 backdrop-blur-sm focus:bg-white/70 focus:border-gray-400 pr-10"
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-full bg-gray-900 text-white hover:bg-gray-800 border border-gray-900 backdrop-blur-sm font-semibold py-6 transition-all duration-300"
                            disabled={loading || !email || !password}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                "Sign In to Portal"
                            )}
                        </Button>
                    </form>

                    {/* Footer Links */}
                    <div className="mt-8 text-center text-sm text-gray-600 border-t border-gray-200 pt-6">
                        Apply as a new broker?{" "}
                        <Link to="/broker-portal/register" className="text-gray-900 font-semibold hover:underline">
                            Register here
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
