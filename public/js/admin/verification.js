function toggleMenu() {
    var m = document.getElementById('mobile-menu');
    var b = document.getElementById('hamburger');
    if(m){ m.classList.toggle('open'); }
    if(b){ b.classList.toggle('open'); }
}

  document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Core Elements ---
    const grid = document.querySelector('.queue-grid');
    let allCards = [];
    const searchInput = document.querySelector('.search-input-group input');
    const professionFilter = document.querySelector('.filter-select');
    const sortBtn = document.querySelector('.table-controls .btn-text');
    const loadMoreBtn = document.querySelector('.btn-page');
    const loadMoreContainer = document.querySelector('.pagination-container'); 
    const countText = document.querySelector('.table-card > .text-muted');

    async function loadPendingPros() {
    try {
        const res  = await fetch('http://localhost:3000/api/admin/pending-pros');
        const pros = await res.json();

        allCards = pros.map(pro => {
            const card = document.createElement('div');
            card.className = 'queue-card';
            card.dataset.created = pro.createdAt; // used by getAgeInHours
            card.dataset.deleted = 'false';

            card.innerHTML = `
                <div class="queue-card-header">
                    <div class="provider-avatar">
                        <span class="material-icons-sharp">person</span>
                    </div>
                    <div class="provider-title">
                        <h3>${pro.name}</h3>
                        <span class="profession-badge">${pro.specialty || 'N/A'}</span>
                    </div>
                    <span class="status-badge status-pending">Pending</span>
                </div>
                <div class="queue-card-body">
                    <div class="info-line">
                        <span class="material-icons-sharp">location_on</span>
                        <span>${pro.serviceArea || 'N/A'}</span>
                    </div>
                    <div class="info-line">
                        <span class="material-icons-sharp">work</span>
                        <span>${pro.experience ? pro.experience + ' years experience' : 'N/A'}</span>
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
        grid.innerHTML = `<p style="text-align:center; padding:24px; color:var(--text-muted);">Failed to load applications. Please try again.</p>`;
    }
}

    // --- 2. Dynamic "No More" Message Setup ---
    const noMoreMsg = document.createElement('p');
    noMoreMsg.className = 'text-muted';
    noMoreMsg.textContent = 'No more pending applications to load at this time.';
    noMoreMsg.style.display = 'none';
    noMoreMsg.style.textAlign = 'center';
    noMoreMsg.style.marginTop = '16px';
    noMoreMsg.style.fontWeight = '500';
    if (loadMoreContainer) {
      loadMoreContainer.appendChild(noMoreMsg);
    }

    // --- 3. Undo System Variables ---
    const undoToast = document.getElementById('undo-toast');
    const undoToastText = undoToast.querySelector('span');
    const undoBtn = document.getElementById('undo-btn');
    let lastDeletedCard = null;
    let toastTimeout;

    // --- 4. State Variables ---
    let sortAscending = true; 
    let visibleLimit = 6; 

    // --- 5. Helper: Age Calculation ---
    function getAgeInHours(card) {
    const created = card.dataset.created;
    if (!created) return 9999;
    const diffMs = Date.now() - new Date(created).getTime();
    return diffMs / (1000 * 60 * 60);
}

    // --- 6. Main Render Function ---
    function renderCards() {
      const searchTerm = searchInput.value.toLowerCase();
      const profTerm = professionFilter.value.toLowerCase();

      let filtered = allCards.filter(card => {
        if (card.dataset.deleted === 'true') return false;

        const name = card.querySelector('.provider-title h3').textContent.toLowerCase();
        const profession = card.querySelector('.profession-badge').textContent.toLowerCase();

        return (name.includes(searchTerm) || profession.includes(searchTerm)) && 
               (profTerm === '' || profession.includes(profTerm));
      });

      filtered.sort((a, b) => {
        const ageA = getAgeInHours(a);
        const ageB = getAgeInHours(b);
        return sortAscending ? ageA - ageB : ageB - ageA;
      });

      grid.innerHTML = ''; 
      const cardsToShow = filtered.slice(0, visibleLimit);
      cardsToShow.forEach(card => grid.appendChild(card));

      countText.textContent = `Showing ${filtered.length} pending applications`;

      // Load More Logic
      if (visibleLimit >= filtered.length) {
        if(loadMoreBtn) loadMoreBtn.style.display = 'none'; 
        if (filtered.length > 0) {
          noMoreMsg.style.display = 'block'; 
        } else {
          noMoreMsg.style.display = 'none'; 
        }
      } else {
        if(loadMoreBtn) loadMoreBtn.style.display = 'inline-block'; 
        noMoreMsg.style.display = 'none'; 
      }
    }

    // --- 7. Event Listeners for Filters & Sorting ---
    if(searchInput) searchInput.addEventListener('input', () => { visibleLimit = 6; renderCards(); });
    if(professionFilter) professionFilter.addEventListener('change', () => { visibleLimit = 6; renderCards(); });
    if(sortBtn) {
      sortBtn.addEventListener('click', () => {
        sortAscending = !sortAscending;
        sortBtn.innerHTML = `<span class="material-icons-sharp">swap_vert</span> Sort by Date (${sortAscending ? 'Newest' : 'Oldest'})`;
        renderCards();
      });
    }

    // --- 8. Event Listener for Load More ---
    if(loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => {
        const originalText = loadMoreBtn.textContent;
        loadMoreBtn.textContent = 'Loading...';
        loadMoreBtn.style.opacity = '0.7';
        loadMoreBtn.style.pointerEvents = 'none';

        setTimeout(() => {
          visibleLimit += 3;
          renderCards();
          
          loadMoreBtn.textContent = originalText;
          loadMoreBtn.style.opacity = '1';
          loadMoreBtn.style.pointerEvents = 'auto';
        }, 800); 
      });
    }

    // --- 9. Undo Message Trigger ---
    function showUndoMessage(providerName) {
      undoToastText.textContent = `${providerName}'s application was resolved.`;
      undoToast.classList.add('show');

      clearTimeout(toastTimeout);
      toastTimeout = setTimeout(() => {
        undoToast.classList.remove('show');
        lastDeletedCard = null; 
      }, 6000);
    }

    // --- 10. Undo Button Click Logic ---
    if(undoBtn) {
      undoBtn.addEventListener('click', () => {
        if (lastDeletedCard) {
          lastDeletedCard.dataset.deleted = 'false';
          lastDeletedCard.style.opacity = '1';
          lastDeletedCard.style.pointerEvents = 'auto';
          lastDeletedCard.querySelector('.btns-line').style.opacity = '1';
          
          const badge = lastDeletedCard.querySelector('.status-badge');
          badge.textContent = 'Pending';
          badge.className = 'status-badge status-pending';

          undoToast.classList.remove('show');
          lastDeletedCard = null;
          renderCards();
        }
      });
    }

    // --- 11. Approve & Reject Click Logic ---
    if(grid) {
      grid.addEventListener('click', (e) => {
        const approveBtn = e.target.closest('.btn-approve');
        const rejectBtn = e.target.closest('.btn-reject');
        
        if (approveBtn || rejectBtn) {
          const card = e.target.closest('.queue-card');
          const badge = card.querySelector('.status-badge');
          const providerName = card.querySelector('h3').textContent;
          const btnsLine = card.querySelector('.btns-line');
          
          const proId  = approveBtn ? approveBtn.dataset.id : rejectBtn.dataset.id;
const status = approveBtn ? 'approved' : 'rejected';

// Call the real backend
fetch(`http://localhost:3000/api/admin/verify/${proId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
}).catch(err => console.error('Failed to update status:', err));

if (approveBtn) {
    badge.textContent = 'Approved';
    badge.className = 'status-badge status-approved';
} else {
    badge.textContent = 'Rejected';
    badge.className = 'status-badge status-rejected';
}

          btnsLine.style.opacity = '0.5';
          card.style.pointerEvents = 'none';

          // Wait 2 seconds, then trigger fade out and deletion
          setTimeout(() => {
            card.style.transition = 'opacity 0.3s ease';
            card.style.opacity = '0';
            
            setTimeout(() => {
              card.dataset.deleted = 'true';
              lastDeletedCard = card; 
              renderCards(); 
              showUndoMessage(providerName); 
            }, 300); 

          }, 2000); 
        }
      });
    }

    // --- 12. Initial Load ---
loadPendingPros();


  });