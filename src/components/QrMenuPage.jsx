import { useState, useEffect } from "react";
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
        {/* <img src="/icon.png" alt="Default Icon" className="section-icon" /> */}
        {section.category}
        {section.iconUrl && (
          <img
            src={section.iconUrl}
            alt="Category Extra Icon"
            className="section-icon-iconUrl"
            style={{ marginLeft: "4px" }}
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
                onClick={() => onImageClick(item.imageUrl)}
                style={{ cursor: "zoom-in" }}
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
  const [previewImage, setPreviewImage] = useState(null);

  const categories = [...new Set(menu.map((s) => s.category))];
  const categorySlugs = categories.map((cat) => ({
    name: cat,
    slug: slugify(cat),
  }));

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

  return (
    <div className="qr-menu-page">
      <div className="qr-menu-hero"></div>

      <Nav categories={categorySlugs} />

      {loading ? (
        <div className="loader" aria-label="Մենյուն բեռնվում է...">
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
              onImageClick={setPreviewImage}
            />
           {index === 0 && (
   <div className="after-first-category-text">
    <img src="/bg2.png" alt="Coffee Icon" />
    
    <div class="promo-text">
  <p>🎱 <strong>BlackBallPool Billiard Bar</strong> - որտեղ խաղը դառնում է հաճույք 🍸</p>

  <p>Այստեղ քեզ սպասում են․</p>

  <ul>
    <li>Մրցակցային և պրոֆեսիոնալ բիլիարդ սեղաններ</li>
    <li>🃏 Մաֆիա և Փոքեր երեկոներ</li>
    <li>🎮 PS5 գեյմինգ անկյուն</li>
    <li>🥂 Բարձրորակ խմիչքներ և կոկտեյլներ</li>
    <li>🎵 Հարմարավետ մթնոլորտ և լավ երաժշտություն</li>
  </ul>

  <p><strong>Վայելիր քո ժամանակը BlackBallPool-ում </strong></p>
</div>


 </div>
)}
          </div>
        ))
      )}

      {previewImage && (
        <div className="image-modal" onClick={() => setPreviewImage(null)}>
          <img
            src={previewImage}
            alt="Preview"
            className="image-modal-content"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="image-modal-close"
            onClick={() => setPreviewImage(null)}
          >
            ×
          </button>
        </div>
      )}
      <ScrollToTop />
    </div>
  );
}
