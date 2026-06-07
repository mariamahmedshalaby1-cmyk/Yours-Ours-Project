function toggleMenu() {
    var m = document.getElementById('mobile-menu');
    var b = document.getElementById('hamburger');
    if(m){ m.classList.toggle('open'); }
    if(b){ b.classList.toggle('open'); }
}

document.addEventListener('DOMContentLoaded', () => {
    const tbody               = document.querySelector('.data-table tbody');
    const searchInput         = document.querySelector('.search-input-group input');
    const statusSelect        = document.querySelector('.filter-select');
    const dateInputs          = document.querySelectorAll('.date-input');
    const startDateInput      = dateInputs[0] || null;
    const endDateInput        = dateInputs[1] || null;
    const sortBtn             = document.querySelector('.table-controls .btn-text');
    const exportBtn           = document.querySelector('.btn-export');
    const cancelSelectedBtn   = document.querySelector('.btn-danger');
    const paginationContainer = document.querySelector('.pagination-buttons');
    const showingText         = document.querySelector('.table-actions .text-muted');
    const selectAllCheckbox   = document.querySelector('thead input[type="checkbox"]');

    let allRows       = [];
    let filteredRows  = [];
    let currentPage   = 1;
    let sortAscending = true;
    const rowsPerPage = 10;

    async function loadBookings() {
        try {
            const token = localStorage.getItem('token');
            const res   = await fetch('http://localhost:3000/api/admin/bookings', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            const bookings = await res.json();

            if (!Array.isArray(bookings)) throw new Error('Invalid data received');

            allRows = bookings.map(b => {
                const tr      = document.createElement('tr');
                const dateObj = new Date(b.scheduledTime);
                const dateDisplay = isNaN(dateObj.getTime())
                    ? 'N/A'
                    : dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                      + ', ' + dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

                tr.innerHTML = `
                    <td><input type="checkbox"></td>
                    <td><b>${b._id}</b></td>
                    <td>${b.client?.name           || 'N/A'}</td>
                    <td>${b.professional?.fullName || 'N/A'}</td>
                    <td>${b.service                || 'N/A'}</td>
                    <td>${dateDisplay}</td>
                    <td>${b.address?.neighborhood  || 'N/A'}</td>
                    <td><span class="badge status-${b.status}">${b.status}</span></td>
                `;

                const cells = tr.querySelectorAll('td');
                return {
                    element:    tr,
                    checkbox:   cells[0].querySelector('input[type="checkbox"]'),
                    id:         b._id,
                    customer:   b.client?.name           || '',
                    provider:   b.professional?.fullName || '',
                    service:    b.service                || '',
                    dateObj:    isNaN(dateObj.getTime()) ? new Date(0) : dateObj,
                    location:   b.address?.neighborhood  || '',
                    statusCell: cells[7]
                };
            });

            currentPage = 1;
            renderTable();

        } catch (err) {
            console.error('Failed to load bookings:', err);
            if (tbody) {
                tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:24px; color:var(--text-muted);">Failed to load bookings. Please try again.</td></tr>`;
            }
        }
    }

    async function loadBookingStats() {
        try {
            const token = localStorage.getItem('token');
            const res   = await fetch('http://localhost:3000/api/admin/stats', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            const data = await res.json();

            const cards = document.querySelectorAll('.stat-card h3');
            if (cards[0]) cards[0].textContent = data.bookingActive    || 0;
            if (cards[1]) cards[1].textContent = data.bookingPending   || 0;
            if (cards[2]) cards[2].textContent = data.bookingCompleted || 0;
            if (cards[3]) cards[3].textContent = data.bookingCancelled || 0;

        } catch (err) {
            console.error('Failed to load booking stats:', err);
        }
    }

    function renderTable() {
        if (!tbody || allRows.length === 0) return;

        const searchTerm = searchInput  ? searchInput.value.toLowerCase()  : '';
        const statusTerm = statusSelect ? statusSelect.value.toLowerCase() : '';
        const start = startDateInput && startDateInput.value ? new Date(startDateInput.value) : null;
        let   end   = endDateInput   && endDateInput.value   ? new Date(endDateInput.value)   : null;
        if (end) end.setHours(23, 59, 59, 999);

        filteredRows = allRows.filter(row => {
            const textMatch =
                row.id.toLowerCase().includes(searchTerm)       ||
                row.customer.toLowerCase().includes(searchTerm) ||
                row.provider.toLowerCase().includes(searchTerm) ||
                row.service.toLowerCase().includes(searchTerm);

            const currentStatus = row.statusCell.textContent.trim().toLowerCase();
            const statusMatch   = !statusTerm || currentStatus === statusTerm;
            const afterStart    = !start || row.dateObj >= start;
            const beforeEnd     = !end   || row.dateObj <= end;

            return textMatch && statusMatch && afterStart && beforeEnd;
        });

        filteredRows.sort((a, b) => sortAscending ? a.dateObj - b.dateObj : b.dateObj - a.dateObj);

        const totalPages = Math.ceil(filteredRows.length / rowsPerPage) || 1;
        if (currentPage > totalPages) currentPage = totalPages;

        const startIndex = (currentPage - 1) * rowsPerPage;
        const endIndex   = startIndex + rowsPerPage;

        tbody.innerHTML = '';
        filteredRows.slice(startIndex, endIndex).forEach(row => tbody.appendChild(row.element));

        if (showingText) {
            const displayStart = filteredRows.length === 0 ? 0 : startIndex + 1;
            const displayEnd   = Math.min(endIndex, filteredRows.length);
            showingText.textContent = `Showing ${displayStart} to ${displayEnd} of ${filteredRows.length} bookings`;
        }

        renderPagination(totalPages);
        if (selectAllCheckbox) selectAllCheckbox.checked = false;
    }

    function renderPagination(totalPages) {
        if (!paginationContainer) return;
        paginationContainer.innerHTML = '';

        const prevBtn       = document.createElement('button');
        prevBtn.className   = 'btn-page';
        prevBtn.textContent = 'Previous';
        prevBtn.disabled    = currentPage === 1;
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) { currentPage--; renderTable(); }
        });
        paginationContainer.appendChild(prevBtn);

        for (let i = 1; i <= totalPages; i++) {
            const pageBtn       = document.createElement('button');
            pageBtn.className   = `btn-page${i === currentPage ? ' active' : ''}`;
            pageBtn.textContent = i;
            pageBtn.addEventListener('click', () => { currentPage = i; renderTable(); });
            paginationContainer.appendChild(pageBtn);
        }

        const nextBtn       = document.createElement('button');
        nextBtn.className   = 'btn-page';
        nextBtn.textContent = 'Next';
        nextBtn.disabled    = currentPage === totalPages;
        nextBtn.addEventListener('click', () => {
            if (currentPage < totalPages) { currentPage++; renderTable(); }
        });
        paginationContainer.appendChild(nextBtn);
    }

    if (searchInput)    searchInput.addEventListener('input',    () => { currentPage = 1; renderTable(); });
    if (statusSelect)   statusSelect.addEventListener('change',  () => { currentPage = 1; renderTable(); });
    if (startDateInput) startDateInput.addEventListener('change',() => { currentPage = 1; renderTable(); });
    if (endDateInput)   endDateInput.addEventListener('change',  () => { currentPage = 1; renderTable(); });

    if (sortBtn) sortBtn.addEventListener('click', () => {
        sortAscending = !sortAscending;
        renderTable();
    });

    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', (e) => {
            if (!tbody) return;
            tbody.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = e.target.checked);
        });
    }

    if (cancelSelectedBtn) {
        cancelSelectedBtn.addEventListener('click', () => {
            if (!tbody) return;
            let itemsCancelled = false;
            Array.from(tbody.querySelectorAll('tr')).forEach(tr => {
                const cb = tr.querySelector('input[type="checkbox"]');
                if (cb && cb.checked) {
                    const rowData = allRows.find(r => r.element === tr);
                    if (rowData && rowData.statusCell.textContent.trim().toLowerCase() !== 'cancelled') {
                        rowData.statusCell.innerHTML = `<span class="badge status-cancelled">cancelled</span>`;
                        itemsCancelled = true;

                        const token = localStorage.getItem('token');
                        fetch(`http://localhost:3000/api/bookings/${rowData.id}/status`, {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': 'Bearer ' + token
                            },
                            body: JSON.stringify({ status: 'cancelled' })
                        }).catch(err => console.error('Failed to cancel booking:', err));
                    }
                    cb.checked = false;
                }
            });
            if (itemsCancelled) renderTable();
            else alert('Please select at least one active booking to cancel.');
        });
    }

    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            let csvContent = "Booking ID,Customer,Service Provider,Service Type,Date & Time,Location,Status\n";
            filteredRows.forEach(row => {
                const cleanStatus = row.statusCell.textContent.trim();
                const targetTd    = row.element.querySelectorAll('td')[5];
                const dateStr     = targetTd ? targetTd.textContent.trim() : 'N/A';
                csvContent += `"${row.id}","${row.customer}","${row.provider}","${row.service}","${dateStr}","${row.location}","${cleanStatus}"\n`;
            });
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.setAttribute('href', URL.createObjectURL(blob));
            link.setAttribute('download', 'Bookings_Export.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }

    loadBookings();
    loadBookingStats();
});