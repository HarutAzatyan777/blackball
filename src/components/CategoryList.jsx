import React from "react";
import ActionButton from "./ActionButton";
import "../styles/CategoryList.css";

export default function CategoryList({
  menu,
  moveCategoryUp,
  moveCategoryDown,
  startEditingCategory,
  askDeleteCategory,
  moveItemUp,
  moveItemDown,
  startEditingItem,
  askDeleteItem,
  editingItem,
  selectedCatId,
  editingItemRef
}) {
  return (
    <div className="category-list">
      {menu.map((sec, index) => (
        <div key={sec.id}>
          <div className="category-header">
            {sec.iconUrl && (
              <img src={sec.iconUrl} alt={`${sec.category} icon`} />
            )}
            <h3>{sec.category}</h3>
            <span className="reorder-buttons">
              <ActionButton onAction={() => moveCategoryUp(index)} disabled={index === 0}>⬆</ActionButton>
              <ActionButton onAction={() => moveCategoryDown(index)} disabled={index === menu.length - 1}>⬇</ActionButton>
              <ActionButton onAction={() => startEditingCategory(sec)}>✏️</ActionButton>
              <ActionButton onAction={() => askDeleteCategory(sec.id)}>❌</ActionButton>
            </span>
          </div>

          <ul>
            {sec.items?.map((item, idx) => (
              <li
                key={idx}
                ref={editingItem?.index === idx && selectedCatId === sec.id ? editingItemRef : null}
              >
                {item.imageUrl && (
                  <img src={item.imageUrl} alt="" />
                )}
                <span className="item-text">{item.nameEn} / {item.nameHy} - {item.price} ֏</span>
                <ActionButton onAction={() => moveItemUp(sec.id, idx)} disabled={idx === 0}>⬆</ActionButton>
                <ActionButton onAction={() => moveItemDown(sec.id, idx)} disabled={idx === sec.items.length - 1}>⬇</ActionButton>
                <ActionButton onAction={() => startEditingItem(sec.id, item, idx)}>✏️</ActionButton>
                <ActionButton onAction={() => askDeleteItem(sec.id, item)}>🗑</ActionButton>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
