import logo from '../assets/images/logo.svg';
import './Logo.css';

export default function Logo({ size = 96 }: { size?: number }) {
  return <img src={logo} alt="소비컷" className="auth-logo" style={{ width: size }} />;
}