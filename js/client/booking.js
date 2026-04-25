(function() {
    var params = new URLSearchParams(window.location.search);
    var pro     = params.get('pro')     || 'Samy Ahmed';
    var service = params.get('service') || 'Electrical Repair';
    var proEl  = document.getElementById('booking-pro-name');
    var svcEl  = document.getElementById('booking-service');
    if (proEl)  proEl.textContent  = pro.replace(/\+/g, ' ');
    if (svcEl)  svcEl.textContent  = service.replace(/\+/g, ' ');
    document.title = 'Book ' + pro.replace(/\+/g, ' ') + ' | Yours&Ours';
})();