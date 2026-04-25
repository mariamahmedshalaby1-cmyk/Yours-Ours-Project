
  document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Core Elements ---
    const grid = document.querySelector('.queue-grid');
    const allCards = Array.from(document.querySelectorAll('.queue-card'));
    const searchInput = document.querySelector('.search-input-group input');
    const professionFilter = document.querySelector('.filter-select');
    const sortBtn = document.querySelector('.table-controls .btn-text');
    const loadMoreBtn = document.querySelector('.btn-page');
    const loadMoreContainer = document.querySelector('.pagination-container'); 
    const countText = document.querySelector('.table-card > .text-muted');

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
      const timeText = card.querySelector('.info-line:first-child span:last-child').textContent;
      const match = timeText.match(/(\d+)\s+(hour|day|week)/);
      if (!match) return 9999; 
      
      const amount = parseInt(match[1]);
      const unit = match[2];
      
      if (unit === 'hour') return amount;
      if (unit === 'day') return amount * 24;
      if (unit === 'week') return amount * 24 * 7;
      
      return 9999;
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
    renderCards();

    // --- 13. STAT CARDS: COUNT-UP ANIMATION ONLY ---
    const statNumbers = document.querySelectorAll('.animate-number');
    
    statNumbers.forEach(numberEl => {
        // Get the target number from the HTML attribute
        const target = +numberEl.getAttribute('data-target'); 
        const duration = 1500; // Animation lasts 1.5 seconds
        
        // Calculate how much to add per frame
        const increment = target / (duration / 16); 
        let current = 0;
        
        const updateCounter = () => {
            current += increment;
            if (current < target) {
                // Format with commas and keep animating
                numberEl.textContent = Math.ceil(current).toLocaleString();
                requestAnimationFrame(updateCounter);
            } else {
                // Ensure it lands exactly on the target number at the end
                numberEl.textContent = target.toLocaleString(); 
            }
        };
        
        // Start the animation
        updateCounter();
    });

  });