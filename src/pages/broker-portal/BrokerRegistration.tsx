import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { brokerPortalService } from "@/services/brokerPortalService";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff, ArrowLeft } from "lucide-react";
import "@/styles/login-animations.css";

export function BrokerRegistration() {
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        agency_name: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                ...formData,
                name: `${formData.first_name} ${formData.last_name}`.trim(),
                phone: formData.phone,
                password: formData.password,
                tenant_id: 1 // Default tenant ID if required by the backend
            };
            await brokerPortalService.registerBroker(payload);
            toast({
                title: "Registration Successful",
                description: "Your broker account is pending builder approval.",
            });
            navigate("/broker-portal/login");
        } catch (error: any) {
            toast({
                title: "Registration Failed",
                description: error.message || "Failed to register.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
    };

    return (
        <div className="min-h-screen flex items-center justify-center overflow-hidden relative px-4 bg-gray-50 py-12">
            {/* Animated Gradient Blobs Background */}
            <div className="blob blob-1"></div>
            <div className="blob blob-2"></div>
            <div className="blob blob-3"></div>

            {/* Glassmorphic Registration Container */}
            <div className="w-full max-w-2xl relative z-10">
                {/* Header */}
                <div className="text-center mb-8 mt-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Broker Registration</h1>
                    <p className="text-gray-600">Join our exclusive broker network to track your leads and commissions</p>
                </div>

                {/* Glassmorphic Form Container */}
                <div className="glass-card rounded-2xl p-8 backdrop-blur-xl bg-white/70 border border-gray-200 shadow-2xl relative">
                    <div className="absolute top-6 left-6">
                        <Link to="/broker-portal/login" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Link>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-6 mt-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="first_name" className="text-gray-900 font-medium">First Name</Label>
                                <Input
                                    id="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    placeholder="John"
                                    required
                                    disabled={loading}
                                    className="w-full bg-white/50 border-gray-300 text-gray-900 placeholder:text-gray-400 backdrop-blur-sm focus:bg-white/70 focus:border-gray-400"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="last_name" className="text-gray-900 font-medium">Last Name</Label>
                                <Input
                                    id="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    placeholder="Doe"
                                    required
                                    disabled={loading}
                                    className="w-full bg-white/50 border-gray-300 text-gray-900 placeholder:text-gray-400 backdrop-blur-sm focus:bg-white/70 focus:border-gray-400"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-gray-900 font-medium">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="broker@agency.com"
                                    required
                                    disabled={loading}
                                    className="w-full bg-white/50 border-gray-300 text-gray-900 placeholder:text-gray-400 backdrop-blur-sm focus:bg-white/70 focus:border-gray-400"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-gray-900 font-medium">Phone Number</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+1 234 567 890"
                                    required
                                    disabled={loading}
                                    className="w-full bg-white/50 border-gray-300 text-gray-900 placeholder:text-gray-400 backdrop-blur-sm focus:bg-white/70 focus:border-gray-400"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="agency_name" className="text-gray-900 font-medium">Agency Name</Label>
                                <Input
                                    id="agency_name"
                                    value={formData.agency_name}
                                    onChange={handleChange}
                                    placeholder="Elite Real Estate"
                                    required
                                    disabled={loading}
                                    className="w-full bg-white/50 border-gray-300 text-gray-900 placeholder:text-gray-400 backdrop-blur-sm focus:bg-white/70 focus:border-gray-400"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-gray-900 font-medium">Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Create a password"
                                        required
                                        disabled={loading}
                                        className="w-full bg-white/50 border-gray-300 text-gray-900 placeholder:text-gray-400 backdrop-blur-sm focus:bg-white/70 focus:border-gray-400 pr-10"
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
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-gray-900 text-white hover:bg-gray-800 border border-gray-900 backdrop-blur-sm font-semibold py-6 transition-all duration-300 mt-6"
                            disabled={loading || !formData.email || !formData.password || !formData.first_name || !formData.last_name || !formData.phone || !formData.agency_name}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Submitting Application...
                                </>
                            ) : (
                                "Submit Application"
                            )}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
