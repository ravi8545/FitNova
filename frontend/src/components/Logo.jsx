export default function Logo({ className = "brand-logo" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="5" cy="7" r="3" fill="#35D440" />
      <circle cx="11" cy="13" r="3" fill="#2BAF34" />
      <circle cx="17" cy="19" r="2.4" fill="#218928" />
    </svg>
  );
}
