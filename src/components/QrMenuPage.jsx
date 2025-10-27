import { useState, useEffect, useMemo } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import "../styles/QrMenuPage.css";
import Nav from "./Nav/Nav";
import ScrollToTop from "../components/ScrollToTop";

/* ----- Օգնական ֆունկցիա slugify-ի համար ----- */
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]+/gu, "")
    .replace(/--+/g, "-");
}


/* ----- MenuSection Subcomponent ----- */
function MenuSection({ section, index, onImageClick }) {
  const sectionId = slugify(section.category);

  return (
    <div
      id={sectionId}
      className="qr-menu-section fade-in"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <h3 className="qr-menu-section-title">
        {section.category}
        {section.iconUrl && (
          <img
            src={section.iconUrl}
            alt="Category Icon"
            className="section-icon-iconUrl"
          />
        )}
      </h3>

      <ul className="qr-menu-items">
        {section.items?.map((item, idx) => (
          <li key={idx} className="qr-menu-item">
            {item.imageUrl && (
              <img
                src={item.imageUrl}
                alt={item.nameEn || item.nameHy || "Menu item image"}
                className="qr-menu-item-image"
                onClick={() => onImageClick(section.items, idx)}
                loading="lazy"
              />
            )}
            <div className="qr-menu-item-text">
              <div className="qr-menu-item-line">
                <span className="item-name-block">
                  {item.nameEn && (
                    <span className="item-name-en">{item.nameEn}</span>
                  )}
                  {item.nameHy && (
                    <span className="item-name-hy">{item.nameHy}</span>
                  )}
                </span>
                <span className="dots"></span>
                <strong className="item-price">{item.price} AMD</strong>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ----- Main Component ----- */
export default function QrMenuPage() {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewData, setPreviewData] = useState({
    items: [],
    currentIndex: 0,
  });

  const categories = useMemo(
    () => [...new Set(menu.map((s) => s.category))],
    [menu]
  );

  const categorySlugs = useMemo(
    () =>
      categories.map((cat) => ({
        name: cat,
        slug: slugify(cat),
      })),
    [categories]
  );

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const q = query(collection(db, "menu"), orderBy("order"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMenu(data);
      } catch (error) {
        console.error("Չհաջողվեց բեռնել մենյուն։", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  const handleImageClick = (items, index) => {
    setPreviewData({ items, currentIndex: index });
  };

  const handleClose = () => setPreviewData({ items: [], currentIndex: 0 });

  const handleNext = (e) => {
    e.stopPropagation();
    setPreviewData((prev) => ({
      ...prev,
      currentIndex:
        prev.currentIndex === prev.items.length - 1
          ? 0
          : prev.currentIndex + 1,
    }));
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setPreviewData((prev) => ({
      ...prev,
      currentIndex:
        prev.currentIndex === 0
          ? prev.items.length - 1
          : prev.currentIndex - 1,
    }));
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (!previewData.items.length) return;
  
      switch (e.key) {
        case "Escape":
          handleClose();
          break;
        case "ArrowRight":
          handleNext(e);
          break;
        case "ArrowLeft":
          handlePrev(e);
          break;
        default:
          break;
      }
    };
  
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [previewData.items]);
  
  

  const currentItem = previewData.items[previewData.currentIndex];

  return (
    <div className="qr-menu-page">
      <div className="qr-menu-hero"></div>

      <Nav categories={categorySlugs} />

      {loading ? (
        <div className="loader" aria-label="Մենյուն բեռնվում է...">
          <div className="spinner"></div>
          <span>Մենյուն բեռնվում է...</span>
        </div>
      ) : menu.length === 0 ? (
        <p className="empty-state">
          Մենյուն դեռ դատարկ է։ Խնդրում ենք փորձել ավելի ուշ կամ կապվել մեզ հետ։
        </p>
      ) : (
        menu.map((section, index) => (
          <div key={section.id}>
            <MenuSection
              section={section}
              index={index}
              onImageClick={handleImageClick}
            />
          </div>
        ))
      )}

      {/* ----- Image Modal with Buttons on Image ----- */}
      {currentItem && (
        <div className="image-modal" onClick={handleClose}>
          <button className="image-modal-close" onClick={handleClose}>
            ×
          </button>

          <div className="modal-inner" onClick={(e) => e.stopPropagation()}>
            <button className="nav-btn prev" onClick={handlePrev}>
              ‹
            </button>

            <img
              src={currentItem.imageUrl}
              alt={currentItem.nameEn || currentItem.nameHy || "Preview"}
              className="image-modal-content"
            />

            <button className="nav-btn next" onClick={handleNext}>
              ›
            </button>

            <div className="image-info">
              <p className="modal-item-name">
                {currentItem.nameHy || currentItem.nameEn}
              </p>
              <p className="modal-item-price">{currentItem.price} AMD</p>
            </div>
          </div>
        </div>
      )}

      <ScrollToTop />
    </div>
  );
}
