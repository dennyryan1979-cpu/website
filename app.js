(() => {
  "use strict";

  const STORAGE_KEY = "storyboards";

  /* ---------------- State / persistence ---------------- */

  /** @type {Array<{id:string,title:string,createdAt:number,updatedAt:number,panels:Array<{id:string,title:string,caption:string,imageDataUrl:string|null}>}>} */
  let storyboards = loadStoryboards();

  function loadStoryboards() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("Failed to load storyboards", e);
      return [];
    }
  }

  function saveStoryboards() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storyboards));
      return true;
    } catch (e) {
      console.error("Failed to save storyboards", e);
      // Storage is full (or blocked) — the in-memory change above never made it
      // to disk, so drop it and re-render from the last state that did.
      storyboards = loadStoryboards();
      render();
      alert(
        "This change couldn't be saved because your browser's local storage is full.\n\n" +
        "Try removing a panel's image, deleting an old storyboard, or using smaller images."
      );
      return false;
    }
  }

  function uid() {
    return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  }

  function findStoryboard(id) {
    return storyboards.find((s) => s.id === id) || null;
  }

  function touch(storyboard) {
    storyboard.updatedAt = Date.now();
  }

  /* ---------------- Router ---------------- */

  function currentRoute() {
    const hash = location.hash.replace(/^#\/?/, "");
    if (hash.startsWith("storyboard/")) {
      return { view: "editor", id: hash.slice("storyboard/".length) };
    }
    return { view: "list" };
  }

  function navigate(hash) {
    location.hash = hash;
  }

  window.addEventListener("hashchange", render);

  /* ---------------- DOM refs ---------------- */

  const viewList = document.getElementById("view-list");
  const viewEditor = document.getElementById("view-editor");
  const storyboardGrid = document.getElementById("storyboard-grid");
  const emptyState = document.getElementById("empty-state");
  const panelGrid = document.getElementById("panel-grid");
  const storyboardTitleEl = document.getElementById("storyboard-title");
  const fileInput = document.getElementById("file-input");
  const importFileInput = document.getElementById("import-file-input");
  const toastEl = document.getElementById("toast");

  document.getElementById("new-storyboard-btn").addEventListener("click", createStoryboard);
  document.getElementById("empty-new-btn").addEventListener("click", createStoryboard);
  document.getElementById("back-btn").addEventListener("click", () => navigate("#/"));
  document.getElementById("add-panel-btn").addEventListener("click", addPanel);
  document.getElementById("export-btn").addEventListener("click", exportToPdf);
  document.getElementById("download-btn").addEventListener("click", downloadStoryboard);
  document.getElementById("import-btn").addEventListener("click", () => importFileInput.click());
  importFileInput.addEventListener("change", () => {
    const file = importFileInput.files && importFileInput.files[0];
    importFileInput.value = "";
    if (file) importStoryboardFile(file);
  });

  let editingStoryboardId = null;
  let pendingUploadPanelId = null;
  let toastTimer = null;

  /* ---------------- Rendering ---------------- */

  function render() {
    const route = currentRoute();
    if (route.view === "editor" && findStoryboard(route.id)) {
      editingStoryboardId = route.id;
      viewList.hidden = true;
      viewEditor.hidden = false;
      renderEditor();
    } else {
      editingStoryboardId = null;
      viewEditor.hidden = true;
      viewList.hidden = false;
      renderList();
    }
  }

  function renderList() {
    storyboardGrid.innerHTML = "";
    const sorted = [...storyboards].sort((a, b) => b.updatedAt - a.updatedAt);
    emptyState.hidden = sorted.length > 0;
    storyboardGrid.hidden = sorted.length === 0;

    for (const sb of sorted) {
      const card = document.createElement("div");
      card.className = "storyboard-card";
      card.tabIndex = 0;
      card.setAttribute("role", "button");

      const body = document.createElement("div");
      body.className = "storyboard-card-body";

      const title = document.createElement("p");
      title.className = "storyboard-card-title";
      title.textContent = sb.title || "Untitled storyboard";

      const meta = document.createElement("div");
      meta.className = "storyboard-card-meta";
      meta.textContent = "Last edited " + formatDate(sb.updatedAt);

      body.append(title, meta);

      const footer = document.createElement("div");
      footer.className = "storyboard-card-footer";

      const count = document.createElement("span");
      count.className = "panel-count-badge";
      count.textContent = sb.panels.length + (sb.panels.length === 1 ? " panel" : " panels");

      const del = document.createElement("button");
      del.className = "btn-danger-text";
      del.textContent = "Delete";
      del.addEventListener("click", (e) => {
        e.stopPropagation();
        deleteStoryboard(sb.id);
      });

      footer.append(count, del);
      card.append(body, footer);

      card.addEventListener("click", () => navigate("#/storyboard/" + sb.id));
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          navigate("#/storyboard/" + sb.id);
        }
      });

      storyboardGrid.appendChild(card);
    }
  }

  function formatDate(ts) {
    if (!ts) return "";
    const d = new Date(ts);
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) +
      " " + d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  }

  function renderEditor() {
    const sb = findStoryboard(editingStoryboardId);
    if (!sb) return;

    if (storyboardTitleEl.textContent !== sb.title) {
      storyboardTitleEl.textContent = sb.title;
    }

    panelGrid.innerHTML = "";
    sb.panels.forEach((panel, index) => {
      panelGrid.appendChild(buildPanelCard(sb, panel, index));
    });
  }

  function buildPanelCard(sb, panel, index) {
    const card = document.createElement("div");
    card.className = "panel-card";
    card.draggable = true;
    card.dataset.panelId = panel.id;

    // Header
    const header = document.createElement("div");
    header.className = "panel-header";

    const handle = document.createElement("span");
    handle.className = "drag-handle";
    handle.title = "Drag to reorder";
    handle.innerHTML = dragHandleSvg();

    const number = document.createElement("div");
    number.className = "panel-number";
    number.textContent = String(index + 1);

    const title = document.createElement("div");
    title.className = "panel-title";
    title.contentEditable = "true";
    title.spellcheck = false;
    title.textContent = panel.title;
    title.addEventListener("blur", () => {
      const val = title.textContent.trim() || "Untitled panel";
      updatePanel(sb.id, panel.id, { title: val });
      title.textContent = val;
    });
    title.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); title.blur(); }
    });

    const remove = document.createElement("button");
    remove.className = "panel-remove";
    remove.textContent = "×";
    remove.title = "Remove panel";
    remove.addEventListener("click", () => removePanel(sb.id, panel.id));

    header.append(handle, number, title, remove);

    // Image area
    const imageArea = document.createElement("div");
    imageArea.className = "panel-image-area";

    if (panel.imageDataUrl) {
      const img = document.createElement("img");
      img.src = panel.imageDataUrl;
      img.alt = panel.title;
      imageArea.appendChild(img);
    } else {
      const placeholder = document.createElement("div");
      placeholder.className = "panel-image-placeholder";
      placeholder.textContent = "Click or drop an image";
      imageArea.appendChild(placeholder);
    }

    imageArea.addEventListener("click", () => {
      pendingUploadPanelId = panel.id;
      fileInput.click();
    });
    imageArea.addEventListener("dragover", (e) => {
      if (hasFiles(e)) { e.preventDefault(); imageArea.classList.add("drag-active"); }
    });
    imageArea.addEventListener("dragleave", () => imageArea.classList.remove("drag-active"));
    imageArea.addEventListener("drop", (e) => {
      e.preventDefault();
      imageArea.classList.remove("drag-active");
      const file = e.dataTransfer.files && e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        readImageFile(file, (dataUrl) => updatePanel(sb.id, panel.id, { imageDataUrl: dataUrl }));
      }
    });

    // Caption (script)
    const captionWrap = document.createElement("div");
    captionWrap.className = "panel-caption";

    const caption = document.createElement("p");
    caption.className = "panel-caption-text";
    caption.contentEditable = "true";
    caption.spellcheck = false;
    caption.dataset.placeholder = "Add script here.";
    caption.textContent = panel.caption;
    caption.addEventListener("blur", () => {
      updatePanel(sb.id, panel.id, { caption: caption.textContent.trim() });
    });

    captionWrap.appendChild(caption);

    // Action
    const actionWrap = document.createElement("div");
    actionWrap.className = "panel-action";

    const action = document.createElement("p");
    action.className = "panel-action-text";
    action.contentEditable = "true";
    action.spellcheck = false;
    action.dataset.placeholder = "Add action here.";
    action.textContent = panel.action || "";
    action.addEventListener("blur", () => {
      updatePanel(sb.id, panel.id, { action: action.textContent.trim() });
    });

    actionWrap.appendChild(action);

    card.append(header, imageArea, captionWrap, actionWrap);

    // Drag reorder handlers
    card.addEventListener("dragstart", (e) => {
      card.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", panel.id);
    });
    card.addEventListener("dragend", () => card.classList.remove("dragging"));
    card.addEventListener("dragover", (e) => {
      e.preventDefault();
      card.classList.add("drag-over");
    });
    card.addEventListener("dragleave", () => card.classList.remove("drag-over"));
    card.addEventListener("drop", (e) => {
      e.preventDefault();
      card.classList.remove("drag-over");
      const draggedId = e.dataTransfer.getData("text/plain");
      if (draggedId && draggedId !== panel.id) {
        reorderPanels(sb.id, draggedId, panel.id);
      }
    });

    return card;
  }

  function hasFiles(e) {
    return e.dataTransfer && Array.from(e.dataTransfer.types || []).includes("Files");
  }

  function dragHandleSvg() {
    return '<svg width="12" height="16" viewBox="0 0 12 16" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<circle cx="3" cy="2" r="1.3" fill="currentColor"/><circle cx="9" cy="2" r="1.3" fill="currentColor"/>' +
      '<circle cx="3" cy="8" r="1.3" fill="currentColor"/><circle cx="9" cy="8" r="1.3" fill="currentColor"/>' +
      '<circle cx="3" cy="14" r="1.3" fill="currentColor"/><circle cx="9" cy="14" r="1.3" fill="currentColor"/>' +
      '</svg>';
  }

  const MAX_IMAGE_DIMENSION = 1600;
  const IMAGE_QUALITY = 0.85;

  // Downscale/re-encode as JPEG so uploaded camera photos don't blow past
  // localStorage's per-origin quota after a handful of panels.
  function readImageFile(file, cb) {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
          const scale = MAX_IMAGE_DIMENSION / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        cb(canvas.toDataURL("image/jpeg", IMAGE_QUALITY));
      };
      img.onerror = () => cb(reader.result);
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  fileInput.addEventListener("change", () => {
    const file = fileInput.files && fileInput.files[0];
    const panelId = pendingUploadPanelId;
    fileInput.value = "";
    pendingUploadPanelId = null;
    if (!file || !panelId || !editingStoryboardId) return;
    readImageFile(file, (dataUrl) => updatePanel(editingStoryboardId, panelId, { imageDataUrl: dataUrl }));
  });

  /* ---------------- Storyboard title editing ---------------- */

  storyboardTitleEl.addEventListener("blur", () => {
    const sb = findStoryboard(editingStoryboardId);
    if (!sb) return;
    const val = storyboardTitleEl.textContent.trim() || "Untitled storyboard";
    sb.title = val;
    storyboardTitleEl.textContent = val;
    touch(sb);
    saveStoryboards();
  });
  storyboardTitleEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); storyboardTitleEl.blur(); }
  });

  /* ---------------- CRUD operations ---------------- */

  function createStoryboard() {
    const sb = {
      id: uid(),
      title: "Untitled storyboard",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      panels: [],
    };
    storyboards.push(sb);
    saveStoryboards();
    navigate("#/storyboard/" + sb.id);
  }

  function deleteStoryboard(id) {
    const sb = findStoryboard(id);
    if (!sb) return;
    const ok = confirm('Delete "' + (sb.title || "Untitled storyboard") + '"? This cannot be undone.');
    if (!ok) return;
    storyboards = storyboards.filter((s) => s.id !== id);
    saveStoryboards();
    render();
  }

  function addPanel() {
    const sb = findStoryboard(editingStoryboardId);
    if (!sb) return;
    const panel = {
      id: uid(),
      title: "New Panel",
      caption: "",
      action: "",
      imageDataUrl: null,
    };
    sb.panels.push(panel);
    touch(sb);
    saveStoryboards();
    renderEditor();

    const card = panelGrid.querySelector('[data-panel-id="' + panel.id + '"] .panel-title');
    if (card) {
      const range = document.createRange();
      range.selectNodeContents(card);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      card.focus();
    }
  }

  function removePanel(storyboardId, panelId) {
    const sb = findStoryboard(storyboardId);
    if (!sb) return;
    const idx = sb.panels.findIndex((p) => p.id === panelId);
    if (idx === -1) return;
    const [removed] = sb.panels.splice(idx, 1);
    touch(sb);
    saveStoryboards();
    renderEditor();
    showUndoToast(removed, idx, sb.id);
  }

  function showUndoToast(removedPanel, index, storyboardId) {
    clearTimeout(toastTimer);
    toastEl.hidden = false;
    toastEl.innerHTML = "";
    const msg = document.createElement("span");
    msg.textContent = 'Removed "' + removedPanel.title + '"';
    const undoBtn = document.createElement("button");
    undoBtn.textContent = "Undo";
    undoBtn.addEventListener("click", () => {
      const sb = findStoryboard(storyboardId);
      if (sb) {
        sb.panels.splice(Math.min(index, sb.panels.length), 0, removedPanel);
        touch(sb);
        saveStoryboards();
        if (editingStoryboardId === storyboardId) renderEditor();
      }
      hideToast();
    });
    toastEl.append(msg, undoBtn);
    toastTimer = setTimeout(hideToast, 5000);
  }

  function hideToast() {
    clearTimeout(toastTimer);
    toastEl.hidden = true;
    toastEl.innerHTML = "";
  }

  function updatePanel(storyboardId, panelId, changes) {
    const sb = findStoryboard(storyboardId);
    if (!sb) return;
    const panel = sb.panels.find((p) => p.id === panelId);
    if (!panel) return;
    Object.assign(panel, changes);
    touch(sb);
    saveStoryboards();
    if ("imageDataUrl" in changes) renderEditor();
  }

  function reorderPanels(storyboardId, draggedId, targetId) {
    const sb = findStoryboard(storyboardId);
    if (!sb) return;
    const fromIdx = sb.panels.findIndex((p) => p.id === draggedId);
    const toIdx = sb.panels.findIndex((p) => p.id === targetId);
    if (fromIdx === -1 || toIdx === -1) return;
    const [moved] = sb.panels.splice(fromIdx, 1);
    sb.panels.splice(toIdx, 0, moved);
    touch(sb);
    saveStoryboards();
    renderEditor();
  }

  /* ---------------- Export / Import (share as file) ---------------- */

  function slugify(s) {
    return (
      s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") ||
      "storyboard"
    );
  }

  function downloadStoryboard() {
    const sb = findStoryboard(editingStoryboardId);
    if (!sb) return;

    const blob = new Blob([JSON.stringify(sb, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = slugify(sb.title || "storyboard") + ".storyboard.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function importStoryboardFile(file) {
    const reader = new FileReader();
    reader.onload = () => {
      let parsed;
      try {
        parsed = JSON.parse(reader.result);
      } catch (e) {
        alert("That file isn't a valid storyboard export — it couldn't be read as JSON.");
        return;
      }
      if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.panels)) {
        alert("That file doesn't look like a storyboard export.");
        return;
      }

      const sb = {
        id: uid(),
        title: (typeof parsed.title === "string" && parsed.title.trim()) || "Imported storyboard",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        panels: parsed.panels.map((p) => ({
          id: uid(),
          title: (p && typeof p.title === "string" && p.title.trim()) || "Untitled panel",
          caption: (p && typeof p.caption === "string") ? p.caption : "",
          action: (p && typeof p.action === "string") ? p.action : "",
          imageDataUrl: (p && typeof p.imageDataUrl === "string") ? p.imageDataUrl : null,
        })),
      };

      storyboards.push(sb);
      if (saveStoryboards()) navigate("#/storyboard/" + sb.id);
    };
    reader.onerror = () => alert("Couldn't read that file.");
    reader.readAsText(file);
  }

  /* ---------------- Export to PDF ---------------- */

  function exportToPdf() {
    const sb = findStoryboard(editingStoryboardId);
    if (!sb) return;

    const printRoot = document.getElementById("print-root");
    printRoot.innerHTML = "";

    const perPage = 6;
    const panels = sb.panels;
    const pageCount = Math.max(1, Math.ceil(panels.length / perPage));

    for (let p = 0; p < pageCount; p++) {
      const items = panels.slice(p * perPage, p * perPage + perPage);
      printRoot.appendChild(buildPrintPage(sb, items, p + 1, pageCount));
    }

    window.print();
  }

  function buildPrintPage(sb, items, pageNum, pageCount) {
    const page = document.createElement("section");
    page.className = "print-page";

    const header = document.createElement("div");
    header.className = "print-page-header";
    const h1 = document.createElement("h1");
    h1.textContent = sb.title || "Untitled storyboard";
    const pageLabel = document.createElement("div");
    pageLabel.className = "print-page-number";
    pageLabel.textContent = "Page " + pageNum + " of " + pageCount;
    header.append(h1, pageLabel);

    const grid = document.createElement("div");
    grid.className = "print-panel-grid";

    let num = (pageNum - 1) * 6;
    for (const panel of items) {
      num++;
      grid.appendChild(buildPrintPanel(panel, num));
    }

    page.append(header, grid);
    return page;
  }

  function buildPrintPanel(panel, num) {
    const el = document.createElement("div");
    el.className = "print-panel";

    const header = document.createElement("div");
    header.className = "print-panel-header";
    const badge = document.createElement("div");
    badge.className = "print-panel-number";
    badge.textContent = String(num);
    const title = document.createElement("div");
    title.className = "print-panel-title";
    title.textContent = panel.title;
    header.append(badge, title);

    const imageWrap = document.createElement("div");
    imageWrap.className = "print-panel-image";
    if (panel.imageDataUrl) {
      const img = document.createElement("img");
      img.src = panel.imageDataUrl;
      imageWrap.appendChild(img);
    }

    const captionWrap = document.createElement("div");
    captionWrap.className = "print-panel-caption";
    const caption = document.createElement("p");
    caption.textContent = panel.caption;
    captionWrap.appendChild(caption);

    const actionWrap = document.createElement("div");
    actionWrap.className = "print-panel-action";
    const action = document.createElement("p");
    action.textContent = panel.action || "";
    actionWrap.appendChild(action);

    el.append(header, imageWrap, captionWrap, actionWrap);
    return el;
  }

  /* ---------------- Init ---------------- */

  render();
})();
