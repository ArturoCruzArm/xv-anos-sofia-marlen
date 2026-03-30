// ========================================
// SELECTOR DE FOTOS - XV ANOS SOFIA MARLEN
// ========================================
// CONFIGURACION: Cambia este numero segun las fotos que tengas
const TOTAL_PHOTOS = 175; // <-- CAMBIA ESTE NUMERO AL TOTAL DE FOTOS

const STORAGE_KEY = 'sofia_marlen_xv_photo_selections';
const FEEDBACK_KEY = 'sofia_marlen_xv_feedback';

// Genera las rutas de las fotos automaticamente
let photos = [];
for (let i = 1; i <= TOTAL_PHOTOS; i++) {
    photos.push(`photos/foto_${String(i).padStart(3, '0')}.webp`);
}

// Limites recomendados
const LIMITS = {
    impresion: 100
};

let photoSelections = {};
let currentPhotoIndex = null;
let currentFilter = 'impresion';

// ========================================
// LOCAL STORAGE FUNCTIONS
// ========================================
function loadSelections() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            photoSelections = JSON.parse(saved);
            console.log('Selecciones cargadas:', photoSelections);
        }
    } catch (error) {
        console.error('Error cargando selecciones:', error);
        photoSelections = {};
    }
}

function saveSelections() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(photoSelections));
        console.log('Selecciones guardadas');
    } catch (error) {
        console.error('Error guardando selecciones:', error);
        showToast('Error al guardar. Verifica el espacio del navegador.', 'error');
    }
}

function clearAllSelections() {
    if (confirm('Estas segura de que quieres borrar TODAS las selecciones? Esta accion no se puede deshacer.')) {
        photoSelections = {};
        saveSelections();
        renderGallery();
        updateStats();
        updateFilterButtons();
        showToast('Todas las selecciones han sido eliminadas', 'success');
    }
}

// ========================================
// STATS FUNCTIONS
// ========================================
function getStats() {
    const stats = {
        impresion: 0,
        redes_sociales: 0,
        invitaciones_web: 0,
        descartada: 0,
        sinClasificar: photos.length
    };

    Object.values(photoSelections).forEach(selection => {
        if (selection.impresion) stats.impresion++;
        if (selection.redes_sociales) stats.redes_sociales++;
        if (selection.invitaciones_web) stats.invitaciones_web++;
        if (selection.descartada) stats.descartada++;
    });

    stats.sinClasificar = photos.length - Object.keys(photoSelections).length;

    return stats;
}

function updateStats() {
    const stats = getStats();

    document.getElementById('countImpresion').textContent = stats.impresion;
    document.getElementById('countRedesSociales').textContent = stats.redes_sociales;
    document.getElementById('countInvitacionesWeb').textContent = stats.invitaciones_web;
    document.getElementById('countDescartada').textContent = stats.descartada;
    document.getElementById('countSinClasificar').textContent = stats.sinClasificar;

    const impresionCard = document.querySelector('.stat-card.impresion');
    if (impresionCard) {
        if (stats.impresion > LIMITS.impresion) {
            impresionCard.classList.add('exceeded');
        } else {
            impresionCard.classList.remove('exceeded');
        }
    }
}

// ========================================
// GALLERY FUNCTIONS
// ========================================
function renderGallery() {
    const grid = document.getElementById('photosGrid');
    grid.innerHTML = '';

    photos.forEach((photo, index) => {
        const selection = photoSelections[index] || {};
        const hasAny = selection.impresion || selection.redes_sociales || selection.invitaciones_web || selection.descartada;

        const card = document.createElement('div');
        card.className = 'photo-card';
        card.dataset.index = index;

        if (selection.descartada) {
            card.classList.add('has-descartada');
        } else {
            const categories = [];
            if (selection.impresion) categories.push('impresion');
            if (selection.redes_sociales) categories.push('redes_sociales');
            if (selection.invitaciones_web) categories.push('invitaciones_web');

            if (categories.length > 1) {
                card.classList.add('has-multiple');
            } else if (categories.length === 1) {
                card.classList.add(`has-${categories[0]}`);
            }
        }

        let badgesHTML = '';
        if (hasAny || selection.rating) {
            badgesHTML = '<div class="photo-badges">';

            if (selection.rating && selection.rating > 0) {
                const stars = String.fromCharCode(9733).repeat(selection.rating);
                badgesHTML += `<span class="badge badge-rating"><i class="fas fa-star"></i> ${stars}</span>`;
            }

            if (selection.impresion) badgesHTML += '<span class="badge badge-impresion"><i class="fas fa-camera"></i> Impresion</span>';
            if (selection.redes_sociales) badgesHTML += '<span class="badge badge-redes-sociales"><i class="fas fa-share-alt"></i> Redes</span>';
            if (selection.invitaciones_web) badgesHTML += '<span class="badge badge-invitaciones-web"><i class="fas fa-globe"></i> Web</span>';
            if (selection.descartada) badgesHTML += '<span class="badge badge-descartada"><i class="fas fa-times-circle"></i> Descartada</span>';
            badgesHTML += '</div>';
        }

        card.innerHTML = `
            <div class="photo-image-container">
                <img src="${photo}" alt="Foto ${index + 1}" loading="lazy">
            </div>
            <div class="photo-number">Foto ${index + 1}</div>
            ${badgesHTML}
        `;

        card.addEventListener('click', () => openModal(index));
        grid.appendChild(card);
    });

    applyFilter();
}

// ========================================
// FILTER FUNCTIONS
// ========================================
function isPhotoVisible(index) {
    const selection = photoSelections[index] || {};
    let show = false;

    switch (currentFilter) {
        case 'all':
            show = true;
            break;
        case 'impresion':
            show = selection.impresion === true;
            break;
        case 'redes-sociales':
            show = selection.redes_sociales === true;
            break;
        case 'invitaciones-web':
            show = selection.invitaciones_web === true;
            break;
        case 'descartada':
            show = selection.descartada === true;
            break;
        case 'sin-clasificar':
            show = !selection.impresion && !selection.redes_sociales && !selection.invitaciones_web && !selection.descartada;
            break;
    }
    return show;
}

function applyFilter() {
    const cards = document.querySelectorAll('.photo-card');

    cards.forEach(card => {
        const index = parseInt(card.dataset.index);
        card.classList.toggle('hidden', !isPhotoVisible(index));
    });
}

function setFilter(filter) {
    currentFilter = filter;
    applyFilter();

    document.querySelectorAll('.btn-filter').forEach(btn => {
        btn.classList.remove('active');
    });

    const activeBtn = document.querySelector(`[data-filter="${filter}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
}

function updateFilterButtons() {
    const stats = getStats();

    document.getElementById('btnFilterAll').textContent = `Todas (${photos.length})`;
    document.getElementById('btnFilterImpresion').textContent = `Impresion (${stats.impresion})`;
    document.getElementById('btnFilterRedesSociales').textContent = `Redes Sociales (${stats.redes_sociales})`;
    document.getElementById('btnFilterInvitacionesWeb').textContent = `Invitaciones Web (${stats.invitaciones_web})`;
    document.getElementById('btnFilterDescartada').textContent = `Descartadas (${stats.descartada})`;
    document.getElementById('btnFilterSinClasificar').textContent = `Sin Clasificar (${stats.sinClasificar})`;
}

function findNextVisiblePhoto(startIndex, direction) {
    const totalPhotos = photos.length;

    if (direction === 'next') {
        for (let i = startIndex + 1; i < totalPhotos; i++) {
            if (isPhotoVisible(i)) return i;
        }
    } else {
        for (let i = startIndex - 1; i >= 0; i--) {
            if (isPhotoVisible(i)) return i;
        }
    }

    return null;
}

// ========================================
// MODAL FUNCTIONS
// ========================================
function openModal(index) {
    currentPhotoIndex = index;
    const modal = document.getElementById('photoModal');
    const modalImage = document.getElementById('modalImage');
    const modalPhotoNumber = document.getElementById('modalPhotoNumber');

    modalImage.src = photos[index];
    modalPhotoNumber.textContent = `Foto ${index + 1}`;

    const selection = photoSelections[index] || {};

    document.querySelectorAll('.option-btn').forEach(btn => {
        const category = btn.dataset.category;
        btn.classList.toggle('selected', selection[category] === true);
    });

    updateStarDisplay(selection.rating || 0);
    updateNavigationButtons();

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function updateStarDisplay(rating) {
    const stars = document.querySelectorAll('#starRating i');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.remove('far');
            star.classList.add('fas');
        } else {
            star.classList.remove('fas');
            star.classList.add('far');
        }
    });
}

function setupStarRating() {
    const starContainer = document.getElementById('starRating');
    if (!starContainer) return;

    const stars = starContainer.querySelectorAll('i');

    stars.forEach((star, index) => {
        star.addEventListener('click', (e) => {
            e.stopPropagation();
            const rating = index + 1;
            updateStarDisplay(rating);

            if (currentPhotoIndex !== null) {
                if (!photoSelections[currentPhotoIndex]) {
                    photoSelections[currentPhotoIndex] = {};
                }
                photoSelections[currentPhotoIndex].rating = rating;
            }
        });

        star.addEventListener('mouseenter', () => {
            stars.forEach((s, i) => {
                if (i <= index) s.style.filter = 'brightness(1.3)';
            });
        });

        star.addEventListener('mouseleave', () => {
            stars.forEach(s => s.style.filter = '');
        });
    });
}

function updateNavigationButtons() {
    const btnPrev = document.getElementById('btnPrevPhoto');
    const btnNext = document.getElementById('btnNextPhoto');

    if (btnPrev && btnNext) {
        const prevIndex = findNextVisiblePhoto(currentPhotoIndex, 'prev');
        const nextIndex = findNextVisiblePhoto(currentPhotoIndex, 'next');

        btnPrev.disabled = prevIndex === null;
        btnPrev.style.opacity = prevIndex === null ? '0.3' : '1';
        btnPrev.style.cursor = prevIndex === null ? 'not-allowed' : 'pointer';

        btnNext.disabled = nextIndex === null;
        btnNext.style.opacity = nextIndex === null ? '0.3' : '1';
        btnNext.style.cursor = nextIndex === null ? 'not-allowed' : 'pointer';
    }
}

function hasUnsavedChanges() {
    if (currentPhotoIndex === null) return false;

    const savedSelection = photoSelections[currentPhotoIndex] || {};
    const currentSelection = {};
    document.querySelectorAll('.option-btn.selected').forEach(btn => {
        currentSelection[btn.dataset.category] = true;
    });

    const savedKeys = Object.keys(savedSelection).filter(k => savedSelection[k]);
    const currentKeys = Object.keys(currentSelection);

    if (savedKeys.length !== currentKeys.length) return true;

    const allKeys = new Set([...savedKeys, ...currentKeys]);

    for (const key of allKeys) {
        if (!!savedSelection[key] !== !!currentSelection[key]) return true;
    }

    return false;
}

function navigatePhoto(direction) {
    if (currentPhotoIndex === null) return;

    const proceed = () => {
        const newIndex = findNextVisiblePhoto(currentPhotoIndex, direction);

        if (newIndex !== null) {
            currentPhotoIndex = newIndex;
            const modalImage = document.getElementById('modalImage');
            const modalPhotoNumber = document.getElementById('modalPhotoNumber');

            modalImage.src = photos[newIndex];
            modalPhotoNumber.textContent = `Foto ${newIndex + 1}`;

            const selection = photoSelections[newIndex] || {};
            document.querySelectorAll('.option-btn').forEach(btn => {
                const category = btn.dataset.category;
                btn.classList.toggle('selected', selection[category] === true);
            });

            updateStarDisplay(selection.rating || 0);
            updateNavigationButtons();
        }
    };

    if (hasUnsavedChanges()) {
        if (confirm('Deseas guardar los cambios antes de continuar?')) {
            saveModalSelection(proceed);
        } else {
            proceed();
        }
    } else {
        proceed();
    }
}

function closeModal() {
    const doClose = () => {
        const modal = document.getElementById('photoModal');
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        currentPhotoIndex = null;
    };

    if (hasUnsavedChanges()) {
        if (confirm('Deseas guardar los cambios antes de salir?')) {
            saveModalSelection(doClose);
        } else {
            doClose();
        }
    } else {
        doClose();
    }
}

function saveModalSelection(callback) {
    if (currentPhotoIndex === null) return;

    const selectedCategories = {};
    let hasAnySelection = false;

    document.querySelectorAll('.option-btn').forEach(btn => {
        const category = btn.dataset.category;
        const isSelected = btn.classList.contains('selected');
        selectedCategories[category] = isSelected;
        if (isSelected) hasAnySelection = true;
    });

    const currentRating = photoSelections[currentPhotoIndex]?.rating || 0;
    if (currentRating > 0) {
        selectedCategories.rating = currentRating;
        hasAnySelection = true;
    }

    if (hasAnySelection) {
        photoSelections[currentPhotoIndex] = selectedCategories;
    } else {
        delete photoSelections[currentPhotoIndex];
    }

    saveSelections();
    renderGallery();
    updateStats();
    updateFilterButtons();
    showToast('Seleccion guardada correctamente', 'success');

    if (callback && typeof callback === 'function') {
        callback();
    } else {
        closeModal();
    }
}

// ========================================
// EXPORT FUNCTIONS
// ========================================
function exportToJSON() {
    const exportData = {
        fecha_exportacion: new Date().toISOString(),
        evento: 'XV Anos - Sofia Marlen',
        total_fotos: photos.length,
        estadisticas: getStats(),
        selecciones: [],
        sugerencias_de_cambios: feedbackData.photos.length > 0 ? feedbackData.photos : 'Sin cambios sugeridos'
    };

    photos.forEach((photo, index) => {
        const selection = photoSelections[index];
        if (selection && (selection.impresion || selection.redes_sociales || selection.invitaciones_web || selection.descartada || selection.rating)) {
            exportData.selecciones.push({
                numero_foto: index + 1,
                archivo: photo,
                calificacion: selection.rating || 0,
                impresion: selection.impresion || false,
                redes_sociales: selection.redes_sociales || false,
                invitaciones_web: selection.invitaciones_web || false,
                descartada: selection.descartada || false
            });
        }
    });

    const jsonText = JSON.stringify(exportData, null, 2);
    const message = `XV ANOS SOFIA MARLEN - SELECCION DE FOTOS\n\n${jsonText}`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/524779203776?text=${encodedMessage}`;

    window.open(whatsappURL, '_blank');
    showToast('Abriendo WhatsApp para enviar reporte...', 'success');
}

function generateTextSummary() {
    const stats = getStats();
    let summary = 'XV ANOS SOFIA MARLEN - SELECCION DE FOTOS\n';
    summary += '='.repeat(50) + '\n\n';
    summary += `RESUMEN GENERAL:\n`;
    summary += `   Total de fotos: ${photos.length}\n`;
    summary += `   Para impresion: ${stats.impresion}\n`;
    summary += `   Para redes sociales: ${stats.redes_sociales}\n`;
    summary += `   Para invitaciones web: ${stats.invitaciones_web}\n`;
    summary += `   Descartadas: ${stats.descartada}\n`;
    summary += `   Sin clasificar: ${stats.sinClasificar}\n\n`;

    const categories = ['impresion', 'redes_sociales', 'invitaciones_web', 'descartada'];
    const categoryNames = {
        impresion: 'IMPRESION',
        redes_sociales: 'REDES SOCIALES',
        invitaciones_web: 'INVITACIONES WEB',
        descartada: 'DESCARTADAS'
    };

    categories.forEach(category => {
        const photosInCategory = [];
        photos.forEach((photo, index) => {
            const selection = photoSelections[index];
            if (selection && selection[category]) {
                const rating = selection.rating ? ` (${selection.rating} estrellas)` : '';
                photosInCategory.push(`${index + 1}${rating}`);
            }
        });

        if (photosInCategory.length > 0) {
            summary += `${categoryNames[category]}:\n`;
            summary += `   Fotos: ${photosInCategory.join(', ')}\n`;
            summary += `   Total: ${photosInCategory.length}\n\n`;
        }
    });

    if (feedbackData.photos.length > 0) {
        summary += `\nSUGERENCIAS DE CAMBIOS EN FOTOS:\n`;
        feedbackData.photos.forEach(item => {
            summary += `   Foto #${item.photoNumber}: ${item.change}\n`;
        });
        summary += '\n';
    }

    summary += `\nGenerado el: ${new Date().toLocaleString('es-MX')}\n`;

    return summary;
}

function copyToClipboard() {
    const summary = generateTextSummary();

    navigator.clipboard.writeText(summary).then(() => {
        showToast('Resumen copiado al portapapeles', 'success');
    }).catch(() => {
        const textarea = document.createElement('textarea');
        textarea.value = summary;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('Resumen copiado al portapapeles', 'success');
    });
}

// ========================================
// TOAST NOTIFICATION
// ========================================
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;

    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// ========================================
// FEEDBACK MANAGEMENT
// ========================================
let feedbackData = { photos: [] };

function loadFeedback() {
    try {
        const saved = localStorage.getItem(FEEDBACK_KEY);
        if (saved) {
            feedbackData = JSON.parse(saved);
            renderFeedbackLists();
        }
    } catch (error) {
        console.error('Error loading feedback:', error);
    }
}

function saveFeedback() {
    try {
        localStorage.setItem(FEEDBACK_KEY, JSON.stringify(feedbackData));
    } catch (error) {
        console.error('Error saving feedback:', error);
    }
}

function addPhotoFeedback() {
    const photoNumber = document.getElementById('photoNumber').value.trim();
    const change = document.getElementById('photoChange').value.trim();

    if (!photoNumber || !change) {
        showToast('Por favor completa ambos campos', 'error');
        return;
    }

    if (photoNumber < 1 || photoNumber > TOTAL_PHOTOS) {
        showToast(`El numero de foto debe estar entre 1 y ${TOTAL_PHOTOS}`, 'error');
        return;
    }

    feedbackData.photos.push({ photoNumber: parseInt(photoNumber), change });
    saveFeedback();
    renderFeedbackLists();

    document.getElementById('photoNumber').value = '';
    document.getElementById('photoChange').value = '';

    showToast('Sugerencia de foto agregada', 'success');
}

function removePhotoFeedback(index) {
    feedbackData.photos.splice(index, 1);
    saveFeedback();
    renderFeedbackLists();
    showToast('Sugerencia eliminada', 'success');
}

function renderFeedbackLists() {
    const photoList = document.getElementById('photoFeedbackList');
    if (!photoList) return;

    if (feedbackData.photos.length === 0) {
        photoList.innerHTML = '<p style="color: rgba(250, 248, 243, 0.5); font-style: italic; margin: 10px 0; text-align: center;">No hay sugerencias de cambios</p>';
    } else {
        photoList.innerHTML = feedbackData.photos.map((item, index) => `
            <div style="display: flex; align-items: center; gap: 10px; padding: 12px; background: rgba(255, 255, 255, 0.08); border-radius: 10px; margin-bottom: 10px; border: 1px solid rgba(212, 175, 55, 0.3);">
                <span style="font-weight: 600; color: var(--gold); min-width: 70px; font-size: 1rem;"><i class="fas fa-camera"></i> #${item.photoNumber}</span>
                <span style="flex: 1; color: var(--cream); font-size: 0.95rem;">${item.change}</span>
                <button onclick="removePhotoFeedback(${index})" style="padding: 8px 12px; background: #f44336; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 0.85rem;"><i class="fas fa-trash-alt"></i></button>
            </div>
        `).join('');
    }
}

// ========================================
// EVENT LISTENERS
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('Iniciando selector de fotos - Sofia Marlen XV Anos');
    console.log(`Total de fotos: ${TOTAL_PHOTOS}`);

    loadSelections();
    loadFeedback();
    renderGallery();
    updateStats();
    updateFilterButtons();

    // Filter buttons
    document.getElementById('btnFilterAll').addEventListener('click', () => setFilter('all'));
    document.getElementById('btnFilterImpresion').addEventListener('click', () => setFilter('impresion'));
    document.getElementById('btnFilterRedesSociales').addEventListener('click', () => setFilter('redes-sociales'));
    document.getElementById('btnFilterInvitacionesWeb').addEventListener('click', () => setFilter('invitaciones-web'));
    document.getElementById('btnFilterDescartada').addEventListener('click', () => setFilter('descartada'));
    document.getElementById('btnFilterSinClasificar').addEventListener('click', () => setFilter('sin-clasificar'));

    // Action buttons
    document.getElementById('btnExport').addEventListener('click', exportToJSON);
    document.getElementById('btnShare').addEventListener('click', copyToClipboard);
    document.getElementById('btnClear').addEventListener('click', clearAllSelections);

    // Modal controls
    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.getElementById('btnCancelSelection').addEventListener('click', closeModal);
    document.getElementById('btnSaveSelection').addEventListener('click', () => saveModalSelection());

    // Star rating
    setupStarRating();

    // Option buttons
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.category;
            const isCurrentlySelected = btn.classList.contains('selected');

            if (category === 'descartada' && !isCurrentlySelected) {
                document.querySelectorAll('.option-btn').forEach(b => {
                    if (b !== btn) b.classList.remove('selected');
                });
            }

            if (category !== 'descartada' && !isCurrentlySelected) {
                const descartadaBtn = document.querySelector('.option-btn[data-category="descartada"]');
                if (descartadaBtn) descartadaBtn.classList.remove('selected');
            }

            btn.classList.toggle('selected');

            if (!isCurrentlySelected && LIMITS[category]) {
                const stats = getStats();
                const futureCount = stats[category] + 1;
                if (futureCount > LIMITS[category]) {
                    showToast(`Nota: Has seleccionado ${futureCount} fotos para ${category} (se recomiendan ${LIMITS[category]})`, 'warning');
                }
            }
        });
    });

    // Close modal on outside click
    document.getElementById('photoModal').addEventListener('click', (e) => {
        if (e.target.id === 'photoModal') closeModal();
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        const modal = document.getElementById('photoModal');
        if (modal.classList.contains('active')) {
            if (e.key === 'Escape') closeModal();
            else if (e.key === 'Enter') saveModalSelection();
            else if (e.key === 'ArrowLeft') { e.preventDefault(); navigatePhoto('prev'); }
            else if (e.key === 'ArrowRight') { e.preventDefault(); navigatePhoto('next'); }
        }
    });

    // Navigation buttons
    document.getElementById('btnPrevPhoto').addEventListener('click', (e) => {
        e.stopPropagation();
        navigatePhoto('prev');
    });

    document.getElementById('btnNextPhoto').addEventListener('click', (e) => {
        e.stopPropagation();
        navigatePhoto('next');
    });

    console.log('Selector de fotos inicializado correctamente!');
});

// Auto-save
document.addEventListener('visibilitychange', () => {
    if (document.hidden) saveSelections();
});

window.addEventListener('beforeunload', () => saveSelections());

// ========================================
// DOWNLOAD FUNCTIONS
// ========================================
async function downloadCurrentPhoto() {
    if (currentPhotoIndex === null) return;
    const url = photos[currentPhotoIndex];
    if (!url) return;
    const filename = 'foto-' + (currentPhotoIndex + 1) + '.jpg';
    showToast('Descargando...', 'success');
    try {
        const resp = await fetch(url, { mode: 'cors' });
        const blob = await resp.blob();
        let finalBlob = blob;
        if (!blob.type.includes('jpeg') && !blob.type.includes('jpg')) {
            const bmp = await createImageBitmap(blob);
            const canvas = document.createElement('canvas');
            canvas.width = bmp.width; canvas.height = bmp.height;
            canvas.getContext('2d').drawImage(bmp, 0, 0);
            finalBlob = await new Promise(function(res){ canvas.toBlob(res, 'image/jpeg', 0.95); });
        }
        const a = document.createElement('a');
        const objUrl = URL.createObjectURL(finalBlob);
        a.href = objUrl; a.download = filename;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        setTimeout(function(){ URL.revokeObjectURL(objUrl); }, 2000);
        sbRegistrarVisita('descarga');
        showToast('Descargando ' + filename, 'success');
    } catch(e) {
        window.open(url, '_blank');
        showToast('Abriendo foto...', 'success');
    }
}

function downloadAndClose() {
    downloadCurrentPhoto();
    closeModal();
}

// Inyectar botones de descarga en el modal al cargar
(function injectDownloadButtons(){
    function tryInject(){
        var actions = document.querySelector('.modal-actions');
        if (!actions) return;
        if (document.getElementById('btnDownloadClose')) return;
        var btnDlClose = document.createElement('button');
        btnDlClose.id = 'btnDownloadClose';
        btnDlClose.className = 'btn';
        btnDlClose.textContent = '\u2B07 Descargar y Cerrar';
        btnDlClose.style.cssText = 'background:#6c5ce7;color:#fff;border:none;padding:8px 14px;border-radius:6px;cursor:pointer;font-size:.85rem;margin-right:4px;';
        btnDlClose.addEventListener('click', downloadAndClose);
        var btnDl = document.createElement('button');
        btnDl.id = 'btnDownloadPhoto';
        btnDl.className = 'btn';
        btnDl.textContent = '\u2B07 JPG';
        btnDl.style.cssText = 'background:#0984e3;color:#fff;border:none;padding:8px 14px;border-radius:6px;cursor:pointer;font-size:.85rem;margin-right:4px;';
        btnDl.addEventListener('click', downloadCurrentPhoto);
        actions.insertBefore(btnDlClose, actions.firstChild);
        actions.insertBefore(btnDl, btnDlClose);
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', tryInject);
    else tryInject();
})();
