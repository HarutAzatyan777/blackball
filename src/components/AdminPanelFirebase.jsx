import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import CategoryForm from "./CategoryForm";
import ItemForm from "./ItemForm";
import ConfirmModal from "./ConfirmModal";
import ActionButton from "./ActionButton";
import "../styles/AdminPanelFirebase.css";
import { signOut, onAuthStateChanged } from "firebase/auth";

const menuRef = collection(db, "menu");

export default function AdminPanelFirebase() {
  const [menu, setMenu] = useState([]);
  const [category, setCategory] = useState("");
  const [categoryIconUrl, setCategoryIconUrl] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [editingCategoryIconUrl, setEditingCategoryIconUrl] = useState("");
  const [selectedCatId, setSelectedCatId] = useState("");
  const [itemNameHy, setItemNameHy] = useState("");
  const [itemNameEn, setItemNameEn] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({
    visible: false,
    type: null,
    payload: null,
  });

  const cancelCategoryEdit = () => {
    setEditingCategory(null);
    setEditingCategoryName("");
    setEditingCategoryIconUrl("");
  };

  const cancelItemEdit = () => {
    setEditingItem(null);
    setItemNameHy("");
    setItemNameEn("");
    setItemPrice("");
    setImageUrl("");
    setSelectedCatId("");
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        window.location.href = "/login";
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const loadMenu = async () => {
    const snapshot = await getDocs(menuRef);
    const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    data.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
    setMenu(data);
  };

  useEffect(() => {
    loadMenu();
  }, []);

  const normalizeCategoryOrder = async () => {
    const sortedMenu = [...menu].sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
    await Promise.all(
      sortedMenu.map((cat, index) =>
        updateDoc(doc(db, "menu", cat.id), { order: index + 1 })
      )
    );
    loadMenu();
  };

  const addCategory = async () => {
    if (!category) return;
    const highestOrder = menu.reduce((max, sec) => Math.max(max, sec.order ?? 0), 0);
    await addDoc(menuRef, {
      category,
      iconUrl: categoryIconUrl,
      items: [],
      order: highestOrder + 1,
    });
    setCategory("");
    setCategoryIconUrl("");
    loadMenu();
  };

  const startEditingCategory = (cat) => {
    setEditingCategory(cat);
    setEditingCategoryName(cat.category);
    setEditingCategoryIconUrl(cat.iconUrl || "");
  };

  const editCategory = async () => {
    if (!editingCategory || !editingCategoryName) return;
    const ref = doc(db, "menu", editingCategory.id);
    await updateDoc(ref, {
      category: editingCategoryName,
      iconUrl: editingCategoryIconUrl,
    });
    cancelCategoryEdit();
    loadMenu();
  };

  const askDeleteCategory = (id) => {
    setConfirmDelete({ visible: true, type: "category", payload: id });
  };

  const moveCategoryUp = async (index) => {
    if (index === 0) return;
    const current = menu[index];
    const prev = menu[index - 1];
    const currentRef = doc(db, "menu", current.id);
    const prevRef = doc(db, "menu", prev.id);
    await Promise.all([
      updateDoc(currentRef, { order: prev.order }),
      updateDoc(prevRef, { order: current.order }),
    ]);
    loadMenu();
  };

  const moveCategoryDown = async (index) => {
    if (index === menu.length - 1) return;
    const current = menu[index];
    const next = menu[index + 1];
    const currentRef = doc(db, "menu", current.id);
    const nextRef = doc(db, "menu", next.id);
    await Promise.all([
      updateDoc(currentRef, { order: next.order }),
      updateDoc(nextRef, { order: current.order }),
    ]);
    setTimeout(loadMenu, 400);
  };

  const addItem = async () => {
    if ((!itemNameHy && !itemNameEn) || !itemPrice || !selectedCatId) return;
    const ref = doc(db, "menu", selectedCatId);
    await updateDoc(ref, {
      items: arrayUnion({
        nameHy: itemNameHy,
        nameEn: itemNameEn,
        price: itemPrice,
        imageUrl: imageUrl,
      }),
    });
    cancelItemEdit();
    loadMenu();
  };

  const startEditingItem = (catId, item, idx) => {
    setSelectedCatId(catId);
    setItemNameHy(item.nameHy || "");
    setItemNameEn(item.nameEn || "");
    setItemPrice(item.price || "");
    setImageUrl(item.imageUrl || "");
    setEditingItem({ original: item, index: idx });
  };

  const editItem = async () => {
    if (!editingItem || !selectedCatId) return;
    const ref = doc(db, "menu", selectedCatId);
    const updatedItems = (menu.find((cat) => cat.id === selectedCatId)?.items || []).map(
      (it, i) =>
        i === editingItem.index
          ? {
              nameHy: itemNameHy,
              nameEn: itemNameEn,
              price: itemPrice,
              imageUrl: imageUrl,
            }
          : it
    );
    await updateDoc(ref, { items: updatedItems });
    cancelItemEdit();
    loadMenu();
  };

  const moveItemUp = async (catId, index) => {
    if (index === 0) return;
    const category = menu.find((cat) => cat.id === catId);
    if (!category) return;
    const items = [...(category.items || [])];
    [items[index - 1], items[index]] = [items[index], items[index - 1]];
    const ref = doc(db, "menu", catId);
    await updateDoc(ref, { items });
    loadMenu();
  };

  const moveItemDown = async (catId, index) => {
    const category = menu.find((cat) => cat.id === catId);
    if (!category) return;
    if (index === (category.items?.length ?? 0) - 1) return;
    const items = [...(category.items || [])];
    [items[index], items[index + 1]] = [items[index + 1], items[index]];
    const ref = doc(db, "menu", catId);
    await updateDoc(ref, { items });
    loadMenu();
  };

  const askDeleteItem = (catId, item) => {
    setConfirmDelete({ visible: true, type: "item", payload: { catId, item } });
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete.visible) return;

    if (confirmDelete.type === "category") {
      await deleteDoc(doc(db, "menu", confirmDelete.payload));
    } else if (confirmDelete.type === "item") {
      const { catId, item } = confirmDelete.payload;
      const ref = doc(db, "menu", catId);
      await updateDoc(ref, { items: arrayRemove(item) });
    }

    setConfirmDelete({ visible: false, type: null, payload: null });
    loadMenu();
  };

  const handleCancelDelete = () => {
    setConfirmDelete({ visible: false, type: null, payload: null });
  };

  return (
    <div className="admin-panel">
      <h2>Admin Panel</h2>

      <div className="top-actions">
        <button onClick={handleLogout} className="logout-btn" title="Logout">
          Logout
        </button>
        <button
          onClick={normalizeCategoryOrder}
          className="normalize-btn"
          title="Normalize category order"
        >
          Կարգավորել կարգը
        </button>
      </div>

      <CategoryForm
        category={category}
        categoryIconUrl={categoryIconUrl}
        setCategory={setCategory}
        setCategoryIconUrl={setCategoryIconUrl}
        addCategory={addCategory}
        editingCategory={editingCategory}
        editingCategoryName={editingCategoryName}
        editingCategoryIconUrl={editingCategoryIconUrl}
        setEditingCategoryName={setEditingCategoryName}
        setEditingCategoryIconUrl={setEditingCategoryIconUrl}
        editCategory={editCategory}
        setEditingCategory={setEditingCategory}
        cancelCategoryEdit={cancelCategoryEdit}
      />

      <hr />

      <ItemForm
        menu={menu}
        selectedCatId={selectedCatId}
        setSelectedCatId={setSelectedCatId}
        itemNameHy={itemNameHy}
        setItemNameHy={setItemNameHy}
        itemNameEn={itemNameEn}
        setItemNameEn={setItemNameEn}
        itemPrice={itemPrice}
        setItemPrice={setItemPrice}
        imageUrl={imageUrl}
        setImageUrl={setImageUrl}
        addItem={addItem}
        editingItem={editingItem}
        editItem={editItem}
        cancelItemEdit={cancelItemEdit}
      />

      <hr />

      <div className="category-list">
        {menu.map((sec, index) => (
          <div key={sec.id}>
            <div className="category-header">
              <div className="category-header-left">
                {sec.iconUrl && <img src={sec.iconUrl} alt={`${sec.category} icon`} />}
                <h3>{sec.category}</h3>
              </div>

              <div className="reorder-buttons">
                <ActionButton onAction={() => moveCategoryUp(index)} disabled={index === 0}>
                  ⬆
                </ActionButton>
                <ActionButton
                  onAction={() => moveCategoryDown(index)}
                  disabled={index === menu.length - 1}
                >
                  ⬇
                </ActionButton>
                <ActionButton onAction={() => startEditingCategory(sec)}>✏️</ActionButton>
                <ActionButton onAction={() => askDeleteCategory(sec.id)}>❌</ActionButton>
              </div>
            </div>

            {editingCategory?.id === sec.id && (
              <div className="inline-editor">
                <input
                  type="text"
                  value={editingCategoryName}
                  onChange={(e) => setEditingCategoryName(e.target.value)}
                  placeholder="Category name"
                />
                <input
                  type="text"
                  value={editingCategoryIconUrl}
                  onChange={(e) => setEditingCategoryIconUrl(e.target.value)}
                  placeholder="Icon URL"
                />
                <div>
                  <button onClick={editCategory}>Պահպանել</button>
                  <button onClick={cancelCategoryEdit} className="cancel-btn">
                    Չեղարկել
                  </button>
                </div>
              </div>
            )}

            <ul>
              {(sec.items || []).map((item, idx) => {
                const itemKey = `${sec.id}-${idx}-${(item.nameEn || item.nameHy || "").replace(
                  /\s+/g,
                  "_"
                )}`;
                const isEditingThisItem =
                  editingItem && editingItem.index === idx && selectedCatId === sec.id;

                return (
                  <li key={itemKey}>
                    <div className="item-row">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt="" />
                      ) : (
                        <div className="item-placeholder">no image</div>
                      )}

                      <div className="item-text">
                        <div className="name">
                          {item.nameEn || "—"} / {item.nameHy || "—"}
                        </div>
                        <div className="price">{item.price} ֏</div>
                      </div>

                      <div className="item-actions">
                        <ActionButton onAction={() => moveItemUp(sec.id, idx)} disabled={idx === 0}>
                          ⬆
                        </ActionButton>
                        <ActionButton
                          onAction={() => moveItemDown(sec.id, idx)}
                          disabled={idx === (sec.items?.length ?? 1) - 1}
                        >
                          ⬇
                        </ActionButton>
                        <ActionButton onAction={() => startEditingItem(sec.id, item, idx)}>✏️</ActionButton>
                        <ActionButton onAction={() => askDeleteItem(sec.id, item)}>🗑</ActionButton>
                      </div>
                    </div>

                    {isEditingThisItem && (
                      <div className="inline-editor item-editor">
                        <input
                          type="text"
                          value={itemNameEn}
                          onChange={(e) => setItemNameEn(e.target.value)}
                          placeholder="Name EN"
                        />
                        <input
                          type="text"
                          value={itemNameHy}
                          onChange={(e) => setItemNameHy(e.target.value)}
                          placeholder="Անուն HY"
                        />
                        <input
                          type="number"
                          value={itemPrice}
                          onChange={(e) => setItemPrice(e.target.value)}
                          placeholder="Price"
                        />
                        <input
                          type="text"
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          placeholder="Image URL"
                        />
                        <div>
                          <button onClick={editItem}>Պահպանել</button>
                          <button onClick={cancelItemEdit} className="cancel-btn">
                            Չեղարկել
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {confirmDelete.visible && (
        <ConfirmModal
          message={
            confirmDelete.type === "category"
              ? "Դուք ցանկանում եք ջնջել այս բաժինը?"
              : "Դուք ցանկանում եք ջնջել այս կետը?"
          }
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
}
