
document.addEventListener('DOMContentLoaded', () => {

  /* ── 1. UNIQUE DATA GENERATORS ── */
  function getChartData(month, week, isRevenue) {
    const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
    const mIdx = months.indexOf(month);
    const wIdx = parseInt(week.replace('week', ''));

    let seed = (mIdx + 1) * 10 + wIdx;
    const random = () => {
        let x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    };

    const data = [];
    for (let i = 0; i < 7; i++) {
        if (isRevenue) {
            data.push(Math.floor(40000 + random() * 50000));
        } else {
            data.push(Math.floor(15 + random() * 40));
        }
    }
    return data;
  }

  function getServicesData(month) {
    const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
    const mIdx = months.indexOf(month);
    
    let seed = (mIdx + 1) * 5; 
    const random = () => {
        let x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    };

    return [
        Math.floor(50 + random() * 45), // Plumber
        Math.floor(30 + random() * 50), // Electrician
        Math.floor(20 + random() * 40)  // Carpenter
    ];
  }

  /* ── 2. TOTAL BOOKINGS LINE CHART ── */
  const ctx1 = document.getElementById('bookingsChart');
  let bookingsChart;
  if (ctx1) {
      bookingsChart = new Chart(ctx1.getContext('2d'), {
        type: 'line',
        data: {
          labels: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          datasets: [{
            label: 'Total Bookings',
            data: getChartData('january', 'week1', false), 
            borderColor: '#89c9c9',
            backgroundColor: 'rgba(137,201,201,0.15)',
            borderWidth: 2,
            pointBackgroundColor: '#02261e',
            pointRadius: 4,
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, grid: { color: '#deecea' }, ticks: { color: '#5a7a6e', font: { family: 'Jost' } } },
            x: { grid: { display: false }, ticks: { color: '#5a7a6e', font: { family: 'Jost' } } }
          }
        }
      });
  }

  /* ── 3. TOTAL REVENUE AREA CHART ── */
  const ctx2 = document.getElementById('revenueChart');
  let revenueChart;
  if (ctx2) {
      revenueChart = new Chart(ctx2.getContext('2d'), {
        type: 'line',
        data: {
          labels: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          datasets: [{
            label: 'Revenue (EGP)',
            data: getChartData('january', 'week1', true), 
            borderColor: '#02261e',
            backgroundColor: 'rgba(2,38,30,0.08)',
            borderWidth: 2,
            pointBackgroundColor: '#89c9c9',
            pointRadius: 4,
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: false, grid: { color: '#deecea' }, ticks: { color: '#5a7a6e', font: { family: 'Jost' } } },
            x: { grid: { display: false }, ticks: { color: '#5a7a6e', font: { family: 'Jost' } } }
          }
        }
      });
  }

  /* ── 4. TOP BOOKING SERVICES HORIZONTAL BAR CHART ── */
  const ctx3 = document.getElementById('servicesChart');
  let servicesChart;
  if (ctx3) {
      servicesChart = new Chart(ctx3.getContext('2d'), {
        type: 'bar',
        data: {
          labels: ['Plumber', 'Electrician', 'Carpenter'],
          datasets: [{
            data: getServicesData('january'), 
            backgroundColor: ['rgba(2,38,30,0.80)', 'rgba(137,201,201,0.90)', 'rgba(208,252,146,0.90)'],
            borderRadius: 6,
            borderSkipped: false,
            barThickness: 30
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { enabled: false } },
          scales: {
            x: { max: 115, grid: { display: false }, ticks: { display: false }, border: { display: false } },
            y: { grid: { display: false }, ticks: { color: '#1a4a3a', font: { size: 13, weight: '600', family: 'Jost' } } }
          },
          animation: {
            onComplete: function() {
              const chart = this;
              const ctx = chart.ctx;
              ctx.save();
              ctx.font = '600 13px Jost, sans-serif';
              ctx.fillStyle = '#1a4a3a';
              ctx.textAlign = 'left';
              chart.data.datasets[0].data.forEach(function(value, index) {
                const meta = chart.getDatasetMeta(0);
                const bar = meta.data[index];
                ctx.fillText(value + '%', bar.x + 8, bar.y + 5);
              });
              ctx.restore();
            }
          }
        }
      });
  }

  /* ── 5. DROPDOWN EVENT LISTENERS ── */
  const bMonth = document.getElementById('bookingsMonth');
  const bWeek = document.getElementById('bookingsWeek');
  const rMonth = document.getElementById('revenueMonth');
  const rWeek = document.getElementById('revenueWeek');
  const sMonth = document.getElementById('servicesMonth');

  function updateBookings() {
      if(bookingsChart && bMonth && bWeek) {
          bookingsChart.data.datasets[0].data = getChartData(bMonth.value, bWeek.value, false);
          bookingsChart.update();
      }
  }
  if(bMonth) bMonth.addEventListener('change', updateBookings);
  if(bWeek) bWeek.addEventListener('change', updateBookings);

  function updateRevenue() {
      if(revenueChart && rMonth && rWeek) {
          revenueChart.data.datasets[0].data = getChartData(rMonth.value, rWeek.value, true);
          revenueChart.update();
      }
  }
  if(rMonth) rMonth.addEventListener('change', updateRevenue);
  if(rWeek) rWeek.addEventListener('change', updateRevenue);

  if(sMonth && servicesChart) {
      sMonth.addEventListener('change', () => {
          servicesChart.data.datasets[0].data = getServicesData(sMonth.value);
          servicesChart.update();
      });
  }

  /* ── 6. DOWNLOAD REPORT BUTTON ── */
  const downloadBtn = document.querySelector('.header-right .btn-primary');
  if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
          let csvContent = "Metric,Value\n";
          csvContent += "Total Bookings,200\n";
          csvContent += "Total Users,65400\n";
          csvContent += "Active Providers,128\n";
          csvContent += "Revenue,8900.00 EGP\n";
          csvContent += "Inactive Providers,248\n";

          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const link = document.createElement('a');
          const url = URL.createObjectURL(blob);
          link.setAttribute('href', url);
          link.setAttribute('download', 'Dashboard_Overview_Report.csv');
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
      });
  }

  /* ── 7. FLAGGED ISSUES LOGIC (REVIEW & DISMISS) ── */
  const issuesTableBody = document.querySelector('.urgent-issues .data-table tbody');
  if (issuesTableBody) {
      issuesTableBody.addEventListener('click', (e) => {
          const reviewBtn = e.target.closest('.btn-view');
          const dismissBtn = e.target.closest('.btn-cancel');
          const row = e.target.closest('tr');

          if (!row) return;

          const bookingId = row.querySelector('td b').textContent;

          if (reviewBtn) {
              alert(`Opening case file for Booking: ${bookingId}\n\nHere you would redirect the admin to the full details page.`);
          }

          if (dismissBtn) {
              row.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
              row.style.opacity = '0';
              row.style.transform = 'translateX(20px)';

              setTimeout(() => {
                  row.remove(); 
                  if (issuesTableBody.children.length === 0) {
                      const emptyRow = document.createElement('tr');
                      emptyRow.innerHTML = `<td colspan="3" style="text-align: center; padding-top: 24px; padding-bottom: 24px; color: var(--text-muted);">
                          <span class="material-icons-sharp" style="font-size: 2rem; display: block; margin-bottom: 8px;">check_circle</span>
                          All caught up! There are no flagged issues.
                      </td>`;
                      issuesTableBody.appendChild(emptyRow);
                  }
              }, 300); 
          }
      });
  }

  /* ── 8. RECENT ACTIVITY: LIVE FEED SIMULATOR ── */
  const activityList = document.querySelector('.activity-list');
  if (activityList) {
      const allEvents = [
          "<p><strong>Youssef</strong> booked a Carpenter service.</p>",
          "<p><strong>Ahmed</strong> left a 5-star review for a Plumber.</p>",
          "<p>New provider <strong>Hassan (Electrician)</strong> joined the platform.</p>",
          "<p>Booking #BK-10114 marked as Completed.</p>",
          "<p><strong>Omar</strong> cancelled an Electrician booking.</p>",
          "<p><strong>Mahmoud</strong> booked a Plumber service.</p>",
          "<p><strong>Tarek</strong> left a 4-star review for a Carpenter.</p>",
          "<p>New provider <strong>Khaled (Plumber)</strong> joined the platform.</p>",
          "<p>Booking #BK-10129 marked as Completed.</p>"
      ];

      let availableEvents = [...allEvents];

      setInterval(() => {
          if (availableEvents.length === 0) {
              availableEvents = [...allEvents];
          }

          const randomIndex = Math.floor(Math.random() * availableEvents.length);
          const randomEvent = availableEvents.splice(randomIndex, 1)[0];

          const newLi = document.createElement('li');
          
          newLi.style.opacity = '0';
          newLi.style.transform = 'translateY(-10px)';
          newLi.style.transition = 'all 0.4s ease';
          
          newLi.innerHTML = `<span class="time text-muted">Just now</span>${randomEvent}`;
          activityList.prepend(newLi);
          
          setTimeout(() => {
              newLi.style.opacity = '1';
              newLi.style.transform = 'translateY(0)';
          }, 50);

          if (activityList.children.length > 4) {
              activityList.lastElementChild.remove();
          }

          const times = activityList.querySelectorAll('.time');
          let currentMinutes = 0;
          
          times.forEach((timeEl, index) => {
              if (index === 0) {
                  timeEl.textContent = "Just now";
              } else {
                  currentMinutes += Math.floor(Math.random() * 6) + 1;
                  timeEl.textContent = `${currentMinutes} mins ago`;
              }
          });
      }, 15000); 
  }

  /* ── 9. TOP WORKERS: CLICKABLE PROFILES ── */
  const workerItems = document.querySelectorAll('.worker-item');
  workerItems.forEach(item => {
      item.style.cursor = 'pointer';
      item.addEventListener('click', () => {
          const name = item.querySelector('strong').textContent;
          const role = item.querySelector('.text-muted').textContent.split('•')[0].trim();
          alert(`Opening Full Profile for: ${name}\nProfession: ${role}\n\nHere you can see their full job history, reviews, and contact info.`);
      });
  });

  /* ── 10. TOP ACTIVE USERS: TABLE SORTING ── */
  const table = document.querySelector('.table-card .data-table');
  if (table && !table.closest('.urgent-issues')) { 
      const headers = table.querySelectorAll('th');
      const tbody = table.querySelector('tbody');

      headers.forEach((header, index) => {
          if (index === 2 || index === 3) {
              header.style.cursor = 'pointer';
              header.title = "Click to sort";
              header.innerHTML += ' ↕️';

              header.addEventListener('click', () => {
                  const rows = Array.from(tbody.querySelectorAll('tr'));
                  
                  rows.sort((a, b) => {
                      let valA = a.querySelectorAll('td')[index].textContent.trim();
                      let valB = b.querySelectorAll('td')[index].textContent.trim();

                      valA = parseFloat(valA.replace(/,/g, '').replace('EGP', '').trim());
                      valB = parseFloat(valB.replace(/,/g, '').replace('EGP', '').trim());

                      return valB - valA; 
                  });

                  tbody.innerHTML = '';
                  rows.forEach(row => tbody.appendChild(row));
              });
          }
      });
  }

  /* ── 11. STAT CARDS: COUNT-UP ANIMATION ── */
  const statNumbers = document.querySelectorAll('.animate-number');
  
  statNumbers.forEach(numberEl => {
      const target = +numberEl.getAttribute('data-target'); 
      const duration = 1500; 
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