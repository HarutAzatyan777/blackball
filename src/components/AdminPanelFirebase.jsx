import React, { useState, useEffect, useRef } from "react";
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

  // Ավելացրու այս մասը, հենց ստեղ նոր ֆունկցիաներ
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
};


  const editingCategoryRef = useRef(null);
  const itemFormRef = useRef(null);
  

    // ✅ Check if user is logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        window.location.href = "/login"; // redirect if not logged in
      }
    });
    return () => unsubscribe();
  }, []);

  // ✅ Logout function
  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("User signed out");
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };


  const loadMenu = async () => {
    const snapshot = await getDocs(menuRef);
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    data.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
  
    console.log(
      "Loaded menu order:",
      data.map((d) => `${d.category}: ${d.order}`)
    );
  
    setMenu(data);
  };
  
  const normalizeCategoryOrder = async () => {
    const sortedMenu = [...menu].sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
    await Promise.all(
      sortedMenu.map((cat, index) =>
        updateDoc(doc(db, "menu", cat.id), { order: index + 1 })
      )
    );
    loadMenu();
  };

  useEffect(() => {
    loadMenu();
  }, []);

  useEffect(() => {
    if (editingCategory && editingCategoryRef.current) {
      editingCategoryRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [editingCategory]);

  useEffect(() => {
    if (editingItem && itemFormRef.current) {
      itemFormRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [editingItem]);

  // -- Category handlers --
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
    setEditingCategory(null);
    setEditingCategoryName("");
    setEditingCategoryIconUrl("");
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
  
    console.log("Moving down:", current.category, "↓", next.category);
    console.log("Before swap:", {
      currentOrder: current.order,
      nextOrder: next.order,
    });
  
    const currentRef = doc(db, "menu", current.id);
    const nextRef = doc(db, "menu", next.id);
    await Promise.all([
      updateDoc(currentRef, { order: next.order }),
      updateDoc(nextRef, { order: current.order }),
    ]);
  
    // Wait a bit to make sure update completes before reload
    setTimeout(loadMenu, 500);
  };
  

  // -- Item handlers --
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
    setItemNameHy("");
    setItemNameEn("");
    setItemPrice("");
    setImageUrl("");
    loadMenu();
  };

  const startEditingItem = (catId, item, idx) => {
    setSelectedCatId(catId);
    setItemNameHy(item.nameHy || "");
    setItemNameEn(item.nameEn || "");
    setItemPrice(item.price);
    setImageUrl(item.imageUrl || "");
    setEditingItem({ original: item, index: idx });
  };

  const editItem = async () => {
    if (!editingItem || !selectedCatId) return;
    const ref = doc(db, "menu", selectedCatId);
    const updatedItems = menu
      .find((cat) => cat.id === selectedCatId)
      .items.map((item) =>
        item === editingItem.original
          ? {
              nameHy: itemNameHy,
              nameEn: itemNameEn,
              price: itemPrice,
              imageUrl: imageUrl,
            }
          : item
      );
    await updateDoc(ref, { items: updatedItems });
    setEditingItem(null);
    setItemNameHy("");
    setItemNameEn("");
    setItemPrice("");
    setImageUrl("");
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
        <button
          onClick={handleLogout}
          style={{
            padding: "8px 16px",
            background: "#f44336",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      <button 
        onClick={normalizeCategoryOrder} 
        style={{ marginBottom: "20px", padding: "8px 16px", cursor: "pointer" }}
        title="Normalize category order"
      >
        Կարգավորել կարգը
      </button>

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
        editingCategoryRef={editingCategoryRef}
      />

      <hr />

      <div ref={itemFormRef}>
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
      </div>

      <hr />

      {/* List of categories and items */}
      {menu.map((sec, index) => (
        <div key={sec.id}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {sec.iconUrl && (
              <img
                src={sec.iconUrl}
                alt={`${sec.category} icon`}
                style={{ width: 24, height: 24, objectFit: "contain" }}
              />
            )}
            <h3 style={{ margin: 0 }}>{sec.category}</h3>
            <span className="reorder-buttons">
              <ActionButton
                onAction={() => moveCategoryUp(index)}
                disabled={index === 0}
              >
                ⬆
              </ActionButton>
              <ActionButton
                onAction={() => moveCategoryDown(index)}
                disabled={index === menu.length - 1}
              >
                ⬇
              </ActionButton>
              <ActionButton onAction={() => startEditingCategory(sec)}>
                ✏️
              </ActionButton>
              <ActionButton onAction={() => askDeleteCategory(sec.id)}>
                ❌
              </ActionButton>
            </span>
          </div>

          <ul style={{ listStyle: "none", padding: 0 }}>
            {sec.items?.map((item, idx) => (
              <li
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "10px",
                }}
              >
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt=""
                    style={{
                      width: 50,
                      height: 50,
                      objectFit: "cover",
                      borderRadius: 6,
                    }}
                  />
                )}
                <span style={{ flexGrow: 1 }}>
                  {item.nameEn} / {item.nameHy} - {item.price} ֏
                </span>
                <ActionButton
                  onAction={() => moveItemUp(sec.id, idx)}
                  disabled={idx === 0}
                >
                  ⬆
                </ActionButton>
                <ActionButton
                  onAction={() => moveItemDown(sec.id, idx)}
                  disabled={idx === sec.items.length - 1}
                >
                  ⬇
                </ActionButton>
                <ActionButton onAction={() => startEditingItem(sec.id, item, idx)}>
                  ✏️
                </ActionButton>
                <ActionButton onAction={() => askDeleteItem(sec.id, item)}>
                  🗑
                </ActionButton>
              </li>
            ))}
          </ul>
        </div>
      ))}

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
