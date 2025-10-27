import "./MenuSkeleton.css";
export default function MenuSkeleton() {
  return (
    <div className="menu-skeleton">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="skeleton-section fade-in"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className="skeleton-title shimmer"></div>

          <ul className="skeleton-items">
            {[...Array(4)].map((_, j) => (
              <li key={j} className="skeleton-item">
                <div className="skeleton-img shimmer"></div>
                <div className="skeleton-text">
                  <div className="skeleton-line shimmer"></div>
                  <div className="skeleton-line short shimmer"></div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}