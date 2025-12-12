import { Button, type ButtonProps } from './Button';

// components/buttons/index.tsx
export { Button } from './Button';

// Submit Button
export const SubmitButton: React.FC<Omit<ButtonProps, 'type'> & { 
  loadingText?: string; 
}> = ({ 
  children = 'Submit', 
  loadingText, 
  loading, 
  ...props 
}) => (
  <Button
    type="submit"
    loading={loading}
    {...props}
  >
    {loading ? (loadingText || children) : children}
  </Button>
);

// Login Button
export const LoginButton: React.FC<Omit<ButtonProps, 'variant' | 'size' | 'fullWidth'>> = (props) => (
  <Button
    type="submit"
    variant="primary"
    size="lg"
    fullWidth
    {...props}
  >
    {props.loading ? 'Signing in...' : 'Sign In'}
  </Button>
);

// Register Button
export const RegisterButton: React.FC<Omit<ButtonProps, 'variant' | 'size' | 'fullWidth'>> = (props) => (
  <Button
    type="submit"
    variant="primary"
    size="lg"
    fullWidth
    {...props}
  >
    {props.loading ? 'Creating account...' : 'Create Account'}
  </Button>
);

// Social Login Button
export const SocialButton: React.FC<ButtonProps & { 
  provider: 'google' | 'github' | 'facebook';
  icon: React.ReactNode;
}> = ({ provider, icon, children, ...props }) => {
  const providerStyles = {
    google: "border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500",
    github: "border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500",
    facebook: "border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
  };

  return (
    <Button
      variant="outline"
      fullWidth
      className={`flex items-center justify-center space-x-3 ${providerStyles[provider]}`}
      {...props}
    >
      {icon}
      <span>{children}</span>
    </Button>
  );
};

// Icon Button
export const IconButton: React.FC<Omit<ButtonProps, 'size'> & {
  icon: React.ReactNode;
  iconPosition?: 'left' | 'right';
}> = ({ icon, iconPosition = 'left', children, ...props }) => (
  <Button
    className="flex items-center space-x-2"
    {...props}
  >
    {iconPosition === 'left' && icon}
    <span>{children}</span>
    {iconPosition === 'right' && icon}
  </Button>
);