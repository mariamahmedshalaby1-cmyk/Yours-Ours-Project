function toggleMenu() {
    var m = document.getElementById('mobile-menu');
    var b = document.getElementById('hamburger');
    if(m){ m.classList.toggle('open'); }
    if(b){ b.classList.toggle('open'); }
}

document.addEventListener('DOMContentLoaded', () => {
    const grid             = document.querySelector('.queue-grid');
    let allCards           = [];
    const searchInput      = document.querySelector('.search-input-group input');
    const professionFilter = document.querySelector('.filter-select');
    const sortBtn          = document.querySelector('.table-controls .btn-text');
    const loadMoreBtn      = document.querySelector('.btn-page');
    const loadMoreContainer= document.querySelector('.pagination-container');
    const countText        = document.querySelector('.table-card > .text-muted');

    // --- Helper: Time Ago ---
    function timeAgo(dateStr) {
        const diffMs    = Date.now() - new Date(dateStr).getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays  = Math.floor(diffHours / 24);
        const diffWeeks = Math.floor(diffDays / 7);

        if (diffWeeks > 0) return `Applied ${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
        if (diffDays  > 0) return `Applied ${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        return `Applied ${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    }

    async function loadPendingPros() {
        try {
            const token = localStorage.getItem('token');
            const res   = await fetch('http://localhost:3000/api/admin/pending-pros', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            const pros = await res.json();

            if (!Array.isArray(pros)) throw new Error('Invalid data received');

            allCards = pros.map(pro => {
                const card = document.createElement('div');
                card.className       = 'queue-card';
                card.dataset.created = pro.createdAt;
                card.dataset.deleted = 'false';
                card.dataset.id      = pro._id;

                card.innerHTML = `
                    <div class="queue-card-header">
                        <div class="provider-avatar">
                            <span class="material-icons-sharp">person</span>
                        </div>
                        <div class="provider-title">
                            <h3>${pro.fullName}</h3>
                            <span class="profession-badge">${pro.specialty || 'N/A'}</span>
                        </div>
                        <span class="status-badge status-pending">Pending</span>
                    </div>
                    <div class="queue-card-body">
                        <div class="info-line">
                            <span class="material-icons-sharp">schedule</span>
                            <span>${timeAgo(pro.createdAt)}</span>
                        </div>
                        <div class="info-line">
                            <span class="material-icons-sharp">work</span>
                            <span>${pro.experienceYears ? pro.experienceYears + ' years experience' : 'N/A'}</span>
                        </div>
                        <div class="info-line">
                            <span class="material-icons-sharp">location_on</span>
                            <span>${pro.city || 'N/A'}</span>
                        </div>
                        <div class="info-line">
                            <span class="material-icons-sharp">phone</span>
                            <a href="tel:${pro.phone || ''}">${pro.phone || 'N/A'}</a>
                        </div>
                        <div class="info-line">
                            <span class="material-icons-sharp">email</span>
                            <a href="mailto:${pro.email || ''}">${pro.email || 'N/A'}</a>
                        </div>
                    </div>
                    <div class="queue-card-actions btns-line">
                        <button class="btn-approve" data-id="${pro._id}">
                            <span class="material-icons-sharp">check_circle</span> Approve
                        </button>
                        <button class="btn-reject" data-id="${pro._id}">
                            <span class="material-icons-sharp">cancel</span> Reject
                        </button>
                    </div>
                `;
                return card;
            });

            renderCards();

        } catch (err) {
            console.error('Failed to load pending professionals:', err);
            if (grid) {
                grid.innerHTML = `<p style="text-align:center; padding:24px; color:var(--text-muted);">Failed to load applications. Please try again.</p>`;
            }
        }
    }

    async function loadVerificationStats() {
        try {
            const token = localStorage.getItem('token');
            const res   = await fetch('http://localhost:3000/api/admin/stats', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            const data  = await res.json();

            const cards = document.querySelectorAll('.stat-card h3');
            if (cards[0]) cards[0].textContent = data.totalPros    || 0;
            if (cards[1]) cards[1].textContent = data.activePros   || 0;
            if (cards[2]) cards[2].textContent = data.rejectedPros || 0;
            if (cards[3]) cards[3].textContent = data.pendingPros  || 0;

        } catch (err) {
            console.error('Failed to load verification stats:', err);
        }
    }

    // --- Dynamic "No More" Message ---
    const noMoreMsg = document.createElement('p');
    noMoreMsg.className        = 'text-muted';
    noMoreMsg.textContent      = 'No more pending applications to load at this time.';
    noMoreMsg.style.display    = 'none';
    noMoreMsg.style.textAlign  = 'center';
    noMoreMsg.style.marginTop  = '16px';
    noMoreMsg.style.fontWeight = '500';
    if (loadMoreContainer) loadMoreContainer.appendChild(noMoreMsg);

    // --- Undo System ---
    const undoToast     = document.getElementById('undo-toast');
    const undoToastText = undoToast ? undoToast.querySelector('span') : null;
    const undoBtn       = document.getElementById('undo-btn');
    let lastDeletedCard = null;
    let toastTimeout;

    // --- State Variables ---
    let sortAscending = true;
    let visibleLimit  = 6;

    // --- Age Calculation ---
    function getAgeInHours(card) {
        const created = card.dataset.created;
        if (!created) return 9999;
        const diffMs = Date.now() - new Date(created).getTime();
        return diffMs / (1000 * 60 * 60);
    }

    // --- Render Cards ---
    function renderCards() {
        if (!grid) return;

        const searchTerm = searchInput     ? searchInput.value.toLowerCase()      : '';
        const rawProf    = professionFilter? professionFilter.value.toLowerCase() : '';
        const profTerm   = (rawProf === 'all' || rawProf === '') ? '' : rawProf;

        let filtered = allCards.filter(card => {
            if (card.dataset.deleted === 'true') return false;
            const nameEl  = card.querySelector('.provider-title h3');
            const badgeEl = card.querySelector('.profession-badge');
            const name       = nameEl  ? nameEl.textContent.toLowerCase()  : '';
            const profession = badgeEl ? badgeEl.textContent.toLowerCase() : '';
            return (name.includes(searchTerm) || profession.includes(searchTerm)) &&
                   (!profTerm || profession.includes(profTerm));
        });

        filtered.sort((a, b) => {
            return sortAscending
                ? getAgeInHours(a) - getAgeInHours(b)
                : getAgeInHours(b) - getAgeInHours(a);
        });

        grid.innerHTML = '';
        filtered.slice(0, visibleLimit).forEach(card => grid.appendChild(card));

        if (countText) countText.textContent = `Showing ${filtered.length} pending applications`;

        if (visibleLimit >= filtered.length) {
            if (loadMoreBtn) loadMoreBtn.style.display = 'none';
            noMoreMsg.style.display = filtered.length > 0 ? 'block' : 'none';
        } else {
            if (loadMoreBtn) loadMoreBtn.style.display = 'inline-block';
            noMoreMsg.style.display = 'none';
        }
    }

    // --- Filter & Sort Listeners ---
    if (searchInput)      searchInput.addEventListener('input',    () => { visibleLimit = 6; renderCards(); });
    if (professionFilter) professionFilter.addEventListener('change', () => { visibleLimit = 6; renderCards(); });
    if (sortBtn) {
        sortBtn.addEventListener('click', () => {
            sortAscending = !sortAscending;
            sortBtn.innerHTML = `<span class="material-icons-sharp">swap_vert</span> Sort by Date (${sortAscending ? 'Newest' : 'Oldest'})`;
            renderCards();
        });
    }

    // --- Load More ---
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            const originalText          = loadMoreBtn.textContent;
            loadMoreBtn.textContent     = 'Loading...';
            loadMoreBtn.style.opacity   = '0.7';
            loadMoreBtn.style.pointerEvents = 'none';
            setTimeout(() => {
                visibleLimit += 3;
                renderCards();
                loadMoreBtn.textContent     = originalText;
                loadMoreBtn.style.opacity   = '1';
                loadMoreBtn.style.pointerEvents = 'auto';
            }, 800);
        });
    }

    // --- Undo Message ---
    function showUndoMessage(providerName) {
        if (!undoToast || !undoToastText) return;
        undoToastText.textContent = `${providerName}'s application was resolved.`;
        undoToast.classList.add('show');
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            undoToast.classList.remove('show');
            lastDeletedCard = null;
        }, 6000);
    }

    // --- Undo Button ---
    if (undoBtn) {
        undoBtn.addEventListener('click', async () => {
            if (lastDeletedCard) {
                const proId = lastDeletedCard.dataset.id;
                try {
                    const token = localStorage.getItem('token');
                    await fetch(`http://localhost:3000/api/admin/verify/${proId}`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + token
                        },
                        body: JSON.stringify({ status: 'pending' })
                    });
                } catch (err) {
                    console.error('Failed to sync undo to database:', err);
                }

                lastDeletedCard.dataset.deleted     = 'false';
                lastDeletedCard.style.opacity       = '1';
                lastDeletedCard.style.pointerEvents = 'auto';

                const btnsLine = lastDeletedCard.querySelector('.btns-line');
                if (btnsLine) btnsLine.style.opacity = '1';

                const badge = lastDeletedCard.querySelector('.status-badge');
                if (badge) {
                    badge.textContent = 'Pending';
                    badge.className   = 'status-badge status-pending';
                }

                if (undoToast) undoToast.classList.remove('show');
                lastDeletedCard = null;
                renderCards();
                loadVerificationStats();
            }
        });
    }

    // --- Approve & Reject ---
    if (grid) {
        grid.addEventListener('click', (e) => {
            const approveBtn = e.target.closest('.btn-approve');
            const rejectBtn  = e.target.closest('.btn-reject');

            if (approveBtn || rejectBtn) {
                const card         = e.target.closest('.queue-card');
                const badge        = card.querySelector('.status-badge');
                const nameEl       = card.querySelector('h3');
                const providerName = nameEl ? nameEl.textContent : 'Professional';
                const btnsLine     = card.querySelector('.btns-line');
                const proId        = approveBtn ? approveBtn.dataset.id : rejectBtn.dataset.id;
                const status       = approveBtn ? 'approved' : 'rejected';

                const token = localStorage.getItem('token');
                fetch(`http://localhost:3000/api/admin/verify/${proId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify({ status })
                })
                .then(() => loadVerificationStats())
                .catch(err => console.error('Failed to update status:', err));

                if (badge) {
                    badge.textContent = approveBtn ? 'Approved' : 'Rejected';
                    badge.className   = approveBtn ? 'status-badge status-approved' : 'status-badge status-rejected';
                }

                if (btnsLine) btnsLine.style.opacity = '0.5';
                card.style.pointerEvents = 'none';

                setTimeout(() => {
                    card.style.transition = 'opacity 0.3s ease';
                    card.style.opacity    = '0';
                    setTimeout(() => {
                        card.dataset.deleted = 'true';
                        lastDeletedCard      = card;
                        renderCards();
                        showUndoMessage(providerName);
                    }, 300);
                }, 2000);
            }
        });
    }

    // --- Initial Load ---
    loadPendingPros();
    loadVerificationStats();
});