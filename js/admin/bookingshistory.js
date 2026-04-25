
document.addEventListener('DOMContentLoaded', () => {
    // 1. Select all the elements we need
    const tbody = document.querySelector('.data-table tbody');
    const searchInput = document.querySelector('.search-input-group input');
    const statusSelect = document.querySelector('.filter-select');
    const dateInputs = document.querySelectorAll('.date-input');
    const startDateInput = dateInputs[0];
    const endDateInput = dateInputs[1];
    const sortBtn = document.querySelectorAll('.table-controls .btn-text')[1]; // The "Sort by" button
    const exportBtn = document.querySelector('.btn-export');
    const cancelSelectedBtn = document.querySelector('.btn-danger');
    const paginationContainer = document.querySelector('.pagination-buttons');
    const showingText = document.querySelector('.table-actions .text-muted');
    const selectAllCheckbox = document.querySelector('thead input[type="checkbox"]');

    // 2. Parse the existing table rows into a manageable Array of Objects
    let allRows = Array.from(tbody.querySelectorAll('tr')).map(tr => {
        const cells = tr.querySelectorAll('td');
        // Convert "March 10, 2026, 10:00 AM" into a real JavaScript Date object
        const dateStr = cells[5].textContent.trim();
        const dateObj = new Date(dateStr.replace(',', '')); 

        return {
            element: tr,
            checkbox: cells[0].querySelector('input[type="checkbox"]'),
            id: cells[1].textContent.trim(),
            customer: cells[2].textContent.trim(),
            provider: cells[3].textContent.trim(),
            service: cells[4].textContent.trim(),
            dateObj: dateObj,
            location: cells[6].textContent.trim(),
            statusCell: cells[7]
        };
    });

    // 3. State Variables
    let currentPage = 1;
    const rowsPerPage = 10;
    let sortAscending = true; 
    let filteredRows = [...allRows]; // Starts with all rows

    // 4. Main Render Function
    function renderTable() {
        // A. Apply Filters
        const searchTerm = searchInput.value.toLowerCase();
        const statusTerm = statusSelect.value.toLowerCase();
        const start = startDateInput.value ? new Date(startDateInput.value) : null;
        let end = endDateInput.value ? new Date(endDateInput.value) : null;
        
        // If end date exists, push it to the end of the day so it includes times up to 11:59 PM
        if (end) end.setHours(23, 59, 59, 999); 

        filteredRows = allRows.filter(row => {
            // Check Search (Matches ID, Customer, Provider, or Service)
            const textMatch = 
                row.id.toLowerCase().includes(searchTerm) ||
                row.customer.toLowerCase().includes(searchTerm) ||
                row.provider.toLowerCase().includes(searchTerm) ||
                row.service.toLowerCase().includes(searchTerm);

            // Check Status
            const currentStatus = row.statusCell.textContent.trim().toLowerCase().replace(' ', '');
            const statusMatch = (statusTerm === '') || (currentStatus === statusTerm);

            // Check Dates
            const afterStart = !start || row.dateObj >= start;
            const beforeEnd = !end || row.dateObj <= end;

            return textMatch && statusMatch && afterStart && beforeEnd;
        });

        // B. Apply Sort (by Date)
        filteredRows.sort((a, b) => {
            return sortAscending ? a.dateObj - b.dateObj : b.dateObj - a.dateObj;
        });

        // C. Calculate Pagination
        const totalPages = Math.ceil(filteredRows.length / rowsPerPage) || 1;
        if (currentPage > totalPages) currentPage = totalPages;

        const startIndex = (currentPage - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        const rowsToShow = filteredRows.slice(startIndex, endIndex);

        // D. Update DOM (Wipe table and inject correct rows)
        tbody.innerHTML = '';
        rowsToShow.forEach(row => tbody.appendChild(row.element));

        // E. Update "Showing X to Y of Z" text
        const displayStart = filteredRows.length === 0 ? 0 : startIndex + 1;
        const displayEnd = Math.min(endIndex, filteredRows.length);
        showingText.textContent = `Showing ${displayStart} to ${displayEnd} of ${filteredRows.length} bookings`;

        // F. Update Pagination Buttons
        renderPagination(totalPages);
        
        // Reset the "Select All" checkbox
        selectAllCheckbox.checked = false;
    }

    // 5. Build Pagination Buttons Dynamically
    function renderPagination(totalPages) {
        paginationContainer.innerHTML = ''; // Clear existing buttons

        // Previous Button
        const prevBtn = document.createElement('button');
        prevBtn.className = 'btn-page';
        prevBtn.textContent = 'Previous';
        if (currentPage === 1) prevBtn.disabled = true;
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) { currentPage--; renderTable(); }
        });
        paginationContainer.appendChild(prevBtn);

        // Number Buttons
        for (let i = 1; i <= totalPages; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `btn-page ${i === currentPage ? 'active' : ''}`;
            pageBtn.textContent = i;
            pageBtn.addEventListener('click', () => {
                currentPage = i;
                renderTable();
            });
            paginationContainer.appendChild(pageBtn);
        }

        // Next Button
        const nextBtn = document.createElement('button');
        nextBtn.className = 'btn-page';
        nextBtn.textContent = 'Next';
        if (currentPage === totalPages) nextBtn.disabled = true;
        nextBtn.addEventListener('click', () => {
            if (currentPage < totalPages) { currentPage++; renderTable(); }
        });
        paginationContainer.appendChild(nextBtn);
    }

    // 6. Event Listeners for Filters
    searchInput.addEventListener('input', () => { currentPage = 1; renderTable(); });
    statusSelect.addEventListener('change', () => { currentPage = 1; renderTable(); });
    startDateInput.addEventListener('change', () => { currentPage = 1; renderTable(); });
    endDateInput.addEventListener('change', () => { currentPage = 1; renderTable(); });

    // 7. Sort Button Event
    sortBtn.addEventListener('click', () => {
        sortAscending = !sortAscending;
        renderTable();
    });

    // 8. "Select All" Checkbox Logic
    selectAllCheckbox.addEventListener('change', (e) => {
        const isChecked = e.target.checked;
        // Only check/uncheck the rows CURRENTLY visible on the page
        const visibleCheckboxes = tbody.querySelectorAll('input[type="checkbox"]');
        visibleCheckboxes.forEach(cb => cb.checked = isChecked);
    });

    // 9. Cancel Selected Logic
    cancelSelectedBtn.addEventListener('click', () => {
        let itemsCancelled = false;

        // Loop through the visible checkboxes
        const visibleRows = Array.from(tbody.querySelectorAll('tr'));
        visibleRows.forEach(tr => {
            const cb = tr.querySelector('input[type="checkbox"]');
            if (cb.checked) {
                // Find this row in our master data array
                const rowData = allRows.find(r => r.element === tr);
                if (rowData && rowData.statusCell.textContent.trim() !== 'Cancelled') {
                    // Update the HTML badge
                    rowData.statusCell.innerHTML = `<span class="badge status-cancelled">Cancelled</span>`;
                    itemsCancelled = true;
                }
                cb.checked = false; // uncheck it after cancelling
            }
        });

        if (itemsCancelled) {
            // Re-filter so if we are viewing "Pending" only, the cancelled ones disappear
            renderTable();
        } else {
            alert('Please select at least one active booking to cancel.');
        }
    });

    // 10. Export CSV Logic
    exportBtn.addEventListener('click', () => {
        // Build CSV string
        let csvContent = "Booking ID,Customer,Service Provider,Service Type,Date & Time,Location,Status\n";
        
        filteredRows.forEach(row => {
            // Add quotes around fields to prevent commas from breaking the columns
            const cleanStatus = row.statusCell.textContent.trim();
            const dateStr = row.element.querySelectorAll('td')[5].textContent.trim();
            
            csvContent += `"${row.id}","${row.customer}","${row.provider}","${row.service}","${dateStr}","${row.location}","${cleanStatus}"\n`;
        });

        // Trigger Download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'Bookings_Export.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // Run once on load to set up initial state
    renderTable();

    // 11. STAT CARDS: BULLETPROOF COUNT-UP ANIMATION
    const statNumbers = document.querySelectorAll('.animate-number');
    
    statNumbers.forEach(numberEl => {
        // Grab the target and remove any commas/spaces before doing math
        const rawTarget = numberEl.getAttribute('data-target') || '0';
        const target = parseFloat(rawTarget.replace(/,/g, '').trim()); 
        
        // Failsafe in case a non-number slips through
        if (isNaN(target)) return;
        
        const duration = 1500; // Animation lasts 1.5 seconds
        const increment = target / (duration / 16); 
        let current = 0;
        
        const updateCounter = () => {
            current += increment;
            if (current < target) {
                numberEl.textContent = Math.ceil(current).toLocaleString();
                requestAnimationFrame(updateCounter);
            } else {
                numberEl.textContent = target.toLocaleString(); 
            }
        };
        
        updateCounter();
    });
});