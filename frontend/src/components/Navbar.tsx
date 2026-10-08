import "./Navbar.css";

interface NavbarProps {
  homeHref?: string;
  loginHref?: string;
  signUpHref?: string;
}

export default function Navbar({
  homeHref = "/",
  loginHref = "/login",
  signUpHref = "/signup",
}: NavbarProps) {
  return (
    <header className="navbar">
      <a className="navbar__logo" href={homeHref} aria-label="HELPFriends home">
        <span className="navbar__logo-help">HELP</span>Friends
      </a>

      <nav className="navbar__actions">
        <a className="navbar__button" href={loginHref}>
          Login
        </a>
        <a className="navbar__button" href={signUpHref}>
          Sign Up
        </a>
      </nav>
    </header>
  );
}