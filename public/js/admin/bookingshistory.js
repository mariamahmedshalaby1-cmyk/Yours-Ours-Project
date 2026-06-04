function toggleMenu() {
    var m = document.getElementById('mobile-menu');
    var b = document.getElementById('hamburger');
    if(m){ m.classList.toggle('open'); }
    if(b){ b.classList.toggle('open'); }
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. Select all the elements we need
    const tbody = document.querySelector('.data-table tbody');
    const searchInput = document.querySelector('.search-input-group input');
    const statusSelect = document.querySelector('.filter-select');
    const dateInputs = document.querySelectorAll('.date-input');
    const startDateInput = dateInputs[0];
    const endDateInput = dateInputs[1];
    const sortBtn = document.querySelector('.table-controls .btn-text'); // The "Sort by" button
    const exportBtn = document.querySelector('.btn-export');
    const cancelSelectedBtn = document.querySelector('.btn-danger');
    const paginationContainer = document.querySelector('.pagination-buttons');
    const showingText = document.querySelector('.table-actions .text-muted');
    const selectAllCheckbox = document.querySelector('thead input[type="checkbox"]');

    // 2. allRows starts empty — gets filled by loadBookings() from the real API
let allRows = [];

async function loadBookings() {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:3000/api/admin/bookings', {
        headers: { 'Authorization': 'Bearer ' + token }
});
        const bookings = await res.json();

        allRows = bookings.map(b => {
            // Build a real TR element so all existing logic keeps working
            const tr = document.createElement('tr');

            const dateObj     = new Date(b.scheduledTime);
            const dateDisplay = isNaN(dateObj)
                ? 'N/A'
                : dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                  + ', ' + dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

            tr.innerHTML = `
                <td><input type="checkbox"></td>
                <td><b>${b._id}</b></td>
                <td>${b.client?.name         || 'N/A'}</td>
                <td>${b.professional?.fullName || 'N/A'}</td>
                <td>${b.service          || 'N/A'}</td>
                <td>${dateDisplay}</td>
                <td>${b.address?.neighborhood || 'N/A'}</td>
                <td><span class="badge status-${b.status}">${b.status}</span></td>
            `;

            const cells = tr.querySelectorAll('td');
            return {
                element:    tr,
                checkbox:   cells[0].querySelector('input[type="checkbox"]'),
                id:         b._id,
                customer:   b.client?.name           || '',
                provider:   b.professional?.fullName || '',
                service:    b.service          || '',
                dateObj:    isNaN(dateObj) ? new Date(0) : dateObj,
                location: b.address?.neighborhood || '',
                statusCell: cells[7]
            };
        });

        renderTable(); // hand off to your existing render logic

    } catch (err) {
        console.error('Failed to load bookings:', err);
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 24px; color: var(--text-muted);">Failed to load bookings. Please try again.</td></tr>`;
    }
}

    async function loadBookingStats() {
    try {
        const token = localStorage.getItem('token');
        const res   = await fetch('http://localhost:3000/api/admin/stats', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        const data  = await res.json();

        const cards = document.querySelectorAll('.stat-card h3');
        if (cards[0]) cards[0].textContent = data.bookingActive;
        if (cards[1]) cards[1].textContent = data.bookingPending;
        if (cards[2]) cards[2].textContent = data.bookingCompleted;
        if (cards[3]) cards[3].textContent = data.bookingCancelled;

    } catch (err) {
        console.error('Failed to load booking stats:', err);
    }
}

    // 3. State Variables
    let currentPage = 1;
    const rowsPerPage = 10;
    let sortAscending = true; 
    let filteredRows = [...allRows]; // Starts with all rows

    // 4. Main Render Function
    function renderTable() {
        if (allRows.length === 0) return;
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

    // Run once on load — fetches real data then renders
loadBookings();
loadBookingStats();

});